---
layout: post
title: On an interesting 9 digit number
sub_title: And singing bananas
featured_image: /images/9_digit_number.png
featured_image_alt_text: 9 digit number
featured_image_title: What's the number?
featured_image_width: 550
featured_image_link: https://www.youtube.com/watch?v=5pliZcqITFE
mathjax: 1
tags: [math]
---

# A puzzle

This post is inspired by a [puzzle](https://www.youtube.com/watch?v=3wv92-MAhss) that was posed by Mr. James Grime on
his YouTube channel, singingbanana.  The puzzle can be stated thus ...

Find a nine digit number, using the digits 1 to 9 without repeats, such that the first two digits form a number
divisible by 2; the first three digits form a number divisible by 3; the first four digits form a number divisible by 4;
and so on up through 9.  Trivially, the first digit will always be a number divisible by 1.

How many such numbers have this property?

# Solution strategies

Clearly we could write some code to implement a brute-force solution.  We could generate all the possible 9 digit
numbers and test for the requisite properties of the sub-numbers.  That would be inelegant though.  Surely we can use
some clever mathematics to solve this, or at least to significantly pare down the space of possible solutions such that
we could solve it by hand.  Let's try.

# A mathematical approach

Let's use the letters \\(a\\) through \\(i\\) as labels for the digits in the number that we seek.  So the number is
\\(abcdefghi\\) and we can describe its required properties using the following expressions ...

A: \\(10a + b \\equiv 0 \\bmod 2\\)

B: \\(100a + 10b + c \\equiv 0 \\bmod 3\\)

C: \\(1000a + 100b + 10c + d \\equiv 0 \\bmod 4\\)

D: \\(10000a + 1000b + 100c + 10d + e \\equiv 0 \\bmod 5\\)

E: \\(100000a + 10000b + 1000c + 100d + 10e + f \\equiv 0 \\bmod 6\\)

F: \\(1000000a + 100000b + 10000c + 1000d + 100e + 10f + g \\equiv 0 \\bmod 7\\)

G: \\(10000000a + 1000000b + 100000c + 10000d + 1000e + 100f + 10g + h \\equiv 0 \\bmod 8\\)

H: \\(100000000a + 10000000b + 1000000c + 100000d + 10000e + 1000f + 100g + 10h + i \\equiv 0 \\bmod 9\\)

Now, since the coefficients of \\(a, b, c, ...\\) can be reinterpretted as values modulo the appropriate number (2, 3,
4, ...), we can simplify the above expressions.  For example, \\(10 \equiv 0 \bmod 2\\) and so expression A becomes
\\(b \\equiv 0 \\bmod 2\\).  Also \\(100 \equiv 1 \\bmod 3\\) and \\(10 \\equiv 1 \\bmod 3\\), so expression B becomes
\\(a + b + c \\equiv 0 \\bmod 3\\).  Overall ...

A: \\(b \\equiv 0 \\bmod 2\\)

B: \\(a + b + c \\equiv 0 \\bmod 3\\)

C: \\(2c + d \\equiv 0 \\bmod 4\\)

D: \\(e \\equiv 0 \\bmod 5\\)

E: \\(4a + 4b + 4c + 4d + 4e + f \\equiv 0 \\bmod 6\\)

F: \\(a + 5b + 4c + 6d + 2e + 3f + g \\equiv 0 \\bmod 7\\)

G: \\(4f + 2g + h \\equiv 0 \\bmod 8\\)

H: \\(a + b + c + d + e + f + g + h + i \\equiv 0 \\bmod 9\\)

We also know that all of the values \\(a, b, c, ...\\) have to be in \\(\\{1, 2, 3, 4, 5, 6, 7, 8, 9\\}\\) and must be
unique.  So clearly \\(e = 5\\) and ...

\\(b\\) is even (since \\(b \\equiv 0 \\bmod 2\\))

\\(d\\) is even (since \\(2c + d\\) is even and \\(2c\\) is even)

\\(f\\) is even (since \\(4a + 4b + 4c + 4d + 4e + f\\) is even and \\(4 \times\\) anything is even)

\\(h\\) is even (since \\(4f + 2g + h\\) is even and \\(4f\\) and \\(2g\\) are even)

And ...

\\(a\\) is odd and not \\(5\\)

\\(c\\) is odd and not \\(5\\)

\\(g\\) is odd and not \\(5\\)

\\(i\\) is odd and not \\(5\\)

... since all the even numbers are taken by \\(\\{b, d, f, h\\}\\) and \\(e = 5\\).

Now, let's look at expression C above, i.e. \\(2c + d \\equiv 0 \\bmod 4\\).  We know that \\(c \\in \\{1, 3, 7,
9\\}\\) so ...

