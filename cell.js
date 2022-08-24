class Cell {
  constructor(value) {
    this.collapsed = false;
    this.collides = false;
    this.house = false;
    if (value instanceof Array) {
      this.options = value;
    } else {
      this.options = [];
      for (let i = 0; i < value; i++) {
        this.options[i] = i;
      }
    }
  }
  makeRoad() {
    this.collides = false;
    this.collapsed = false;
    this.options = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    this.options = [...this.options, 14, 15, 19]; // add driveway tiles to the mix
  }
  makeHouse() {
    this.collides = true;
    this.collapsed = false;
    this.house = true;
    this.options = [13, 16];
  }
  makeStore() {
    this.collides = true;
    this.collapsed = false;
    this.store = true;
    this.options = [20];
  }
}
//grass tiles: 0, 1
// road tiles: 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
// driveway tiles: 14, 15, 19
// house tiles: 13, 16
// roof tiles: 17, 18

//
