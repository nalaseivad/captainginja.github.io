---
layout: post
title: On The Countdown Numbers Game
sub_title: "And cats ..."
featured_image: /images/countdown_numbers_game.png
featured_image_alt_text: "alt text"
featured_image_title: "That countdown jingle though ..."
featured_image_width: 600
featured_image_link: https://www.youtube.com/watch?v=3pqGwaUEjI8
mathjax: 1
tags: [code]
---

# Game Shows

Ah, TV game shows.  We all have our favorites, and one of mine is
[Countdown](https://en.wikipedia.org/wiki/Countdown_(game_show)).  Well, actually I much prefer
[8 Out of 10 Cats Does Countdown](https://www.google.com/search?q=8+out+of+10+cats+does+countdown&tbm=vid) really.  It
has all the good stuff from Countdown while also having so much more.  It also introduced another game into the mix
which I will mention in due course.

Countdown has two main games: The word game and the numbers game, both with two players.  The first one is OK but I've
never really been a word guy.  My brain just doesn't really work that well with words.  Ah, but the numbers game ...
that's the juice.  The contestant in control chooses six of 24 shuffled face-down number tiles, arranged into two
groups: 20 "small numbers" (two each of 1 to 10) and four "large numbers" (25, 50, 75 and 100).  Then an off-stage
computer (triggered via a suitably theatrical button) generates a three digit target number.  Then it's up to the
contestants to combine the numbers, along with the standard arithmetic operators (+, -, *, /), in order to come up with
an expression that will evaluate to the target number.  They have 30 seconds to do this, enforced by the most famous
[countdown timer jingle](https://www.youtube.com/watch?v=M2dhD9zR6hk) in all of TV.

Sometimes the numbers game is easy but sometimes it can be fiendishly hard with a complicated solution.  For example,
this one ...

```
target  = 952
numbers = 3 6 25 50 75 100
```

... has only two solutions, but even so, was famously [solved](https://www.youtube.com/watch?v=pfa3MHLLSWI) by a clever
chap in quite some style.

The TV game is a mental challenge but this is the sort of thing that naturally begs for a computer solver, and that is
the subject of today's post.  Onward!

# That Other Game

Oh yes, the other game, from Cats Does Countdown.  It's called
[Carrot in a Box](https://www.youtube.com/watch?v=0UGuPvrsG3E) and it's ace.  It was so good in fact that they played it
[again](https://www.youtube.com/watch?v=w58Rco0iyMk).  And [again](https://www.youtube.com/watch?v=IlEeHrTF9YE).

# Initial Approach and Attempts

There are no clever shortcut solutions here, this calls for a brute force search through the space of possible
expressions with a focus on efficiency.  I've been thinking about this for some time and had a few runs at coding up
something, in Python.

My first attempt worked but was slow.  I came up with the idea of writing a Reverse Polish Notation (RPN) calculator and
then generating all possible RPN expressions from the six numbers and four arithmetic operators, evaluating each
expression in turn and then seeing which ones matched the target number.  I thought that RPN notation would be useful
since it avoided any issues of operator precedence in the evaluation of the expressions.  This implementation was very
memory inefficient though.

Then I found some Countdown Numbers Game solvers online (e.g. [this one](https://www.maths-resources.com/countdown/))
and I saw that they could solve the game almost instantly.  That one was implemented in JavaScript and I could find the
code with a little "view page source" action.  It gave me some ideas for a different approach which I then ran with in
order to come up with a much faster solver.  And I learnt some things along the way.

# My Solution

My [new solution](https://github.com/nalaseivad/countdown-numbers) is still brute force but it involves a much simpler
recursive search.  Here's the core function ...

``` python
#
# The main recursive routine to search the space of possible expressions and find those that evaluate
# to the target
#
def _find_expressions_for_target(expressions, target, found_fn):
  first_expression = expressions[0]
  if _get_expression_value(first_expression) == target:
    if found_fn(first_expression):
      return 1
    
  for i in range(len(expressions) - 1):
    ei = expressions[i]
    for j in range(i + 1, len(expressions)):
      ej = expressions[j]
      for op_key in _operators.keys():
        valid, new_expression = _do_operation(op_key, ei, ej)
        if not valid: continue
        new_expressions = _new_expression_list(expressions, new_expression, i, j)
        if _find_expressions_for_target(new_expressions, target, found_fn):
          return 1
```

This assumes that the expressions argument contains a list of expressions where each expression is either a number or a
tuple of the form (number, operator, lhs_expression, rhs_expression).  Nested expressions are supported, and are
actually required as part of the logic.

I follow the canonical structure of a recursive function ...

* Check for my base case, i.e. that the first expression in the list has a value equal to the target
* Proceed to enumerate all the ways that I can "reduce" the expression list by one (combine two elements via an
  operation to create a new element and move everything else down) and call myself with each of those smaller lists

I abstracted out what the user wants to do with a found solution expression by requiring them to pass in a function that
I will call with the solution expression as its argument.  I also allow the user to control whether they are happy with
the first solution expression found or whether they want to continue and find all possible solution expressions.  If
their function returns true (1, True, or any other value that Python considers "true") then they are "one and done",
whereas if they return false then we keep going.

I store all the possible operators in a dict structure ...

``` python
def _swap_args(a, b):
  return b, a

def _args(a, b):
  return a, b

#
# A dict to contain info about possible operators
#
_operators = {
  'ADD' : ['+', lambda a, b: a + b, _args],
  'SUB' : ['-', lambda a, b: a - b, _args],
  'SUB2' : ['-', lambda a, b: b - a, _swap_args],    # Subtraction with the args swapped
  'MUL' : ['*', lambda a, b: a * b, _args],
  'DIV' : ['/', lambda a, b: a / b, _args],
  'DIV2' : ['/', lambda a, b: b / a, _swap_args],    # Division with the args swapped
}
```

... and use a trick that I learnt from the online JavaScript solver that I found, to consider subtraction and division
two ways (as "a - b" and "b - a", and as "a / b" and "b / a").  I store the actual operation logic in the dict value as
a lambda and also store a function that will swap the order of the operands if I am using one of my "reverse" sub/div
operations.

Then my _do_operation function is this ...

``` python
#
# Perform an operation, if valid.  Returns a bool (indicating whether the expression was valid) and
# a tuple containing (result, op, lhs, rhs).
#
def _do_operation(op_key, lhs, rhs):
  lhs_value = _get_expression_value(lhs)
  rhs_value = _get_expression_value(rhs)
  if not _is_valid_operation(op_key, lhs_value, rhs_value):
    return 0, None

  op_symbol, op_fn, args_fn = _operators[op_key]
  result = op_fn(lhs_value, rhs_value)
  lhs, rhs = args_fn(lhs, rhs)             # Potentially swap the args, for DIV2 and SUB2
  return 1, (result, op_symbol, lhs, rhs)
```

... which uses some other helper functions ...

``` python
#
# Get the value from an expression tuple of the form (value, op, lhs, rhs)
#
def _get_expression_value(expression):
  return expression[0] if type(expression) is tuple else expression


#
# Is a given operation valid according to our use case?
#
def _is_valid_operation(op_key, lhs, rhs):
  # Skip division by zero or any division that results in a remainder
  if(op_key == 'DIV' and (rhs == 0 or lhs % rhs != 0)): return 0
  if(op_key == 'DIV2' and (lhs == 0 or rhs % lhs != 0)): return 0

  # Skip any subtraction that results in a negative number
  if(op_key == 'SUB' and rhs > lhs): return 0
  if(op_key == 'SUB2' and lhs > rhs): return 0

  # It's a legit operation
  return 1
```

The _new_expression_list function is the important one for recursion ...

``` python
#
# Create a new list of expressions from the old one, a new expression and the indexes of the args
# to that new expression
#
def _new_expression_list(expressions, new_expression, i, j):
  # Replace the element at position i with the new expression and exclude the element at position j
  result = expressions[0:i] + [new_expression] + expressions[i + 1:j]
  # Concatenate any elements after position j
  if j < len(expressions):
    result += expressions[j + 1:]
  return result
```

Above I said that I ...

> ... proceed to enumerate all the ways that I can "reduce" the expression list by one (combine two elements via an
> operation to create a new element and move everything else down) and call myself with each of those smaller lists

At a given level of recursion the expressions argument to the _find_expressions_for_target function references a list of
expressions.

```
expressions = [ e0, e1, e2, ..., eN ]
```

We will enumerate all pairs of elements of this list with a double loop and then a loop over all possible operators ...

``` python
  for i in range(len(expressions) - 1):
    ei = expressions[i]
    for j in range(i + 1, len(expressions)):
      ej = expressions[j]
      for op_key in _operators.keys():
        ...
```

The variable i takes values from 0 (the index of the first element in the list) through one less than the index of the
last element in the list, and j takes values from i + 1 (the index of the next element in the list after the ith
element) through the index of the last element in the list.  As such (i, j) are the indexes of each pair of elements in
the list.  Then for each of these pairs we combine them using each of the possible operators.

For each ith expression (ei), jth expression (ej) and operator (op), we calculate result (r = lhs op rhs) where (lhs,
rhs) could be (ei, ej) or (ej, ei) based on the operator (we have those SUB2 and DIV2 operators remember) and then
create a new expression list by replacing ei with [r, op, lhs, rhs] and removing ej.  Here's some examples ...

```
expressions     = [ e0, e1, e2, e3, e5, e6 ]
                    ^   ^
                    ei  ej
new_expressions = [ [ r, op, lhs, rhs ], e2, e3, e4, e5, e6 ]


expressions     = [ e0, e1, e2, e3, e4, e5, e6 ]
                    ^       ^
                    ei      ej
new_expressions = [ [ r, op, lhs, rhs ], e1, e3, e4, e5, e6 ]


expressions     = [ e0, e1, e2, e3, e4, e5, e6 ]
                            ^           ^
                            ei          ej
new_expressions = [ e0, e1, [ r, op, lhs, rhs ], e3, e4, e6 ]


expressions     = [ e0, e1, e2, e3, e4, e5, e6 ]
                            ^               ^
                            ei              ej
new_expressions = [ e0, e1, [ r, op, lhs, rhs ], e3, e4, e5 ]
```

In each case len(num_expressions) is one less than len(expressions).  This facilitates our recursion.

# How Does It Work?

It works pretty well.  It's practically instantaneous to find a single solution to any set of inputs and it'll find all
solutions in a couple of seconds.

Handling found solution expressions is delegated to the user of the module.  Initially I wrote a simple CLI that just
printed out the solution in each call to my found function.  But this resulted in some duplicate expressions.  E.g. ...

```
[adavies@bob ~/countdown-numbers]$python3 ./countdown_numbers_solver_cli.py  952 3 6 25 50 75 100 -all
target = 952, numbers = [3, 6, 25, 50, 75, 100]
((((3 * 75) * (6 + 100)) - 50) / 25)
(((((3 + 100) * 6) * 75) / 50) + 25)
(((((3 + 100) * 75) * 6) / 50) + 25)
((((3 + 100) * (6 * 75)) / 50) + 25)
(((3 + 100) * ((6 * 75) / 50)) + 25)
((((3 + 100) * (6 * 75)) / 50) + 25)
(((3 + 100) * ((6 * 75) / 50)) + 25)
(((3 + 100) * ((6 * 75) / 50)) + 25)
((((3 * (6 + 100)) * 75) - 50) / 25)
((((3 * 75) * (6 + 100)) - 50) / 25)
(((3 * ((6 + 100) * 75)) - 50) / 25)
[adavies@bob ~/countdown-numbers]$
```

You can see in the above that solutions 1 and 10 are the same.  Also solutions 7 and 8.  Then, solutions 2 and 3,
although not having exactly the same infix representation, are logically the same given the associative/commutative
properties of multiplication.

How can we get exact duplicates?  It's because we can take different paths through the space to get to the same
expression.  Here's an example using different numbers.

```
target = 251, numbers = [2, 4, 5, 6, 50]

Path 1
  level 1
  expressions: [2, 4, 5, 6, 50]
  i = 0, j = 3, op = SUB2, ei = 2, ej = 6
  2 SUB2 6 = 4
    level 2
    expressions: [[4, -, 6, 2], 4, 5, 50]
    i = 0, j = 1, op = DIV, ei = [4, -, 6, 2], ej = 4
    4 DIV 4 = 1
      level 3
      expressions: [[1, /, [4, -, 6, 2], 4], 5, 50]        <- Different: ((6 - 2) / 4) before (5 * 50)
      i = 1, j = 2, op = MUL, ei = 5, ej = 50
      5 MUL 50 = 250
        level 4
        expressions: [[1, /, [4, -, 6, 2], 4], [250, *, 5, 50]]
        i = 0, j = 1, op = ADD, ei = [1, /, [4, -, 6, 2], 4], ej = [250, *, 5, 50]
        1 ADD 250 = 251
          level 5
          expressions: [251, ADD, [[1, /, [4, -, 6, 2], 4], [250, *, 5, 50]]]

Path 2
  level 1
  expressions: [2, 4, 5, 6, 50]
  i = 0, j = 3, op = SUB2, ei = 2, ej = 6
  2 SUB2 6 = 4
    level 2
    expressions: [[4, -, 6, 2], 4, 5, 50]
    i = 0, j = 1, op = DEV, ei = [4, -, 6, 2], ej = 4
    4 DIV 4 = 1
      level 3
      expressions: [[4, -, 6, 2], 4, [250, *, 5, 50]]      <- Different: (5 * 50) before ((6 - 2) / 4)
      i = 1, j = 2, op = MUL, ei = 5, ej = 50
      5 MUL 50 = 250
        level 4
        expressions: [[1, /, [4, -, 6, 2], 4], [250, *, 5, 50]]
        i = 0, j = 1, op = ADD, ei = [1, /, [4, -, 6, 2], 4], ej = [250, *, 5, 50]
        1 ADD 250 = 251
          level 5
          expressions: [251, ADD, [[1, /, [4, -, 6, 2], 4], [250, *, 5, 50]]]
```

So, how can we deal with this?  I don't want these duplicates.  Filtering out actual duplicate expression strings is
easy but I don't like the idea of writing code to apply associative/commutative rules to find the other kind of dupes.

But wait, someone must have written code to do this sort of thing already right?  Yes indeed.  Because of the depth of
the Python community there happens to be a symbolic math library called [SymPy](https://sympy.org), and it exposes
functionality to parse expression strings into a standard expression tree form and also to format those trees in
various ways.  We can use this to create a canonical representatiion for each solution expression that can be used as
the key in a map to remove duplicates.  I love it when someone else solves my problems for me.

We can use it like this ...

``` python
import countdown_numbers_solver as solver
import sys
import sympy
import os


_solutions = {}    # A dict to eliminate duplicate solution expressions


def _found_expression(expression, only_one):
  infix_expression = _format_expression_infix(expression)
  key = sympy.srepr(sympy.sympify(infix_expression, evaluate = False))    # Canonical expression as key
  if not key in _solutions:
    _solutions[key] = infix_expression
  return only_one


def _is_number(expression):
  return 0 if type(expression) is tuple else 1


def _format_expression_infix(expression):
  if _is_number(expression):
    return expression 
  op_symbol = expression[1]
  lhs = _format_expression_infix(expression[2])
  rhs = _format_expression_infix(expression[3])
  return f'({lhs} {op_symbol} {rhs})'


def main():
  if len(sys.argv) < 3:
    _print_usage()
    return 1
  
  target = int(sys.argv[1])
  numbers = [int(s) for s in sys.argv[2:] if s[0] != '-']
  only_one = 0 if '-all' in sys.argv[2:] else 1

  numbers.sort()    # Don't have to do this but let's be tidy shall we?

  print(f'target = {target}, numbers = {numbers}')

  solver.find_expressions_for_target(numbers, target, lambda e: _found_expression(e, only_one))

  for solution in _solutions.values():
    print(f'{target} = {solution}')
  return 0


if __name__ == "__main__":
  exit(main())
```

This is much better ...

```
[adavies@bob ~/countdown-numbers]$python3 ./countdown_numbers_solver_cli.py 952 3 6 25 50 75 100 -all
target = 952, numbers = [3, 6, 25, 50, 75, 100]
952 = ((((3 * 75) * (6 + 100)) - 50) / 25)
952 = (((((3 + 100) * 6) * 75) / 50) + 25)
[adavies@bob ~/countdown-numbers]$
```

As I said above, there are only two solutions for this classic set of numbers, and my code can find both of them in ~3
seconds.  Human players get [30](https://www.youtube.com/watch?v=M2dhD9zR6hk).

I'm done with this game for now.  I'm off to get two boxes and a carrot.
