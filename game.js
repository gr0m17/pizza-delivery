//ground collision detection
//if the tile on the ground is not a road tile, collide with it, and stop moving

const GRID_SIZE = 30;
const TILE_WIDTH = 200;
const TILE_HEIGHT = TILE_WIDTH / 2;
const MAX_HEIGHT = 0;
const NUMOFTILES = 20;
let d;
let gpsArrow;
let storeArrow;
let v = 0.05;
let isDown = false;
let isLeft = false;
let isRight = false;
let isBreaking = false;
let isUp = false;
let houses = [13, 16];
let stores = [20];
let collides = [...houses];
let pizzaCar;
let grid = [];
let houseMap = [];
let deliveryHouses = [];
let startingArray = undefined;
//fill grid with empty 0s
for (let i = 0; i < GRID_SIZE; i++) {
  grid[i] = [];
  for (let j = 0; j < GRID_SIZE; j++) {
    grid[i][j] = 0;
  }
}

let tile_images = [];
let tileImages = tile_images;

let x_start = 0;
let y_start = 0;

function draw_grid() {
  x_start = width / 2 - TILE_WIDTH / 2;
  y_start = 50;
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      draw_tile(tile_images[grid[j][i]], i, j);
    }
  }
}
let z_offset;

function draw_tile(img, x, y, addedOffset = 0) {
  let x_screen = x_start + ((x - y) * TILE_WIDTH) / 2;
  let y_screen = y_start + ((x + y) * TILE_HEIGHT) / 2;
  let z_offset = MAX_HEIGHT - img.height;
  image(img, x_screen, y_screen + z_offset + addedOffset);
}

