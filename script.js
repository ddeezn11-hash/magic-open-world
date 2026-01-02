const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 50;
const MAP_ROWS = 12;
const MAP_COLS = 16;

const TERRAIN = {
    GRASS: 0,
    WATER: 1,
    TREE: 2,
    SAND: 3,
    MOUNTAIN: 4
};

let map = [
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

let player = { x: 0, y: 0, width: TILE_SIZE, height: TILE_SIZE, speed: 5 };

const keys = {};
const images = {};
let imagesLoaded = false;

function loadImages() {
    const imageSources = {
        'player': "assets/Friendly_gesture_of_a_stick_figure-removebg-preview.png",
        'grass': "assets/grass.png",
        'water': "assets/water.png",
        'tree': "assets/tree.png",
        'sand': "assets/sand.png",
        'mountain': "assets/mountain.png"
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
                initializeEditor();
                console.log("All images loaded!");
            }
        };
        images[key].onerror = () => {
            console.error("Error loading image: " + imageSources[key]);
        };
    }
}

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

function canMove(newX, newY) {
    const col = Math.floor(newX / TILE_SIZE);
    const row = Math.floor(newY / TILE_SIZE);

    if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return false;
    const tile = map[row][col];
    return tile === TERRAIN.GRASS || tile === TERRAIN.SAND;
}

function update() {
    if (!imagesLoaded) return;

    let newX = player.x;
    let newY = player.y;

    if (keys['ArrowUp']) newY -= player.speed;
    if (keys['ArrowDown']) newY += player.speed;
    if (keys['ArrowLeft']) newX -= player.speed;
    if (keys['ArrowRight']) newX += player.speed;

    if (canMove(newX, player.y)) player.x = newX;
    if (canMove(player.x, newY)) player.y = newY;

    if (document.activeElement.id !== 'playerX' && document.activeElement.id !== 'playerY' && document.activeElement.id !== 'playerSpeed') {
        document.getElementById('playerX').value = player.x;
        document.getElementById('playerY').value = player.y;
        document.getElementById('playerSpeed').value = player.speed;
    } else {
        console.log("Skipping editor update because an input field has focus.");
    }

    console.log("Player x:", player.x, "Player y:", player.y, "Player speed:", player.speed);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    ctx.drawImage(images['player'], player.x, player.y, player.width, player.height);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function initializeEditor() {
    // Player Editor
    document.getElementById('playerX').value = player.x;
    document.getElementById('playerY').value = player.y;
    document.getElementById('playerSpeed').value = player.speed;

    document.getElementById('playerX').addEventListener('change', () => {
        player.x = parseInt(document.getElementById('playerX').value);
    });
    document.getElementById('playerY').addEventListener('change', () => {
        player.y = parseInt(document.getElementById('playerY').value);
    });
    document.getElementById('playerSpeed').addEventListener('change', () => {
        player.speed = parseInt(document.getElementById('playerSpeed').value);
    });

    // Save/Load Buttons
    const saveButton = document.getElementById('saveButton');
    const loadButton = document.getElementById('loadButton');

    saveButton.addEventListener('click', saveMap);
    loadButton.addEventListener('click', loadMap);

    // Map Editor - Create Terrain Buttons
    const terrainButtonsDiv = document.getElementById('terrainButtons');
    for (const terrainName in TERRAIN) {
        const terrainValue = TERRAIN[terrainName];
        const button = document.createElement('button');
        button.textContent = terrainValue;
        button.classList.add('terrain-' + terrainValue);
        button.addEventListener('click', () => setSelectedTerrain(terrainValue));
        terrainButtonsDiv.appendChild(button);
    }

    canvas.addEventListener('click', handleCanvasClick);
}

let selectedTerrain = 0;

function setSelectedTerrain(terrain) {
    selectedTerrain = terrain;
    console.log("Selected terrain: " + selectedTerrain);
}

function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);

    if (row >= 0 && row < MAP_ROWS && col >= 0 && col < MAP_COLS) {
        map[row][col] = selectedTerrain;
        console.log(`Changed tile at row ${row}, col ${col} to terrain ${selectedTerrain}`);
    }
}

function saveMap() {
    localStorage.setItem('mapData', JSON.stringify(map));
    console.log("Map saved to localStorage!");
}

function loadMap() {
    const savedMapData = localStorage.getItem('mapData');
    if (savedMapData) {
        map = JSON.parse(savedMapData);
        console.log("Map loaded from localStorage!");
    } else {
        console.log("No map data found in localStorage.");
    }
}

loadImages();

let startCheckImagesLoaded = setInterval(() => {
    if (imagesLoaded) {
        clearInterval(startCheckImagesLoaded);
        loadMap();  // Load the map *after* images are loaded
        gameLoop();
    }
}, 100);
