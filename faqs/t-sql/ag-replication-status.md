---
layout: faq
title: Availability Group Database Replication Status
sub_title: Show replication status (send/redo/...) for Availability Group databases
faq_type: t-sql
---

## Availability Group Database Replication Status

```sql
--
--  Show the status of replication for databases in an Availability Group
--
SELECT
  ag.name AS agName,
  ar.replica_server_name AS serverName,
  db_name(drs.database_id) AS dbName,
  CASE WHEN ars.is_local = 1 THEN 'Local' ELSE 'Remote' END AS location,
  ars.role_desc AS [role],
  drs.synchronization_state_desc AS syncState,
  ars.synchronization_health_desc AS health,
  drs.log_send_queue_size AS sendQueueSizeKB,
  drs.log_send_rate AS sendRateKBps,
  CASE WHEN drs.log_send_queue_size > 0 THEN
    CASE WHEN drs.log_send_rate > 0 THEN drs.log_send_queue_size / drs.log_send_rate ELSE NULL END
  ELSE
    0
  END AS sendDelaySeconds,
  drs.redo_queue_size AS redoQueueSizeKB,
  drs.redo_rate AS redoRateKBps,
  CASE WHEN drs.redo_queue_size > 0 THEN
    CASE WHEN drs.redo_rate > 0 THEN drs.redo_queue_size / drs.redo_rate ELSE NULL END
  ELSE
    0
  END AS redoDelaySeconds,
  drs.last_commit_time AS lastCommitTime
FROM
  sys.availability_groups AS ag WITH (NOLOCK)
    INNER JOIN sys.availability_replicas AS ar WITH (NOLOCK)
    ON ag.group_id = ar.group_id 
      INNER JOIN sys.dm_hadr_availability_replica_states AS ars WITH (NOLOCK)
      ON ar.replica_id = ars.replica_id
        INNER JOIN sys.dm_hadr_database_replica_states AS drs WITH (NOLOCK)
        ON ag.group_id = drs.group_id AND drs.replica_id = ars.replica_id
WHERE
  DB_NAME(drs.database_id) IN ('database1', 'database2', 'database3')  -- Edit to taste
ORDER BY
  ag.[name], drs.database_id, ar.replica_server_name;
```