function setup() {
  //load the car sprite
  pizzaCar = {
    x: 0,
    y: 0,
    angle: 1.5708,
    xOffset: 0.8,
    yOffset: 1.2,
    health: 10,
    damage: 3,
    dead: false,
    value: 0,
    // xOffset: 0.5,
    // yOffset: 1.1,

    direction: "SW",
    images: {
      N: loadImage("./pizzaCar/pizzaCar_N.png"),
      NE: loadImage("./pizzaCar/pizzaCar_NE.png"),
      NNE: loadImage("./pizzaCar/pizzaCar_NNE.png"),
      NNW: loadImage("./pizzaCar/pizzaCar_NNW.png"),
      NEE: loadImage("./pizzaCar/pizzaCar_NEE.png"),
      SEE: loadImage("./pizzaCar/pizzaCar_SEE.png"),
      SSE: loadImage("./pizzaCar/pizzaCar_SSE.png"),
      SSW: loadImage("./pizzaCar/pizzaCar_SSW.png"),
      SWW: loadImage("./pizzaCar/pizzaCar_SWW.png"),
      NWW: loadImage("./pizzaCar/pizzaCar_NWW.png"),

      E: loadImage("./pizzaCar/pizzaCar_E.png"),
      SE: loadImage("./pizzaCar/pizzaCar_SE.png"),
      S: loadImage("./pizzaCar/pizzaCar_S.png"),
      SW: loadImage("./pizzaCar/pizzaCar_SW.png"),
      W: loadImage("./pizzaCar/pizzaCar_W.png"),
      NW: loadImage("./pizzaCar/pizzaCar_NW.png"),
    },
    position: createVector(0, 0),
    velocity: createVector(0, 0),
    acceleration: createVector(0, 0),
    maxSpeed: 0.115,
    maxForce: 0.005,
    maxBreaking: 0.03,
    maxTurnRate: 0.0065,
    breakingOffset: 0,
    currentPedal: 0,
    storeLocation: [],
    pizzaStorage: [],
    deliveryTracker: [],
    spwanedAtStore: false,
    update: function () {
      this.velocity.add(this.acceleration);
      this.velocity.limit(this.maxSpeed);
      this.position.add(this.velocity);
      this.acceleration.mult(0);
      this.x = this.position.x;
      this.y = this.position.y;
      this.currentPedal *= 0.9;
    },
    movePizzaCar() {
      if (isUp) {
        //increase the current speed by the acceleration rate
        if (this.currentPedal < this.maxSpeed) {
          this.currentPedal += this.maxForce;
          console.log(this.currentPedal);
        }
      }
      if (isDown) {
        //decrease the current speed by the acceleration rate
        if (this.currentPedal > 0) {
          this.currentPedal -= this.maxBreaking;
          if (this.currentPedal < 0) {
            this.currentPedal = 0;
          }
          console.log(this.currentPedal);
        }
        // console.log(newX, newY);

        // pizzaCar.x = constrain(pizzaCar.x + v * (isRight - isLeft), 0, width);
        // pizzaCar.y = constrain(pizzaCar.y + v * (isDown - isUp), 0, height);
        // setPizzaDirection(isRight, isLeft, isDown, isUp);
      }
      let pedalPercent = this.currentPedal / this.maxSpeed;
      pedalPercent = pedalPercent * 10;
      if (pedalPercent < 0.001) {
        pedalPercent = 0.01;
      }
      if (isLeft) {
        this.angle -=
          0.05 + this.maxTurnRate + this.breakingOffset * pedalPercent;
        if (this.angle < 0) {
          this.angle = PI * 2;
        }
      }
      if (isRight) {
        this.angle +=
          0.05 + this.maxTurnRate + this.breakingOffset * pedalPercent;
        if (this.angle > PI * 2) {
          this.angle = 0;
        }
      }
      if (isBreaking) {
        this.breakingOffset = 0.025;
        if (this.currentPedal > 0) {
          this.currentPedal -= this.maxBreaking / 8;
          if (this.currentPedal < 0) {
            this.currentPedal = 0;
          }
        }
      }
      if (!isBreaking) {
        this.breakingOffset = 0;
      }

      // console.log(this.angle);
      //add the curent speed and the current angle to the velocity
      // let targetX = this.currentPedal * cos(this.angle);
      // let targetY = this.currentPedal * sin(this.angle);

      this.velocity.x = this.currentPedal * cos(this.angle);
      this.velocity.y = this.currentPedal * sin(this.angle);
      //adjust the velocity to the target velocity at max rate

      this.setPizzaDirection();
      console.log(this.x, this.y);
      if (
        this.x + this.y * GRID_SIZE >= GRID_SIZE * GRID_SIZE ||
        this.x < 0 ||
        this.y < 0 ||
        this.y > GRID_SIZE ||
        this.x > GRID_SIZE
      ) {
        this.collide();
      } else {
        if (grid[floor(this.y)][floor(this.x)]?.[0] != undefined) {
          let tile = grid[floor(this.y)][floor(this.x)][0];
          if (collides.includes(tile)) {
            //make a vector opposite the velocity and add it to the acceleration
            this.collide();
          }
        }
      }
      if (!this.dead) {
        this.update();
      }
    },
    collide() {
      if (!this.dead) {
        let opposite = createVector(-this.velocity.x * 5, -this.velocity.y * 5);
        //divide the maxspeed by the velocity to get the percentage of the speed
        let percent = this.velocity.mag() / this.maxSpeed;

        this.health -= this.damage * percent;
        if (this.health < 0) {
          this.dead = true;
        }
        this.currentPedal = 0;
        this.acceleration = createVector(0, 0);
        this.acceleration.add(opposite);
      }
    },
    // setPizzaDirection(isRight, isLeft, isDown, isUp) {
    //   if (isRight && isUp) {
    //     pizzaCar.direction = "E";
    //   } else if (isRight && isDown) {
    //     pizzaCar.direction = "S";
    //   } else if (isLeft && isUp) {
    //     pizzaCar.direction = "N";
    //   } else if (isLeft && isDown) {
    //     pizzaCar.direction = "W";
    //   } else if (isRight) {
    //     pizzaCar.direction = "SE";
    //   } else if (isLeft) {
    //     pizzaCar.direction = "NW";
    //   } else if (isUp) {
    //     pizzaCar.direction = "NE";
    //   } else if (isDown) {
    //     pizzaCar.direction = "SW";
    //   }
    // },
    setPizzaDirection() {
      //convert the angle to degrees
      let angle = (this.angle * 180) / PI;
      // console.log(angle);
      //if the angle is between 0 and 22.5, the car is facing SE

      if ((angle >= 0 && angle < 11.25) || (angle >= 348.75 && angle < 360)) {
        this.direction = "SE";
      } else if (angle >= 11.25 && angle < 33.75) {
        this.direction = "SSE";
      } else if (angle >= 33.75 && angle < 56.25) {
        this.direction = "S";
      } else if (angle >= 56.25 && angle < 78.75) {
        this.direction = "SSW";
      } else if (angle >= 78.75 && angle < 101.25) {
        this.direction = "SW";
      } else if (angle >= 101.25 && angle < 123.75) {
        this.direction = "SWW";
      } else if (angle >= 123.75 && angle < 146.25) {
        this.direction = "W";
      } else if (angle >= 146.25 && angle < 168.75) {
        this.direction = "NWW";
      } else if (angle >= 168.75 && angle < 191.25) {
        this.direction = "NW";
      } else if (angle >= 191.25 && angle < 213.75) {
        this.direction = "NNW";
      } else if (angle >= 213.75 && angle < 236.25) {
        this.direction = "N";
      } else if (angle >= 236.25 && angle < 258.75) {
        this.direction = "NNE";
      } else if (angle >= 258.75 && angle < 281.25) {
        this.direction = "NE";
      } else if (angle >= 281.25 && angle < 303.75) {
        this.direction = "NEE";
      } else if (angle >= 303.75 && angle < 326.25) {
        this.direction = "E";
      } else if (angle >= 326.25 && angle < 348.75) {
        this.direction = "SEE";
      }

      // if ((angle >= 0 && angle < 22.5) || (angle >= 337.5 && angle < 360)) {
      //   this.direction = "SE";
      // } else if (angle >= 22.5 && angle < 67.5) {
      //   this.direction = "S";
      // } else if (angle >= 67.5 && angle < 112.5) {
      //   this.direction = "SW";
      // } else if (angle >= 112.5 && angle < 157.5) {
      //   this.direction = "W";
      // } else if (angle >= 157.5 && angle < 202.5) {
      //   this.direction = "NW";
      // } else if (angle >= 202.5 && angle < 247.5) {
      //   this.direction = "N";
      // } else if (angle >= 247.5 && angle < 292.5) {
      //   this.direction = "NE";
      // } else if (angle >= 292.5 && angle < 337.5) {
      //   this.direction = "E";
      // }
    },
    //if the angle is between 22.5 and 67.5, the car is facing S
  };
  createCanvas(600, 400);
  gpsArrow = loadImage("tiles/arrow_003.png");
  storeArrow = loadImage("tiles/arrow_004.png");
  for (let i = 0; i <= NUMOFTILES; i++) {
    tile_images.push(loadImage("./tiles/tile-" + i + ".png"));
  }
  const newarray = generateMap();
  // console.log(newarray);
  // console.log(grid);
  //spread newArray into grid
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (newarray[i + j * GRID_SIZE] != undefined) {
        // console.log(grid[i]);
        grid[i][j] = newarray[i + j * GRID_SIZE];
      }
    }
  }
}

