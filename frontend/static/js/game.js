let Game = {
    init: function() {
        this.data = {};
        // Handles to the html elements
        this.data.bingoResult = document.getElementById('bingo-result');
        this.data.canvas = document.getElementById('main-canvas');
        // Context for the canvas
        this.data.ctx = this.data.canvas.getContext('2d');
        this.data.status = document.getElementById('status');
        this.data.roomLink = document.getElementById('room-link');
        this.data.roomLinkUrl = document.getElementById('room-link-url');
        this.data.copyClipboard = document.getElementById('copy-clipboard');
        this.data.start = document.getElementById('start');
        this.data.startButton = document.getElementById('start-button');
        this.data.result = document.getElementById('result');
        this.data.resultMsg = document.getElementById('result-msg');
        this.data.newGameButton = document.getElementById('new-game-button');
        
        // Loading resources
        this.queue = new createjs.LoadQueue();
        this.queue.on("complete", this.loadComplete, this);
        this.queue.loadFile({
            id: 'theme',
            src: '/static/audio/bensound-relaxing.mp3'
        });
    },
    
    loadComplete: function() {
        // Preparing loaded resources
        this.data.theme = this.queue.getResult('theme');
        this.data.theme.loop = true;
        
        // Playing theme
        this.data.theme.play();
        
        // Initializing game
        this.data.cellHeight = 60;
        this.data.cellWidth = 60;
        this.data.animationFrame = 0;
        this.data.selectedCell = {x: 0, y: 0};
        this.data.state = {
            playerType: null,
            selections: [],
            board: [],
            state: {},
            score: 0
        };
        
        // Initialize everything
        GameSocket.init(this.data);
        Input.init(this.data);
        Renderer.init(this.data);
        Game.run(this.data);
    },
    
    run: function(data) {
        // Main game loop
        const gameLoop = function() {
            Game.input(data);
            Game.update(data);
            Game.render(data);
            
            data.animationFrame += 1;
            
            window.requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    },
    
    input: function(data) {
        Input.update(data);
    },
    
    update: function(data) {
        // Game update Physics, Gameinfo etc...
        // If user has clicked on a new cell and it is the user's turn
        if (data.clickedCell && data.state.turn) {
            // Check if cell is already clicked
            const result = _.find(data.state.input.me.concat(data.state.input.opponent), function(cell) {
                return cell.x === data.clickedCell.x && cell.y === data.clickedCell.y;
            });
            console.log(result);
            // Storing clicked cell information
            if (_.isUndefined(result)) {
                data.state.input.me.push(data.clickedCell);
                
                // Setting turn to false
                data.state.turn = false;
                
                // Sending input information to server
                data.socket.emit('player_input', data.clickedCell);
            }
            
            delete data.clickedCell;
        }
    },
    
    render: function(data) {
        Renderer.update(data);
    }
};
// Initialize the game
Game.init();
