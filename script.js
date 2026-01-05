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
let players = {}; // Other players
let socket = null;
let playerId = null;
let isConnected = false;

const keys = {};
const images = {};
let imagesLoaded = false;

// Initialize Socket.io connection
function initializeSocket() {
    socket = io();

    socket.on('connect', () => {
        console.log('Connected to server');
        isConnected = true;
        updateConnectionStatus(true);
        playerId = socket.id;
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        isConnected = false;
        updateConnectionStatus(false);
        players = {};
    });

    // Receive initial game state
    socket.on('game-state', (state) => {
        map = state.map;
        console.log('Received game state');
    });

    // Receive list of all connected players
    socket.on('players-list', (playersList) => {
        players = playersList;
        delete players[playerId]; // Remove self from list
        updatePlayersList();
        console.log('Received players list:', Object.keys(players).length, 'other players');
    });

    // Handle new player joining
    socket.on('player-joined', (newPlayer) => {
        if (newPlayer.id !== playerId) {
            players[newPlayer.id] = newPlayer;
            updatePlayersList();
            console.log('New player joined:', newPlayer.id);
        }
    });

    // Handle player movement
    socket.on('player-moved', (data) => {
        if (players[data.id]) {
            players[data.id].x = data.x;
            players[data.id].y = data.y;
        }
    });

    // Handle player updates
    socket.on('player-updated', (data) => {
        if (players[data.id]) {
            Object.assign(players[data.id], data);
        }
    });

    // Handle player disconnect
    socket.on('player-left', (playerId) => {
        delete players[playerId];
        updatePlayersList();
        console.log('Player left:', playerId);
    });

    // Handle map changes
    socket.on('map-changed', (data) => {
        const { row, col, terrain } = data;
        map[row][col] = terrain;
    });
}

function updateConnectionStatus(connected) {
    const statusElement = document.getElementById('statusText');
    const statusContainer = document.getElementById('connectionStatus');
    if (connected) {
        statusElement.textContent = 'Connected';
        statusContainer.classList.remove('disconnected');
    } else {
        statusElement.textContent = 'Disconnected';
        statusContainer.classList.add('disconnected');
    }
    updatePlayerCount();
}

function updatePlayerCount() {
    const count = Object.keys(players).length + 1; // +1 for self
    document.getElementById('playerCount').textContent = `Players: ${count}`;
}

function updatePlayersList() {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';

    // Add self
    const selfItem = document.createElement('div');
    selfItem.className = 'player-item';
    selfItem.style.borderLeftColor = 'blue';
    selfItem.innerHTML = `<div class="player-name">You (${playerId ? playerId.substring(0, 6) : '?'})</div><div class="player-position">X: ${Math.round(player.x)}, Y: ${Math.round(player.y)}</div>`;
    playersList.appendChild(selfItem);

    // Add other players
    for (const id in players) {
        const p = players[id];
        const item = document.createElement('div');
        item.className = 'player-item';
        item.style.borderLeftColor = p.color || 'gray';
        item.innerHTML = `<div class="player-name">${id.substring(0, 6)}</div><div class="player-position">X: ${Math.round(p.x)}, Y: ${Math.round(p.y)}</div>`;
        playersList.appendChild(item);
    }

    updatePlayerCount();
}

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

window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === '.') {
        toggleEditorVisibility();
    }
});

window.addEventListener('keyup', e => keys[e.key] = false);

function canMove(newX, newY) {
    const col = Math.floor(newX / TILE_SIZE);
    const row = Math.floor(newY / TILE_SIZE);

    if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return false;
    const tile = map[row][col];
    return tile === TERRAIN.GRASS || tile === TERRAIN.SAND;
}

let lastSyncTime = 0;
const SYNC_INTERVAL = 100; // Send position updates every 100ms

function update() {
    if (!imagesLoaded) return;

    let newX = player.x;
    let newY = player.y;

    if (keys['ArrowUp']) newY -= player.speed;
    if (keys['ArrowDown']) newY += player.speed;
    if (keys['ArrowLeft']) newX -= player.speed;
    if (keys['ArrowRight']) newX += player.speed;

    let moved = false;
    if (canMove(newX, player.y)) {
        player.x = newX;
        moved = true;
    }
    if (canMove(player.x, newY)) {
        player.y = newY;
        moved = true;
    }

    // Send position to server
    if (moved && isConnected && socket) {
        const now = Date.now();
        if (now - lastSyncTime > SYNC_INTERVAL) {
            socket.emit('player-move', { x: player.x, y: player.y });
            lastSyncTime = now;
        }
    }

    // Update UI (only if not focused on input)
    if (document.activeElement.id !== 'playerX' && document.activeElement.id !== 'playerY' && document.activeElement.id !== 'playerSpeed') {
        document.getElementById('playerX').value = Math.round(player.x);
        document.getElementById('playerY').value = Math.round(player.y);
        document.getElementById('playerSpeed').value = player.speed;
    }

    // Update player list
    updatePlayersList();

    console.log("Player x:", player.x, "Player y:", player.y, "Player speed:", player.speed);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw map
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

    // Draw other players
    for (const id in players) {
        const p = players[id];
        ctx.fillStyle = p.color || 'gray';
        ctx.fillRect(p.x, p.y, p.width, p.height);
        // Draw player label
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText(id.substring(0, 6), p.x + 5, p.y + TILE_SIZE + 12);
    }

    // Draw self
    if (images['player']) {
        ctx.drawImage(images['player'], player.x, player.y, player.width, player.height);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function initializeEditor() {
    // Player Editor
    document.getElementById('playerX').value = Math.round(player.x);
    document.getElementById('playerY').value = Math.round(player.y);
    document.getElementById('playerSpeed').value = player.speed;

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

    // Make Editor Draggable
    makeDraggable(document.getElementById('editorPanel'));
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
        // Broadcast map change to server
        if (isConnected && socket) {
            socket.emit('map-edit', { row, col, terrain: selectedTerrain });
        }
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

function toggleEditorVisibility() {
    const editorPanel = document.getElementById('editorPanel');
    if (editorPanel.style.display === 'none') {
        editorPanel.style.display = 'block';
    } else {
        editorPanel.style.display = 'none';
    }
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = document.getElementById(element.id + "Header");
    if (header) {
        header.onmousedown = dragMouseDown;
    } else {
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

loadImages();

// Initialize Socket.io
initializeSocket();

let startCheckImagesLoaded = setInterval(() => {
    if (imagesLoaded) {
        clearInterval(startCheckImagesLoaded);
        loadMap();
        gameLoop();
    }
}, 100);
