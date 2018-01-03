var g_images = null;
var g_imageIndex = 0;
var g_imageToggle = 0;

function Main(images) {
  //console.log("Main");
  //console.log(images);
  g_images = images;

  ShowImage(0);
  window.setTimeout(function () {
    ShowImageAndSetTimer(1)
  }, 4000);
}

function ShowImage(toggleHiden) {
  //console.log("ShowImage");
  var newImageSrc = g_images[g_imageIndex];
  //console.log(newImageSrc);

  var images = $("img");
  images[g_imageToggle].src = newImageSrc;
  if (toggleHiden) {
    images.toggleClass("hidden");
  } 
  
  ++g_imageIndex;
  g_imageIndex %= g_images.length;
  ++g_imageToggle;
  g_imageToggle %= 2;
}

function ShowImageAndSetTimer(toggleHidden) {
  ShowImage(toggleHidden);
  window.setTimeout(function () {
    ShowImageAndSetTimer(toggleHidden)
  }, 4000);
}
