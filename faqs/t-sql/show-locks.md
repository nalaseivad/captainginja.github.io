---
layout: faq
title: Show locks
sub_title: What locks are currently held on objects in the current database and by who?
faq_type: t-sql
---

## Show locks

```sql
--
--  Show locks on objects in the current database
--
SELECT
  es.session_id AS spid,
  es.host_name AS hostname,
  es.login_name AS loginName,
  tst.open_transaction_count AS openTranCount,
  tl.request_mode AS reqMode,
  tl.request_type AS reqType,
  tl.request_status AS reqStatus,
  tl.resource_type AS resType,
  tl.resource_description AS resDesc,
  COALESCE(o.name, po.name) AS objName,
  i.name AS indexName
FROM
  sys.dm_tran_locks AS tl WITH (NOLOCK)
    INNER JOIN sys.dm_exec_sessions AS es WITH (NOLOCK)
      ON es.session_id = tl.request_session_id
    LEFT JOIN sys.dm_tran_active_transactions AS tat WITH (NOLOCK)
      ON tat.transaction_id = tl.request_owner_id
    LEFT JOIN sys.dm_tran_session_transactions AS tst WITH (NOLOCK)
      ON tst.session_id = es.session_id
    LEFT JOIN sys.objects AS o WITH (NOLOCK)
      ON o.object_id = tl.resource_associated_entity_id
    LEFT JOIN sys.partitions AS p WITH (NOLOCK)
      ON p.hobt_id = tl.resource_associated_entity_id
    LEFT JOIN sys.objects AS po WITH (NOLOCK)
      ON po.object_id = p.object_id
    LEFT JOIN sys.indexes AS i WITH (NOLOCK)
      ON i.object_id = p.object_id AND i.index_id = p.index_id
WHERE
  tl.request_session_id <> @@SPID AND     -- Don't include the connection running this query
  tl.resource_database_id = DB_ID()
```