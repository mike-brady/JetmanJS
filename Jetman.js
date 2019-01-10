class Jetman {
  constructor(x, y, sprite) {
    this.x = x;
    this.y = y;

    this.width = 0;
    this.height = 0;

    this.riseRate = 2.5;

    this.sprite = new Image();
    this.sprite.src = sprite;

    var t = this;
    this.sprite.onload = function() {
      t.width = this.width;
      t.height = this.height;
    }
  }

  setXY(x, y) {
    this.x = x;
    this.y = y;
  }

  getXY() {
    return [this.x, this.y];
  }
}
