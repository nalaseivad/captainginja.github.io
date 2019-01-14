USE DropMe;
GO

IF OBJECT_ID('Files__Directories__FK', 'F') IS NOT NULL ALTER TABLE dbo.Files DROP CONSTRAINT Files_Directories__FK;
GO

IF OBJECT_ID('Files', 'U') IS NOT NULL DROP TABLE dbo.Files;
GO
CREATE TABLE dbo.Files (
  fileId int NOT NULL IDENTITY,
  directoryId int NOT NULL,
  [name] varchar(32) NOT NULL
  
  CONSTRAINT Files__PK PRIMARY KEY (fileId, directoryId)
);
GO

IF OBJECT_ID('Directories', 'U') IS NOT NULL DROP TABLE dbo.Directories;
GO
CREATE TABLE dbo.Directories (
  directoryId int NOT NULL IDENTITY,
  [name] varchar(32) NOT NULL
  
  CONSTRAINT Directories__PK PRIMARY KEY (directoryId)
);
GO

ALTER TABLE dbo.Files ADD CONSTRAINT Files__Directories__FK FOREIGN KEY (directoryId) REFERENCES Directories(directoryId);
GO

CREATE UNIQUE NONCLUSTERED INDEX Directories__n__UIX ON dbo.Directories ([name]);
GO

CREATE UNIQUE NONCLUSTERED INDEX Files__n__UIX ON dbo.Files ([name]);
GO

-----------------------------------------------------------------------------------------------------------------------

USE DropMe;


GO
DELETE FROM dbo.Files;
DELETE FROM dbo.Directories;
DBCC CHECKIDENT ('dbo.Files', RESEED, 0);
DBCC CHECKIDENT ('dbo.Directories', RESEED, 0);


GO
BEGIN TRANSACTION

DECLARE @directoryName varchar(32) = '/foo/bar';
DECLARE @fileName varchar(32) = 'baz';

DECLARE @directoryId int = 0;
SET @directoryId = (SELECT DISTINCT directoryId FROM dbo.Directories WHERE [name] = @directoryName);
IF @directoryId IS NULL
BEGIN
  DECLARE @directoryIds TABLE (directoryId int);
  INSERT INTO dbo.Directories OUTPUT INSERTED.directoryId INTO @directoryIds VALUES (@directoryName);
  SET @directoryId = (SELECT DISTINCT directoryId FROM @directoryIds);
END

DECLARE @fileIds TABLE (fileId int);
INSERT INTO dbo.Files (directoryId, [name])
OUTPUT INSERTED.fileId INTO @fileIds
SELECT @directoryId, @fileName;

DECLARE @fileId int = (SELECT DISTINCT fileId FROM @fileIds);

COMMIT;

GO
SELECT * FROM dbo.Files;
SELECT * FROM dbo.Directories;


GO
IF OBJECT_ID('[dbo].[StandardCatchHandler]', 'P') IS NULL
BEGIN
  EXEC sp_executesql N'CREATE PROCEDURE [dbo].[StandardCatchHandler] AS RETURN 1';
END

GO
ALTER PROCEDURE [dbo].[StandardCatchHandler]
AS
BEGIN
  DECLARE @errmsg   nvarchar(2048) = ERROR_MESSAGE();
  DECLARE @severity tinyint        = ERROR_SEVERITY();
  DECLARE @state    tinyint        = ERROR_STATE();
  DECLARE @errno    int            = ERROR_NUMBER();
  DECLARE @proc     sysname        = ERROR_PROCEDURE();
  DECLARE @lineno   int            = ERROR_LINE();

  IF @errmsg NOT LIKE '***%'
  BEGIN
    SET @errmsg = '*** ' + COALESCE(QUOTENAME(@proc), '<Dynamic SQL>') + ', Line ' + LTRIM(STR(@lineno)) +
                  '. Errno ' + LTRIM(STR(@errno)) + ': ' + @errmsg;
  END
  RAISERROR('%s', @severity, @state, @errmsg);
END
GO


GO
IF OBJECT_ID('dbo.IsXactAbortOn', 'FN') IS NULL
BEGIN
  EXEC sp_executesql N'CREATE FUNCTION dbo.IsXactAbortOn() RETURNS int AS BEGIN RETURN 1; END';
END

GO
ALTER FUNCTION dbo.IsXactAbortOn()
RETURNS int
AS
BEGIN
  DECLARE @options int = (SELECT @@OPTIONS);
  IF (@options & 16384) = 16384 RETURN 1;
  RETURN 0;
END
GO

