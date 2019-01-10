class Game {
  constructor(canvas, jetman) {
    this.debugMode = false;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    this.jetman = jetman

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

    this.paused = true;
    this.stepper;
    this.frameRate = 60;
    this.speed = 12;

    this.mousedown = false;
    this.globalMousedown = false;
    this.fallRate = 3.25;

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

    this.canvas.addEventListener('mousedown', function() { t.mousedown = true; t.paused = false; }, false);
    this.canvas.addEventListener('mouseup', function() { t.mousedown = false; }, false);
    this.canvas.addEventListener('mouseout', function() { t.mousedown = false; }, true);
    this.canvas.addEventListener('mouseenter', function() { if(t.globalMousedown) { t.mousedown = true; } }, true);

    var t = this;
    this.stepper = setInterval(function() { for(var i=0; i<t.speed; i++) { t.step(); } t.draw(); }, 1000/t.frameRate);
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
    if(lastColumn.gapTop == this.minWallHeight || lastColumn.gapBottom == this.canvas.height - this.minWallHeight) {
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
      if(lastColumn.gapTop == this.minWallHeight || rand > 2) {
        this.slope *= -1;
      }
    }

  }

  addColumn() {
    var column = {};
    if(this.columns.length > 0) {
      column.gapCenter = this.columns[this.columns.length-1].gapCenter + this.slope*this.columnWidth;
    } else {
      column.gapCenter = this.canvas.height/2;
    }

    column.gapHeight = this.defaultGapHeight;

    column.gapTop = Math.min(this.canvas.height - this.minWallHeight - this.minGapHeight, Math.max(this.minWallHeight, column.gapCenter - column.gapHeight/2));
    column.gapBottom = Math.max(this.minWallHeight + this.minGapHeight, Math.min(this.canvas.height - this.minWallHeight, column.gapCenter + column.gapHeight/2));

    column.gapHeight = column.gapBottom - column.gapTop;
    column.gapCenter = column.gapTop + column.gapHeight/2;

    this.columns.push(column);
  }

  step() {
    if(this.paused) {
      return;
    }
    this.columns.shift();
    this.nextSlopeChange--;

    if(this.columns.length > this.nextSlopeChange) {
      this.setSlope();
      this.setNextSlopeChange();
    }

    var oldXY = this.jetman.getXY();
    var newXY = oldXY;
    if(this.mousedown) {
      newXY[1] = oldXY[1] - this.jetman.riseRate/this.speed;
      this.jetman.setXY(newXY[0],Math.max(this.minWallHeight + this.jetman.height/2, newXY[1]));
    } else {
      newXY[1] = oldXY[1] + this.fallRate/this.speed;
      this.jetman.setXY(newXY[0],Math.min(this.canvas.height - this.minWallHeight - this.jetman.height/2, newXY[1]));
    }

    if(this.collision()) {
      this.endGame();
    } else {
      this.dist++;
      this.score = Math.round(this.dist/100);
    }

    this.addColumn();
  }

  endGame() {
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
        this.ctx.fillStyle = "#000000";
      }
      this.ctx.fillRect(i*this.columnWidth, this.columns[i].gapTop, this.columnWidth, this.columns[i].gapHeight);
      if(this.debugMode) {
        //draw center line of gap
        this.ctx.fillStyle = "#882222";
        this.ctx.fillRect(i*this.columnWidth, this.columns[i].gapTop + this.columns[i].gapHeight/2, 1, 1);
      }
    }

    this.ctx.drawImage(this.jetman.sprite, this.jetman.x - this.jetman.width/2, this.jetman.y - this.jetman.height/2, this.jetman.width, this.jetman.height);
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

  collision() {
    var i = Math.floor(this.jetman.x - this.jetman.width/2);
    var max = Math.ceil(this.jetman.x + this.jetman.width/2);
    for(i; i<max; i++) {
      if(this.jetman.y-this.jetman.height/2 <= this.columns[i].gapTop || this.jetman.y+this.jetman.height/2 >= this.columns[i].gapBottom) {
        return true;
      }
    }

    return false;
  }

  reset() {
    this.columns = [];
    this.slope = 0;
    this.score = 0;

    for(var i=0; Math.ceil(i<this.canvas.width/this.columnWidth); i++) {
      this.addColumn();
    }

    this.jetman.setXY(this.canvas.width/2, this.canvas.height/2);

    this.draw();
  }
}
