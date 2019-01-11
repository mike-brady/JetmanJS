class Object {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;

    this.width = width;
    this.height = height;

    this.setBounds();
  }

  setXY(x, y) {
    this.x = x;
    this.y = y;

    this.setBounds();
  }

  getXY() {
    return { x: this.x, y: this.y };
  }

  setBounds() {
    this.left = this.x - this.width/2;
    this.top = this.y - this.height/2;
    this.right = this.x + this.width/2;
    this.bottom = this.y + this.height/2;
  }
}
