import {
  fromEvent,
  interval,
  animationFrameScheduler,
  merge,
} from 'rxjs';
import {
  scan,
  distinctUntilChanged,
  map,
  withLatestFrom,
  mapTo,
} from 'rxjs/operators';

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

// Generate initial game elements
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
});

// The step function moves the ball and checks collisions
const step = (bricks, ball, ticker, paddleX) => {
  // Move ball
  const ballNext = {
    ...ball,
    x: ball.x + ball.dX,
    y: ball.y + ball.dY,
  };

  // Bounds collisions
  if (leftBoundHit(ballNext)) {
    ballNext.x = ballNext.radius;
    ballNext.dX = -ballNext.dX;
  }
  if (rightBoundHit(ballNext)) {
    ballNext.x = canvas.width - ballNext.radius;
    ballNext.dX = -ballNext.dX;
  }
  if (ceilingHit(ballNext)) {
    ballNext.y = ballNext.radius;
    ballNext.dY = -ballNext.dY;
  }
  if (floorHit(ballNext)) { // Game over
    gameOver('loser.');
    ballNext.y = canvas.height - ballNext.radius;
    ballNext.dY = -ballNext.dY;
  }

  // Paddle collision
  if (paddleHit(ballNext, paddleX)) {
    ballNext.y = canvas.height - config.paddle.height - (ballNext.radius / 2);
    ballNext.dY = -ballNext.dY;
  }

  // Brick collisions and removal of impacted bricks
  const hitBrick = bricks.filter((brick) => brickHit(ballNext, brick));
  const remainingBricks = bricks.filter((brick) => !brickHit(ballNext, brick));
  if (hitBrick.length) {
    ballNext.y = ballNext.dY > 0
      ? hitBrick[0].y - (hitBrick[0].height / 2)
      : hitBrick[0].y + (hitBrick[0].height / 2);
    ballNext.dY = -ballNext.dY;
  }

  if (remainingBricks.length < 1) { // Game won
    gameOver('well done');
  }

  return {
    ball: ballNext,
    bricks: remainingBricks,
    ticker,
    paddleX,
  };
};

/* RxJS Stuff */

// Ticker stream
const ticker$ = interval(config.tickerStep, animationFrameScheduler);

// User input and paddle streams
const keyDown$ = fromEvent(document, 'keydown').pipe(map((event) => config.controls[event.keyCode] || 0));
const keyUp$ = fromEvent(document, 'keyup').pipe(mapTo(0));
const user$ = merge(keyDown$, keyUp$);

const paddleX$ = ticker$.pipe(
  withLatestFrom(user$),
  scan((xPosition, [ticker, direction]) => {
    const nextXPosition = xPosition + (config.paddle.speed * direction);
    return nextXPosition > canvas.width
      ? canvas.width
      : nextXPosition < 0
        ? 0
        : nextXPosition;
  }, (canvas.width / 2)), // Paddle starts in the middle
  distinctUntilChanged(),
);

// Stream with all game elements
const elements$ = ticker$.pipe(
  withLatestFrom(paddleX$),
  scan(({ bricks, ball }, [ticker, paddleX]) => step(bricks, ball, ticker, paddleX),
    newGameElements()),
);

// Observer
const update = {
  next: (elements) => {
    clearCanvas();
    renderPaddle(elements.paddleX);
    renderBall(elements.ball);
    renderBricks(elements.bricks);
  },
};

const run = elements$.subscribe(update);

const gameOver = (message) => {
  alert(message);
  run.unsubscribe();
};
