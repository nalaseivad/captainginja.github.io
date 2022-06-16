---
layout: faq
title: PowerShell - Arrays
sub_title: Everything you wanted to know but were afraid to ask
faq_type: powershell
---

## Literal Lists

Delimited lists.  Both , and ; work as the delimiter when all the items are on one line.  Or a mix of both.

```powershell
$array = 1, 2, 3
$array = 1; 2; 3
$array = 1, 2; 3
$array = (1, 2, 3)
$array = @(1, 2, 3)
# Result ...
1
2
3
# ... Result
```

Multi-line lists.  No need for the , or ; anymore.

```powershell
$array = @(
  1
  2
  3
)
# Result ...
1
2
3
# ... Result
```

Although it's fine if you still use them

```powershell
$array = @(
  1,
  2,
  3
)
# Result ...
1
2
3
# ... Result
```

## Enumerations

```powershell
1..5
# Result ...
1
2
3
4
5
# ... Result
0..4
# Result ...
0
1
2
3
4
# ... Result
5..1
# Result ...
5
4
3
2
1
# ... Result
-2..2
# Result ...
-2
-1
0
1
2
# ... Result
```
