---
layout: math-faq
title: Factoring the general quadratic equation
sub_title: A method
math_faq: true
mathjax: 1
---

We want to rewrite the general quadratic equation $$ax^2 + bx + c$$ in the form
$$(\alpha x + \beta)(\gamma x + \delta)$$.

To do this we look for two numbers $$p$$ and $$q$$ such that $$ac = pq$$ and $$p + q = b$$.

We can now rewrite the general quadratic equation as ...

$$ax^2 + (p + q)x + c$$

$$= ax^2 + px + qx + c$$

$$= px(\frac{a}{p}x + 1) + c(\frac{q}{c}x + 1)$$

Now, since $$ac = pq$$ then $$\frac{a}{p} = \frac{q}{c}$$ and thus also $$\frac{a}{p}x + 1 = \frac{q}{c}x + 1$$.

Therefore we can further write the general quadratic equation as ...

$$px(\frac{a}{p}x + 1) + c(\frac{a}{p}x + 1)$$

$$= (\frac{a}{p}x + 1)(px + c)$$

$$= \frac{(ax + p)(px + c)}{p}$$

Let's try some examples.

**Example 1**

$$6x^2 + 11x + 3$$

$$a = 6$$, $$b = 11$$ and $$c = 3$$; $$ac = 6 \cdot 3 = 18 = 2 \cdot 9$$ and $$b = 11 = 2 + 9$$; so $$p = 2$$.
Therefore ...

$$6x^2 + 11x + 3 = \frac{(6x + 2)(2x + 3)}{2} = (3x + 1)(2x + 3)$$

**Example 2**

$$6x^2 + 13x + 6$$

$$a = 6$$, $$b = 13$$ and $$c = 6$$; $$ac = 6 \cdot 6 = 36 = 4 \cdot 9$$ and $$b = 13 = 4 + 9$$; so $$p = 4$$.
Therefore ...

$$6x^2 + 13x + 6 = \frac{(6x + 4)(4x + 6)}{4} = \frac{(6x + 4)(4x + 6)}{2 \cdot 2} =
\frac{(6x + 4)}{2}\frac{(4x + 6)}{2} = (3x + 2)(2x + 3)$$

**Example 3**

$$9x^2 + 12x - 12$$

$$a = 9$$, $$b = 12$$ and $$c = -12$$; $$ac = 9 \cdot -12 = -108 = -6 \cdot 18$$ and $$b = 12 = -6 + 18$$, so
$$p = -6$$.  Therefore ...

$$9x^2 + 12x - 12 = \frac{(9x - 6)(-6x - 12)}{-6} = \frac{(9x - 6)(-6x - 12)}{3 \cdot -2} =
\frac{(9x - 6)}{3}\frac{(-6x - 12)}{-2} = (3x - 2)(3x + 6)$$