\\(c = 1\\): \\(2 + d \\equiv 0 \\bmod 4 \\implies d \\equiv 2 \\bmod 4\\), or

\\(c = 2\\): \\(6 + d \\equiv 0 \\bmod 4 \\implies d \\equiv 2 \\bmod 4\\), or

\\(c = 3\\): \\(14 + d \\equiv 0 \\bmod 4 \\implies d \\equiv 2 \\bmod 4\\), or

\\(c = 4\\): \\(18 + d \\equiv 0 \\bmod 4 \\implies d \\equiv 2 \\bmod 4\\)

We already know that \\(d \\in \\{2, 4, 6, 8\\}\\).  Of these, the only ones that satisfy \\(d \\equiv 2 \\bmod 4\\) are
\\(\\{2, 6\\}\\).  So \\(d \in \\{2, 6\\}\\).

Now, let's look at expression G above, i.e. \\(4f + 2g + h \\equiv 0 \\bmod 8\\).  Since \\(4f + 2g + h\\) has to be a
muliple of 8 it also has to be a multiple of 4 too.  So \\(4f + 2g + h \\equiv 0 \\bmod 4\\) which implies that
\\(2g + h \\equiv 0 \\bmod 4\\).  Now, by the same logic as we applied above for \\(2c + d \\equiv 0 \\bmod 4\\) where
\\(c \\in \\{1, 3, 7, 9\\}\\) we can take \\(2g + h \\equiv 0 \\bmod 4\\) where \\(g \\in \\{1, 3, 7, 9\\}\\) and
deduce that \\(h \\in \\{2, 6\\}\\).

The fact that \\(d \\in \\{2, 6\\}\\) and \\(h \\in \\{2, 6\\}\\) means that no other digit can be a 2 or a 6.  So now
we know ...

\\(a \\in \\{1, 3, 7, 9\\}\\)

\\(b \\in \\{4, 8\\}\\)

\\(c \\in \\{1, 3, 7, 9\\}\\)

\\(d \\in \\{2, 6\\}\\)

\\(e = 5\\)

\\(f \\in \\{4, 8\\}\\)

\\(g \\in \\{1, 3, 7, 9\\}\\)

\\(h \\in \\{2, 6\\}\\)

\\(i \\in \\{1, 3, 7, 9\\}\\)

Now, recall that expression E states that \\(4a + 4b + 4c + 4d + 4e + f \\equiv 0 \\bmod 6\\).  But \\(e = 5\\) so this
becomes \\(4a + 4b + 4c + 4d + 20 + f \\equiv 0 \\bmod 6\\) which implies that
\\(4a + 4b + 4c + 4d + (2 \\bmod 6) + f \\equiv 0 \\bmod 6\\) or \\(4a + 4b + 4c + 4d + f \\equiv 4 \\bmod 6\\).

Expression B says \\(a + b + c \\equiv 0 \\bmod 3\\) so \\(4(a + b + c) + 4d + f \\equiv 4 \\bmod 6\\) gives us
\\(4(0 \\bmod 3) + 4d + f \\equiv 4 \\bmod 6\\) which imples that \\((0 \\bmod 12) + 4d + f \\equiv 4 \\bmod 6\\) which
implies that \\(4d + f \\equiv 4 \\bmod 6\\).

