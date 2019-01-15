---
layout: post
title: "On Turning on RCS"
sub_title: "Turning on Read Committed Snapshot might change behavior"
featured_image: /images/behavior_change.jpg
featured_image_alt_text: "Behavior Change"
featured_image_title: "What do you mean it changed?  That's not a bug, it's a feature!"
featured_image_width: 400px
featured_image_link: /images/feature_bug.jpg
tags: [sql]
---

This is the second in a series of posts on Microsoft SQL Server.  If you are the sort of person who doesn't care about
context and the logical flow of information then please, feel free to read on.  However, I do suggest that you start
your stroll through my mumblings on this subject at the
[beginning]({{ site.baseurl }}{% post_url 2015-03-19-on-rdbms %}).  It's your choice though.

# Read Committed Snapshot

Microsoft SQL Server offers a database-level setting called *READ_COMMITTED_SNAPSHOT* that controls whether data
snapshots are used for transactions that run under the Read Committed isolation level.  For a primer on the whole
notion of transactions, isolation levels and the nature of this setting I direct your attention to the
[first]({{ site.baseurl }}{% post_url 2015-03-19-on-rdbms %}) in this series of posts.  As mentioned in that previous
article, turning on this setting can, in some edge cases, lead to a change in the behavior of transactions running
under the *READ COMMITTED* isolation level.  This is an edge case but it's an instructive one to explore since it will
give us a greater understanding of the nuance of row-versioning and snapshotting in the process.

Before we proceed I want to emphasise that running a database with the *READ_COMMITTED_SNAPSHOT* setting on is not a bad
thing by any stretch of the imagination.  In fact it's a great feature to enable and will minimize contention in a
database application.  There's no risk of inconsistent behavior among running transactions when it is on, but there is a
risk of a behavior change from when it is on to when it is off, or vice versa.  The risk is in having a live database
that has been running with the setting off for a while and then turning it on.  Some use-cases will see a behavior
change when you do this.  However if you are creating a new database then I would suggest that you enable it from the
start.

## An Example of a Behavior Change

Let's look at the behavior of a theoretical situation.  Open a connection to an MS SQL instance (we will call this
connection #1) and run this initial query:

```sql
-- Query 1 ---------------------------------------------------------------------

USE master;
GO

IF EXISTS (SELECT * FROM sys.databases WHERE name = 'MarblesTest')
BEGIN
  ALTER DATABASE MarblesTest SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
  DROP DATABASE MarblesTest;
END
GO

CREATE DATABASE MarblesTest;
--ALTER DATABASE MarblesTest SET READ_COMMITTED_SNAPSHOT ON;
GO

USE MarblesTest;
GO

CREATE TABLE dbo.Marbles (
  id INT PRIMARY KEY,
  color CHAR(5)
);
GO

INSERT INTO dbo.Marbles VALUES ( 1, 'Black' ), ( 2, 'White' );
GO
```

Note that the ALTER DATABASE statement to turn on *READ_COMMITTED_SNAPSHOT* is commented out and so the database will be
created with that setting off (the default).

Now execute this query on the same connection:

```sql
-- Query 2 ---------------------------------------------------------------------
USE MarblesTest;
GO

DECLARE @id INT;

BEGIN TRAN
  SELECT  @id = MIN(id)
  FROM    dbo.Marbles
  WHERE   color = 'Black';
  
  UPDATE  dbo.Marbles
  SET     color = 'White'
  WHERE   id = @id;
```