function draw() {
  //translate the canvas so that the pizza car is in the center of the screen
  //move canvas to center of pizzacar.position
  let x_screen =
    -width / 2 + x_start + ((pizzaCar.x - pizzaCar.y) * TILE_WIDTH) / 2;
  let y_screen =
    -height / 2 + y_start + ((pizzaCar.x + pizzaCar.y) * TILE_HEIGHT) / 2;

  translate(-x_screen - 50, -y_screen + 100);
  //print some text on screen

  background("black");
  draw_grid();

  drawPizzaCar(pizzaCar.position.x, pizzaCar.position.y);
  pizzaCar.movePizzaCar(); //draw the roof
  let storeSpawned = false;
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (houses.includes(abs([grid[i][j][0]]))) {
        if (!storeSpawned) {
          draw_roof(i, j, "store");
          storeSpawned = true;
          if (!pizzaCar.spwanedAtStore) {
            pizzaCar.storeLocation = [i, j];
            // console.log(pizzaCar.storeLocation);

            pizzaCar.position = createVector(j + 0.5, i + 1.5);
            pizzaCar.spwanedAtStore = true;
            // console.log("car spawned at: " + pizzaCar.storeLocation);
          }
        } else {
          // console.log("found a house");
          draw_roof(i, j, "house");
          //if x and y are not equal to dim -1 push into houses array
          if (i < GRID_SIZE - 3 && j < GRID_SIZE - 3) {
            deliveryHouses.push({ x: j, y: i });
          }
        }
      } //
    } //
  } //
  if (pizzaCar.dead) {
    let x_screen = x_start + ((pizzaCar.x - pizzaCar.y) * TILE_WIDTH) / 2;
    let y_screen = y_start + ((pizzaCar.x + pizzaCar.y) * TILE_HEIGHT) / 2;
    let z_offset = MAX_HEIGHT;
    push();
    rect(x_screen + pizzaCar.xOffset, y_screen + pizzaCar.yOffset, 200, 100);
    textSize(20);
    text(
      "Game Over",
      x_screen + pizzaCar.xOffset + 50,
      y_screen + pizzaCar.yOffset + 25
    );
    textSize(12);
    text(
      "  You crashed! \n your car is dead.",
      x_screen + pizzaCar.xOffset + 50,
      y_screen + pizzaCar.yOffset + 50
    );
    pop();
  }
  pizzaObjective();
}

