---
layout: faq
title: PowerShell - Strings
sub_title: Everything you wanted to know but were afraid to ask
faq_type: powershell
---

## String Literals

```powershell
$s = 'This is a string literal that does not interpolate variables and allows the use of literal special chars'
$s = "This is a string literal that does interpolate variables and special chars"
$foo = "bar"
$bar = "The value of the foo variable is $foo"
$bar = 'This does not interplate the value of the foo variable: $foo'
$baz = "If I want to use an expression then I have to quote it like this: $($foo.ToUpper())"
$s "This newline ... `n ... will be interpolated"
$s 'But this newline ... `n ... will not'
```

Examples ...

```powershell
$s = "foo`nbar"
# Result ...
foo
bar
# ... Result
$s = 'foo`nbar'
# Result ...
foo`nbar
# ... Result
```

## Special Characters

Basically just use `char instead of \char as you would in C and other languages.

```powershell
`r   # Carriage Return ASCII %0D (13)
`n   # Newline         ASCII %0A (10)
`t   # Tab             ASCII %09 (9)
```

## Multi-Line String Literals

Embed literal newlines ...

```powershell
$s = "line1`r`nline2"
```

Embed [System.Environment]::NewLine

```powershell
$s = "line1{0}line2" -f [System.Environment]::NewLine
```

Use a here-string ...

```powershell
$s = @"
SELECT id, value
FROM   dbo.Foo
WHERE  id IN (1, 2, 3);
"@
```

# Formatted Expressions

Use the `-f` operator ...

```powershell
$s = "{0} foo {1}" -f "value0", "value1"
# Result ...
"value0 foo value1"
# ... Result
```

Display a number to 3 decimal places

```powershell
$s = "{0:n3}" -f 3.14159
# Result ...
"3.142"
# ... Result
```

Right/left align and width

```powershell
$s = "foo {0,10:n3} bar" -f 3.14159
# Result ...
"foo      3.142 bar"
# ... Result
$s = "foo {0,-10:n3} bar" -f 3.14159
# Result ...
"foo 3.142      bar"
# ... Result
```

Padding

```powershell
$s = "{0:d3}" -f 42
# Result ...
"042"
# ... Result
```

Numbers as hex

```powershell
$s = "{0:x}" -f 10
# Result ...
"a"
# ... Result
$s = "{0:X2}" -f 10
# Result ...
"0A"
# ... Result
$s = "0x{0:X}" -f 42
# Result ...
"0x2A"
# ... Result
$s = "0x{0:X4}" -f 42
# Result ...
"0x002A"
# ... Result
```

Dates and times

```powershell
$s = "{0:HH:mm:ss.fff}" -f (Get-Date)    # HH is the hour in 24 hour time, hh is in 12 hour time, fff is milliseconds
# Result ...
"15:30:10.914"
# ... Result
$s = "{0:yyyy-MM-dd HH:mm:ss}" -f (Get-Date)    # MM is the month, mm is minutes
# Result ...
"2022-06-16 15:30:10"
# ... Result
```

[Reference](https://ss64.com/ps/syntax-f-operator.html)

## Concatenation

Concatenate strings with `+`

```powershell
$bar = "Part 1" + $foo + " part 2"
```

## Splitting Strings

The `-split` operator allows you to use a regex ...

```powershell
$s = 'foo, bar ,  baz'
$s -split '\s*,\s*'
# Result ...
foo
bar
baz
# ... Result
```

## Joining Arrays into a String

```powershell
(1, 2, 3) -join ','
# Result ...
1,2,3
# ... Result
```

# Convert hex string to integer

Prefix with '0x' and cast ...

```powershell
$hex = "0d0f"
$number = [int]"0x$hex"
# Result ...
3343
# ... Result
```

And just to prove that we can go back ...

```powershell
$number = 3343
$hex = "{0:x4}" -f $number
# Result ...
0d0f
# ... Result
```
