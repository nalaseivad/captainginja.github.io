---
layout: math-faq
title: Factoring the general quadratic equation
sub_title: A method
faq_type: math
mathjax: 1
---

We want to rewrite the general quadratic equation $$ax^2 + bx + c$$ in the form
$$(\alpha x + \beta)(\gamma x + \delta)$$.

To do this we look for two numbers $$p$$ and $$q$$ such that $$ac = pq$$ and $$p + q = b$$.  By convention we choose
$$p \leq q$$. 

We can now rewrite the general quadratic equation as ...

$$ax^2 + (p + q)x + c$$

$$= ax^2 + px + qx + c$$

$$= px(\frac{a}{p}x + 1) + c(\frac{q}{c}x + 1)$$

Now, since $$ac = pq$$ then $$\frac{a}{p} = \frac{q}{c}$$.

Therefore we can further write the general quadratic equation as ...

$$px(\frac{a}{p}x + 1) + c(\frac{a}{p}x + 1)$$

or ...

$$px(\frac{q}{c}x + 1) + c(\frac{q}{c}x + 1)$$

We could do either but let's use $$\frac{a}{p}$$ since we chose $$p$$ to be the smaller number.

So ...

$$px(\frac{a}{p}x + 1) + c(\frac{a}{p}x + 1)$$

We now have a common factor of $$(\frac{a}{p}x + 1)$$ so let's pull that out ...

$$= (\frac{a}{p}x + 1)(px + c)$$

And rewrite as ...

$$= \frac{(ax + p)(px + c)}{p}$$

And thus we have a formula to factor the general quadratic once we have found $$p$$ and $$q$$ such that $$ac = pq$$ and
$$p + q = b$$.  We could use either $$p$$ or $$q$$ but, by convention, we use the smaller of the two and call it $$p$$.

$$ax^2 + bx + c = \frac{(ax + p)(px + c)}{p}$$

Let's try some examples.

---

**Example 1**

$$6x^2 + 11x + 3$$

$$a = 6$$, $$b = 11$$ and $$c = 3$$; $$ac = 6 \cdot 3 = 18$$.

$$18 = 1 \cdot 18 = 2 \cdot 9 = 3 \cdot 6$$.  Of these pairs, $$2 + 9 = 11$$ and so we can take $$p = 2$$.

Therefore ...

$$6x^2 + 11x + 3 = \frac{(6x + 2)(2x + 3)}{2} = (3x + 1)(2x + 3)$$

---

**Example 2**

$$6x^2 + 13x + 6$$

$$a = 6$$, $$b = 13$$ and $$c = 6$$; $$ac = 6 \cdot 6 = 36$$.

$$36 = 1 \cdot 36 = 2 \cdot 18 = 4 \cdot 9$$.  Of these pairs, $$4 + 9 = 13$$ and so we can take $$p = 4$$.

Therefore ...

$$6x^2 + 13x + 6 = \frac{(6x + 4)(4x + 6)}{4} = \frac{(6x + 4)(4x + 6)}{2 \cdot 2} =
\frac{(6x + 4)}{2}\frac{(4x + 6)}{2} = (3x + 2)(2x + 3)$$

---

**Example 3**

$$9x^2 + 12x - 12$$

$$a = 9$$, $$b = 12$$ and $$c = -12$$; $$ac = 9 \cdot -12 = -108$$.

$$-108 = -1 \cdot 108 = -2 \cdot 54 = -4 \cdot 26 = -6 \cdot 18 = -8 \cdot 13$$.  of these pairs, $$-6 + 18 = 12$$ and
so we can take $$p = -6$$.

Therefore ...

$$9x^2 + 12x - 12 = \frac{(9x - 6)(-6x - 12)}{-6} = \frac{(9x - 6)(-6x - 12)}{3 \cdot -2} =
\frac{(9x - 6)}{3}\frac{(-6x - 12)}{-2} = (3x - 2)(3x + 6)$$


