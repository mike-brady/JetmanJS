window.onload = function() {
  var canvas = document.getElementById("jetmanjs");
  var game = new Game(canvas, new Jetman(canvas.width/2, canvas.height/2, 'sprites/jetman.png'));
  game.init();
};
