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
const FOOD_START_AMOUNT = 50;
const FOOD_SPAWN_RATE = 50; // spawn one food every X frames
let generation = 1;
let loaded = false;
let highscore = 0;

function preload() {}

function setup() {
  createCanvas(400, 400);
  // Improves performance for small neural networks and classifySync()
  ml5.tf.setBackend("cpu");
  // frameRate(6);
  spawnFood();

  let snake = new Snake();
  const modelDetails = {
    model: "model/model.json",
    metadata: "model/model_meta.json",
    weights: "model/model.weights.bin",
  };
  snake.brain.load(modelDetails).then((res) => {
    console.log('Model loaded');
    for (let i = 0; i < TOTAL; i++) {
      snakes.push(new Snake(snake.brain.copy()));
    }
    loaded = true;
  })
  .catch(error => console.error(error));
  
  // Slider for speeding up simulation
  slider = createSlider(1, 10, 1);
  slider.position(10, 420);
}

function draw() {
  if (loaded) {
    // Speed up simulation
    for (let n = 0; n < slider.value(); n += 1) {
      updateSnakes();
      // No survivors go to the next generation
      if (snakes.length === 0) {
        counter = 0;
        nextGeneration();
      }
      spawnSingleFood();

      // drawing
      background(220);
      drawGrid();
      drawFood();
      drawSnakes();
      fill(0, 0, 0);
      textSize(25);
      text("Gen: " + generation, 0, 20);
      text("Highscore: " + highscore, 200, 20);
      // console.log("Alive: " + snakes.length + ", Dead: " + savedSnakes.length);
    }
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
  } else if (key === "e") {
    snakes[0].brain.save();
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
    if (snake.offScreen() || snake.checkHeadAndTailCollision()) {
      // save snake and remove
      savedSnakes.push(snakes.splice(i, 1)[0]);
    } else {
      snake.think();
      snake.update();
    }
  }
}

function spawnFood() {
  foods = [];
  for (let i = 0; i < FOOD_START_AMOUNT; i++) {
    foods.push({
      x: floor(random(width) / cellSize),
      y: floor(random(width) / cellSize),
    });
  }
}

function spawnSingleFood() {
  if (frameCount % FOOD_SPAWN_RATE == 0) {
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
  console.log("Model is ready!!");
}
