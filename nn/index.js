console.log("ml5 version:", ml5.version);

let cellSize = 16;
let snake;
let loaded = false;
let trainingdata = [];
let isTraining = true;

function preload() {}

function setup() {
  createCanvas(400, 400);
  // Improves performance for small neural networks and classifySync()
  ml5.tf.setBackend("cpu");
  frameRate(8);

  snake = new Snake();
  const modelDetails = {
    model: "model/model.json",
    metadata: "model/model_meta.json",
    weights: "model/model.weights.bin",
  };
  if(!isTraining) {
    snake.brain.load(modelDetails).then((res) => {
      console.log("Model loaded");
      loaded = true;
    });
  } else {
    loaded = true;
  }
  
  // .catch(error => console.error(error));

  // frameRate(10);
}

function draw() {
  if (loaded) {
    updateSnake();
    let inputs = snake.createInputs();
    let outputs = snake.createOutputs();
    console.log("inputs: " + JSON.stringify(inputs));
    console.log("outputs: " + JSON.stringify(outputs));
    trainingdata.push({
      inputs,
      outputs,
    });

    // drawing
    background(220);
    drawGrid();
    drawSnake();
    fill(0, 0, 0);
    textSize(25);
    text("Highscore: " + snake.score, 200, 20);
    // console.log("Alive: " + snakes.length + ", Dead: " + savedSnakes.length);
  } else {
    text("Loading model", 0, 20);
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    snake.moveX = -1;
    snake.moveY = 0;
  } else if (keyCode === RIGHT_ARROW) {
    snake.moveX = 1;
    snake.moveY = 0;
  } else if (keyCode === UP_ARROW) {
    snake.moveY = -1;
    snake.moveX = 0;
  } else if (keyCode === DOWN_ARROW) {
    snake.moveY = 1;
    snake.moveX = 0;
  } else if (key === "e") {
    snake.brain.save();
  } else if (key === "t") {
    // train with data
    // Step 4: add data to the neural network
    console.log("training...");
    trainData();
  }
}

function trainData() {
  trainingdata.forEach((item) => {
    snake.brain.addData(item.inputs, item.outputs);
  });
  const trainingOptions = {
    epochs: 64
  }
  snake.brain.train(trainingOptions, trainingDone);
}

function trainingDone() {
  console.log("training DONE");
  isTraining = false;
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

function drawSnake() {
  snake.show();
}

function updateSnake() {
  if (snake.offScreen() || snake.checkHeadAndTailCollision()) {
    // save snake and
    // game over
    console.log("game over");
    snake.reset();
  } else {
    if (!isTraining) {
      snake.think();
    }
    snake.update();
  }
}

function modelReady() {
  console.log("Model is ready!!");
}
