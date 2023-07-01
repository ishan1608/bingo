// Imports
const _ = require('underscore');
const UUID = require('uuid/v4');
const http = require('http');
const express = require('express');
const io = require('socket.io');
const mkdirp = require('mkdirp');
const winston = require('winston');

// Create logs directory
mkdirp.sync('logs');

// Configuring winston
winston.configure({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'logs/default.log' })
    ]
});
winston.level = 'debug';

const gameServer = require('./game_server.js');

const gameport = process.env.PORT || 8001;

// Express app
const app = express();
const server = http.Server(app);

// Create a socket.io instance using our express server
const sio = io.listen(server);

// Start the server
server.listen(gameport);
winston.log('debug', 'Bingo game server listening on port ' + gameport);

// Serve index.html
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/frontend/index.html');
});

// Serving files in the static folder
app.use('/static', express.static('frontend/static'));

// New Socket.io connection
sio.on('connection', function(client) {
    // Generate and allot a new UUID to client
    client.userid = UUID();
    
    // Connect to room
    client.on('connect-room', function(roomId) {
        // Create empty room
        gameServer.joinRoom(roomId);
        
        // Attach roomId to the client
        client.roomId = roomId;
        
        // Insert the player
        const result = gameServer.insertClient(roomId, client);
        client.type = result.type;
        
        // Initialize the game
        gameServer.initializeGame(roomId);

        // Broadcast game
        gameServer.broadcastGame(roomId);
    });
    
    // Send the player their id
    client.emit('onconnected', {
        id: client.userid
    });
    
    // When player disconnects
    client.on('disconnect', function() {
        // If client has a room remove client from the room
        if (_.has(client, 'roomId')) {
            // Remove the client
            gameServer.removeClient(client.roomId, client);

            // End the game
            gameServer.endGame(client.roomId);

            // Broadcast game
            gameServer.broadcastGame(client.roomId);
        }
    });
    
    // When player intends to start game
    client.on('start', function() {
        // Start game by player
        gameServer.startGame(client.roomId, client);
        
        // Broadcast game
        gameServer.broadcastGame(client.roomId);
    });
    
    // When player clicks on a cell
    client.on('player_input', function(number) {
        // Store player input
        gameServer.playerInput(client.roomId, client, number);
        
        // Brodcast game
        gameServer.broadcastGame(client.roomId);
    });
    
    // When player requests a new game
    client.on('new-game', function() {
        // Request a new game with same players
        gameServer.initializeGame(client.roomId);
        
        // Broadcast game
        gameServer.broadcastGame(client.roomId);
    });
});
