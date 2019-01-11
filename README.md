# JetmanJS

A JavaScript remake of the Facebook game, Jetman.

## Getting Started

Download the files from the [dist](dist/) folder and place them inside your web directory.

Include [jetmanjs.min.js](dist/jetmanjs.min.js) in your webpage.

```
<script type="text/javascript" src="jetmanjs.min.js"></script>
```

Create a canvas element with an id of "jetmanjs".

```
<canvas id="jetmanjs" width="600" height="400"></canvas>
```

Create a Jetman object, get the canvas element, and initialize the game.
```
window.onload = function() {
  var jetman = new Jetman('sprites/jetman.png');
  var canvas = document.getElementById("jetmanjs");
  var game = new Game(canvas, jetman);
  game.init();
};
```

Next, load the page, and play some Jetman!

## Authors

* **Mike Brady** - *Initial work* - [Mike Brady](https://github.com/mike-brady)

See also the list of [contributors](https://github.com/mike-brady/JetmanJS/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