GO
DECLARE @OPTIONS int;
SET @OPTIONS = (SELECT @@OPTIONS);
IF (@OPTIONS & 16384) = 16384
  PRINT 'XACT_ABORT ON';
ELSE
  PRINT 'XACT_ABORT OFF';


GO
IF OBJECT_ID('dbo.AddFile', 'P') IS NULL
BEGIN
  EXEC sp_executesql N'CREATE PROCEDURE dbo.AddFile AS RETURN 1';
END

GO
ALTER PROCEDURE dbo.AddFile
  @fileName varchar(32),
  @directoryName varchar(32),
  @fileId int OUTPUT  
AS
BEGIN
  IF dbo.IsXactAbortOn() = 1 PRINT 'XACT_ABORT is ON'; ELSE PRINT 'XACT_ABORT is OFF';
  SET XACT_ABORT ON;
  IF dbo.IsXactAbortOn() = 1 PRINT 'XACT_ABORT is ON'; ELSE PRINT 'XACT_ABORT is OFF';
  SET NOCOUNT ON;
  BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @directoryId int = 0;
    SET @directoryId = (SELECT DISTINCT directoryId FROM dbo.Directories WHERE [name] = @directoryName);
    IF @directoryId IS NULL
    BEGIN
      DECLARE @directoryIds TABLE (directoryId int);
      INSERT INTO dbo.Directories OUTPUT INSERTED.directoryId INTO @directoryIds VALUES (@directoryName);
      SET @directoryId = (SELECT DISTINCT directoryId FROM @directoryIds);
    END

    DECLARE @fileIds TABLE (fileId int);
    INSERT INTO dbo.Files (directoryId, [name])
    OUTPUT INSERTED.fileId INTO @fileIds
    SELECT @directoryId, @fileName;

    SET @fileId = (SELECT DISTINCT fileId FROM @fileIds);

    COMMIT;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    EXEC dbo.StandardCatchHandler
    RETURN 55555;
  END CATCH
END

GO
IF dbo.IsXactAbortOn() = 1 PRINT 'XACT_ABORT is ON'; ELSE PRINT 'XACT_ABORT is OFF';
DECLARE @fileId int;
EXEC dbo.AddFile @fileName = 'baz', @directoryName = '/foo/bar/', @fileId = @fileId OUTPUT
PRINT 'sdfds'
SELECT @fileId;
GO
IF dbo.IsXactAbortOn() = 1 PRINT 'XACT_ABORT is ON'; ELSE PRINT 'XACT_ABORT is OFF';

GO
IF dbo.IsXactAbortOn() = 1 PRINT 'XACT_ABORT is ON'; ELSE PRINT 'XACT_ABORT is OFF';
DECLARE @fileId int;
EXEC dbo.AddFile @fileName = 'baz', @directoryName = '/foo/bar/', @fileId = @fileId OUTPUT
SELECT @fileId;
GO
IF dbo.IsXactAbortOn() = 1 PRINT 'XACT_ABORT is ON'; ELSE PRINT 'XACT_ABORT is OFF';



GO
SELECT * FROM dbo.Files;
SELECT * FROM dbo.Directories;


SELECT * FROM sys.objects WHERE type='P'

SELECT OBJECT_ID('dbo.AddFile', 'P')


SELECT @@options;

SET XACT_ABORT ON;
SET XACT_ABORT OFF;

GO
DECLARE @OPTIONS int;
SET @OPTIONS = (SELECT @@OPTIONS);
IF (@OPTIONS & 16384) = 16384
  PRINT 'XACT_ABORT ON';
ELSE
  PRINT 'XACT_ABORT OFF';


GO
SET XACT_ABORT OFF;
DELETE FROM dbo.Files;
DELETE FROM dbo.Directories;
BEGIN TRY
INSERT INTO dbo.Directories ([name]) VALUES ('1');
INSERT INTO dbo.Directories ([name]) VALUES ('1');
INSERT INTO dbo.Directories ([name]) VALUES ('2');
INSERT INTO dbo.Directories ([name]) VALUES ('3');
END TRY
BEGIN CATCH

END CATCH

GO
SELECT * FROM dbo.Directories;

-----------------------------------------------------------------------------------------------------------------------