The query will complete immediately. Now open up another connection to your MS SQL instance (we will call this
connection #2) and run this query:

```sql
-- Query 3 ---------------------------------------------------------------------
USE MarblesTest;
GO

DECLARE @id INT;

BEGIN TRAN
  SELECT  @id = MIN(id)
  FROM    dbo.Marbles
  WHERE   color = 'Black';

  UPDATE  dbo.Marbles
  SET     color = 'Red'
  WHERE   id = @id;
COMMIT
GO
```

This query will block and sit executing until you take some further action. Now go back to connection #1 and excute this
query:

```sql
-- Query 4 ---------------------------------------------------------------------
COMMIT
GO
```

This query will complete immediately, and once it has completed the other query (running on connection #2) will complete
too.

```sql
-- Query 5 ---------------------------------------------------------------------
SELECT * FROM dbo.Marbles;
```

Now, in either connection run this query:

You will see this result:

{:.sql-result-table}
| id | color |
| -- | ----- |
| 1  | White |
| 2  | White |

Now, go back to connection #1, uncomment the *ALTER DATABASE* ... *SET READ_COMMITTED_SNAPSHOT* ... line from within
Query 1 and run it again. This will drop and recreate the database, but this time with the setting on.

Now rerun the other queries on the different connections exactly as before. This time the final result will be:

 {:.sql-result-table}
| id | color |
| -- | ----- |
| 1  | Red   |
| 2  | White |

"Err, what!?" I hear you say. "How can that be?"

Let's take a closer look at the queries from above, starting with query 2 (running on connection #1) ...

```sql
-- Query 2 ---------------------------------------------------------------------
USE MarblesTest;
GO

DECLARE @id INT;

BEGIN TRAN
  SELECT  @id = MIN(id)
  FROM    dbo.Marbles
  WHERE   color = 'Black';
  
  UPDATE  dbo.Marbles
  SET     color = 'White'
  WHERE   id = @id;
```

First we'll look at what happens when the *READ_COMMITTED_SNAPSHOT* setting is off.  This query starts a transaction and
then proceeds to issue a *SELECT* statement to determine the minimum id across all of the rows in the Marbles table that
have a color of 'Black'.  Since the transaction is running with an isolation level of *READ COMMITTED* (the default) and
the *READ_COMMITTED_SNAPSHOT* setting is off, then this tries to, and does, take out a shared lock on all of the rows
that match the predicate, all one of them.  The *SELECT* statement's predicate selects just that one row, the row with
id = 1, and then calculates the minimum id across that one row, which is obviously 1; and so we set @id to 1.  The
transaction then releases its shared lock as soon as the statement completes.  Next it issues an *UPDATE* statement to
set the color of the row (with id = 1) to 'White'.  This tries to, and does, take out an exclusive lock on that row and
the *UPDATE* completes.  The lock is not released yet however.  It will be held until the transaction is committed, and
this query does not commit the transaction. That comes later.

With the *READ_COMMITTED_SNAPSHOT* setting on nothing materially different happens (at least in terms of why we see this
strange behavior).  The first statement in the transaction (the *SELECT*) will not issue a shared lock in this case,
instead it will read from a snapshot of the transactionally consistent row data as of the start of the statement.  The
second statement (the *UPDATE*) will still take out an exclusive lock as before and that lock will again be held until
the transaction commits, which will happen at some point later.

Now let's take another look at query 3 (running on connection #2) ...

```sql
-- Query 3 - Annotated ---------------------------------------------------------
USE MarblesTest;
GO
 
DECLARE @id INT;
 
BEGIN TRAN
  -- With the READ_COMMITTED_SNAPSHOT setting off, this query will block here
  SELECT  @id = MIN(id)
  FROM    dbo.Marbles
  WHERE   color = 'Black';
 
  -- With the READ_COMMITTED_SNAPSHOT setting on, this query will block here
  UPDATE  dbo.Marbles
  SET     color = 'Red'
  WHERE   id = @id;
COMMIT
GO
```

Again, we'll first consider what happens when the *READ_COMMITTED_SNAPSHOT* setting is off.  The query starts a
transaction and then proceeds to issue a *SELECT* statement to determine the minimum id across all of the rows in the
Marbles table that have a color of 'Black'.  Since the transaction is running with an isolation level of *READ
COMMITTED* (the default) and the *READ_COMMITTED_SNAPSHOT* setting is off then this tries to take out a shared lock on
all of the rows that match the predicate.  It can't take out all of those locks though since the other transaction
(running on connection #1) has an exclusive lock on one of the rows that this transaction wants a shared lock on.  So,
this transaction (on connection #2) blocks here and the first statement (the *SELECT*) will not run yet.  Once we
execute the commit statement back on connection #1 then that transaction releases its exclusive lock on the row it
updated and the transaction (running on connection #2) can now take the shared lock on that row and proceed with its
*SELECT* statement.  Because this transaction is running as *READ COMMITTED* (meaning that it will see transactionally
consistent data as of the start of each statement) then it will read the updated data written by the other transaction
and thus will now see that both rows have a color of 'White'.  The minimum id value across the rows with a color of
'Black' is thus now NULL (there are no rows with a color of 'Black') and so @id is set to NULL.  The subsequent *UPDATE*
statement has no effect since there are no rows that match the predicate id = NULL.  The transaction is committed and
this query completes.  The end result is that we have both rows with color = 'White'.

With the *READ_COMMITTED_SNAPSHOT* setting on we see different behavior.  The query starts a transaction and then
proceeds to issue a *SELECT* statement to determine the minimum id across all of the rows in the Marbles table that have
a color of 'Black'.  Since the transaction is running with an isolation level of *READ COMMITTED* (the default) and the
*READ_COMMITTED_SNAPSHOT* setting is on then this statement does not require a shared lock and instead reads from a
snapshot copy of the transactionally consistent data as of the start of the statement.  This snapshot will contain the
row data as it was before the other transaction (on connection #1) started, i.e. rowId 1 with a color of 'Black' and
rowId 2 with a color of 'White'.  So the *SELECT* query's predicate will select the one row with a color of 'Black'
(rowId 1) and that will also be the minimum id of course.  Thus @id will end up being set to 1.  The subsequent *UPDATE*
statement will try to take out an exclusive lock on the row with rowId 1 but will be unable to get it because the other
transaction (on connection #1) is holding an exclusive lock on the same row.  Once we execute the commit statement back
on connection #1 then that transaction releases its exclusive lock on the row and the transaction (running on
connection #2) can now take the exclusive lock and proceed with its *UPDATE*.  Note that at this time the modification
to rowId 1 (color now set to 'White') is committed.  Because the transaction (running on connection #2) is running as
*READ COMMITTED* then this statement will see a transactionally consistent view of the data as of the start of the
statement (i.e. it will see rowId 1 with the modified color of 'White') but that doesn't really matter since this
statement is just going to go ahead and update the color of that row to 'Red'.  This it does.  The transaction is then
committed and the query completes.  The end result is that we have rowId 1 with a color of 'Red' and rowId 2 with a
color of 'White'.

So there you go.  Changing the *READ_COMMITTED_SNAPSHOT* setting can change the behavior of queries.  Be wary.  Having
your databases run with *READ_COMMITTED_SNAPSHOT* on can provide real benefits to the concurrency of database queries
and it is worth doing.  Just make sure that you turn it on early in the life of your database (ideally at the start) so
that clients do not become accustomed to the shared-lock based behavior.
