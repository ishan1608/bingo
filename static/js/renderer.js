var Renderer = {
    init: function(data) {
        // Used to draw one time things
    },
    
    update: function(data) {
        // Used to re draw/display things
        // Update top level "BINGO" based on score
        data.bingoResult.innerText = "BINGO".substring(0, data.score);
        
        // Clear Canvas
        data.ctx.clearRect(0, 0, data.canvas.width, data.canvas.height);
        
        // Waiting
        if (data.state.msg === 'waiting') {
            // Opponent hasn't connected
            if ((data.playerType === 'host' && data.state.client === 'unavailable') ||
                (data.playerType === 'client' && data.state.host === 'unavailable')) {
                data.status.innerHTML = 'Room Link: <b>' + window.location.href + '</b><br/>' + 'Waiting for opponent to join...';
                data.status.classList.remove('hide');
                data.start.classList.add('hide');
                data.canvas.classList.add('hide');
                data.result.classList.add('hide');
                data.bingoResult.classList.add('hide');
            }
            
            // Opponent has connected
            if ((data.playerType === 'host' && data.state.client === 'available' && data.state.host === 'available') ||
                (data.playerType === 'client' && data.state.host === 'available' && data.state.client === 'available')) {
                data.status.classList.add('hide');
                data.start.classList.remove('hide');
                data.canvas.classList.add('hide');
                data.result.classList.add('hide');
                data.bingoResult.classList.add('hide');
            }
            
            // Player and opponent has started
            if (((data.playerType === 'host') && (data.state.host === 'started') && (data.state.client === 'available')) ||
                ((data.playerType === 'client') && (data.state.client === 'started') && (data.state.host === 'available'))) {
                data.status.innerText = 'Waiting for opponent to start...';
                data.status.classList.remove('hide');
                data.start.classList.add('hide');
                data.canvas.classList.add('hide');
                data.result.classList.add('hide');
                data.bingoResult.classList.add('hide');
            }
        }
        
        // Player turn
        if (data.state.msg === 'host_turn' || data.state.msg === 'client_turn') {
            data.status.classList.add('hide');
            data.start.classList.add('hide');
            data.canvas.classList.remove('hide');
            data.result.classList.add('hide');
            data.bingoResult.classList.remove('hide');
            
            // Draw the board on canvas
            this.drawCanvas(data);
        }
        
        // Waiting for other player to move
        if (((data.state.msg === 'host_turn') && (data.playerType !== 'host')) || 
            ((data.state.msg === 'client_turn') && (data.playerType !== 'client'))) {
            this.drawWaiting(data);
        }
        
        // Match result
        if (data.state.msg === 'host_won') {
            data.status.classList.add('hide');
            data.start.classList.add('hide');
            data.canvas.classList.add('hide');
            if (data.playerType === 'host') {
                data.resultMsg.innerText = 'You Won';
            }
            if (data.playerType === 'client') {
                data.resultMsg.innerText = 'You Lost';
            }
            data.result.classList.remove('hide');
            data.bingoResult.classList.remove('hide');
        }
        if (data.state.msg === 'client_won') {
            data.status.classList.add('hide');
            data.start.classList.add('hide');
            data.canvas.classList.add('hide');
            if (data.playerType === 'client') {
                data.resultMsg.innerText = 'You Won';
            }
            if (data.playerType === 'host') {
                data.resultMsg.innerText = 'You Lost';
            }
            data.result.classList.remove('hide');
            data.bingoResult.classList.remove('hide');
        }
        if (data.state.msg === 'draw') {
            data.status.classList.add('hide');
            data.start.classList.add('hide');
            data.canvas.classList.add('hide');
            data.resultMsg.innerText = 'Match Draw';
            data.result.classList.remove('hide');
            data.bingoResult.classList.remove('hide');
        }
        
        // End (Other player disconnected)
        if (data.state.msg === 'end') {
            data.status.innerHTML = 'Room Link: <b>' + window.location.href + '</b><br/>' + 'Opponent left the room...';
            data.status.classList.remove('hide');
            data.start.classList.add('hide');
            data.canvas.classList.add('hide');
            data.result.classList.add('hide');
            data.bingoResult.classList.add('hide');
        }
    },
    
    drawCanvas: function(data) {
        // Draw grid
        this.drawGrid(data);
        // Draw board
        for (var i = 0; i < data.numRows; i++) {
            for (var j = 0; j < data.numRows; j++) {
                var number = data.board[i][j];
                // Draw number in grayish color
                this.drawNumber(data, number, i, j, '#897f7f');
                
                // Value is selected
                if (data.selections.indexOf(number) !== -1) {
                    // Draw selection cross
                    this.drawCross(data, i, j);
                    // Re-draw number in black
                    this.drawNumber(data, number, i, j, '#000000');
                }
            }
        }
        
        // Draw xpad selection
        if (data.gamepad.exists) {
            this.drawCellBorder(data, data.gamepad.selectedCell);
        }
    },
    
    drawGrid: function(data) {
        var canvasWidth = data.canvas.width;
        var cellWidth = (canvasWidth / data.numRows);
        for (var i = 0; i < data.numRows; i++) {
            // Vertical line
            data.ctx.beginPath();
            data.ctx.moveTo(cellWidth * (i + 1), 0);
            data.ctx.lineTo(cellWidth * (i + 1), canvasWidth);
            data.ctx.stroke();
            
            // Horizontal line
            data.ctx.beginPath();
            data.ctx.moveTo(0, cellWidth * (i + 1));
            data.ctx.lineTo(canvasWidth, cellWidth * (i + 1));
            data.ctx.stroke();
            
        }
    },
    
    drawNumber: function(data, number, x, y, color) {
        var canvasWidth = data.canvas.width;
        var cellWidth = (canvasWidth / data.numRows);
        
        // Setting style to display
        data.ctx.font = '40px serif';
        data.ctx.fillStyle = color;
        // The number should not be clinging to the side
        var xOffset = 10;
        if (number < 10) {
            xOffset = 20;
        }
        // Draw the number
        data.ctx.fillText('' + number, (y * cellWidth) + xOffset, ((x + 1) * cellWidth) - 15);
        // Reset style
        data.ctx.fillStyle = '#000000';
    },
    
    drawCross: function(data, x, y) {
        var canvasWidth = data.canvas.width;
        var cellWidth = (canvasWidth / data.numRows);
        
        // Setting style
        data.ctx.lineWidth = 2;
        data.ctx.strokeStyle = '#3F5F5F';
        
        // Diagonal 1
        data.ctx.beginPath();
        data.ctx.moveTo(cellWidth * y, cellWidth * x);
        data.ctx.lineTo(cellWidth * (y + 1), cellWidth * (x + 1));
        data.ctx.stroke();
        
        // Diagonal 2
        data.ctx.beginPath();
        data.ctx.moveTo(cellWidth * y, cellWidth * (x + 1));
        data.ctx.lineTo(cellWidth * (y + 1), cellWidth * x);
        data.ctx.stroke();
        
        // Reset the style
        data.ctx.lineWidth = 1;
        data.ctx.strokeStyle = '#000000';
    },
    
    drawCellBorder: function(data, position) {
        var canvasWidth = data.canvas.width;
        var cellWidth = (canvasWidth / data.numRows);
        // Changing "X" and "Y" co-ordinates to fit display
        var x = position.y;
        var y = position.x;
        
        // set style
        data.ctx.strokeStyle = '#ff0000';
        data.ctx.lineWidth = 4;
        
        data.ctx.beginPath();
        data.ctx.moveTo(cellWidth * y, cellWidth * x);
        data.ctx.lineTo(cellWidth * y, cellWidth * (x + 1));
        data.ctx.lineTo(cellWidth * (y + 1), cellWidth * (x + 1));
        data.ctx.lineTo(cellWidth * (y + 1), cellWidth * x);
        data.ctx.lineTo(cellWidth * y, cellWidth * x);
        data.ctx.stroke();
        
        // Re-setting style
        data.ctx.strokeStyle = '#000000';
        data.ctx.lineWidth = 1;
    },
    
    drawWaiting: function(data) {
        var canvasWidth = data.canvas.width;
        data.ctx.font = '48px serif';
        data.ctx.fillStyle = 'red';
        data.ctx.fillText('Waiting', (canvasWidth / 4), ((canvasWidth / 2) + (canvasWidth / 10)));
        data.ctx.fillStyle = 'black';
    }
};