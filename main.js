window.onload = function() {
  var canvas = document.getElementById("jetman");
  var game = new Game(canvas, new Jetman(canvas.width/2, canvas.height/2, 'jetman.png'));
  game.init();
};
