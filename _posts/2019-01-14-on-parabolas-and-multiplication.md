---
layout: post
title: On parabolas and multiplication
sub_title: Multiplying with geometry ...
featured_image: /images/momath_string_product.jpg
featured_image_alt_text: "String Product @ MoMath"
featured_image_title: The string product exhibit at MoMath in NYC
featured_image_width: 450
featured_image_link: https://momath.org/
mathjax: 1
function_plot: 1
tags: [math]
---

I visited the National Museum of Mathematics in New York City with my family just recently.  It's a neat little museum
that can be experienced in a few hours and I highly recommend it.  One of the exhibits there is called "String Product".
It's a large model of a paraboloid that sits in the middle of a spiral staircase between floors and illustrates an
interesting property of the simple parabola \\(y = x^2\\).  If you take two positive numbers \\(a\\) and \\(b\\) and
draw two vertical lines, parallel to the y-axis, from \\(x = -a\\) and \\(x = b\\), and then draw a line through the
two points where these vertical lines cross the parabola, then that line will meet the y-axis at the value \\(a * b\\).
So this gives a nice geometric trick for multiplication.

Try it out ...

<div id="plot-1" style="margin:auto;width:fit-content"></div>

<p>
  a: <input id="a-value" size="3"/>
  , b: <input id="b-value" size="3"/>
  , a * b = <input id="ab-value" size="3" disabled="true" />
  <button id="button" onclick="buttonClick()">Plot</button>
</p>

<script>
  function buttonClick() {
    var a = document.getElementById("a-value").value;
    var b = document.getElementById("b-value").value;
    plot(a, b);
  }

  function checkNumber(x) {
    return !(isNaN(x) || x < 0 || x > 10);
  }

  function checkNumbers(numbers) {
    var ok = true;
    numbers.forEach(function(x) {
      if(!checkNumber(x)) {
        alert('Inputs must be numbers between 0 and 10');
        ok = false;
      }
    });
    return ok;
  }

  function plot(a, b) {
    if(!checkNumbers([a, b])) return;

    // New line equation and annotation text labels
    var lineEquation = (b - a) + 'x + ' + (a * b);
    var aText = 'x = -' + a;
    var bText = 'x = ' + b;
    var productText = 'y = ' + (a * b);

    // Update config
    config = {
      target: '#plot-1',
      width: 700,
      height: 500,
      disableZoom: true,
      xAxis: { domain: [-12, 12] },
      yAxis: { domain: [0, 110] },
      data: [ { fn: 'x^2', color: 'blue' } ],
      annotations: []
    };

    // Reset the plot.
    // It seems that I need to do this in order to get the new annotation text labels to show correctly.
    functionPlot(config);

    // New line plot and annotations
    config.data[1] = { fn: lineEquation, color: 'green' };
    config.annotations[0] = { x: -a, text: aText };
    config.annotations[1] = { x: b, text: bText };
    config.annotations[2] = { y: a * b, text: productText };

    // Update the plot and the equation result value
    functionPlot(config);
    
    document.getElementById("ab-value").value = a * b;
  }

  // Initial values to plot
  var aValue = 2;
  var bValue = 4;
  document.getElementById("a-value").value = aValue;
  document.getElementById("b-value").value = bValue;
  plot(aValue, bValue);
</script>

# Proof

Why is this so?  Let's see.

Points on the parabola are parameterized by the coordinates \\((x, x^2)\\).  So if we take the two positive integers
\\(a\\) and \\(b\\) and then look at the vertical lines \\(x = -a\\) and \\(x = b\\), the points where these cross the
parabola are \\((-a, a^2)\\) and \\((b, b^2)\\).

The general equation of a line is \\(y = mx + c\\) where \\(m\\) is the slope and \\(c\\) is the value at which the line
crosses the y-axis.  To find \\(m\\) and \\(c\\) we can use the two points that we know are on the line, namely
\\((-a, a^2)\\) and \\((b, b^2)\\).  So ...

1) From point $$(-a, a^2): a^2 = -ma + c$$

2) From point $$(b, b^2): b^2 = mb + c$$

We can eliminate c from these two equations by subtracting them ...

$$b^2 - a^2 = mb + ma + c - c$$

$$b^2 - a^2 = m(b + a)$$

Note that $$b^2 - a^2 = (b + a)(b - a)$$ and so ...

$$(b + a)(b - a) = m(b + a)$$

By canceling, we get $$m = (b - a)$$ and then substituting back in equation #2 above we get ...

$$b^2 = (b - a)b + c$$

$$b^2 = b^2 - ab + c$$

$$c = ab$$

So the value at which the line crosses the y-axis is equal to $$ab$$.

QED.


