<!DOCTYPE html>
<html>
<head>
  <script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js"></script>

  <script>

    var globalResizeTimer = null;

    $(document).ready(function() {
      //console.log("ready");
      DrawCanvas();
    });

    $(window).resize(function () {
      //console.log("resize");
      if(globalResizeTimer != null) return;
      globalResizeTimer = window.setTimeout(function() {
        DrawCanvas();
        globalResizeTimer = null;
      }, 100);
    });

    function DrawCanvas(e) {
      console.log("DrawCanvas");
      //console.log("window.innerWidth = " + window.innerWidth);
      //console.log("window.innerHeight = " + window.innerHeight);
      var canvas = document.getElementById("my-canvas");
      canvas.width = window.innerWidth * 0.9;
      canvas.height = window.innerHeight * 0.9;
      var context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);

      for(var x = 0; x < 4; ++x) {
        for(var y = 0; y < 4; ++y) {
          //console.log("x=" + x + ",y=" + y);
          DrawRect(canvas, x, y, 4, 4);
        }
      }
    }

    function DrawRect(canvas, x, y, rectsPerRow, rectsPerColumn) {
      //console.log("DrawRect");
      //console.log("x=" + x + ",y=" + y + ",rectsPerRow=" + rectsPerRow + ",rectsPerColumn=" + rectsPerColumn);
      var space = 10;
      var rectWidth = (canvas.width - ((rectsPerRow + 1) * space)) / rectsPerRow;
      var rectHeight = (canvas.height - ((rectsPerColumn + 1) * space)) / rectsPerColumn;
      var rectLeft = (space * (x + 1)) + (x * rectWidth);
      var rectTop = (space * (y + 1)) + (y * rectHeight);
      //console.log("canvas.width=" + canvas.width + ",canvas.height=" + canvas.height + ",rectWidth=" + rectWidth + ",rectHeight=" + rectHeight);
      //console.log("rectLeft=" + rectLeft + ",rectTop=" + rectTop);

      var context = canvas.getContext("2d");
      context.beginPath();
      context.moveTo(rectLeft, rectTop);
      context.lineTo(rectLeft + rectWidth, rectTop);
      context.lineTo(rectLeft + rectWidth, rectTop + rectHeight);
      context.lineTo(rectLeft, rectTop + rectHeight);
      context.lineTo(rectLeft, rectTop);
      context.stroke();
    }
  </script>

  <style>
    body {
      margin: 0;
    }
    #outer {
      display: table;
      position: absolute;
      height: 100%;
      width: 100%;
    }
    #middle {
      display: table-cell;
      vertical-align: middle;
    }
    #my-canvas {
      display: block;
      background-color: lightsteelblue;
      margin-left: auto;
      margin-right: auto;
    }
  </style>
  </head>

<body>
  <div id="outer">
    <div id="middle">
      <canvas id="my-canvas" width="150" height="150"/>
    </div>
  </div>
</body>
</html>