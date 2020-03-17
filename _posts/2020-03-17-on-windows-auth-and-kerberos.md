---
layout: post
title: On Windows Auth and Kerberos
sub_title: And Service Principal Names
featured_image: /images/cerberos.png
featured_image_alt_text: Cerberos
featured_image_title: "Are we sure he wasn't just a normal dog with two subwoofers?"
featured_image_width: 600
featured_image_link: https://www.youtube.com/watch?v=D-UmfqFjpl0
tags: [sql, ad]
---

# Authenticate You I Will.  But How?

When you configure a SQL Server instance one choice is what
[authentication](https://docs.microsoft.com/en-us/dotnet/framework/data/adonet/sql/authentication-in-sql-server) modes
it will support.  There are two choices: "Windows Authentication mode" and "SQL Server and Windows Authentication mode",
otherwise known as mixed mode.  Windows Authenticatian is always preferred for applications but sometimes you need to
support legacy apps or clients that do not natively support Windows Auth.  But what is Windows auth?  Actually, what is
authentication?

# Authentication and Authorization

Two terms are often thrown around when it comes to how applications connect to a server/service: authentication and
authorization.  They are similar but different concepts.  Authentication means confirming identity, whereas
authorization means confirming access.  In even more simpler terms authentication is the process of verifying who
someone is, while authorization is the process of determining what someone should have access to.

Authentication is about validating credentials and establishing identity.  A system takes the given credentials and then
somehow checks whether you are who/what you say you are.  These credentials are typically a username and password
although there are various other types of credentials and mechanisms of authentication as well.

Authorization occurs after identity has been established.  Based on the confirmed identity the system will then grant
appropriate access to resources such as databases, files, records, accounts, funds, etc.  Not all identities will have
access to all resources.  For example a system may have the notion of roles that user identities map to: customer,
staff, manager, admin, etc.

# Different Types of Authentication

## Single-Factor Authentication

This is the simplest form of authentication scheme.  In order to establish identity for potential access to a system a
user presents a username (a statement of identity) and a secret token (commonly known as a password).  The system takes
these two pieces of information and compares the secret token to stored information for that username in order to
determine that the user is who they claim to be.  If the secret matches the saved secret then the claimed identity is
accepted.

A secure system does not store the secret tokens in plaintext in a datastore, rather it stores hashed versions of the
secret tokens.  By "hashed" I mean the result of passing the secret token through a one-way transformation that reliably
maps inputs to outputs (the hash of the input) but for which it is prohibitively hard to take a given output hash value
and convert it back into the input that generated that output.  The system stores the hashed secret tokens in its data
store.  When a user presents their username and secret token, the system calculates the hash of that secret token and
compares it to the saved value for the presented username.  If the values match then identity is established.

## Two-Factor Authentication

This scheme requires a two-step verification process which not only requires a username and password, but also an
additional piece of information only the user knows or is in possession of.  This commonly involves some sort of
"callback" to a previously registered device (e.g. a cell phone) with a token that the user then presents back to the
system, or a request for a token from a previously configured token generator scheme (e.g. the Google Authenticator
app), typically a known pseudo random number generation algorithm with a coordinated seed.  Such schemes are becoming
increasingly common.

## Multi-Factor Authentication

This is the most advanced method of authentication which requires three or more levels of security from independent
categories of authentication in order to establish identity.  These "factors" are independent of each other in order to
minimize the risk of data exposure.

# SQL Server Authentication

SQL Server auth is a simple single-factor authentication scheme.  Once a client program has estalbished its initial
connection to the SQL Server process (e.g. a TCP socket) then the username and password are sent over the wire for
processing.  SQL Server hashes the password, compares it to the saved hash for the username and confirms identity if
they match.  This is not ideal since the application has to have access to both the username and password in order to
present them everytime it needs to connect to the database server.  The application is wholely responsible for securing
the username and password.  Often this leads to passwords being stored in app configuration files in an unsecure way.

# Windows Authenticaion

[Windows authentication](https://docs.microsoft.com/en-us/windows-server/security/windows-authentication/windows-authentication-overview)
can actually uses various schemes.  The two main ones are
[NTLM](https://docs.microsoft.com/en-us/windows-server/security/kerberos/ntlm-overview) and
[Kerberos](https://docs.microsoft.com/en-us/windows-server/security/kerberos/kerberos-authentication-overview).  When
you connect to SQL Server using "Windows authenticatian" then you might use either scheme depending on the context.
NTLM will be used for systems configured as a member of a workgroup and for local logon authentication on non-domain
controllers.  In a domain, Kerberos is the default scheme but its use requires that the SQL Server service is running as
an account that has the appropriate permissions to domain objects and that the configuration in the domain is correct.

## NTLM

NTLM credentials consist of the domain name, the username and a one-way hash of the user's password.  NTLM uses an
encrypted challenge/response protocol to authenticate a user without sending the user's password over the wire.
Instead, the system requesting authentication must perform a calculation that proves it has access to the secured NTLM
credentials.  More details are beyond the scope of this post.

## Kerberos

[Kerberos](https://docs.microsoft.com/en-us/windows/win32/secauthn/microsoft-kerberos) is more complex and a complete
treatment is definitely beyond the scope of this post.  Ultimately it provides a mechanism for mutual authentication
between entities before a secure network connection is established.  It assumes that transactions between clients and
servers take place on an open network where machines are not physically secure, and packets can be monitored and
modified at will.  It is much more secure than NLTM and should always be preferred.

# Did my SQL Server connection Use Kerberos or NTLM?

When you logon to a remote SQL Server instance using Windows Authentication how do you know what authentication scheme
was used?  You can check this by querying an appropriate dynamic management view (DMV).

``` sql
SELECT auth_scheme FROM sys.dm_exec_connections WHERE session_id = @@SPID;
```

This will return either "NTLM" or "KERBEROS".  Now if you think that you should be using Kerberos (because you are
connecting to a remote SQL Server instance in a domain environment) but you are not then there are a few things to
check.

Kerberos auth requires the registration of appropriate Service Principal Names (SPNs) on appropriate objects in Active
Directory.  These are service-specific key-value pairs saved as part of the servicePrincipalName attribute on the AD
computer object of the machine that is running SQL Server [See below to an exception to this when using AD managed
service accounts].  If these are not set correctly then Kerberos can't be used and SQL Server will fall back to using
NTLM.

If SPNs are not set correctly you may also see
[other errors](https://support.microsoft.com/en-us/help/2443457/you-may-experience-connectivity-issues-to-sql-server-if-spns-are-misco)
when trying to connect to a SQL Server instance, e.g. "Cannot Generate SSPI Context".

You can check the SPN configuration using the ADSI Edit app in Windows (adsiedit.msc).  Navigate to the CN record for
the SQL Server machine then right click and select Properties to bring up the Properties dialog box.  In the
"Attribute Editor" tab scroll down and find the "servicePrincipalName" entry.  Click on "Edit" or "View" (depending on
your access) and you should see a collection of values something like this ...

```
Values
...
HOST/servername
HOST/servername.mycompany.com
MSSQLSvc/servername.mycompany.com
MSSQLSvc/servername.mycompany.com:1433
...
```

You should see lines prefixed with "MSSQLSvc".  These are the SPNs for the SQL Server service running on this machine.
If they are missing then something is wrong.

These entries should be automatically added by the SQL Server service when it starts up.  However this assumes that the
account that the SQL Server service is logging on with has the approprate rights to set these attributes in Active
Directory.  If someone has changed the account that the service will run as (e.g. to an incorrectly configured domain
service account) then this might be an issue.  Check the SQL Server error log for entries that say something like this
...

```
The SQL Server Network Interface library could not register the Service Principal Name (SPN)
[MSSQLSvc/servername.mycompany.com:1433 ] for the SQL Server Service.  Windows return code:
0x2098, state: 15.  Failure to register an SPN might cause integrated authentication to use
NTLM instead of Kerberos.  This is an informational message.  Further action is only required
if Kerberos authentication is required by authentication policies and if the SPN has not been
manually registered.
```

The account running the SQL Server service has to have the appropriate permissions to write the SPN to AD.  The default
SQL Server service account (NT Service\MSSQLSERVER) can do this.  If you want to use a service account - and in a domain
environment you should - then you will need to use an appropriately configured managed service account.  See
[here]({{ site.baseurl }}{% post_url 2020-03-16-on-ad-group-managed-service-accounts %}) for more on that.

On the subject of using group managed service accounts, if you are doing that then the SQL Server SPNs will actually be
registered on a different object in AD.  As opposed to being registered on the CN object for the computer on which a
given SQL Server instance is running, any SQL Server instance configured to logon as a group managed service account
will actually register its SPN on the CN for the group managed service account.  So, using the same terminology from my
other blog post, about managaged service accounts, if we have three machines (sqlnj01, sqlnj02 and sqlca01) all
configured to run the SQL Server service as the managed service account gmsa-sqlag01 then we will not find MSSQLSvc
SPNs on the CN objects for sqlnj01, sqlnj02 and sqlca01 in AD.  Rather, on the CN object for gmsa-sqlag01 we will see
these values under the servicePrincipalName attribte ...

```
Values
...
MSSQLSvc/sqlnj01.mycompany.com
MSSQLSvc/sqlnj01.mycompany.com:1433
MSSQLSvc/sqlnj02.mycompany.com
MSSQLSvc/sqlnj02.mycompany.com:1433
MSSQLSvc/sqlca01.mycompany.com
MSSQLSvc/sqlca01.mycompany.com:1433
...
```

Happy authenticating!

# References

* [SQL Server Authentication](https://docs.microsoft.com/en-us/dotnet/framework/data/adonet/sql/authentication-in-sql-server)
* [Windows Authentication Overview](https://docs.microsoft.com/en-us/windows-server/security/windows-authentication/windows-authentication-overview)
* [Register an SPN for Kerberos Connections](https://docs.microsoft.com/en-us/sql/database-engine/configure-windows/register-a-service-principal-name-for-kerberos-connections?view=sql-server-ver15)
* [SQL Server Connectivity Issues if SPNs are Misconfigured](https://support.microsoft.com/en-us/help/2443457/you-may-experience-connectivity-issues-to-sql-server-if-spns-are-misco)
* [Microsoft Kerberos](https://docs.microsoft.com/en-us/windows/win32/secauthn/microsoft-kerberos)
* [Microsoft Kerberos Configuration Checker Tool](https://www.microsoft.com/en-us/download/details.aspx?id=39046)
  