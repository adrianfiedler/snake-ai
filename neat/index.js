console.log("ml5 version:", ml5.version);

let cellSize = 16;
let snakes = [];
let savedSnakes = [];
const TOTAL = 150;
let generation = 1;
let loaded = false;
let highscore = 0;
let count = 0;
const MAX_ROUND_FRAMES = 90;

function preload() {}

function setup() {
  createCanvas(400, 400);
  // Improves performance for small neural networks and classifySync()
  ml5.tf.setBackend("cpu");
  // frameRate(10);

  let snake = new Snake();
  const modelDetails = {
    model: "model/model.json",
    metadata: "model/model_meta.json",
    weights: "model/model.weights.bin",
  };
  //snake.brain.load(modelDetails).then((res) => {
  console.log("Model loaded");
  for (let i = 0; i < TOTAL; i++) {
    snakes.push(new Snake()); //snake.brain.copy()));
  }
  loaded = true;
  //})
  // .catch(error => console.error(error));

  // frameRate(10);
  // Slider for speeding up simulation
  slider = createSlider(1, MAX_ROUND_FRAMES, 1);
  slider.position(10, 420);
}

function draw() {
  if (loaded) {
    // Speed up simulation
    for (let n = 0; n < slider.value(); n += 1) {
      count++;
      // Time exceeded
      if (count >= MAX_ROUND_FRAMES) {
        console.log("Time is up");
        count = 0;
        saveRemainingSnakes();
      }
      updateSnakes();
      // No survivors go to the next generation
      if (snakes.length === 0) {
        nextGeneration();
      }

      // drawing
      background(220);
      drawGrid();
      drawSnakes();
      fill(0, 0, 0);
      textSize(25);
      text("Gen: " + generation, 0, 20);
      text("Highscore: " + highscore, 200, 20);
      text("Frame: " + count, 0, 40);
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

function saveRemainingSnakes() {
  for (let i = 0; i < snakes.length; i++) {
    // save snake and remove
    savedSnakes.push(snakes[i]);
    snakes = [];
  }
}

function reset() {
  console.log("Died!");
  snakeSize = 1;
  tail = [];
  tail.push({
    x: floor(width / cellSize / 2),
    y: floor(width / cellSize / 2),
  });
}

function modelReady() {
  console.log("Model is ready!!");
}
