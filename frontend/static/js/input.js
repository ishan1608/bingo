var Input = {
    init: function (data) {
        // Used to setup listeners for mouse, keyboard, gamepad etc..
        // Copy to Clipboard
        data.copyClipboard.addEventListener('click', function() {
            // Select the room link
            data.roomLinkUrl.select();
            
            // Copy to clipboard
            try {
                document.execCommand('copy');
                data.copyClipboard.innerText = 'Copied';
            } catch (err) {
                window.prompt("Copy to clipboard: Ctrl+C, Enter", data.roomLinkUrl.value);
            }
        });
        
        // Setup mouse click listener
        var self = this;
        data.canvas.addEventListener('click', function (event) {
            if (((data.playerType === 'host') && (data.state.msg === 'host_turn')) ||
                ((data.playerType === 'client') && (data.state.msg === 'client_turn'))) {
                self.mouseClick(data, event);
            }
        });
        
        data.startButton.addEventListener('click', function(event) {
            GameSocket.requestStart(data);
        });
        
        data.newGameButton.addEventListener('click', function(event) {
            GameSocket.requestNewGame(data);
        });
        
        // NOTE gamepadconnected and gamepaddisconnected are both useless events in chrome
        // Have to old school and do long polling
        // However this will not be old school to me as I have always done event handling in the past
        // So technically this is a new (even though inferior) technology to me
        data.gamepad = {};
        data.gamepad.buttons = [];
        data.gamepad.exists = false;
        // Initialized all buttons as depressed
        for (var i = 0; i <= 15; i++) {
            data.gamepad.buttons.push(false);
        }
        
        // Mouse over the canvas
        data.canvas.addEventListener('mousemove', function(event) {
            // If this is the player's turn then handle mouseover events
            if (((data.playerType === 'host') && (data.state.msg === 'host_turn')) ||
                    ((data.playerType === 'client') && (data.state.msg === 'client_turn'))) {
                console.log('x ' + (event.clientX - event.target.offsetLeft) + ' y ' + (event.clientY - event.target.offsetTop));
                var position = {
                    x: event.clientX - event.target.offsetLeft,
                    y: event.clientY - event.target.offsetTop
                };
                // Sanity checks, to make sure the mouse move doesn't drags the selected cell out of the grid
                if (position.x < 0) {
                    position.x = 0;
                }
                if (position.x >= data.canvas.width) {
                    position.x = data.canvas.width - 1;
                }
                if (position.y < 0) {
                    position.y = 0;
                }
                if (position.y >= data.canvas.width) {
                    position.y = data.canvas.width - 1;
                }
                // Getting the selected cell
                var selectedCell = self.getCellAtPosition(data, position);
                console.log('Selected cell');
                console.log(selectedCell);
                data.selectedCell = selectedCell;
            }
        });
    },
    
    update: function (data) {
        // Check for changes in input and update game state information accordingly
        // Only concerned with first gamepad
        data.gamepad.gamepad = navigator.getGamepads()[0];
        if (data.gamepad.gamepad) {
            // xpad connected
            if (data.gamepad.exists === false) {
                data.gamepad.exists = true;
            }

            // NOTE For Left Trigger / Right Trigger, this doesn't provides the value
            // NOTE For Left Stick / Right Stick, these provide presses and not movements
            for (var i = 0; i <= 15; i++) {
                if (data.gamepad.gamepad.buttons[i].pressed === true && data.gamepad.buttons[i] === false) {
                    data.gamepad.buttons[i] = true;
                }
                if (data.gamepad.gamepad.buttons[i].pressed === false && data.gamepad.buttons[i] === true) {
                    data.gamepad.buttons[i] = false;
                    // Process gamepad input
                    this.gamepadInput(data, i);
                }
            }
        }
    },
    
    mouseClick: function(data, event) {
        var position = this.getPointerPosition(data, event);
        var clickedCell = this.getCellAtPosition(data, position);
        this.sendSelection(data, clickedCell);
    },
    
    getPointerPosition: function(data, event) {
        var x;
        var y;
        if (event.pageX != undefined && event.pageY != undefined) {
            x = event.pageX;
            y = event.pageY;
        }
        else {
            x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        
        x -= data.canvas.offsetLeft;
        y -= data.canvas.offsetTop;
        
        return {
            x: x,
            y: y
        }
    },
    
    getCellAtPosition: function(data, position) {
        var cellWidth = (data.canvas.width / data.numRows);
        position.x = Math.floor(position.x / cellWidth);
        position.y = Math.floor(position.y / cellWidth);
        return position;
    },
    
    gamepadInput: function(data, buttonIndex) {
        var buttonTypes = ['A', 'B', 'X', 'Y', 'Left Bummper', 'Right Bumper', 'Left Trigger', 'Right Trigger',
                                   'View', 'Menu', 'Left Stick', 'Right Stick', 'D-Up', 'D-Down', 'D-Left', 'D-Right'];
        console.log('xPad - ' + buttonTypes[buttonIndex]);
        // Process gamepad input for help section
        Help.displayXpadInput(buttonTypes[buttonIndex]);

        // If this is the player's turn then poll for xpad input
        if (((data.playerType === 'host') && (data.state.msg === 'host_turn')) ||
                ((data.playerType === 'client') && (data.state.msg === 'client_turn'))) {
            switch(buttonTypes[buttonIndex]) {
                case 'A':
                case 'X':
                    console.log('Send selection ' + buttonTypes[buttonIndex]);
                    this.sendSelection(data, data.selectedCell);
                    break;
                case 'D-Up':
                    console.log('Go up ' + buttonTypes[buttonIndex]);
                    console.log(data.selectedCell);
                    data.selectedCell.y -= 1;
                    if (data.selectedCell.y < 0) {
                        data.selectedCell.y = data.numRows - 1;
                    }
                    console.log(data.selectedCell);
                    break;
                case 'D-Down':
                    console.log('Go down ' + buttonTypes[buttonIndex]);
                    console.log(data.selectedCell);
                    data.selectedCell.y += 1;
                    if (data.selectedCell.y >= data.numRows) {
                        data.selectedCell.y = 0;
                    }
                    console.log(data.selectedCell);
                    break;
                case 'D-Left':
                    console.log(data.selectedCell);
                    data.selectedCell.x -= 1;
                    if (data.selectedCell.x < 0) {
                        data.selectedCell.x = data.numRows - 1;
                    }
                    console.log(data.selectedCell);
                    console.log('Go left ' + buttonTypes[buttonIndex]);
                    break;
                case 'D-Right':
                    console.log(data.selectedCell);
                    data.selectedCell.x += 1;
                    if (data.selectedCell.x >= data.numRows) {
                        data.selectedCell.x = 0;
                    }
                    console.log(data.selectedCell);
                    console.log('Go right ' + buttonTypes[buttonIndex]);
                    break;
            }
        }
        
        // Opponent has connected and waiting for the player to start
        if ((data.playerType === 'host' && data.state.client === 'available' && data.state.host === 'available') ||
            (data.playerType === 'client' && data.state.host === 'available' && data.state.client === 'available')) {
            if (buttonTypes[buttonIndex] === 'Menu') {
                GameSocket.requestStart(data);
            }
        }
        
        // New game message
        if ((data.state.msg === 'host_won') || (data.state.msg === 'client_won') || ((data.state.msg === 'draw'))) {
            if (buttonTypes[buttonIndex] === 'Menu') {
                GameSocket.requestNewGame(data);
            }
        }
    },
    
    sendSelection: function(data, clickedCell) {
        console.log('sending selection');
        console.log(clickedCell);
        // TODO Check for number value as selected
        // Get number value from clickedCell as below
        GameSocket.sendSelection(data, data.board[clickedCell.y][clickedCell.x]);
    }
};
