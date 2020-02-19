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
  tl.request_mode AS reqMode,
  tl.request_type AS reqType,
  tl.request_status AS reqStatus,
  tl.resource_type AS resType,
  tl.resource_description AS resDesc,
  COALESCE(o.name, po.name) AS objName,
  i.name AS indexName
FROM
  sys.dm_tran_locks AS tl
  INNER JOIN
  sys.dm_exec_sessions AS es ON tl.request_session_id = es.session_id
  LEFT JOIN
  sys.dm_tran_active_transactions AS at ON tl.request_owner_id = at.transaction_id
  LEFT JOIN
  sys.objects AS o ON tl.resource_associated_entity_id = o.object_id
  LEFT JOIN
  sys.partitions AS p ON tl.resource_associated_entity_id = p.hobt_id
  LEFT JOIN
  sys.objects AS po ON p.object_id = po.object_id
  LEFT JOIN
  sys.indexes AS I ON p.object_id = i.object_id AND p.index_id = i.index_id
WHERE
  tl.request_session_id <> @@SPID AND     -- Don't include the connection running this query
  tl.resource_database_id = DB_ID() AND   -- DB_ID() => id of current db
  at.transaction_id IS NOT NULL           -- Remove this to see shared locks on the current database
```
