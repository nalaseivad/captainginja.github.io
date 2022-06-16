---
layout: faq
title: PowerShell - Everything Else
sub_title: Everything you wanted to know but were afraid to ask
faq_type: powershell
---

## Versions

You really should be using the cross-platform [PowerShell Core](https://github.com/PowerShell/PowerShell).  You can get
[installers](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell?view=powershell-7.2)
for Windows, Linux and MacOS.

PowerShell Core is implemented in pwsh.exe whereas the old, Windows specific, PowerShell was powershell.exe.  The two
versions can coexist on the same machine. 

## What Version of PowerShell is installed?

```
PS H:\> Get-Host

Name             : ConsoleHost
Version          : 7.2.4
InstanceId       : 052ac3b9-57bb-48b5-bc46-8dbc2636c883
UI               : System.Management.Automation.Internal.Host.InternalHostUserInterface
CurrentCulture   : en-US
CurrentUICulture : en-US
PrivateData      : Microsoft.PowerShell.ConsoleHost+ConsoleColorProxy
DebuggerEnabled  : True
IsRunspacePushed : False
Runspace         : System.Management.Automation.Runspaces.LocalRunspace

PS H:\> 
```

## Variables

```
$foo = 1
$foo = 3.142
$foo = 'bar'
$foo = "bar"
$foo = '2022-06-15 23:10:11'
```

## Types and Casting

```
PS H:\> $foo = 1
PS H:\> $foo.GetType()

IsPublic IsSerial Name                                     BaseType
-------- -------- ----                                     --------
True     True     Int32                                    System.ValueType

PS H:\> $foo = 3.142
PS H:\> $foo.GetType()

IsPublic IsSerial Name                                     BaseType
-------- -------- ----                                     --------
True     True     Double                                   System.ValueType

PS H:\> $foo = 'bar'
PS H:\> $foo.GetType()

IsPublic IsSerial Name                                     BaseType
-------- -------- ----                                     --------
True     True     String                                   System.Object

PS H:\> $foo = "bar"
PS H:\> $foo.GetType()

IsPublic IsSerial Name                                     BaseType
-------- -------- ----                                     --------
True     True     String                                   System.Object

PS H:\> $foo = [int]3.142
PS H:\> $foo
3
PS H:\> $foo = [double]42
PS H:\> $foo.GetType()

IsPublic IsSerial Name                                     BaseType
-------- -------- ----                                     --------
True     True     Double                                   System.ValueType

PS H:\> $foo = [DateTime]'2022-06-15 12:23:34'
PS H:\> $foo.GetType()

IsPublic IsSerial Name                                     BaseType
-------- -------- ----                                     --------
True     True     DateTime                                 System.ValueType

PS H:\> $foo

Wednesday, June 15, 2022 12:23:34 PM

PS H:\>
```

## Strings and Interpolation

Double quoted strings interpolate variables.  Single quoted strings do not.

```
$foo = "bar"
$bar = "I said $foo"
$baz = 'I said $foo'
```

To interpolate an expression surround the expression in `$( )`.

```
$bar = "I said $($foo.ToUpper())"
```

Concatenate strings with `+`

```
$bar = "Part 1" + $foo + " part 2"
```

## Arrays

Create literal lists ...

```
PS H:\> $array = 1, 2, 3
PS H:\> $array.GetType()

IsPublic IsSerial Name                                     BaseType
-------- -------- ----                                     --------
True     True     Object[]                                 System.Array

PS H:\>
```

Alternatives ...

```
$array = (1, 2, 3)
$array = @(1, 2, 3)
```

Add onto the end of an array.  This actually creates a new array and copies the old array over ...

```
PS H:\> $array = 1, 2, 3
PS H:\> $array + 4
1
2
3
4
PS H:\> $array.Length
4
```

## Dynamic Arrays

Use .Net collections ...

```
PS H:\> $list = New-Object System.Collections.Generic.List[string]
PS H:\> $list.GetType()

IsPublic IsSerial Name                                     BaseType
-------- -------- ----                                     --------
True     True     List`1                                   System.Object

PS H:\> $list.Add('foo')
PS H:\> $list.Add('bar')
PS H:\> $list
foo
bar
PS H:\> $list.GetType()

IsPublic IsSerial Name                                     BaseType
-------- -------- ----                                     --------
True     True     List`1                                   System.Object

PS H:\> $list[0]
foo
PS H:\> $list[0].GetType()

IsPublic IsSerial Name                                     BaseType
-------- -------- ----                                     --------
True     True     String                                   System.Object

PS H:\> $list.Count
3
PS H:\>
```

## Hash Tables

```
PS H:\> $hash = @{ foo = 'bar'; bar = 'baz'  }
PS H:\> $hash

Name                           Value
----                           -----
bar                            baz
foo                            bar

PS H:\> $hash.Add('baz', 'bing')
PS H:\> $hash

Name                           Value
----                           -----
bar                            baz
foo                            bar
baz                            bing

PS H:\> $hash.Remove('baz')
PS H:\> $hash

Name                           Value
----                           -----
bar                            baz
foo                            bar

PS H:\> $hash.bar
baz
PS H:\> $hash['bar']
baz
PS H:\>
PS H:\> $hash = @{ 'foo' = 'bar'; 'bar' = 'baz'  }
PS H:\> $hash

Name                           Value
----                           -----
bar                            baz
foo                            bar

PS H:\>
```

## Nested Structures

```
PS H:\> $hash = @{
>> foo = @(
>> 1,2,3
>> ); bar = @(42)
>> }

Name                           Value
----                           -----
bar                            {42}
foo                            {1, 2, 3}

PS H:\> $hash.foo
1
2
3
PS H:\>
```

## Splitting Strings

The `-split` operator allows you to use a regex ...

```
PS H:\> $s = 'foo, bar ,  baz'
PS H:\> $s -split '\s*,\s*'
foo
bar
baz
PS H:\>
```

## Joining Arrays

```
PS H:\> (1, 2, 3) -join ','
1,2,3
PS H:\>
```

# Regex Replace

```
PS H:\> $s = '   foo bar baz   '
PS H:\> $s -replace '^\s+(.+)\s+', '$1'
foo bar baz
PS H:\>
```

# Regex Match

```
PS H:\> $s = '   foo    bar '
PS H:\> $s -match '\s+ba'
True
PS H:\>
```

## Looping

```
foreach($element in $array) {
  Write-Host $element
}

for($n = 0; $n -lt 10; ++$n) {
  Write-Host $n
}

$n = 0
while($true) {
  Write-Host $n
  if($n -gt 4) { break }
  ++$n
}

$n = 0
do {
  Write-Host $n
  ++$n
} while($n -lt 4)

$n = 0
do {
  Write-Host $n
  ++$n
} until($n -gt 4)

```

