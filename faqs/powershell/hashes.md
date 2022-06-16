---
layout: faq
title: PowerShell - Hashes
sub_title: Everything you wanted to know but were afraid to ask
faq_type: powershell
---

## Literals

Delimited lists

```powershell
$hash = @{ foo = "bar"; bar = "baz" }
# Result ...
Name                           Value
----                           -----
bar                            baz
foo                            bar
# ... Result
```

Multi-line.  No need for the ; anymore.

```powershell
$hash = @{
  foo = "bar"
  bar = "baz"
}
# Result ...
Name                           Value
----                           -----
bar                            baz
foo                            bar
# ... Result
```

Using the ; is still fine though

```powershell
$hash = @{
  foo = "bar";
  bar = "baz"
}
# Result ...
Name                           Value
----                           -----
bar                            baz
foo                            bar
# ... Result
```
