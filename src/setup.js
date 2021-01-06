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

// Game area
const canvas = document.querySelector('canvas');
canvas.width = config.bricks.columns * (config.bricks.width + config.bricks.gap) + config.bricks.gap;
canvas.height = canvas.width * 0.66;

export { canvas, config };
