// Daniel Shiffman
// Neuro-Evolution with ml5.js

// Genetic Algorithm Functions
// TODO: create a ml5.population() class to manage this?

// Create the next generation
function nextGeneration() {
  console.log("next generation");
  // Calculate fitness values
  calculateFitness();

  // Create new population of snakes
  for (let i = 0; i < TOTAL; i += 1) {
    snakes[i] = reproduce();
  }

  // Release all the memory
  for (let i = 0; i < TOTAL; i += 1) {
    savedSnakes[i].brain.dispose();
  }
  // Clear the array
  savedSnakes = [];
  spawnFood();
  generation++;
}

// Create a child snake from two parents
function reproduce() {
  const brainA = pickOne();
  const brainB = pickOne();
  const childBrain = brainA.crossover(brainB);
  childBrain.mutate(0.1);
  return new Snake(childBrain);
}

// Pick one parent probability according to normalized fitness
function pickOne() {
  let index = 0;
  let r = random(1);
  while (r > 0) {
    r -= savedSnakes[index].fitness;
    index += 1;
  }
  index -= 1;
  const snake = savedSnakes[index];
  return snake.brain;
}

// Normalize all fitness values
function calculateFitness() {
  let sum = 0;
  for (const snake of savedSnakes) {
    sum += snake.score;
  }
  for (const snake of savedSnakes) {
    snake.fitness = snake.score / sum;
  }
}