USE [Sqlis]
GO
/****** Object:  StoredProcedure [dbo].[StandardCatchHandler]    Script Date: 4/11/2018 4:55:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[StandardCatchHandler]
AS
BEGIN
  IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;

  DECLARE @errmsg   nvarchar(2048) = ERROR_MESSAGE();
  DECLARE @severity tinyint        = ERROR_SEVERITY();
  DECLARE @state    tinyint        = ERROR_STATE();
  DECLARE @errno    int            = ERROR_NUMBER();
  DECLARE @proc     sysname        = ERROR_PROCEDURE();
  DECLARE @lineno   int            = ERROR_LINE();

  IF @errmsg NOT LIKE '***%'
  BEGIN
    SET @errmsg = '*** ' + COALESCE(QUOTENAME(@proc), '<Dynamic SQL>') + ', Line ' + LTRIM(STR(@lineno)) +
                  '. Errno ' + LTRIM(STR(@errno)) + ': ' + @errmsg;
  END
  RAISERROR('%s', @severity, @state, @errmsg);
END

-----------------------------------------------------------------------------------------------------------------------


DELETE FROM dbo.Bar;

GO
SELECT * FROM dbo.Foo;
SELECT * FROM dbo.Bar;

SET XACT_ABORT ON;
--SET XACT_ABORT OFF;
DECLARE @barValue varchar(32) = 'bar 1';
DECLARE @fooValue varchar(32) = 'foo 1';

RAISERROR('Point 0', 0, 1) WITH NOWAIT;
BEGIN TRANSACTION
RAISERROR('Point 1', 0, 1) WITH NOWAIT;

DECLARE @fooIds TABLE (fooId int);
INSERT INTO dbo.Foo (barId, fooValue)
OUTPUT INSERTED.fooId INTO @fooIds
VALUES
  ((SELECT barId FROM dbo.Bar WHERE barValue = @barValue), @fooValue);

RAISERROR('Point 2', 0, 1) WITH NOWAIT;
COMMIT
RAISERROR('Point 3', 0, 1) WITH NOWAIT;
GO
RAISERROR('Point 4, @@TRANCOUNT=%d', 0, 1, @@TRANCOUNT) WITH NOWAIT;



SELECT
  barId, fooValue
FROM (
  SELECT barId, @fooValue AS fooValue FROM dbo.Bar WHERE barValue = @barValue
) AS t;

IF (SELECT COUNT(*) FROM @fooIds) = 0
BEGIN
  DECLARE @barIds TABLE (barId int);
  INSERT INTO dbo.Bar OUTPUT INSERTED.barId INTO @barIds VALUES (@barValue);
  DECLARE @barId int = (SELECT barId FROM @barIds);

  INSERT INTO dbo.Foo (barId, fooValue)
  OUTPUT INSERTED.fooId INTO @fooIds
  SELECT
    barId, fooValue
  FROM (
    SELECT barId, @fooValue AS fooValue FROM dbo.Bar WHERE barValue = @barValue
  ) AS t;
END

SELECT * FROM dbo.Foo;
SELECT * FROM dbo.Bar;
GO

-----------------------------------------------------------------------------------------------------------------------

SELECT * FROM sys.objects AS o WHERE name LIKE 'Foo%' OR name LIKE 'Bar%'

SELECT
  *
FROM
  sys.objects AS o
    INNER JOIN sys.columns AS c
    ON c.object_id = o.object_id
WHERE
  o.name LIKE 'Foo%' OR o.name LIKE 'Bar%'

-----------------------------------------------------------------------------------------------------------------------

USE DropMe;
GO

TRUNCATE TABLE dbo.Foo;
GO

SET XACT_ABORT ON;
--SET XACT_ABORT OFF;

BEGIN TRANSACTION
RAISERROR('After BEGIN TRANSACTION', 0, 1) WITH NOWAIT;

INSERT INTO dbo.Foo (charValue, intValue) VALUES ('foo', 42);
RAISERROR('After INSERT 1', 0, 1) WITH NOWAIT;
INSERT INTO dbo.Foo (charValue, intValue) VALUES ('bar', NULL);  -- NULL constraint violation
RAISERROR('After INSERT 2', 0, 1) WITH NOWAIT;
INSERT INTO dbo.Foo (charValue, intValue) VALUES ('baz', 911);
RAISERROR('After INSERT 3', 0, 1) WITH NOWAIT;

COMMIT TRANSACTION
RAISERROR('After COMMIT TRANSACTION', 0, 1) WITH NOWAIT;
GO

IF @@ERROR <> 0
BEGIN
  RAISERROR('@@ERROR <> 0', 0, 1) WITH NOWAIT;
  IF @@TRANCOUNT > 0
  BEGIN
    RAISERROR('@@TRANCOUNT > 0', 0, 1) WITH NOWAIT;
    ROLLBACK TRANSACTION;
  END
  ELSE BEGIN
    RAISERROR('@@TRANCOUNT = 0', 0, 1) WITH NOWAIT;
  END
END
ELSE BEGIN
  RAISERROR('@@ERROR = 0', 0, 1) WITH NOWAIT;
  IF @@TRANCOUNT > 0
  BEGIN
    RAISERROR('@@TRANCOUNT > 0', 0, 1) WITH NOWAIT;
    ROLLBACK TRANSACTION;
  END
  ELSE BEGIN
    RAISERROR('@@TRANCOUNT = 0', 0, 1) WITH NOWAIT;
  END
END
GO

SELECT * FROM dbo.Foo;

-----------------------------------------------------------------------------------------------------------------------

USE DropMe;
GO

IF OBJECT_ID('Files__Directories__FK', 'F') IS NOT NULL ALTER TABLE dbo.Files DROP CONSTRAINT Files_Directories__FK;
GO

IF OBJECT_ID('Files', 'U') IS NOT NULL DROP TABLE dbo.Files;
GO
CREATE TABLE dbo.Files (
  fileId int NOT NULL IDENTITY,
  directoryId int NOT NULL,
  [name] varchar(32) NOT NULL
  
  CONSTRAINT Files__PK PRIMARY KEY (fileId, directoryId)
);
GO

IF OBJECT_ID('Directories', 'U') IS NOT NULL DROP TABLE dbo.Directories;
GO
CREATE TABLE dbo.Directories (
  directoryId int NOT NULL IDENTITY,
  [name] varchar(32) NOT NULL
  
  CONSTRAINT Directories__PK PRIMARY KEY (directoryId)
);
GO

ALTER TABLE dbo.Files ADD CONSTRAINT Files__Directories__FK FOREIGN KEY (directoryId) REFERENCES Directories(directoryId);
GO

CREATE UNIQUE NONCLUSTERED INDEX Directories__n__UIX ON dbo.Directories ([name]);
GO

CREATE UNIQUE NONCLUSTERED INDEX Files__n__UIX ON dbo.Files ([name]);
GO





GO
IF OBJECT_ID('[dbo].[StandardCatchHandler]', 'P') IS NULL
BEGIN
  EXEC sp_executesql N'CREATE PROCEDURE [dbo].[StandardCatchHandler] AS RETURN 1';
END

GO
ALTER PROCEDURE [dbo].[StandardCatchHandler]
AS
BEGIN
  DECLARE @errmsg   nvarchar(2048) = ERROR_MESSAGE();
  DECLARE @severity tinyint        = ERROR_SEVERITY();
  DECLARE @state    tinyint        = ERROR_STATE();
  DECLARE @errno    int            = ERROR_NUMBER();
  DECLARE @proc     sysname        = ERROR_PROCEDURE();
  DECLARE @lineno   int            = ERROR_LINE();

  IF @errmsg NOT LIKE '***%'
  BEGIN
    SET @errmsg = '*** ' + COALESCE(QUOTENAME(@proc), '<Dynamic SQL>') + ', Line ' + LTRIM(STR(@lineno)) +
                  '. Errno ' + LTRIM(STR(@errno)) + ': ' + @errmsg;
  END
  RAISERROR('%s', @severity, @state, @errmsg);
END
GO




GO
IF OBJECT_ID('dbo.IsXactAbortOn', 'FN') IS NULL
BEGIN
  EXEC sp_executesql N'CREATE FUNCTION dbo.IsXactAbortOn() RETURNS int AS BEGIN RETURN 1; END';
END

GO
ALTER FUNCTION dbo.IsXactAbortOn()
RETURNS int
AS
BEGIN
  DECLARE @options int = (SELECT @@OPTIONS);
  IF (@options & 16384) = 16384 RETURN 1;
  RETURN 0;
END
GO




GO
IF OBJECT_ID('dbo.AddFile', 'P') IS NULL
BEGIN
  EXEC sp_executesql N'CREATE PROCEDURE dbo.AddFile AS RETURN 1';
END

GO
ALTER PROCEDURE dbo.AddFile
  @fileName varchar(32),
  @directoryName varchar(32),
  @fileId int OUTPUT  
AS
BEGIN
  IF dbo.IsXactAbortOn() = 1 PRINT 'XACT_ABORT is ON'; ELSE PRINT 'XACT_ABORT is OFF';
  SET XACT_ABORT ON;
  IF dbo.IsXactAbortOn() = 1 PRINT 'XACT_ABORT is ON'; ELSE PRINT 'XACT_ABORT is OFF';
  SET NOCOUNT ON;
  BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @directoryId int = 0;
    SET @directoryId = (SELECT DISTINCT directoryId FROM dbo.Directories WHERE [name] = @directoryName);
    IF @directoryId IS NULL
    BEGIN
      DECLARE @directoryIds TABLE (directoryId int);
      INSERT INTO dbo.Directories OUTPUT INSERTED.directoryId INTO @directoryIds VALUES (@directoryName);
      SET @directoryId = (SELECT DISTINCT directoryId FROM @directoryIds);
    END

    DECLARE @fileIds TABLE (fileId int);
    INSERT INTO dbo.Files (directoryId, [name])
    OUTPUT INSERTED.fileId INTO @fileIds
    SELECT @directoryId, @fileName;

    SET @fileId = (SELECT DISTINCT fileId FROM @fileIds);

    COMMIT;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    EXEC dbo.StandardCatchHandler
    RETURN 55555;
  END CATCH
END





GO
DELETE FROM dbo.Files;
DELETE FROM dbo.Directories;
DBCC CHECKIDENT ('dbo.Files', RESEED, 0);
DBCC CHECKIDENT ('dbo.Directories', RESEED, 0);

GO
IF dbo.IsXactAbortOn() = 1 PRINT 'XACT_ABORT is ON'; ELSE PRINT 'XACT_ABORT is OFF';
DECLARE @fileId int;
EXEC dbo.AddFile @fileName = 'baz', @directoryName = '/foo/bar/', @fileId = @fileId OUTPUT
PRINT 'sdfds'
SELECT @fileId;
GO
IF dbo.IsXactAbortOn() = 1 PRINT 'XACT_ABORT is ON'; ELSE PRINT 'XACT_ABORT is OFF';

GO
IF dbo.IsXactAbortOn() = 1 PRINT 'XACT_ABORT is ON'; ELSE PRINT 'XACT_ABORT is OFF';
DECLARE @fileId int;
EXEC dbo.AddFile @fileName = 'baz', @directoryName = '/foo/bar/', @fileId = @fileId OUTPUT
SELECT @fileId;
GO
IF dbo.IsXactAbortOn() = 1 PRINT 'XACT_ABORT is ON'; ELSE PRINT 'XACT_ABORT is OFF';

-----------------------------------------------------------------------------------------------------------------------

USE DropMe;
GO

TRUNCATE TABLE dbo.Foo;
GO

SET XACT_ABORT ON;
--SET XACT_ABORT OFF;

BEGIN TRANSACTION
RAISERROR('After BEGIN TRANSACTION', 0, 1) WITH NOWAIT;

INSERT INTO dbo.Foo (charValue, intValue) VALUES ('foo', 42);
RAISERROR('After INSERT 1', 0, 1) WITH NOWAIT;
INSERT INTO dbo.Foo (charValue, intValue) VALUES ('bar', NULL);  -- NULL constraint violation
RAISERROR('After INSERT 2', 0, 1) WITH NOWAIT;
INSERT INTO dbo.Foo (charValue, intValue) VALUES ('baz', 911);
RAISERROR('After INSERT 3', 0, 1) WITH NOWAIT;

COMMIT TRANSACTION
RAISERROR('After COMMIT TRANSACTION', 0, 1) WITH NOWAIT;
GO  -- This GO has to be here in order for the code below to be executed if XACT_ABORT is ON

IF @@ERROR <> 0
BEGIN
  RAISERROR('@@ERROR <> 0', 0, 1) WITH NOWAIT;
  IF @@TRANCOUNT > 0
  BEGIN
    RAISERROR('@@TRANCOUNT > 0', 0, 1) WITH NOWAIT;
    ROLLBACK TRANSACTION;
  END
  ELSE BEGIN
    RAISERROR('@@TRANCOUNT = 0', 0, 1) WITH NOWAIT;
  END
END
ELSE BEGIN
  RAISERROR('@@ERROR = 0', 0, 1) WITH NOWAIT;
  IF @@TRANCOUNT > 0
  BEGIN
    RAISERROR('@@TRANCOUNT > 0', 0, 1) WITH NOWAIT;
    ROLLBACK TRANSACTION;
  END
  ELSE BEGIN
    RAISERROR('@@TRANCOUNT = 0', 0, 1) WITH NOWAIT;
  END
END
GO -- This GO has to be here in order for the code below to be executed if XACT_ABORT is ON

SELECT * FROM dbo.Foo;

-----------------------------------------------------------------------------------------------------------------------



