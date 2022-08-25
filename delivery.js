class Delivery {
  constructor(storeX, storeY, houses, pizzaCar) {
    this.pizzaCar = pizzaCar;
    this.dead = false;
    this.delivered = false;
    this.storeX = storeX;
    this.storeY = storeY;
    //randomly pick a house from houses
    this.house = houses[floor(random(houses.length))];
    //make a timer with 5 seconds per tile away from the house
    this.timer = this.distanceToStore() * 75;
    this.timerStart = this.timer;
    this.value = this.timer * 3;
  }
  distanceToStore() {
    return dist(this.house.x, this.house.y, this.storeX, this.storeY);
  }
  distanceToPizzaCar() {
    return dist(this.house.x, this.house.y, this.pizzaCar.x, this.pizzaCar.y);
  }
  update() {
    if (this.timer >= 0 && !this.delivered) {
      this.timer--;
      if (this.timer <= 0) {
        this.dead = true;
      }
    }

    //if the pizzaCar is at the house.x and house.y +1, then deliver the pizza
    if (
      floor(this.pizzaCar.x) == this.house.x &&
      floor(this.pizzaCar.y) == this.house.y + 1
    ) {
      // if (
      //   this.pizzaCar.position.x >= this.house.x &&
      //   this.pizzaCar.position.x <= this.house.x + 2 &&
      //   this.pizzaCar.position.y >= this.house.y - 1 &&
      //   this.pizzaCar.position.y <= this.house.y + 1 &&
      //   !this.delivered
      // ) {
      if (this.dead) {
        console.log("you tried to deliver it, but is was too late.");
        this.value = 0;
        this.pizzaCar.deliveryTracker.push(this);
        this.pizzaCar.pizzaStorage.splice(0, 1);
        this.pizzaCar.displayStatus();
      } else {
        console.log("pizza delivered!");
        console.log("value: " + this.value);
        //move the pizza from storage into deliveryTracker
        this.pizzaCar.deliveryTracker.push(this);
        this.pizzaCar.pizzaStorage.splice(0, 1);
        this.pizzaCar.displayStatus();
      }
      this.delivered = true;
    }
  }
}
