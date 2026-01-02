const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 50; // size of each tile
const MAP_ROWS = 12;
const MAP_COLS = 16;

// Define terrain types
const TERRAIN = {
    GRASS: 0,
    WATER: 1,
    TREE: 2,
    SAND: 3, // Added SAND terrain
    MOUNTAIN: 4 // Added MOUNTAIN terrain
};

// Sample map layout (0=grass, 1=water, 2=tree, 3=sand, 4=mountain)
const map = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 2, 0, 0, 1, 1, 0, 0, 3, 3],
    [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3],
    [0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 3],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 2, 0, 4, 4, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 4, 4, 0, 0],
    [0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 4, 4, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

// Player object
const player = { x: 0, y: 0, width: TILE_SIZE, height: TILE_SIZE, speed: 5, animationFrame: 0, animationSpeed: 10 };  // Added animation properties

// Key state
const keys = {};

// Load images
const images = {};
let imagesLoaded = false; // Flag to check if all images are loaded

function loadImages() {
    const imageSources = {
        'player': "assets/Friendly_gesture_of_a_stick_figure-removebg-preview.png",
        'grass': "assets/grass.png",
        'water': "assets/water.png",
        'tree': "assets/tree.png",
        'sand': "assets/sand.png", // Added sand image
        'mountain': "assets/mountain.png", // Added mountain image
        'player_walk1': "assets/player_walk1.png",  // Animation frames
        'player_walk2': "assets/player_walk2.png"
    };

    let loadedImages = 0;
    const totalImages = Object.keys(imageSources).length;

    for (const key in imageSources) {
        images[key] = new Image();
        images[key].src = imageSources[key];
        images[key].onload = () => {
            loadedImages++;
            if (loadedImages === totalImages) {
                imagesLoaded = true;
                console.log("All images loaded!");
            }
        };
        images[key].onerror = () => {
            console.error("Error loading image: " + imageSources[key]);
        };
    }
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
    return tile === TERRAIN.GRASS || tile === TERRAIN.SAND; // walkable on grass and sand
}

// Update player position
function update() {
    if (!imagesLoaded) return; // Don't update if images aren't loaded yet

    let newX = player.x;
    let newY = player.y;
    let moving = false;

    if (keys['ArrowUp']) { newY -= player.speed; moving = true; }
    if (keys['ArrowDown']) { newY += player.speed; moving = true; }
    if (keys['ArrowLeft']) { newX -= player.speed; moving = true; }
    if (keys['ArrowRight']) { newX += player.speed; moving = true; }

    // Check hitboxes before moving
    if (canMove(newX, player.y)) player.x = newX;
    if (canMove(player.x, newY)) player.y = newY;

    // Update animation frame
    if (moving) {
        player.animationFrame++;
        if (player.animationFrame >= 2 * player.animationSpeed) {
            player.animationFrame = 0;
        }
    }
}

// Draw map and player
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas each frame

    for (let row = 0; row < MAP_ROWS; row++) {
        for (let col = 0; col < MAP_COLS; col++) {
            const tile = map[row][col];
            let img = null;

            switch (tile) {
                case TERRAIN.GRASS: img = images['grass']; break;
                case TERRAIN.WATER: img = images['water']; break;
                case TERRAIN.TREE: img = images['tree']; break;
                case TERRAIN.SAND: img = images['sand']; break;
                case TERRAIN.MOUNTAIN: img = images['mountain']; break;
            }

            if (img) {
                ctx.drawImage(img, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // Draw Player with Animation
    const animationIndex = Math.floor(player.animationFrame / player.animationSpeed);
    const playerImage = (animationIndex === 0) ? images['player_walk1'] : images['player_walk2'];  // Alternate between animation frames

    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

// Main loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
loadImages();
// Wait for images to load before starting the game loop (moved inside loadImages success callback)
let startCheckImagesLoaded = setInterval(() => {
    if (imagesLoaded) {
        clearInterval(startCheckImagesLoaded);
        gameLoop();
    }
}, 100);
