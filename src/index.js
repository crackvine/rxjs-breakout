import {
  fromEvent,
  interval,
  animationFrameScheduler,
  merge,
  combineLatest,
} from 'rxjs';
import {
  scan,
  distinctUntilChanged,
  map,
  withLatestFrom,
  mapTo,
} from 'rxjs/operators';

const config = {
  tickerStep: 20, // ms
  controls: {
    37: -1, // left arrow key code 37
    39: 1, // right arrow key code 39
  },
  ball: {
    radius: 5,
    dX: 4, // initial speed X
    dY: 4, // initial speed Y
  },
  paddle: {
    width: 50,
    height: 10,
    speed: 10,
  },
  bricks: {
    rows: 5,
    columns: 8,
    width: 48,
    height: 5,
    gap: 2,
    topMargin: 40,
  },
};

// RENDER
// GAME AREA
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = config.bricks.columns * (config.bricks.width + config.bricks.gap) + config.bricks.gap;
canvas.height = canvas.width * 0.66;

// GAME ELEMENTS
const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const drawPaddle = (xPos) => {
  ctx.beginPath();
  ctx.rect(
    xPos - (config.paddle.width / 2),
    canvas.height - config.paddle.height,
    config.paddle.width,
    config.paddle.height,
  );
  ctx.fill();
  ctx.closePath();
};

const drawBall = (ball) => {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
};

const drawBrick = (brick) => {
  ctx.beginPath();
  ctx.rect(
    brick.x - brick.width / 2,
    brick.y - brick.height / 2,
    brick.width,
    brick.height,
  );
  ctx.fill();
  ctx.closePath();
};

const drawBricks = (bricks) => {
  bricks.forEach((brick) => drawBrick(brick));
};

// SETUP
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

// Starting values for game elements
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
    x: canvas.width / 2,
    y: canvas.height / 2,
    dX: config.ball.dX,
    dY: config.ball.dY,
  },
});

// MOVE BALL AND CHECK COLLISIONS
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
  if (floorHit(ballNext)) { // GAME OVER
    gameOver('loser.');
    ballNext.y = canvas.height - ballNext.radius;
    ballNext.dY = -ballNext.dY;
  }

  // Paddle collision
  if (paddleHit(ballNext, paddleX)) {
    ballNext.y = canvas.height - config.paddle.height - (ballNext.radius / 2);
    ballNext.dY = -ballNext.dY;
  }

  // Check brick collisions and remove impacted bricks
  const hitBrick = bricks.filter((brick) => brickHit(ballNext, brick));
  const remainingBricks = bricks.filter((brick) => !brickHit(ballNext, brick));
  if (hitBrick.length) {
    ballNext.y = ballNext.dY > 0
      ? hitBrick[0].y - (hitBrick[0].height / 2)
      : hitBrick[0].y + (hitBrick[0].height / 2);
    ballNext.dY = -ballNext.dY;
  }
  if (remainingBricks.length < 1) {
    gameOver('well done');
  }

  return {
    ball: ballNext,
    bricks: remainingBricks,
    ticker,
    paddleX,
  };
};

// TICKER
const ticker$ = interval(config.tickerStep, animationFrameScheduler);

// USER INPUT && PADDLE
const keyDown$ = fromEvent(document, 'keydown').pipe(map((event) => config.controls[event.keyCode] || 0));
const keyUp$ = fromEvent(document, 'keyup').pipe(mapTo(0));
const user$ = merge(keyDown$, keyUp$);

const paddleX$ = ticker$.pipe(
  withLatestFrom(user$),
  scan((xPosition, [_, direction]) => {
    const nextXPosition = xPosition + (config.paddle.speed * direction);
    return nextXPosition > canvas.width
      ? canvas.width
      : nextXPosition < 0
        ? 0
        : nextXPosition;
  }, (canvas.width / 2)), // Paddle starts in the middle
  distinctUntilChanged(),
);

const elements$ = ticker$.pipe(
  withLatestFrom(paddleX$),
  scan(({ bricks, ball }, [ticker, paddleX]) => step(bricks, ball, ticker, paddleX),
    newGameElements()),
);

// COLLISION DETECTION
const paddleHit = (ball, paddleX) => (
  ball.y + ball.radius > canvas.height - config.paddle.height
  && ball.x > paddleX - (config.paddle.width / 2)
  && ball.x < paddleX + (config.paddle.width / 2)
);

const leftBoundHit = (ball) => ball.x < ball.radius;
const rightBoundHit = (ball) => ball.x > canvas.width - ball.radius;
const ceilingHit = (ball) => ball.y < ball.radius;
const floorHit = (ball) => ball.y > (canvas.height - ball.radius);

const brickHit = (ball, brick) => (
  ball.x + ball.dX > brick.x - (brick.width / 2)
  && ball.x + ball.dX < brick.x + (brick.width / 2)
  && ball.y + ball.dY > brick.y - (brick.height / 2)
  && ball.y + ball.dY < brick.y + brick.height / 2
);

// UPDATE

const update = {
  next: ([paddleX, elements]) => {
    clearCanvas();
    drawPaddle(paddleX);
    drawBall(elements.ball);
    drawBricks(elements.bricks);
  },
};

const run = combineLatest([paddleX$, elements$]).subscribe(update);

const gameOver = (message) => {
  alert(message);
  run.unsubscribe();
};
