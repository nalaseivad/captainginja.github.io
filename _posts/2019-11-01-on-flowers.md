---
layout: post
title: On flowers
sub_title: And irrational numbers ... and JavaScript
featured_image: /images/flower.jpg
featured_image_alt_text: Flower
featured_image_title: "I got hay fever.  I'm all like 'Heeeey! I got a fever and the only prescription is ...'"
featured_image_width: 650
featured_image_link: https://www.youtube.com/watch?v=cVsQLlk-T0s
mathjax: 1
tags: [math]
jquery: 1
script_src: /js/flower.js
script_ready_eval_string: main()
style_src: /css/flower.css
---

# Inspiration

I recently came upon a gem of a [video](https://www.youtube.com/watch?v=sj8Sg8qnjOg) on YouTube from the
[Numberphile](https://www.youtube.com/channel/UCoxcjq-8xIDTYp3uz647V5A) channel.  If you don't follow Numberphile then
shame on you, it's a wonderful series of videos on all matters mathematic and numerical.  There's a sibling channel
called [Computerphile](https://www.youtube.com/channel/UC9-y-6csu5WGm29I7JiwpnA) that is equally as good but focuses
on all matters computery.  Now you may be wondering if that is a real word but it
[is](https://en.wiktionary.org/wiki/computery)!  Isn't it amazing how all kinds of terms ultimately become legitimized
via sufficient adoption.  Computery can refer things of or pertaining to computers or it can sometimes refer to the
[quality of a person](https://www.urbandictionary.com/define.php?term=Computery) too.  Anyway, I digress.

The subject of the inspirational video was that of irrational numbers and specifically how some of them are more (or
less) irrational than others.  This was illustrated via a discussion of how seeds are packed into the head of a flower.
The video contained various illustrations and animations that were very neat and enlightening and after seeing them I
decided that I wanted to write some code to render those animations myself.  And that, dear reader, is the point of this
post.

# A Seed Renderer

Here's a little JavaScript app that will render seeds according to various parameters.  The basic parameters are
presented just below the image and are 1) the width (in pixels) of a seed, 2) the fraction of a clockwise turn at which
to render the next seed (this can be entered as a fraction or a decimal), and 3) an outward radial spacing factor which
controls how much each seed is moved out away from the origin per turn (a value of 1 will ensure that after one full
turn around the origin the next seed will be placed one seed width further out).  Some initial values are plugged in but
you can change them and then click the 'Draw Flower' button.

Just below the basic parameters is an input that allows you to dial in a delta to the rotation-factor and two buttons
that will then re-render the flower after having incremented or decremented the rotation-factor by the delta amount.
This allows you to see how the layout of the seeds changes as the rotation-factor changes.  Try it.

<div id="flower-1"
     class="flower"
		 width="400"
		 height="400"
		 seed-width="10"
		 rotation-factor="0.413"
		 out-factor="0.1"></div>

<div id="flower-1-values">
	<p style="text-align:center">
		seed-width: <input id="seed-width-value" size="2" />
		rotation-factor: <input id="rotation-factor-value" size="10" />
		out-factor: <input id="out-factor-value" size="4" />
		<button id="button" onclick="drawFlower('flower-1')">Draw Flower</button>
	</p>
	<p style="text-align:center">
		rotation-factor-delta: <input id="rotation-factor-delta-value" size="8" value="0.0001"/>
		<button id="button" onclick="incRotationFactorAndDrawFlower('flower-1')">+</button>
		<button id="button" onclick="decRotationFactorAndDrawFlower('flower-1')">-</button>
	</p>
</div>

# Animation

Here's another JavaScript app that will animate the changes in the seed rendering pattern as the rotation-factor
changes.  Just dial in a starting rotation-factor, a delta for the factor between each render and a delay (the number of
milliseconds to wait between renders).  The 'Start' button will start the animation.  I bet you can guess what the
'Stop' button does.

<div id="flower-2"
     class="flower"
		 width="400"
		 height="400"
		 seed-width="10"
		 rotation-factor="0.4"
		 out-factor="0.1"></div>

<div id="flower-2-values">
	<p style="text-align:center">
		rotation-factor: <span id="rotation-factor-display"></span>
	</p>
	<p style="text-align:center">
		start-rotation-factor: <input id="start-rotation-factor-value" size="10" value="0.4" />
		rotation-factor-delta: <input id="rotation-factor-delta-value" size="8" value="0.0001" />
		delay (ms): <input id="delay-value" size="6" value="100" />
		<button id="start-animation-button" onclick="startAnimation('flower-2')">Start</button>
		<button id="stop-animation-button" onclick="stopAnimation('flower-2')" disabled>Stop</button>
	</p>
</div>
