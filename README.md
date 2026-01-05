# Magic Open World - Multiplayer Game

A multiplayer tile-based game built with Node.js, Socket.io, and Canvas. Players can move around a shared world, edit the map in real-time, and see other players moving.

## Features

- **Multiplayer Support**: Multiple 
players can join the same server and play together
- **Real-time Synchronization**: Player positions and map changes sync in real-time via Socket.io
- **Map Editor**: Click on tiles to change terrain types (grass, water, trees, sand, mountains)
- **Player Tracking**: See a list of connected players and their positions
- **Connection Status**: Real-time connection status indicator

## Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Server

Start the development server:
```bash
npm start
```

For development with auto-restart on file changes:
```bash
npm run dev
```

The server will start on `http://localhost:3000` by default.

## How to Play

1. Open your browser and navigate to `http://localhost:3000`
2. Use **Arrow Keys** to move your character
3. Press **`.` (period)** to toggle the editor panel visibility
4. **Click on tiles** to edit the map (select a terrain type in the Map Editor panel first)
5. Adjust player speed in the Player Editor panel
6. The Players panel shows all connected players and their positions

## Controls

- **Arrow Keys**: Move your character
- **`.` (period)**: Toggle editor visibility
- **Mouse Click**: Edit map tiles
- **Speed Input**: Adjust movement speed

## Game Map

The game world is a 12x16 tile grid with different terrain types:
- **0 (Green)**: Grass (walkable)
- **1 (Blue)**: Water (not walkable)
- **2 (Dark Green)**: Trees (not walkable)
- **3 (Brown)**: Sand (walkable)
- **4 (Gray)**: Mountains (not walkable)

## Technical Stack

- **Backend**: Node.js with Express
- **Real-time Communication**: Socket.io
- **Frontend**: Vanilla JavaScript with HTML5 Canvas
- **Styling**: CSS3

## Server Features

- Maintains shared game state (map and player positions)
- Broadcasts player movements to all connected clients
- Syncs map changes across all players
- Handles player join/disconnect events
- Stores player data (position, speed, color)

## Architecture

### Client-Side
- Handles user input and local player movement
- Renders the game world and all players
- Emits local changes to the server
- Receives updates from other players

### Server-Side
- Manages game state and player registry
- Routes messages between clients
- Validates and broadcasts state changes
- Handles connection/disconnection

## Customization

You can customize the game by:
- Modifying terrain types in the `TERRAIN` constant
- Adjusting canvas size and tile dimensions
- Changing the initial map layout
- Adding new game mechanics or features

## License

ISC
