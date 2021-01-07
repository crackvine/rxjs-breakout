import { canvas, config } from './setup';

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

export {
  paddleHit,
  leftBoundHit,
  rightBoundHit,
  ceilingHit,
  floorHit,
  brickHit,
};
