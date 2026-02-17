---
layout: post
title: On Vibe Coding
sub_title: And my new friend Claude
featured_image: /images/claude_is_thinking.png
featured_image_alt_text: "Claude is thinking"
featured_image_title: "OK, then I guess we don't need you anymore, you're fired"
featured_image_width: 550
featured_image_link: https://www.youtube.com/watch?v=_2C2CNmK7dQ
tags: [code, ai]
---

# Introduction

"Vibe Coding" - it's the new hotness, or so people say.  I have heard a decent amount of positive feedback from many of
my developer friends so I felt like I needed to give it a try.  From what I can gather - as of now - Claude Code is the
current hottest hotness, so I stumped up for a Claude Pro subscription ($20 / month), installed Claude Code and stared
at the CLI prompt for a while.

What should I ask it to do [first](https://www.youtube.com/watch?v=xO76RlsgdeE&t=109s)?

Then I thought that I could ask it to write code for a web-based Countdown Numbers Game solver like I recently did
myself.  I gave it this prompt ...

> Create a website app with a UI that allows users to enter the parameters of the Countdown Numbers game (a target
> number [positive integer] and 6 other numbers [each taken from the set {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75,
> 100}] that are to be combined with the standard arithmetic operations [+, -, *, /], and also parentheses for
> precedence resolution, to form an expression that when evalauted will result in the target number).  Ensure that the
> inputs in the UI do parameter validation to ensure that they are valid and also make it easy for users to enter the
> numbers, e.g. that their input keyboard switches to the appropriate type on mobile to make it quick and natural to
> enter numbers as opposed to having the full keyboard and having to manually switch to enter numbers.  There should be
> an input for the target number, another that allows them to quickly/easily enter the list of 6 numbers, and then a
> button that will trigger calculation of the solution.  When clicked that button should then calculate "all" possible
> combinations of the 6 numbers and the operators that will resilt in the target number.  The list of possible
> expressions should then be printed to the screen.  Ensure that no logically duplicate expressions are printed.  I only
> want to see expressions that are logically different, e.g. don't show both "2 * 3 * 4" and "(2 * 3) * 4".
{: .quote}

It thought for a while (actually it ruminated, percolated, simmered, spelunked, recombobulated and whirred) and then it
gave me a perfectly functional first implementation of a web-based Countdown Numbers Game solver.  It even did better
with the UI than I did in my version (I will be the first to admit that I am not a designer ...).  It allowed the user
to click on a table of numbers to select them for the current puzzle, a bit like people do in the actual game on TV.

Color me impressed.

It wasn't perfect though so I proceeded with a few more prompts and iterations ...

> That's a good first attempt.  Some feeback and changes that I'd like to see ...
> 
>  - Use '/' in the output display instead of the traditional divide symbol (with a line and two dots).
>  - Use parentheses universally to clearly show operator precedence, but only as much as is required; not excessively
{: .quote}

And it did it.

> Nice.  We're still showing what I would consider to be duplicate logical solutions though.  For example ...
>
>  ((50 − 1) − 8) × 3 = 123
>
>  ((50 − 8) − 1) × 3 = 123
>
>  (50 − (1 + 8)) × 3 = 123
>
>  These are all essentially 41 * 3.  Where we have a chain of the same operation (e.g. addition/subtraction here) let's
>  standardize the order of the operands.  I want these to all be recognized as the same expression ...
>
>  (50 - 1 - 8) * 3 = 123
{: .quote}

And it did it.

> Nice.  Breakout the different logical components of this single HTML file into separate files, i.e. page structure,
> code and style.
{: .quote}

And it did it.

> Make it so that this will render nicely in a desktop browser window and also in a mobile phone browser window.  On
> mobile everything should be readable and compatible with the sort of keyboard input that IOS and Android offer for web
> forms.
{: .quote}

> I see this ...
> 
>   1 + 100 * 2 − 3 − 75 = 123
> 
>   There should be parenthese here.  It should be ...
> 
>   1 + (100 * 2) − 3 − 75 = 123
> 
>   And this ...
> 
>   1 + 100 / 2 + 75 − 3 = 123
> 
>   ... should be ...
> 
>   1 + (100 / 2) + 75 − 3 = 123
{: .quote}

> The only time there shouldn't be parentheses is for chains of the same operator.  So this is OK ...
> 
>   1 + 2 + 3
> 
>   But this is not ...
> 
>   1 + 2 * 3
> 
>   That latter one should be ...
> 
>   1 + (2 * 3)
> 
>   ... or ...
> 
>   (1 + 2) * 3
> 
>   ... depending on what the actual expresison should be
> 
> There should be no assumption of operator presentation in the interpretation of the display
{: .quote}

And it fixed things up.

Then after looking at the code, I asked for some formatting/style adjustments ...

> Don't let any single line of code be longer than 120 characters.  Wrap lines cleanly and logically as necessary in
> order to ensure that is the case.
{: .quote}

... and it did that for me.

Then I asked it about it's other style assumptions ...

> Explain your current naming conventions
{: .quote}

... and it gave me a very clear description or it's pretty logical code structure and naming.

Then I asked it to put all of the code in a local Git repo, and it did.

Then I asked ...

> Can we write unit tests for this?  What sort of unit testing frameworks work best for web apps like this?  We should
> separate the solving logic and the UI logic so that we can test them separately.  There are rules for the UI: all
> params must be specified and each param must conform to spec, the output should be rendered/formatted according to our
> rules.  Then there are rules for the solver engine: the answer must be right, there should be no logical duplicates in
> the list of answers.
> 
> Separate our concerns and add unit tests using appropriate frameworks.  Do this work in an appropriately named local
> branch.
{: .quote}

... and it made intelligent choices of a unit testing framework to use, refactored the code for more logical testability
and implemented an initial suite of tests.

And then I ran out of token credits and was politely asked to purchase more or come back in a few hours to continue.  By
this point I was sufficiently impressed and convinced Vibe Coding is real.  Wow.

---

I came back the next day, restarted the Claude CLI in the same folder and asked this ...

> Explain how the solver works.  Give me a step my step description of the algorithm along with the types used, the
> techniques (e.g. recursion) and how the code flows.
{: .quote}

... and it gave me this ...

```
Here's a step-by-step breakdown of the solver:

  Types

  The solver uses two implicit types (plain JS objects, no TypeScript):

  - Entry: { val: number, tree: Tree } — a computed value paired with the expression tree that produced it.
  - Tree (discriminated union):
    - { type: 'num', val: number } — a leaf/literal number.
    - { type: 'op', op: '+' | '-' | '*' | '/', left: Tree, right: Tree } — a binary operation node.

  Core Algorithm: solve(numbers, target)

  The algorithm is exhaustive search via recursion with backtracking. It explores every way to combine the
  input numbers with arithmetic operations.

  Step by step:

  1. Initialise the pool (line 74): Wrap each input number into an Entry with a leaf tree node. Create an
     empty Set for deduplicated solutions.
  2. Recurse on the pool (line 76–105): The recurse(pool) function:
    - Check for solutions: Scan every entry in the pool. If any entry's value equals the target,
	  canonicalise its tree and add the string to the solutions set.
    - Base case: If the pool has fewer than 2 entries, stop — no more pairs to combine.
    - Pick a pair: Iterate over all distinct pairs (i, j) where i < j. Build rest — the pool minus those
	  two entries.
    - Try all valid operations on the pair (a, b):
      - a + b — always tried.
      - a * b — skipped if either operand is 1 (multiplying by 1 is redundant).
      - a - b — only if a > b (keeps results positive).
      - b - a — only if b > a.
      - a / b — only if b > 1 and b divides a evenly (integers only).
      - b / a — only if a > 1 and a divides b evenly.
  3. tryOp(a, b, op, rest) (line 107–118): Computes the result value, rejects it if <= 0, pushes a new
     Entry (with an op tree node) onto rest, recurses, then pops it off (backtracking). This
	 mutate-then-restore pattern avoids allocating a new array on every recursive call.
  4. Return: After full exploration, convert the Set to an array.

  Deduplication: Canonical Forms

  The Set eliminates duplicate solutions by comparing canonical string representations. The canonical(tree)
  function (line 31–70) normalises expressions so that equivalent trees produce the same string:

  - collectAdditive(tree): Recursively flattens chains of + and - into { pos: [...], neg: [...] } lists.
    Subtraction flips pos/neg of the right subtree.
  - collectMultiplicative(tree): Same idea for * and /, producing { num: [...], den: [...] }.
  - canonical(tree): For +/- ops, collects additive terms, wraps sub-expressions in parens, sorts them
    alphabetically, then joins. Same for *//. Sorting is the key trick — 3 + 5 and 5 + 3 both become 3 + 5.

  Output Helpers

  - displayStr(canon): Replaces ASCII - with the Unicode minus sign − for display.
  - countNums(expr): Counts how many number literals appear in an expression (via regex).
  - sortSolutions(results): Sorts solutions by fewest numbers used first, then by string length, then
    lexicographically. This puts the simplest/shortest solutions first.

  Techniques Summary

  ┌──────────────────────────────────────┬──────────────────────────────────────────────────────────────┐
  │ Technique                            │ Where                                                        │
  ├──────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Exhaustive combinatorial search      │ recurse() — tries all pairs × all ops                        │
  ├──────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Backtracking                         │ tryOp() — push/recurse/pop pattern                           │
  ├──────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Tree-based expression representation │ Tree type threaded through all computation                   │
  ├──────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Canonical form deduplication         │ canonical() + Set eliminates equivalent expressions          │
  ├──────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Algebraic flattening + sorting       │ collectAdditive/collectMultiplicative normalise associative/ │
  │                                      | commutative ops                                              │
  ├──────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Pruning                              │ Skip identity ops (×1), non-positive results, non-integer    │
  │                                      | divisions                                                    │
  └──────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```

Again, wow.  There's a level of understanding here, of algorithms, data structures, patterns and style that is truly
impressive.

I'm not going to say that people with no experience of designing and developing software will suddenly be able to build
quality product.  It's clear to me that certain human disciplines and skills (specification, use cases, user stories,
testing, review) are still going to be an essential part of the process, but tools like this are going to massively
improve the productivity of software development.  It occurs to me that now anyone can "hire" very talented software
developers for a lot less money than a full time human.  These tools will inevitably become a central part of dev teams.
We need to wake up, accept the new reality and get on board.  This is a complete paradigm change.

---

Here's the solver that Claude wrote, and my original for comparison ...

* [Countdown Numbers - Claude](/tools/countdown-numbers-claude/countdown.html) 
* [Countdown Numbers - Human](/tools/countdown-numbers/solver-ui.html) 

