let GameSocket = {
	init: function(data) {
        const self = this;
		// Connect to server for registering player
        data.socket = io.connect('/');
        
        data.socket.on('onconnected', function(serverData) {
            console.log('socket io connected');
            console.log(serverData);
            
            data.state.id = serverData.id;
            
            self.connectToRoom(data);
        });
        
        data.socket.on('game-state', function(serverData) {
            console.log('on game state');
            console.log(serverData);
            data.numRows = serverData.numRows;
            data.playerType = serverData.playerType;
            data.selections = serverData.selections;
            data.board = serverData.board;
            data.state = serverData.state;
            data.score = serverData.score;
        });
	},
    
    requestStart: function(data) {
        data.socket.emit('start');
    },
    
    requestNewGame: function(data) {
        data.socket.emit('new-game');
    },
    
    sendSelection: function(data, number) {
        data.socket.emit('player_input', number);
    },
    
    connectToRoom: function(data) {
        let hash = window.location.hash.substring(1, window.location.hash.length);
        console.log('hash ' + hash);
        // Hash is the room id
        if (hash !== '') {
            console.log('connecting to room');
            data.socket.emit('connect-room', hash);
        } else {
            // There is no room player should be redirected to a fresh room
            hash = Math.random().toString(36).substring(2);
            window.location.href += '#' + hash;
            location.reload();
        }
    }
};