---
layout: post
title: On a Neat Excel Formula
sub_title: And finding things ... backwards
featured_image: /images/math_skills_stage_of_life.png
featured_image_alt_text: Excel FTW!
featured_image_title: "The solution to any problem is an Excel spreadsheet"
featured_image_width: 600
featured_image_link: https://www.youtube.com/watch?v=UBX2QQHlQ_I
tags: [excel]
---

# Tools

Excel is one of the greatest pieces of software ever written.  There, I said it.  I love Excel and use it all the time,
even for things that it probably shouldn't be used for.  It was once said that "The solution to any problem is an Excel
spreadsheet" and I sometimes think I hew too closely to that addage.  You can do all sorts of things in Excel even if it
isn't immediately obvious how to do it.

# Searching for occurrences of a substring inside a string

Excel has a nifty FIND function that you can use to find the index of the "first" occurrence of a substring inside
a string starting from a given index into the string.  I use it all the time.

```
FIND(<find_text>, <within_text>, [<start_index>])

Returns the index (1-based) of the first occurance of <find_text> within <within_text> starting from the character at
index <start_index>.  If <find_text> is not found then it returns #VALUE!.

<find_text>      Required.  The text to find.
<within_text>    Required.  The text to search.
<start_index>    Optional.  A (1-based) index offset into <within_text> to start the search for <find_text> from.  The
                 default is the first character.
```

Note that because Excel was written for business users as opposed to programmers, the indexes are all 1-based as opposed
to 0-based.  Once we get past that little annoyance then we can use it to do neat things.  For example, to find the
index of the first occurrence of the string value in cell A2 within the string value in cell A1, we would use this ...

```
=FIND(A2, A1)
```

Nice.  However, Excel does not have an equivalent function to find the index of the "last" occurrence of a substring
inside a string.  It can search from the left but it can't search from the right.  This is annoying.  However with some
inventive use of a few other Excel functions we can do it.  Here's how ...

```
=IF(ISERROR(FIND(A2, A1)),
    #VALUE!,
    FIND(REPT("~", LEN(A2)), SUBSTITUTE(A1, A2, REPT("~", LEN(A2)), (LEN(A1) - LEN(SUBSTITUTE(A1, A2, ""))) / LEN(A2))))
```

OK, that's clearly not as simple as FIND, but it works.  How does it work though?  Let's break it down.

The outer enclosing IF statement is there to mimic the behavior of the FIND function if the substring isn't found in the
string at all.  We use FIND to test for that.  If FIND returns #VALUE!, an error, then we return #VALUE! too.  Let's
remove that logic and look at what's left ...

```
FIND(REPT("~", LEN(A2)), SUBSTITUTE(A1, A2, REPT("~", LEN(A2)), (LEN(A1) - LEN(SUBSTITUTE(A1, A2, ""))) / LEN(A2)))
```

Let's break this down some more ...

```
FIND(REPT("~", LEN(A2)),
     SUBSTITUTE(A1, A2, REPT("~", LEN(A2)), (LEN(A1) - LEN(SUBSTITUTE(A1, A2, ""))) / LEN(A2)))
```

We are now using FIND to search for a different substring in a modified version of the string.  What's this all about?
The modified version of the string is the result of a call to Excel's SUBSTITUTE function ...

```
SUBSTITUTE(<text>, <old_text>, <new_text>, [<instance_num>])

<text>           Required.  The text within which you want to substitute characters.

<old_text>       Required.  The text you want to replace.

<new_text>       Required.  The text you want to replace <old_text> with.

<instance_num>   Optional.  Specifies which occurrence of <old_text> you want to replace with <new_text>.  If you
                 specify <instance_num>, only that instance of <old_text> is replaced.  Otherwise, every occurrence of
                 <old_text> in <text> is changed to <new_text>.
```

We use SUBSTITUTE to create a version of the string that has the last instance of the substring replaced with a
different (hopefully unique) substring of the same length.  It's this different substring that we can then search for
using the outer FIND call.  Note that the outer FIND call is now searching for REPT("~", LEN(A2)) as opposed to just A2.

