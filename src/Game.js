class Game {
  constructor(canvas, jetman) {
    this.debugMode = false;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = this.canvas.scrollWidth;
    this.canvas.height = this.canvas.scrollHeight;

    this.jetman = jetman;

    this.columnWidth = 1;
    this.defaultGapHeight = this.canvas.height/1.5;
    this.minGapHeight = this.jetman.height * 5;
    this.minWallHeight = 20;
    this.slope = 0;
    this.maxSlope = .5;
    this.slopeChangeRate = 200/this.columnWidth;
    this.slopeChangeRateSD = 150/this.columnWidth;
    this.nextSlopeChange = this.slopeChangeRate;
    this.columns = [];
    this.barriers = [];
    this.nextBarrier = this.canvas.width*1.25;

    this.paused = true;
    this.gameOver = false;
    this.stepper;
    this.frameRate = 60;
    this.speed = 4;

    this.mousedown = false;
    this.globalMousedown = false;
    this.fallRate = 3;

    this.dist = 0;
    this.score = 0;
    this.highScore = 0;
  }

  init() {
    if(this.debugMode) {
      console.log('DEBUG MODE ON');
    }

    if(localStorage.jetmanHS) {
      this.highScore = localStorage.jetmanHS;
    }

    this.reset();

    var t = this;
    document.addEventListener('mousedown', function() { t.globalMousedown = true; }, true);
    document.addEventListener('mouseup', function() { t.globalMousedown = false; }, true);

    if(this.debugMode) {
      document.addEventListener('keyup', function(e) { if(e.keyCode == 32) { t.playPause(); } }, true);
    }

    this.canvas.addEventListener('mousedown', function() { t.mousedown = true; if(!t.gameOver) { t.paused = false; } }, false);
    this.canvas.addEventListener('touchstart', function() { t.mousedown = true; if(!t.gameOver) { t.paused = false; } }, false);
    this.canvas.addEventListener('mouseup', function() { t.mousedown = false; }, false);
    this.canvas.addEventListener('touchend', function() { t.mousedown = false; }, false);
    this.canvas.addEventListener('touchcancel', function() { t.mousedown = false; }, false);
    this.canvas.addEventListener('mouseout', function() { t.mousedown = false; }, true);
    this.canvas.addEventListener('mouseenter', function() { if(t.globalMousedown) { t.mousedown = true; } }, true);

    var t = this;
    this.stepper = setInterval(function() { t.step(); t.draw(); }, 1000/t.frameRate);
  }

  playPause() {
    this.paused = !this.paused;
  }

  setNextSlopeChange() {
    var nextSlopeChange = this.nextSlopeChange + this.slopeChangeRate;
    var slopeChangeDeviation = Math.floor(Math.random()*this.slopeChangeRateSD);
    if(Math.random() < .5) {
      nextSlopeChange += slopeChangeDeviation;
    }
    else {
      nextSlopeChange -= slopeChangeDeviation;
    }
    this.nextSlopeChange = nextSlopeChange;
  }

  setSlope() {
    var rand = Math.random();
    var lastColumn = this.columns[this.columns.length-1];

    //If the gap can't go any higher or lower, give a 50/50 chance of the slope going the opposite direction or remaining straight
    if(lastColumn.top == this.minWallHeight || lastColumn.bottom == this.canvas.height - this.minWallHeight) {
      rand *= 2;
    }
    //Else give a 33/33/33 chance of the slope going up, down, or straigt
    else {
      rand *= 3;
    }

    if(rand < 1) {
      this.slope = 0;
    }
    else {
      this.slope = Math.random()*this.maxSlope*-1;
      if(lastColumn.top == this.minWallHeight || rand > 2) {
        this.slope *= -1;
      }
    }
  }

  removeColumns() {
    while(this.columns[0].right <= 0) {
      this.columns.shift();
    }
  }

  addColumns() {
    while(this.columns.length == 0 || this.columns[this.columns.length-1].left <= this.canvas.width) {
      var x = this.columnWidth/2;
      var y = this.canvas.height/2;
      var height = this.defaultGapHeight;

      if(this.columns.length > 0) {
        var lastColumn = this.columns[this.columns.length-1];
        x = lastColumn.right;
        y = Math.min(
              this.canvas.height - this.minWallHeight - height/2,
              Math.max(
                this.minWallHeight+height/2,
                this.columns[this.columns.length-1].y + this.slope*this.columnWidth
              )
            );
      }

      this.columns.push(new Object(x, y, this.columnWidth, height));
    }
  }

  addBarrier(x, y, width, height) {
    this.barriers.push(new Object(x, y, width, height));
  }

  step() {
    if(this.paused) {
      return;
    }

    var dist = this.speed;

    for(var i in this.columns) {
      var oldXY = this.columns[i].getXY();
      this.columns[i].setXY(oldXY.x - dist, oldXY.y);
    }

    for(var i in this.barriers) {
      var oldXY = this.barriers[i].getXY();
      this.barriers[i].setXY(oldXY.x - dist, oldXY.y);
    }

    var oldXY = this.jetman.getXY();
    var newXY = oldXY;
    if(this.mousedown) {
      newXY.y = oldXY.y - this.jetman.riseRate;
      this.jetman.setXY(newXY.x, newXY.y);
    } else {
      newXY.y = oldXY.y + this.fallRate;
      this.jetman.setXY(newXY.x, newXY.y);
    }

    if(this.crashed()) {
      this.endGame();
    } else {
      this.dist += dist;
      this.score = Math.round(this.dist/100);
    }

    this.nextSlopeChange--;
    this.nextBarrier -= dist;

    if(this.columns.length > this.nextSlopeChange) {
      this.setSlope();
      this.setNextSlopeChange();
    }

    if(this.nextBarrier < this.dist + this.canvas.width/2) {
      this.addBarrier(this.canvas.width, this.canvas.height/2-30, 20, 60); console.log('TODO: Fix this. Not static ints.');
      this.nextBarrier = this.dist + this.canvas.width * 2;
    }

    this.removeColumns();
    this.addColumns();
  }

  endGame() {
    this.gameOver = true;
    this.paused = true;
    if(this.score > this.highScore) {
      localStorage.jetmanHS = this.score;
      this.highScore = this.score;
    }

    var t = this;
    setTimeout(function() { t.reset(); }, 500);
  }

  draw() {
    this.ctx.fillStyle = "#3333ff";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#000000";
    for(var i in this.columns) {
      if(this.debugMode) {
        //reset fillStyle because it will have been set to a different color when drawing the center line
        this.ctx.fillStyle = "#000000";
      }

      this.ctx.fillRect(this.columns[i].left, this.columns[i].top, this.columns[i].width, this.columns[i].height);
      if(this.debugMode) {
        //draw center line of gap
        this.ctx.fillStyle = "#ff0000";
        this.ctx.fillRect(this.columns[i].x, this.columns[i].y, 1, 1);
      }
    }

    for(var i in this.barriers) {
      this.ctx.fillStyle = "#3333ff";
      this.ctx.fillRect(this.barriers[i].left, this.barriers[i].top, this.barriers[i].width, this.barriers[i].height);
    }

    this.ctx.drawImage(this.jetman.sprite, this.jetman.left, this.jetman.top, this.jetman.width, this.jetman.height);
    if(this.debugMode) {
      this.ctx.strokeStyle = "#888822";
      this.ctx.strokeRect(this.jetman.x - this.jetman.width/2, this.jetman.y - this.jetman.height/2, this.jetman.width, this.jetman.height);
    }

    this.ctx.font = "24px Arial";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.textAlign = "left";
    this.ctx.fillText("High Score: " + this.highScore + " Score: " +this.score, 10, 28);

    if(this.score == 0 && this.paused) {
      this.ctx.font = "24px Arial";
      this.ctx.fillStyle = "#ffffff";
      this.ctx.textAlign = "center";
      this.ctx.fillText("Click to Start", this.canvas.width/2, this.canvas.height/2 + 60);
    }
  }

  crashed() {
    for(var i in this.columns) {
      if(this.xCollision(this.jetman, this.columns[i]) && this.yOutOfBounds(this.jetman, this.columns[i])) {
        return true;
      }
    }

    for(var i in this.barriers) {
      if(this.collision(this.jetman, this.barriers[i])) {
        return true;
      }
    }

    return false;
  }

  collision(a, b) {
    if(this.xCollision(a, b) && this.yCollision(a, b)) {
      return true;
    }

    return false;
  }

  xCollision(a, b) {
    if(a.left <= b.right && a.right >= b.left) {
      return true;
    }

    return false;
  }

  yCollision(a, b) {
    if(a.top <= b.bottom && a.bottom >= b.top) {
      return true;
    }

    return false;
  }

  xOutOfBounds(a, b) {
    if(a.left <= b.left || a.right >= b.right) {
      return true;
    }

    return false;
  }

  yOutOfBounds(a, b) {
    if(a.top <= b.top || a.bottom >= b.bottom) {
      return true;
    }

    return false;
  }

  reset() {
    this.columns = [];
    this.barriers = [];
    this.slope = 0;
    this.dist = 0;
    this.score = 0;

    this.addColumns();

    this.jetman.setXY(this.canvas.width/2, this.canvas.height/2);

    this.draw();

    this.paused = true;
    this.gameOver = false;
  }
}
