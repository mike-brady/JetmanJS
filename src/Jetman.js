class Jetman extends Object {
  constructor(sprite) {
    super(0, 0, 0, 0);

    this.riseRate = 2.25;

    this.sprite = new Image();
    this.sprite.src = sprite;

    var t = this;
    this.sprite.onload = function() {
      t.width = this.width;
      t.height = this.height;

      t.setBounds();
    }
  }
}