We hope that a sequence of repeated '~' characters will be a unique substring within the string.  This isn't perfect but
it'll work most of the time.  Good enough for government work as they say.  Depending on the nature of the strings that
you are searching through in a real world application you could change this to more likely be a unique substring.

So how do we replace the last instance of the substring in the string?  Well, SUBSTITUTE has that optional fourth
argument that allows us to specify which instance of &lt;old_text&gt; that we want to replace with &lt;new_text&gt;
within &lt;text&gt;.  If we know how many instances of substring are in our string then that's the number that we need
to pass as &lt;instance_num&gt;.  The formula that we pass to this argument is ...

```
(LEN(A1) - LEN(SUBSTITUTE(A1, A2, ""))) / LEN(A2)
```

This does indeed calculate the number of instances of substring there are in our string.  But how?

We use SUBSTITUTE again.  This time to replace "all" instances of our substring with the empty string.  We then
calculate the length of this modified string and subtract it from the length of the original string.  The result is the
total number of characters in the n instances of the substring in the string.  But we know the length of each substring
so we can divide that into this total to get the number of substring instances that there were.  Voila!

And there you have it ladies and gentlemen.  Excel hackery at its best.

Let's work through some examples to demonstrate how this works.

## Example 1

```
A1: C:\some\quite\nested\file\path\foo.txt
A2: \
```

We can find the index of that last '\\' with ...

```
A3: =IF(ISERROR(FIND(A2, A1)),
        #VALUE!,
        FIND(REPT("~", LEN(A2)),
             SUBSTITUTE(A1, A2, REPT("~", LEN(A2)), (LEN(A1) - LEN(SUBSTITUTE(A1, A2, ""))) / LEN(A2))))
```

And we can extract the filename with ...

```
A4: =MID(A1, A3 + 1, LEN(A1) - A3)      -> foo.txt
```

Let's work this through from the inside out ...

```
SUBSTITUTE(A1, A2, "")                                                -> C:somequitenestedfilepathfoo.txt
LEN(SUBSTITUTE(A1, A2, ""))                                           -> 32
LEN(A1) - LEN(SUBSTITUTE(A1, A2, ""))                                 -> 6
(LEN(A1) - LEN(SUBSTITUTE(A1, A2, ""))) / LEN(A2)                     -> 6
SUBSTITUTE(A1, A2, REPT("~", LEN(A2)), 6)))                           -> C:\some\quite\nested\file\path~foo.txt
FIND(REPT("~", LEN(A2)), SUBSTITUTE(A1, A2, REPT("~", LEN(A2)), 6)))  -> 31
```

Since the substring that we were searching for was only one character long we could have simplified this a bit to ...

```
A3: =IF(ISERROR(FIND(A2, A1)),
        #VALUE!,
        FIND("~",
             SUBSTITUTE(A1, A2, "~", (LEN(A1) - LEN(SUBSTITUTE(A1, A2, ""))) / LEN(A2))))
```

## Example 2

Of course the substring will not always be just one character.

```
A1: foo|||bar|||baz|||boof|||bang|||bung
A2: |||
```

We can find the index of that last '\|\|\|' with ...

```
A3: =IF(ISERROR(FIND(A2, A1)),
        #VALUE!,
        FIND(REPT("~", LEN(A2)),
             SUBSTITUTE(A1, A2, REPT("~", LEN(A2)), (LEN(A1) - LEN(SUBSTITUTE(A1, A2, ""))) / LEN(A2))))
```

And we can extract the last token with ...

```
A4: =MID(A1, A3 + 1, LEN(A1) - A3)      -> bung
```

Let's work this through from the inside out ...

```
SUBSTITUTE(A1, A2, "")                                                -> foobarbazboofbangbung
LEN(SUBSTITUTE(A1, A2, ""))                                           -> 21
LEN(A1) - LEN(SUBSTITUTE(A1, A2, ""))                                 -> 15
(LEN(A1) - LEN(SUBSTITUTE(A1, A2, ""))) / LEN(A2)                     -> 5
SUBSTITUTE(A1, A2, REPT("~", LEN(A2)), 6)))                           -> foo|||bar|||baz|||boof|||bang~~~bung
FIND(REPT("~", LEN(A2)), SUBSTITUTE(A1, A2, REPT("~", LEN(A2)), 6)))  -> 30
```

QED