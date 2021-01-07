const config = {
  ball: {
    radius: 5,
    dX: 3, // initial speed X
    dY: 3, // initial speed Y
  },
  paddle: {
    width: 50,
    height: 10,
    speed: 8,
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
document.getElementById('stage').style.width = `${canvas.width}px`;

export { canvas, config };
