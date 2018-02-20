---
layout: post
title: "On Mathematics and its Teaching"
sub_title: And my journey from loving math to hating it and back to loving it again
featured_image: /images/mathematics_blackboard.jpg
featured_image_alt_text: "Mathematics Blackboard"
featured_image_title: >
  Some of the greatest ideas of all time have come to people during math class ... none of which have anything to do
  with math
featured_image_width: 550
featured_image_link: https://en.wikipedia.org/wiki/Euler%27s_identity
mathjax: 1
function_plot: 1
---

<div id="plot-1" style="margin:auto;width:fit-content"></div>

<script>
  functionPlot({
    target: '#plot-1',
    title: '',
    width: 600,
    height: 300,
    disableZoom: true,
    xAxis: {
      domain: [-6, 6]
    },
    data: [{
      fn: 'sin(x^2)'
    },
    {
      fn: 'sin(x)'
    }]
  });
</script>
