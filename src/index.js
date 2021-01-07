import {
  canvas,
  config,
} from './setup';
import {
  clearCanvas,
  renderPaddle,
  renderBall,
  renderBricks,
} from './render';
import {
  paddleHit,
  leftBoundHit,
  rightBoundHit,
  ceilingHit,
  floorHit,
  brickHit,
} from './collisions';

// Generation of initial game elements
const newBrickWall = (rows, columns, width, height, gap) => {
  const bricks = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      bricks.push({
        x: (j * (width + gap)) + gap + (width / 2),
        y: (i * (height + gap)) + gap + (height / 2) + config.bricks.topMargin,
        width,
        height,
      });
    }
  }
  return bricks;
};

const newGameElements = () => ({
  bricks: newBrickWall(
    config.bricks.rows,
    config.bricks.columns,
    config.bricks.width,
    config.bricks.height,
    config.bricks.gap,
  ),
  ball: {
    radius: config.ball.radius,
    dX: config.ball.dX,
    dY: config.ball.dY,
    x: canvas.width / 2,
    y: canvas.height / 2,
  },
  paddle: {
    width: config.paddle.width,
    height: config.paddle.height,
    x: (canvas.width / 2),
  },
});

// Redraw utility function
const updateCanvas = (elements) => {
  clearCanvas();
  renderPaddle(elements.paddle.x);
  renderBall(elements.ball);
  renderBricks(elements.bricks);
};

// Global state
const gameElements = newGameElements();
let gameOver = false;
let leftKeyPressed = false;
let rightKeyPressed = false;

// Key controls events
document.onkeydown = (e) => {
  if (e.keyCode === 37) {
    leftKeyPressed = true;
  } else if (e.keyCode === 39) {
    rightKeyPressed = true;
  }
};
document.onkeyup = (e) => {
  if (e.keyCode === 37) {
    leftKeyPressed = false;
  } else if (e.keyCode === 39) {
    rightKeyPressed = false;
  }
};

const run = () => {
  // Move elements and check collisions on every frame

  // Move Paddle
  if (leftKeyPressed) {
    gameElements.paddle.x -= config.paddle.speed;
  } else if (rightKeyPressed) {
    gameElements.paddle.x += config.paddle.speed;
  }

  // Move ball
  gameElements.ball.x += gameElements.ball.dX;
  gameElements.ball.y += gameElements.ball.dY;

  // Bounds collisions
  if (leftBoundHit(gameElements.ball)) {
    gameElements.ball.x = gameElements.ball.radius;
    gameElements.ball.dX = -gameElements.ball.dX;
  }
  if (rightBoundHit(gameElements.ball)) {
    gameElements.ball.x = canvas.width - gameElements.ball.radius;
    gameElements.ball.dX = -gameElements.ball.dX;
  }
  if (ceilingHit(gameElements.ball)) {
    gameElements.ball.y = gameElements.ball.radius;
    gameElements.ball.dY = -gameElements.ball.dY;
  }
  if (floorHit(gameElements.ball)) { // Game over
    alert('loser.');
    gameOver = true;
  }

  // Paddle collision
  if (paddleHit(gameElements.ball, gameElements.paddle.x)) {
    gameElements.ball.y = canvas.height - config.paddle.height - (gameElements.ball.radius / 2);
    gameElements.ball.dY = -gameElements.ball.dY;
  }

  // Brick collisions and removal of impacted bricks
  const hitBrick = gameElements.bricks.filter((brick) => brickHit(gameElements.ball, brick));
  const remainingBricks = gameElements.bricks.filter((brick) => !brickHit(gameElements.ball, brick));
  if (hitBrick.length) {
    gameElements.ball.y = gameElements.ball.dY > 0
      ? hitBrick[0].y - (hitBrick[0].height / 2)
      : hitBrick[0].y + (hitBrick[0].height / 2);
    gameElements.ball.dY = -gameElements.ball.dY;
  }
  gameElements.bricks = remainingBricks;

  if (remainingBricks.length < 1) { // Game won
    alert('well done');
    gameOver = true;
  }

  updateCanvas(gameElements);

  if (gameOver === false) {
    requestAnimationFrame(run);
  }
};

run();
