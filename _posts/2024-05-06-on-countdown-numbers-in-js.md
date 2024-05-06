---
layout: post
title: On Countdown Numbers in JS
sub_title: "And HTML with a little CSS too ..."
featured_image: /images/countdown_numbers_js_ai.png
featured_image_alt_text: "More AI art!"
featured_image_title: "More AI art!  Trying to describe to ChatGPT what you want in an image is like herding cats ..."
featured_image_width: 600
featured_image_link: https://www.youtube.com/watch?v=YMrr4RnQ0Cs
tags: [code]
---

# The Countdown Numbers Game

I've written about [this amazing game]({{ site.baseurl }}{% post_url 2024-04-11-on-the-countdown-numbers-game %})
before, and presented a solver for it written in Python.  That's not very web accessible though, so I decided to write
an [HTML/JS/CSS version]({{ site.baseurl }}/tools/countdown-numbers/solver-ui.html) of the solver and host it on this
site.

I don't know JavaScript that well and so I started by asking ChatGPT to rewrite my Python version in JS for me.  It did
just that and gave me a good place to start from.  It wasn't perfect of course, since some Python idioms don't directly
translate, but it got me started.  Then I proceeded to learn enough JS, HTML and CSS in order to figure out how to make
this online tool work the way I wanted it too.

For the Python version I was using a library called SymPy to help to identify duplicate logical expressions and filter
them out from the results.  There is no immediately available JS equivalent to that that I know of so the JS version
will print logical dups if they fall out from the algorithm.  I will revisit this at some point, I may end up having to
write more code to do that myself.

I added the HTML/JS/CSS code to the existing [repo](https://github.com/nalaseivad/countdown-numbers).
