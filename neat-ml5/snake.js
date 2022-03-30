class Snake {
  constructor(brain) {
    this.size = 1;
    this.tail = [];
    this.ate = false;
    this.tail.push({
      x: floor(width / cellSize / 2),
      y: floor(width / cellSize / 2),
    });
    this.score = 2;
    this.fitness = 0;
    this.moveX = 1;
    this.moveY = 0;
    this.lastMoves = ["right"];
    this.lastDist = 0;
    this.color = {
      r: Math.random() * 255,
      g: Math.random() * 255,
      b: Math.random() * 255,
    };
    this.food = this.spawnSingleFood();

    if (brain) {
      this.brain = brain;
    } else {
      const options = {
        inputs: 10,
        /*[
          "food_left",
          "food_right",
          "food_top",
          "food_bottom",
          "wall_left",
          "wall_right",
          "wall_top",
          "wall_bottom",
          "closest_food_angle",
          "closest_food_dist"
        ],*/
        outputs: ["left", "right", "up", "down"],
        debug: true,
        task: "classification",
        noTraining: true,
        layers: [
          {
            type: "dense",
            units: 64,
            activation: "relu",
          },
          {
            type: "dense",
            activation: "sigmoid",
          },
        ],
      };
      this.brain = ml5.neuralNetwork(options);
    }
  }

  show() {
    fill(this.color.r, this.color.g, this.color.b);
    ellipseMode(CORNER);
    circle(this.food.x * cellSize, this.food.y * cellSize, cellSize);
    for (let i = 0; i < this.tail.length; i++) {
      rect(
        this.tail[i].x * cellSize,
        this.tail[i].y * cellSize,
        cellSize,
        cellSize
      );
    }
  }

  update() {
    let food = this.food;
    if (this.tail[0].x == food.x && this.tail[0].y == food.y) {
      this.size++;
      this.food = this.spawnSingleFood();
      this.score += 100;
      this.ate = true;
    }
    this.tail.unshift({
      x: this.tail[0].x + this.moveX,
      y: this.tail[0].y + this.moveY,
    });
    this.tail = this.tail.slice(0, this.size);
    let distFood = dist(this.tail[0].x, this.tail[0].y, food.x, food.y);
    if (distFood < this.lastDist) {
      this.score += 1;
    } else {
      this.score -= 1.5;
    }
    this.lastDist = distFood;
  }

  offScreen() {
    return (
      this.tail[0].x < 0 ||
      this.tail[0].x >= width / cellSize ||
      this.tail[0].y < 0 ||
      this.tail[0].y >= width / cellSize
    );
  }

  hitsItself() {
    if (this.size == 1) {
      return false;
    }
    for (let i = 0; i < this.size; i++) {
      if (
        this.tail[0].x == this.tail[i].x &&
        this.tail[0].y == this.tail[i].y
      ) {
        return true;
      }
    }
    return false;
  }

  think() {
    const inputs = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let head = this.tail[0];
    let food = this.food;
    if (food.y == head.y && food.x == head.x - 1) {
      // food left
      inputs[0] = 1;
    } else if (food.y == head.y && food.x == head.x + 1) {
      // food right
      inputs[1] = 1;
    } else if (food.x == head.x && food.y == head.y - 1) {
      // food top
      inputs[2] = 1;
    } else if (food.x == head.x && food.y == head.y + 1) {
      // food bottom
      inputs[3] = 1;
    }
    if (head.x == 0 || this.checkTailAdjacent("left")) {
      // wall or tail left?
      inputs[4] = 1;
    }
    if (head.x == width / cellSize - 1 || this.checkTailAdjacent("right")) {
      // wall or tail right?
      inputs[5] = 1;
    }
    if (head.y == 0 || this.checkTailAdjacent("top")) {
      // wall or tail top?
      inputs[6] = 1;
    }
    if (head.y == width / cellSize - 1 || this.checkTailAdjacent("bottom")) {
      // wall or tail bottom?
      inputs[7] = 1;
    }
    let closestFood = this.food;
    // Angle between closest food and head
    let headV = createVector(this.moveX, this.moveY);
    let foodV = createVector(closestFood.x, closestFood.y);
    inputs[8] = this.getAngle(headV, foodV);
    let distInput = 0;
    if (this.lastDist != 0) {
      distInput = 1 - this.lastDist / (width / cellSize);
    }
    inputs[9] = distInput;
    // this.printInputs(inputs);
    const results = this.brain.classifySync(inputs);
    // console.log(results);

    let index = 0;
    /*
    let index = this.checkLastMoves(results[0].label) ? 1 : 0;
    if (index == 1) {
      index = this.checkLastMoves(results[1].label) ? 2 : 1;
      if (index == 2) {
        index = this.checkLastMoves(results[2].label) ? 3 : 2;
        if (index == 3) {
          index = this.checkLastMoves(results[2].label)
            ? Math.round(Math.random() * 3)
            : 2;
        }
      }
    }*/

    if (results[index].label === "left") {
      this.moveX = -1;
      this.moveY = 0;
    } else if (results[index].label === "right") {
      this.moveX = 1;
      this.moveY = 0;
    } else if (results[index].label === "up") {
      this.moveX = 0;
      this.moveY = -1;
    } else if (results[index].label === "down") {
      this.moveX = 0;
      this.moveY = 1;
    }
    this.lastMoves.unshift(results[index].label);
    const MOVE_HISTORY = 4;
    if (this.lastMoves.length > MOVE_HISTORY) {
      this.lastMoves = this.lastMoves.slice(0, MOVE_HISTORY + 1);
    }
  }

  printInputs(inputs) {
    /*
    console.log(
      `food:{ left:${inputs[0]}, right: ${inputs[1]}, top: ${inputs[2]}, bottom: ${inputs[3]} }`
    );
    console.log(
      `wall:{ left:${inputs[4]}, right: ${inputs[5]}, top: ${inputs[6]}, bottom: ${inputs[7]} }`
    );
    */
    console.log("angle: " + inputs[8]);
  }

  checkLastMoves(newMove) {
    for (let i = 0; i < this.lastMoves.length; i++) {
      if (this.lastMoves[i] == newMove) {
        return true;
      }
    }
    return false;
  }

  checkTailAdjacent(pos) {
    if (this.tail.length == 1) {
      return false;
    }
    const head = this.tail[0];
    for (let i = 1; i < this.tail.length; i++) {
      let curr = this.tail[i];
      switch (pos) {
        case "left":
          if (curr.x == head.x - 1 && curr.y == head.y) {
            return true;
          }
          break;
        case "right":
          if (curr.x == head.x + 1 && curr.y == head.y) {
            return true;
          }
          break;
        case "top":
          if (curr.y == head.y - 1 && curr.x == head.x) {
            return true;
          }
          break;
        case "bottom":
          if (curr.y == head.y + 1 && curr.x == head.x) {
            return true;
          }
          break;
      }
    }
    return false;
  }

  checkHeadAndTailCollision() {
    if (this.tail.length == 1) {
      return false;
    }
    const head = this.tail[0];
    for (let i = 1; i < this.tail.length; i++) {
      let curr = this.tail[i];
      if (curr.x == head.x && curr.y == head.y) {
        return true;
      }
    }
    return false;
  }

  getAngle() {
    let head = this.tail[0];
    let vectToFood = createVector(this.food.x - head.x, this.food.y - head.y);
    let dir = createVector(this.moveX, this.moveY);
    // 1: in front, 0: behind
    return degrees(vectToFood.angleBetween(dir)) / 180;
  }

  spawnSingleFood() {
    return {
      x: floor(random(width) / cellSize),
      y: floor(random(width) / cellSize),
    };
  }
}
