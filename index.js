console.log("ml5 version:", ml5.version);

let moveX = 1;
let moveY = 0;
let cellSize = 16;
let food;
let snakes = [];
let savedSnakes = [];
let counter = 0;
let foods = [];
const TOTAL = 50;
let generation = 1;
let loaded = false;

function preload() {

}

function setup() {
  createCanvas(400, 400);
  // Improves performance for small neural networks and classifySync()
  ml5.tf.setBackend("cpu");
  // frameRate(6);
  spawnFood();

  let snake = new Snake();
  // snake.brain.load('snakeModel.json').then(res => {
    for (let i = 0; i < TOTAL; i++) {
      snakes.push(new Snake());
    }
    loaded = true;
 // });
}

function draw() {
  if(loaded) {
    updateSnakes();
    // No survivors go to the next generation
    if (snakes.length === 0) {
      counter = 0;
      nextGeneration();
    }
  
    // drawing
    background(220);
    drawGrid();
    drawFood();
    drawSnakes();
    fill(0, 0, 0);
    textSize(25);
    text("Gen: " + generation, 0, 20);
    console.log("Alive: " + snakes.length + ", Dead: " + savedSnakes.length);
  } else {
    text("Loading model", 0, 20);
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    snakes[0].moveX = -1;
    snakes[0].moveY = 0;
  } else if (keyCode === RIGHT_ARROW) {
    snakes[0].moveX = 1;
    snakes[0].moveY = 0;
  } else if (keyCode === UP_ARROW) {
    snakes[0].moveY = -1;
    snakes[0].moveX = 0;
  } else if (keyCode === DOWN_ARROW) {
    snakes[0].moveY = 1;
    snakes[0].moveX = 0;
  } else if (key === 'e') {
    snakes[0].brain.save('snakeModel');
  }
}

function drawGrid() {
  for (var x = 0; x < width; x += cellSize) {
    for (var y = 0; y < height; y += cellSize) {
      stroke(0);
      strokeWeight(0.02);
      line(x, 0, x, height);
      line(0, y, width, y);
    }
  }
}

function drawSnakes() {
  snakes.forEach((snake) => {
    snake.show();
  });
}

function drawFood() {
  fill(0, 255, 0);
  foods.forEach((food) => {
    rect(food.x * cellSize, food.y * cellSize, cellSize, cellSize);
  });
}

function updateSnakes() {
  for (let i = 0; i < snakes.length; i++) {
    let snake = snakes[i];
    if (snake.offScreen() /*|| snake.hitsItself()*/) {
      // save snake and remove
      savedSnakes.push(snakes.splice(i, 1)[0]);
    } else {
      snake.think();
      snake.update();
    }
  }
}

function spawnFood() {
  for (let i = 0; i < TOTAL; i++) {
    foods.push({
      x: floor(random(width) / cellSize),
      y: floor(random(width) / cellSize),
    });
  }
}

function reset() {
  console.log("Died!");
  snakeSize = 1;
  spawnFood();
  tail = [];
  tail.push({
    x: floor(width / cellSize / 2),
    y: floor(width / cellSize / 2),
  });
}

function modelReady() {
  console.log('Model is ready!!');
}