function pizzaObjective() {
  let carX = pizzaCar.position.x;
  let carY = pizzaCar.position.y;
  let storeY = pizzaCar.storeLocation[0] + 1;
  let storeX = pizzaCar.storeLocation[1];

  let distance = dist(carX, carY, storeX, storeY);
  console.log(storeX, storeY);
  console.log(distance);
  if (distance < 0.75) {
    if (pizzaCar.pizzaStorage.length == 0) {
      pizzaCar.pizzaStorage.push(
        new Delivery(storeX, storeY, deliveryHouses, pizzaCar)
      );
      console.log("pizza added");
    }
    console.log(
      pizzaCar.pizzaStorage[0].house.x,
      pizzaCar.pizzaStorage[0].house.y
    );
  }
  if (pizzaCar.pizzaStorage.length > 0) {
    pizzaCar.pizzaStorage[0].update();
  }
}
function draw_roof(i, j, type = "house") {
  let roofNumber;
  if (type == "store") {
    roofNumber = "18";
  } else if (type == "house") {
    roofNumber = "17";
  }
  let z_offset = MAX_HEIGHT - tile_images[grid[i][j]].height;
  x_start = width / 2 - TILE_WIDTH / 2;
  y_start = 10;

  draw_tile(tile_images[roofNumber], j, i, -42);
}
function drawPizzaCar(x, y) {
  draw_tile(
    pizzaCar.images[pizzaCar.direction],
    x - pizzaCar.xOffset,
    y - pizzaCar.yOffset,
    -0
  ); //draw the pizzaCar
  let x_screen = x_start + ((x - y) * TILE_WIDTH) / 2;
  let y_screen = y_start + ((x + y) * TILE_HEIGHT) / 2;
  let z_offset = MAX_HEIGHT;
  //use p5.js to draw text
  push();
  textSize(6);
  if (!pizzaCar.dead) {
    text(
      "HP: " + pizzaCar.health.toFixed(2),
      x_screen + 80,
      y_screen + z_offset - 110
    );
  }
  if (pizzaCar.pizzaStorage.length > 0) {
    pizzaCar.pizzaStorage[0].update();
    text(
      "delivery time remaining: " +
        pizzaCar.pizzaStorage[0].timer +
        "\n delivery address: " +
        pizzaCar.pizzaStorage[0].house.x +
        "," +
        pizzaCar.pizzaStorage[0].house.y,
      x_screen + 80,
      y_screen + z_offset - 90
    );
    //draw the arrow to the store
  }

  //calculate the angle from the pizzacar to the delivery house
  if (pizzaCar.pizzaStorage[0] != undefined) {
    let angle = atan2(
      y - (pizzaCar.pizzaStorage[0].house.y + 1.5),
      x - (pizzaCar.pizzaStorage[0].house.x + 0.8)
    );
    //draw the arrow
    push();
    let arrowOffsetX = 55;
    let arrowOffsetY = -170;
    translate(x_screen + arrowOffsetX, y_screen + z_offset + arrowOffsetY);
    rotate(angle - PI / 4);
    image(gpsArrow, -12, -16);

    pop();
  } else {
    push();
    let storeAngle = atan2(
      y - (pizzaCar.storeLocation[0] + 1.5),
      x - (pizzaCar.storeLocation[1] + 0.8)
    );
    let storeArrowOffsetX = 55;
    let storeArrowOffsetY = -170;
    translate(
      x_screen + storeArrowOffsetX,
      y_screen + z_offset + storeArrowOffsetY
    );
    rotate(storeAngle - PI / 4);
    image(storeArrow, -12, -16);

    pop();
  }
}
function generateMap() {
  let tiles = [];

  let grid = [];
  const DIM = GRID_SIZE;
  function startThis() {
    // createCanvas(DIM * TILE_WIDTH, DIM * TILE_HEIGHT);
    //
    //UL/BL/UR/BR
    tiles[0] = new Tile(tileImages[0], ["GGG", "GGG", "GGG", "GGG"]);
    tiles[1] = new Tile(tileImages[1], ["GGG", "GGG", "GGG", "GGG"]);
    tiles[2] = new Tile(tileImages[2], ["GRG", "GRG", "GRG", "GRG"]);
    tiles[3] = new Tile(tileImages[3], ["GGG", "GRG", "GRG", "GRG"]);
    tiles[4] = new Tile(tileImages[4], ["GRG", "GGG", "GRG", "HHH"]);
    tiles[5] = new Tile(tileImages[5], ["DW1", "GRG", "GGG", "GRG"]);
    tiles[6] = new Tile(tileImages[6], ["GRG", "GRG", "GRG", "GGG"]);
    tiles[7] = new Tile(tileImages[7], ["GGG", "GGG", "GRG", "GRG"]);
    tiles[8] = new Tile(tileImages[8], ["GRG", "GGG", "GGG", "GRG"]);
    tiles[9] = new Tile(tileImages[9], ["GRG", "GRG", "GGG", "GGG"]);
    tiles[10] = new Tile(tileImages[10], ["GGG", "GRG", "GRG", "GGG"]);
    tiles[11] = new Tile(tileImages[12], ["GRG", "GGG", "GRG", "GGG"]);
    tiles[12] = new Tile(tileImages[12], ["GGG", "GRG", "GGG", "GRG"]);

    tiles[13] = new Tile(tileImages[13], ["GGG", "DW1", "GGG", "GGG"]);

    tiles[14] = new Tile(tileImages[14], ["GGG", "HHH", "GGG", "1WD"]);
    tiles[15] = new Tile(tileImages[15], ["GGG", "GGG", "HHH", "1WD"]);
    tiles[16] = new Tile(tileImages[16], ["GGG", "DW1", "GGG", "GGG"]);

    tiles[17] = new Tile(tileImages[17], ["R!", "!O", "!O", "F!"]);
    tiles[18] = new Tile(tileImages[18], ["R!", "!O", "!O", "F!"]);
    tiles[19] = new Tile(tileImages[19], ["RRR", "GGG", "GGG", "1WD"]);
    // tiles[20] = new Tile(tileImages[20], ["GGG", "DW1", "GGG", "GGG"]);
    //for each tiles[i]
    for (let i = 0; i < tiles.length; i++) {
      tiles[i].index = i;
    }

    console.log(tiles.length);
    // Generate the adjacency rules based on edges
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      tile.analyze(tiles);
    }

    //in this space generate the store location and 5 houses. the store should always be in the bottom left corner.
    //the houses should be in a random location and be at least 2 tiles away from the edges of the map.
    let storeLocation = { x: 2, y: DIM - 2 };
    let houses = [];
    for (let i = 0; i < 5; i++) {
      let houseLocation = [0, 0];
      while (
        abs(houseLocation[0] - storeLocation[0]) < 2 ||
        abs(houseLocation[1] - storeLocation[1]) < 2
      ) {}
      houses.push({ x: floor(random(0, DIM)), y: floor(random(0, DIM)) });
    }
    console.log(houses);
    //place the store and houses in an array and call restartWFC to generate the map
    houseMap = [storeLocation, ...houses];

    restartWFC();
  }
  function restartWFC(startingArray = undefined) {
    //starting array will already have cells in it.
    // console.log("restarting wfc");
    for (let i = 0; i < DIM * DIM; i++) {
      grid[i] = new Cell(tiles.length);
    }
    if (startingArray == undefined) {
    } else {
      console.log("using houseMap");
      let storeLocation = { x: startingArray[0].x, y: startingArray[0].y };
      grid[storeLocation.x + storeLocation.y * DIM].makeStore();
      for (let i = 1; i < startingArray.length; i++) {
        // console.log(startingArray);
        let x = startingArray[i].x;
        let y = startingArray[i].y;
        // console.log(grid);
        // console.log(x, y);
        grid[x + y * DIM].makeHouse();
        // console.log(grid[x + y * DIM]);
        // grid[i] = startingArray[i];
      }
    }
    // Create cell for each spot on the grid
    //inject the houses and road
    //
    ////
  }
  function checkValid(arr, valid) {
    //console.log(arr, valid);
    for (let i = arr.length - 1; i >= 0; i--) {
      // VALID: [BLANK, RIGHT]
      // ARR: [BLANK, UP, RIGHT, DOWN, LEFT]
      // result in removing UP, DOWN, LEFT
      let element = arr[i];
      // console.log(element, valid.includes(element));
      if (!valid.includes(element)) {
        arr.splice(i, 1);
      }
    }
    // console.log(arr);
    // console.log("----------");
  }

  function generateMapFunction() {
    const w = width / DIM;
    const h = height / DIM;
    for (let j = 0; j < DIM; j++) {
      for (let i = 0; i < DIM; i++) {
        let cell = grid[i + j * DIM];
        if (cell.collapsed) {
          let index = cell.options[0];
          if (index == undefined) {
            index = 0;
          }
          // image(tiles[index].img, i * w, j * h, w, h);
        } else {
          // noFill();
          // stroke(51);
          // rect(i * w, j * h, w, h);
        }
      }
    }
    // Pick cell with least entropy
    let gridCopy = grid.slice();
    gridCopy = gridCopy.filter((a) => !a.collapsed);
    // console.table(grid);
    // console.table(gridCopy);
    if (gridCopy.length == 0) {
      console.log("collapsed all, ready for next round");
      makeGrid(grid);
    }
    gridCopy.sort((a, b) => {
      return a.options.length - b.options.length;
    });
    let len = gridCopy[0].options.length;
    let stopIndex = 0;
    for (let i = 1; i < gridCopy.length; i++) {
      if (gridCopy[i].options.length > len) {
        stopIndex = i;
        break;
      }
    }
    if (stopIndex > 0) gridCopy.splice(stopIndex);
    //
    const cellPicker = floor(random(0, gridCopy.length));
    // console.log("cellPicker:", cellPicker);
    const cell = gridCopy[cellPicker];
    // console.log("cell:", cell);
    // console.table(cell.options);
    // console.log("gridCopy:", gridCopy);
    cell.collapsed = true;
    let pick = random(cell.options);
    // console.log(pick);
    if (pick === undefined) {
      //if undefined, reanalyze the cell
      // console.log(cell);
      console.log("UNDEFINED, setting to 0");
      pick = 0;

      restartWFC();
      // return;
    }
    cell.options = [pick];
    const nextGrid = [];
    for (let j = 0; j < DIM; j++) {
      for (let i = 0; i < DIM; i++) {
        let index = i + j * DIM;
        if (grid[index].collapsed) {
          nextGrid[index] = grid[index];
        } else {
          let options = new Array(tiles.length).fill(0).map((x, i) => i);
          // Look up
          if (j > 0) {
            let up = grid[i + (j - 1) * DIM];
            let validOptions = [];
            for (let option of up.options) {
              let valid = tiles[option].down;
              validOptions = validOptions.concat(valid);
            }
            checkValid(options, validOptions);
          }
          // Look right
          if (i < DIM - 1) {
            let right = grid[i + 1 + j * DIM];
            let validOptions = [];
            for (let option of right.options) {
              let valid = tiles[option].left;
              validOptions = validOptions.concat(valid);
            }
            checkValid(options, validOptions);
          }
          // Look down
          if (j < DIM - 1) {
            let down = grid[i + (j + 1) * DIM];
            let validOptions = [];
            for (let option of down.options) {
              let valid = tiles[option].up;
              validOptions = validOptions.concat(valid);
            }
            checkValid(options, validOptions);
          }
          // Look left
          if (i > 0) {
            let left = grid[i - 1 + j * DIM];
            let validOptions = [];
            for (let option of left.options) {
              let valid = tiles[option].right;
              validOptions = validOptions.concat(valid);
            }
            checkValid(options, validOptions);
          }
          // I could immediately collapse if only one option left?
          nextGrid[index] = new Cell(options);
        }
      }
    }
    grid = nextGrid;
    return makeGrid(grid);
  }
  startThis();
  //check if all the cells are collapsed
  let done = false;
  while (!done) {
    // console.log("grid:", grid);

    if (!grid.every((a) => a.collapsed == true)) {
      generateMapFunction();
      // console.log("cycle!");
      // console.log(grid);
    } else {
      done = true;
    }
  }

  makeGrid(grid);
  //make an array of grid[i].options[0] for each cell
  function makeGrid(grid) {
    let sendArray = [];
    for (let i = 0; i < grid.length; i++) {
      sendArray[i] = [grid[i].options[0]];
    }
    return sendArray;
  }
  return makeGrid(grid);
}

function setMove(k, b) {
  console.log(k, b);
  switch (k) {
    case 87: //w
      // case UP:
      return (isUp = b);

    case 83: //s
      // case DOWN:
      return (isDown = b);

    case 65: //a
      // case LEFT:
      return (isLeft = b);

    case 68: //d
      // case RIGHT:
      return (isRight = b);
    case 32:
      if (pizzaCar.dead) {
        pizzaCar.dead = false;
        pizzaCar.health = 100;
        pizzaCar.position.x = pizzaCar.storeLocation[1] + 0.5;
        pizzaCar.position.y = pizzaCar.storeLocation[0] + 1.5;
        pizzaCar.angle = PI / 2;
      } else {
        return (isBreaking = b);
      }
    default:
      return b;
  }
}
function keyPressed() {
  console.log(keyCode);
  console.log(key);
  setMove(keyCode, true);
}

function keyReleased() {
  console.log(keyCode);
  console.log(key);
  setMove(keyCode, false);
}
