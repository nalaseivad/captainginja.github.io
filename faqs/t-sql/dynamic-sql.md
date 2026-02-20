---
layout: faq
title: Dynamic SQL
sub_title: Execute dynamically constructed T-SQL statements
faq_type: t-sql
---

## Execute some SQL in the current database context ....

```sql
EXEC sys.sp_executesql @stmt = <sql>, @params = <params>, @param1 = <value1>, ..., @paramN = <valueN>
```

@sql and @params are of type nvarchar and must be declared as such.  If you supply string literals as parameters then
they must be prefixed with N.

Example 0

```sql
-- This is a common dynamic SQL usecase since "CREATE SCHEMA must be the first statement in a query batch"
EXEC sys.sp_executesql N'CREATE SCHEMA foobar';
```

Example 1

```sql
DECLARE @fieldName nvarchar(max) = N'foo';
DECLARE @tableName nvarchar(max) = N'bar';
DECLARE @sql nvarchar(max);
SET @sql = 'SELECT ' + @fieldName + ' FROM ' + @tableName;
EXEC sys.sp_executesql @sql;
-- or ...
EXEC sys.sp_executesql @stmt = @sql;    -- This will avoid any warnings about non-named params
```

Example 2

```sql
DECLARE @sql nvarchar(max);
DECLARE @params nvarchar(max);
SET @sql = 'SELECT foo, bar FROM some_table WHERE id = @id AND type = @type';
SET @params = '@id int, @type int';
EXEC sys.sp_executesql @stmt = @sql, @params = @params, @id = 123, @type = 42;
```

Example 3 - With output parameter

```sql
DECLARE @sql nvarchar(max);
DECLARE @params nvarchar(max);
SET @sql = 'SELECT @foo = foo FROM some_table WHERE id = @id';
SET @params = '@id int, @foo nvarchar(32) OUTPUT';
EXEC sys.sp_executesql @stmt = @sql, @params = @params, @id = 123, @foo OUTPUT;
```
	
## Execute some SQL in a specific database context ...

```sql
EXEC <database_name>.sys.sp_executesql @stmt = <sql>, @params = <params>, @param1 = <value1>, ..., @paramN = <valueN>
```

## Execute some SQL in a specific database context where the database name is a run-time parameter ...

```sql
DECLARE @databaseName sysname = 'scratch';
DECLARE @sp_executesql nvarchar(max) = @databaseName + '.sys.sp_executesql';
EXEC @sp_executesql @stmt = @sql, ...;
```

Example 4 - Normalize a proc name in a database

```sql
DECLARE @databaseName sysname = 'scratch';
DECLARE @sp_executesql nvarchar(max) = @databaseName + '.sys.sp_executesql';

DECLARE @procName sysname = 'TestProc';
SELECT @procName;

DECLARE @sql nvarchar(max);
-- MIN will return NULL if the proc doesn't exist
SET @sql = '
SELECT @procName = MIN(QUOTENAME(s.name) + ''.'' + QUOTENAME(o.name))
FROM   sys.objects AS o INNER JOIN sys.schemas AS s ON o.schema_id = s.schema_id
WHERE  o.object_id = OBJECT_ID(@procName)';
	
EXEC @sp_executesql @sql, N'@procName sysname OUTPUT', @procName OUTPUT;
	
SELECT @procName;
```

Example 5 - Create a schema in a database

```sql
DECLARE @databaseName sysname = 'scratch';
DECLARE @sp_executesql nvarchar(max) = @databaseName + '.sys.sp_executesql';
DECLARE @sql nvarchar(max);
SET @sql = 'CREATE SCHEMA foobar';
EXEC @sp_executesql @stmt = @sql;
```

Useful since CREATE SCHEMA natively has to be the first statement in a block.

## Fun with parameters ...

Example 6 - Error: Must declare the scalar variable "@number"

```sql
DECLARE @number int = 42;
DECLARE @sql nvarchar(max);
SET @sql = 'SELECT @number';
EXEC sp_executesql @sql;
```

Example 7 - Returns 42

```sql
DECLARE @number int = 42;
DECLARE @sql nvarchar(max);
SET @sql = 'SELECT @number';
EXEC sp_executesql @sql, N'@number int', @number;
```

Even though we don't specifically supply a value for the parameter @number in the call to EXEC, this brings the variable
into local scope and its current value becomes visible inside the dynamic SQL execution

Example 8 - Returns 42

```sql
DECLARE @number int = 42;
DECLARE @sql nvarchar(max);
SET @sql = 'SELECT @number';
EXEC sp_executesql @sql, N'@number int', @number = @number;
```

Another way of writing it, explicity providing the initial value of the @number parameter

Example 9 - Returns 43

```sql
DECLARE @number int = 42;
DECLARE @sql nvarchar(max);
SET @sql = 'SELECT @number = @number + 1';
EXEC sp_executesql @sql, N'@number int OUTPUT', @number OUTPUT;
SELECT @number;
```

The value of 42 is brought in from the outside then modified inside, and that modification is to the outside variable
since the param was declared as OUTPUT

Example 10 - Returns 43

```sql
DECLARE @number int = 42;
DECLARE @sql nvarchar(max);
SET @sql = 'SELECT @number = @number + 1';
EXEC sp_executesql @sql, N'@number int OUTPUT', @number = @number OUTPUT;
SELECT @number;
```

Another way of writing it, explicity providing the initial value of the @number parameter
