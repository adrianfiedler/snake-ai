// Step 1: set your neural network options
const options = {
  task: 'regression',
  inputs:[
  'food_left', 'food_right', 'food_top', 'food_bottom', 
  'wall_left', 'wall_right', 'wall_top', 'wall_bottom',
  'move_left', 'move_right', 'move_top', 'move_bottom'
  ],
  outputs:['left', 'right', 'up', 'down'],
  debug: true
}

// Step 2: initialize your neural network
const nn = ml5.neuralNetwork(options);