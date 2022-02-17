---
layout: faq
title: Windows
sub_title: Only the best tips and hacks
faq: true
---

## Active Directory Security Groups

You might think that using Active Directory security groups was a good abstraction but I'm coming to the opinion they
are actually a pain in the arse.  I have tried to use them to manage permissions to SQL Server instances. I create a
security group and then add that group as a login to a SQL Server instance.  Then I grant privileges to the group.
Then - ideally - I can just add a domain user to the security group and then that user will receive access to the SQL
Server instance with the associated privileges.

The problem is that Windows caches AD security group membership when a user logs into a machine.  There may be a TTL for
this cache - I'm not 100% sure - but if there is it's pretty long.  This means that when I add a new domain user account
to the security group in order for them to receive access to SQL Server, the Windows machine that they are currently
logged in to will not know that they are now a member of that security group and so "Windows Authentication" from
SQL Server Management Studio (SSMS) will not allow them to login to the requisite SQL Server instance since
Kerberos/NTLM will not know that they are a member of the group that is a login to the instance.

The fix is to have the user log out of and back into Windows on the machine on which they are running SSMS.  When they
relogin Windows will rediscover the security groups that they are a member of and cache that info anew.  Then when they
launch SSMS, Windows Authentication to the required SQL Server instance will work.

Or ... they can hack it like this ...

* Close SSMS
* ```taskkill /f /im explorer.exe```
* ```runas /user:<domain>\<username> explorer.exe```
* Restart SSMS

Item #3 will restart Windows Explorer and "relogin".  This will reread security group membership.  Any new process
started from the new Windows Explorer process will be a subprocess and will inherit group membership.  The newly
launched SSMS instance will then be able to login to the required SQL Server instance.

