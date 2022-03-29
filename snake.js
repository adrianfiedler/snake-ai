class Snake {
  constructor(brain) {
    this.size = 1;
    this.tail = [];
    this.tail.push({
      x: floor(width / cellSize / 2),
      y: floor(width / cellSize / 2),
    });
    this.score = 0;
    this.fitness = 0;
    this.moveX = 1;
    this.moveY = 0;
    this.lastMoves = ["right"];
    this.color = {
      r: Math.random() * 255,
      g: Math.random() * 255,
      b: Math.random() * 255,
    };

    if (brain) {
      this.brain = brain;
    } else {
      const options = {
        inputs: 9,
        /*[
          "food_left",
          "food_right",
          "food_top",
          "food_bottom",
          "wall_left",
          "wall_right",
          "wall_top",
          "wall_bottom",
          "closest_food_angle"
        ],*/
        outputs: ["left", "right", "up", "down"],
        debug: true,
        task: "classification",
        noTraining: true,
        layers:[
          {
            type: 'dense',
            units: 64,
            activation: 'relu',
          },
          {
            type: 'dense',
            activation: 'softmax',
          },
        ]
      };
      this.brain = ml5.neuralNetwork(options);
    }
  }

  show() {
    fill(this.color.r, this.color.g, this.color.b);
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
    // console.log(this.tail[0].x, this.tail[0].y);
    this.score++;
    for (let i = 0; i < foods.length; i++) {
      let food = foods[i];
      if (this.tail[0].x == food.x && this.tail[0].y == food.y) {
        this.size++;
        foods.splice(i, 1);
        spawnSingleFood();
        this.score += 500;
      }
    }
    this.tail.unshift({
      x: this.tail[0].x + this.moveX,
      y: this.tail[0].y + this.moveY,
    });
    this.tail = this.tail.slice(0, this.size);
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

  mutate() {
    // 10% mutation rate
    this.brain.mutate(0.1);
  }

  think() {
    const inputs = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let head = this.tail[0];
    foods.forEach((food) => {
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
    });
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
    let closestFood = this.getClosestFood();
    // Angle between closest food and head
    let headV = createVector(head.x, head.y);
    let foodV = createVector(closestFood.x, closestFood.y);
    inputs[8] = this.getAngle(headV, foodV);
    // console.log(angleBetween);
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
    console.log(`food:{ left:${inputs[0]}, right: ${inputs[1]}, top: ${inputs[2]}, bottom: ${inputs[3]} }`);
    console.log(
      `wall:{ left:${inputs[4]}, right: ${inputs[5]}, top: ${inputs[6]}, bottom: ${inputs[7]} }`
    );
    console.log('angle: ' + inputs[8]);
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

  getClosestFood() {
    let minDist = Infinity;
    let closest;
    for (let i = 0; i < foods.length; i++) {
      let food = foods[i];
      let currDist = dist(this.tail[0].x, this.tail[0].y, food.x, food.y);
      if (currDist < minDist) {
        minDist = currDist;
        closest = food;
      }
    }
    return closest;
  }

  getAngle(p1, p2) {
    // angle in degrees
    let angleDegrees =Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    return angleDegrees / 180;
  }
}
