// Your code will go here
// open up your console - if everything loaded properly you should see the latest ml5 version
console.log("ml5 version:", ml5.version);

let moveX = 1;
let moveY = 0;
let cellSize = 16;
let tail = [];
let snakeSize = 1;
let food;

function setup() {
  createCanvas(400, 400);
  tail.push({
    x: floor(width / cellSize / 2),
    y: floor(width / cellSize / 2)
  });
  frameRate(8);
  spawnFood();
}

function draw() {
  background(220);
  makeGuess();
  drawGrid();
  updateSnake();
  drawFood();
  drawSnake();
  fill(0,0,0);
  textSize(25);
  text('Score: ' + snakeSize, 0, 20);
  
}

function makeGuess() {
  
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    moveX = -1;
    moveY = 0;
  } else if (keyCode === RIGHT_ARROW) {
    moveX = 1;
    moveY = 0;
  } else if (keyCode === UP_ARROW) {
    moveY = -1;
    moveX = 0;
  } else if(keyCode === DOWN_ARROW) {
    moveY = 1;
    moveX = 0;
  }
}

function drawGrid() {
  for (var x = 0; x < width; x += cellSize) {
    for (var y = 0; y < height; y += cellSize) {
      stroke(0);
      strokeWeight(.02);
      line(x, 0, x, height);
      line(0, y, width, y);
    }
  }
}

function drawSnake() {
  fill(255, 255, 255);
  for(let i = 0; i < tail.length; i++) {
    rect(tail[i].x * cellSize, tail[i].y * cellSize, cellSize, cellSize);
  }
}

function drawFood() {
  fill(0, 255, 0);
  rect(food.x * cellSize, food.y * cellSize, cellSize, cellSize);
}

function updateSnake() {
  if(tail[0].x < 0 || tail[0].x >= (width / cellSize) || tail[0].y < 0 || tail[0].y >= (width / cellSize)) {
    reset();
  }
  if(tail[0].x == food.x && tail[0].y == food.y) {
    snakeSize++;
    spawnFood();
  }
  tail.unshift({
    x: tail[0].x += moveX,
    y: tail[0].y += moveY
  });
  tail = tail.slice(0, snakeSize + 1);
}

function spawnFood() {
  food = {
    x: floor(random(width) / cellSize),
    y: floor(random(width) / cellSize)
  }
}

function reset() {
  console.log('Died!');
  snakeSize = 1;
  spawnFood();
  tail = [];
  tail.push({
    x: floor(width / cellSize / 2),
    y: floor(width / cellSize / 2)
  });
}