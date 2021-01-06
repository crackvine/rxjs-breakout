import { canvas, config } from './setup';

const ctx = canvas.getContext('2d');

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const renderPaddle = (xPos) => {
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

const renderBall = (ball) => {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
};

const renderBrick = (brick) => {
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

const renderBricks = (bricks) => {
  bricks.forEach((brick) => renderBrick(brick));
};

export {
  clearCanvas,
  renderPaddle,
  renderBall,
  renderBricks,
};
