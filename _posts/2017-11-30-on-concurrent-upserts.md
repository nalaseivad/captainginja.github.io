---
layout: post
title: "On Concurrent UPSERTS"
sub_title: "How to do it right with SQL Server"
featured_image: /images/concurrent_upserts.png
featured_image_alt_text: "Concurrent UPSERTS"
featured_image_title: "Mmm, donuts!"
featured_image_width: 580
featured_image_link: /images/mmm_donuts.jpg
---

# Introduction

It's a very common usecase to have to either *INSERT* a new row into a table or *UPDATE* an existing row depending on
whether the row already exists.  This logic is commonly referred to as an UPSERT.  Let’s see how we can handle this in
T-SQL.

We assume that we have this table ...

```sql
CREATE TABLE dbo.Foo (
  fooId int          NOT NULL,
  stuff varchar(256) NOT NULL

  CONSTRAINT Foo__PK CLUSTERED (fooId)
);
```

Some naive T-SQL code to handle the UPSERT might be ...

```sql
IF EXISTS ( SELECT * FROM dbo.Foo WHERE fooId = @fooId )
  UPDATE dbo.Foo
     SET stuff = @stuff
   WHERE fooId = @fooId;
ELSE
  INSERT dbo.Foo ( fooId, stuff )
  VALUES ( @fooId, @stuff );
```

This will work fine for a single connection but with multiple connections and high concurrency this will start to fail
frequently with primary key violations.

There are various ways to handle this badly.  If you are interested in these then I encourage you to read several of the
articles listed in the further reading section below.
[This one](http://michaeljswart.com/2017/07/sql-server-upsert-patterns-and-antipatterns/) in particular summarizes
things very well.  However, if all you care about is how to do it well then I offer the following solution (from
[here](http://weblogs.sqlteam.com/dang/archive/2009/01/31/UPSERT-Race-Condition-With-MERGE.aspx)).

# Solution

I recommend using a MERGE statement With HOLDLOCK.

```sql
MERGE dbo.Foo WITH (HOLDLOCK) AS target
USING (SELECT @fooId AS fooId, @stuff AS stuff) AS source
ON    source.fooId = target.fooId

WHEN MATCHED THEN UPDATE
  SET target.stuff = source.stuff

WHEN NOT MATCHED THEN
  INSERT ( fooId, stuff )
  VALUES ( @fooId, @stuff );
```

No transaction is required here since *MERGE* is an atomic statement.  *MERGE* takes out a key update lock by default so
we don’t need to use an *UPDLOCK* hint (as is the case with some other possible solutions).  We do need a *HOLDLOCK*
hint though in order to ensure that SQL Server doesn’t release the key update lock before the *INSERT*.

# References and Further Reading

* <http://michaeljswart.com/2017/07/sql-server-upsert-patterns-and-antipatterns/>
* <http://michaeljswart.com/2011/09/mythbusting-concurrent-updateinsert-solutions/>
* <https://samsaffron.com/blog/archive/2007/04/04/14.aspx>
* <http://weblogs.sqlteam.com/dang/archive/2009/01/31/UPSERT-Race-Condition-With-MERGE.aspx>
* <http://weblogs.sqlteam.com/dang/archive/2007/10/28/Conditional-INSERTUPDATE-Race-Condition.aspx>