We know that \\(d \\in \\{2, 6\\}\\) ...

\\(d = 2 \\implies 8 + f \\equiv 4 \\bmod 6 \\implies 2 \\bmod 6 + f \\equiv 4 \\bmod 6 \\implies f \\equiv 2 \\bmod 6
\\implies f = 8\\)

\\(d = 6 \\implies 24 + f \\equiv 4 \\bmod 6 \\implies 0 \\bmod 6 + f \\equiv 4 \\bmod 6 \\implies f \\equiv 4 \\bmod 6
\\implies f = 4\\)

So either \\(def = 258\\) or \\(def = 654\\)

Let's assume \\(def = 258\\).  So then \\(b\\) must be \\(4\\) and so \\(abc\\) could be \\(143\\), \\(147\\),
\\(149\\), \\(341\\), \\(347\\), \\(349\\), \\(741\\), \\(743\\), \\(749\\), \\(941\\), \\(943\\) or \\(947\\).  But
\\(abc\\) must be divisible by \\(3\\) which eliminates several of these and leaves us with just \\(147\\) or \\(741\\).

If \\(def = 654\\) then \\(b\\) must be \\(8\\) and \\(abc\\) could be \\(183\\), \\(187\\), \\(189\\), \\(381\\),
\\(387\\), \\(389\\), \\(781\\), \\(783\\), \\(789\\), \\(981\\), \\(983\\) or \\(987\\).  But, again, \\(abc\\) must be
divisible by \\(3\\) which leaves us with just \\(183\\) or \\(189\\), \\(381\\), \\(387\\), \\(783\\), \\(789\\),
\\(981\\) or \\(987\\).

So now we know that \\(abcdef\\) can be ...

\\(147258\\)

\\(741258\\)

\\(183654\\)

\\(189654\\)

\\(381654\\)

\\(387654\\)

\\(783654\\)

\\(789654\\)

\\(981654\\)

\\(987654\\)

Enumerating the possible values of \\(ghi\\) gives us ...

\\(147258369\\) - \\(14725836\\) is not divisible by \\(8\\)

\\(147258963\\) - \\(1472589\\) is not divisible by \\(7\\)

\\(741258369\\) - \\(7412583\\) is not divisible by \\(7\\)

\\(741258963\\) - \\(7412589\\) is not divisible by \\(7\\)

\\(183654729\\) - \\(1836547\\) is not divisible by \\(7\\)

\\(183654927\\) - \\(1836549\\) is not divisible by \\(7\\)

\\(189654327\\) - \\(1896543\\) is not divisible by \\(7\\)

\\(189654723\\) - \\(1896547\\) is not divisible by \\(7\\)

\\(381654729\\)

\\(381654927\\) - \\(3816549\\) is not divisible by \\(7\\)

\\(387654129\\) - \\(3876541\\) is not divisible by \\(7\\)

\\(387654921\\) - \\(3876549\\) is not divisible by \\(7\\)

\\(783654129\\) - \\(7836541\\) is not divisible by \\(7\\)

\\(783654921\\) - \\(78365492\\) is not divisible by \\(8\\)

\\(789654123\\) - \\(7896541\\) is not divisible by \\(7\\)

\\(789654321\\) - \\(7896543\\) is not divisible by \\(7\\)

\\(981654327\\) - \\(9816543\\) is not divisible by \\(7\\)

\\(981654723\\) - \\(9816547\\) is not divisible by \\(7\\)

\\(987654123\\) - \\(9876541\\) is not divisible by \\(7\\)

\\(987654321\\) - \\(9876543\\) is not divisible by \\(7\\)

So, only one number isn't eliminated.  The unqiue answer to the puzzle is \\(381654729\\).
