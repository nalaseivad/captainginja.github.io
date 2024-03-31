---
layout: post
title: On Fizz Buzz
sub_title: "And abstraction, and style ..."
featured_image: /images/fizz_buzz_ai_image.png
featured_image_alt_text: "alt text"
featured_image_title: "Disclaimer: This image was created by the Dall-E AI tool"
featured_image_width: 600
featured_image_link: https://www.google.com/search?q=crazy+ai+images
mathjax: 1
tags: [code]
---

# Coding Interviews

Coding interviews are typically horrible.  Rather than evaluating the useful knowledge and experience of a candidate,
and their ability to contribute to real world projects, they're invariably just invitations to write code to solve
arbitrary algorithm and data structures puzzles, and under time and situational pressure to boot.

Now don't get me wrong, such puzzles are fun and there is something to be said for asking a candidate to actually write
code as part of an interview; but more often than not, the ability to write code - on demand - to reverse a linked list,
is not an accurate indication of someone's ability to contribute as a member of a dev team in most real world
siutations.  But I digress, this isn't a post about how to interview more effectively - although I should write such a
thing one day - it's about coding puzzles, and more importantly, abstraction and code style.

# Fizz Buzz

A popular, some might say hackneyed, coding interview puzzle is Fizz Buzz.  Here's the ask ...

> Write code that will print out the numbers 1 to 100, in order, with each number on a new line.  However, if the number
> is divisible by 3 then print out the word 'Fizz' instead, if the number is divisible by 5 then print out the word
> 'Buzz' instead, and if the number is divisible by both 3 and 5 then print out the word 'FizzBuzz' instead.

Simple enough right?  Let's give it a try, in Python.

``` python
for n in range(1, 101):
  if n % 3 and n % 5 == 0:
    print('FizzBuzz')
  elif n % 3 == 0:
    print('Fizz')
  elif n % 5 == 0:
    print('Buzz')
  else:
    print(n)
```

This works but it's not pretty.  We repeat the strings to print and have three cases to test.  Can we do it with simpler
logic?  First let's try to remove the duplication and combine the cases.

``` python
for n in range(1, 101):
  if n % 3 == 0:
    print('Fizz', end = '')
  if n % 5 == 0:
    print('Buzz')
  else:
    print(n)
```

This doesn't quite meet the spec though.  It produces this output ...

```
1
2
Fizz3
4
Buzz
Fizz6
7
8
Fizz9
Buzz
11
Fizz12
13
14
FizzBuzz
16
```

We need to code for printing a newline after 'Fizz' if the number is divisible by 3 but not divisible by 5, something
like ...

``` python
for n in range(1, 101):
  if n % 3 == 0:
    print('Fizz', end = '')
    if n % 5 != 0:
      print()
  if n % 5 == 0:
    print('Buzz')
  else:
    print(n)
```

This does away with the duplicate strings but still has more logic cases than I'd like.  Let's think about this a bit
more.  We want to print something for each of the numbers 1 through 100, so let's abstract out that something.

``` python
def fizz_buzz(n):
  return f'Output for n = {n}'

for n in range(100):
  print(fizz_buzz(n + 1))
```

This has a slightly cleaner loop.  we don't need to use two parameters to the range function, just one will give us the
numbers 0 to 99 but we can then pass n + 1 into our function.  Also, the function doesn't know or care that its result
will be printed out so it doesn't need to worry about newlines anymore.

We still need the modulo logic in the function though.  Let's see if we can factor out the 3 and 5, the logic is the
same regardless of the divisor and the string to return.  How do we factor that out?  Another function!

``` python
def value_if_divisor(n, divisor, value):
  if n % divisor == 0:
    return value
  return ''
```

We can make this more concise.

``` python
def value_if_divisor(n, divisor, value):
  return value if n % divisor == 0 else ''
```

And use it like this ...

``` python
def value_if_divisor(n, divisor, value):
  return value if n % divisor == 0 else ''

def fizz_buzz(n):
  ret = value_if_divisor(n, 3, value)
  ret += value_if_divisor(n, 5, value)
  return ret or str(n)

for n in range(100):
  print(fizz_buzz(n + 1))
```

But why limit ourselves to just two possible divisors?  We could support an arbitrary list.

``` python
def value_if_divisor(n, divisor, value):
  return value if n % divisor == 0 else ''

def values_for_divisors_or_n(divisors, values, n):
  ret = ''
  for divisor, value in zip(divisors, values):
    ret += value_if_divisor(n, divisor, value)
  return ret or str(n)

for n in range(100):
  print(values_for_divisors_or_n((3, 5), ('Fizz', 'Buzz'), n + 1))
```

Note the use of the zip function to take two iterable collections and return a single iterator that gives you a pair of
values for corresponding elements in turn.  Zip is useful.

Do we always want to concatenate the replacement values?  Could we abstract out the combination logic?  Sounds like we
need another function.

``` python
def value_if_divisor(n, divisor, value):
  return value if n % divisor == 0 else ''

def values_for_divisors_or_n(divisors, values, n, combine_fn):
  ret = ''
  for divisor, value in zip(divisors, values):
    ret = combine_fn(ret, value_if_divisor(n, divisor, value))
  return ret or str(n)

def concatenate(a, b):
  return a + b

for n in range(100):
  print(values_for_divisors_or_n((3, 5), ('Fizz', 'Buzz'), n + 1, concatenate))
```

So now we can use more complex combination logic without having to think about the rest of the logic.

``` python
...

def concatenate(a, b):
  sep = '' if a == '' or b == '' else '-'
  return a + sep + b

...
```

And for simple logic we can use a lambda.

``` python
...

for n in range(100):
  print(values_for_divisors_or_n((3, 5), ('Fizz', 'Buzz'), n + 1, lambda a, b: a + b))
```

This is pretty generic now but is it efficient?  We need to allocate memory to hold the full list of divisors and
replacement values.  The range function returns an iterator so we don't need to hold all the integers that we want to
test in memory at the same time, we just hold each integer as we process it and then forget it.

For extra style points we could take advantage of the fact that print is a variadic function and use a generator
expression along with the prefix '*' unpack operator, like this ...

``` python
print(*(values_for_divisors_or_n((3, 5), ('Fizz', 'Buzz'), n + 1, lambda a, b: a + b)
        for n in range(100)),
      sep = '\n')
```

... but this would then require all of the elements returned by the values_for_divisors_or_n function to be materialized
in memory at the same time, so that we could then pass them all as parameters to the single call to the print function.
This would not scale well with larger lists of integers.

So, let's stick with calling print once for each integer.  Here's our final - generic and neat - Fizz Buzz solution.

``` python
def value_if_divisor(n, divisor, value):
  return value if n % divisor == 0 else ''

def values_for_divisors_or_n(divisors, values, n, combine_fn):
  ret = ''
  for divisor, value in zip(divisors, values):
    ret = combine_fn(ret, value_if_divisor(n, divisor, value))
  return ret or str(n)

for n in range(100):
  print(values_for_divisors_or_n((3, 5), ('Fizz', 'Buzz'), n + 1, lambda a, b: a + b))
```

So when the next tech interviewer asks you the Fizz Buzz question you can really impress them.
