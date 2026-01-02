const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 50; // size of each tile
const MAP_ROWS = 12;
const MAP_COLS = 16;

// Define terrain types
const TERRAIN = {
  GRASS: 0,
  WATER: 1,
  TREE: 2
};

// Sample map layout (0=grass, 1=water, 2=tree)
const map = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,0,0,0,0,2,0,0,1,1,0,0,0,0],
  [0,0,0,0,2,0,0,0,0,0,0,0,0,1,1,0],
  [0,0,2,0,0,0,0,0,0,2,0,0,0,0,0,0],
  [0,0,0,0,1,1,0,0,0,0,0,2,0,0,0,0],
  [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0],
  [0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,0,0,0,0,2,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0],
  [0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

// Player object
const player = { x: 0, y: 0, width: TILE_SIZE, height: TILE_SIZE, speed: 5 };

// Key state
const keys = {};

// Load images
const images = {};
function loadImages() {
  images['player'] = new Image();
  images['player'].src = "assets/Friendly_gesture_of_a_stick_figure-removebg-preview.png";

  images['grass'] = new Image();
  images['grass'].src = "assets/grass.png";

  images['water'] = new Image();
  images['water'].src = "assets/water.png";

  images['tree'] = new Image();
  images['tree'].src = "assets/tree.png";
}

// Input events
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// Collision check with terrain
function canMove(newX, newY) {
  const col = Math.floor(newX / TILE_SIZE);
  const row = Math.floor(newY / TILE_SIZE);

  if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return false;
  const tile = map[row][col];
  return tile === TERRAIN.GRASS; // only walkable on grass
}

// Update player position
function update() {
  let newX = player.x;
  let newY = player.y;

  if (keys['ArrowUp']) newY -= player.speed;
  if (keys['ArrowDown']) newY += player.speed;
  if (keys['ArrowLeft']) newX -= player.speed;
  if (keys['ArrowRight']) newX += player.speed;

  // Check hitboxes before moving
  if (canMove(newX, player.y)) player.x = newX;
  if (canMove(player.x, newY)) player.y = newY;
}

// Draw map and player
function draw() {
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      const tile = map[row][col];
      let img;
      if (tile === TERRAIN.GRASS) img = images['grass'];
      if (tile === TERRAIN.WATER) img = images['water'];
      if (tile === TERRAIN.TREE) img = images['tree'];
      ctx.drawImage(img, col*TILE_SIZE, row*TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }

  ctx.drawImage(images['player'], player.x, player.y, player.width, player.height);
}

// Main loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start game
loadImages();
gameLoop();
