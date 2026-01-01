const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player and enemy setup
const player = { x: 50, y: 50, size: 50, speed: 5 };
const enemy = { x: 400, y: 300, size: 50, speed: 2, color: 'blue' };
let score = 0;

// Track key presses
const keys = {};

// Load player image
const playerImage = new Image();
playerImage.src = "assets/Friendly_gesture_of_a_stick_figure-removebg-preview.png";

// Keyboard input
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// Collision detection
function isColliding(a, b) {
  return a.x < b.x + b.size &&
         a.x + a.size > b.x &&
         a.y < b.y + b.size &&
         a.y + a.size > b.y;
}

// Update game state
function update() {
  // Player movement
  if (keys['ArrowUp']) player.y -= player.speed;
  if (keys['ArrowDown']) player.y += player.speed;
  if (keys['ArrowLeft']) player.x -= player.speed;
  if (keys['ArrowRight']) player.x += player.speed;

  // Keep player in bounds
  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

  // Enemy moves randomly
  enemy.x += (Math.random() - 0.5) * enemy.speed * 2;
  enemy.y += (Math.random() - 0.5) * enemy.speed * 2;
  enemy.x = Math.max(0, Math.min(canvas.width - enemy.size, enemy.x));
  enemy.y = Math.max(0, Math.min(canvas.height - enemy.size, enemy.y));

  // Check collision
  if (isColliding(player, enemy)) {
    alert(`Game Over! Your score: ${score}`);
    score = 0;
    player.x = 50;
    player.y = 50;
  }

  // Update score
  score++;
  document.getElementById('score').textContent = score;
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player (stick figure)
  ctx.drawImage(playerImage, player.x, player.y, player.size, player.size);

  // Draw enemy cube
  ctx.fillStyle = enemy.color;
  ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
}

// Main game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
