---
layout: faq
title: PowerShell - Pipelines
sub_title: Everything you wanted to know but were afraid to ask
faq_type: powershell
---

## ForEach-Object

```powershell
1..5 | % { "x$_" }
# Result ...
x1
x2
x3
x4
# ... Result
1..5 | foreach { "x$_" }
# Result ...
x1
x2
x3
x4
# ... Result
```

## Select-Object

```powershell
$array = @(
  @{ name = "Alan"; age = 42 }
  @{ name = "Bob"; age = 24 }
  @{ name = "Joe"; age = 34 }
)
$array | Convert-ToJson
# Result ...
[
  {
    "name": "Alan",
    "age": 42
  },
  {
    "name": "Bob",
    "age": 24
  },
  {
    "name": "Joe",
    "age": 34
  }
]
# ... Result
$array | select name | Convert-ToJson
# Result ...
[
  {
    "name": "Alan"
  },
  {
    "name": "Bob"
  },
  {
    "name": "Joe"
  }
]
# ... Result
```


## Where-Object

```powershell
1..10 | ? { $_ % 2 -eq 0 }
# Result ...
2
4
6
8
10
# ... Result
1..10 | where { $_ % 2 -eq 0 }
# Result ...
2
4
6
8
10
# ... Result
```
