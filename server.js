const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Game state
const gameState = {
    players: {},
    map: [
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
    ]
};

io.on('connection', (socket) => {
    console.log('New player connected:', socket.id);

    // Add new player to game state
    gameState.players[socket.id] = {
        id: socket.id,
        x: Math.random() * 600,
        y: Math.random() * 400,
        width: 50,
        height: 50,
        speed: 5,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`
    };

    // Send current game state to new player
    socket.emit('game-state', gameState);

    // Notify all other players about the new player
    socket.broadcast.emit('player-joined', gameState.players[socket.id]);

    // Send all connected players to the new player
    socket.emit('players-list', gameState.players);

    // Handle player movement
    socket.on('player-move', (data) => {
        if (gameState.players[socket.id]) {
            gameState.players[socket.id].x = data.x;
            gameState.players[socket.id].y = data.y;

            // Broadcast updated position to all other players
            socket.broadcast.emit('player-moved', {
                id: socket.id,
                x: data.x,
                y: data.y
            });
        }
    });

    // Handle map edits
    socket.on('map-edit', (data) => {
        const { row, col, terrain } = data;
        if (row >= 0 && row < 12 && col >= 0 && col < 16) {
            gameState.map[row][col] = terrain;
            // Broadcast map change to all players
            io.emit('map-changed', { row, col, terrain });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete gameState.players[socket.id];
        io.emit('player-left', socket.id);
    });

    // Handle custom events for player updates
    socket.on('update-player', (data) => {
        if (gameState.players[socket.id]) {
            Object.assign(gameState.players[socket.id], data);
            socket.broadcast.emit('player-updated', {
                id: socket.id,
                ...data
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
