const socket = io();
let roomId = null;
let playerOne = false;

//creates game
function createGame() {
    //whoever creates the game is player1
    playerOne = true;
    //emit sends message to all clients
    socket.emit('createGame');
}

//joins game
function joinGame() {
    roomId = document.getElementById('roomId').value;
    socket.emit('joinGame', {roomId: roomId});
}

//make a new game (listens for newGame message from index.js)
socket.on('newGame', (id) => {
    roomId = id.roomId;
    //hide start game div once the game starts
    document.getElementById('startGame').style.display = 'none';
    document.getElementById('gamePlay').style.display = 'block';
    document.getElementById('waitingRoom').innerHTML = `Waiting for opponent, share the code ${roomId} to join. The game will begin when two players have joined the game.`;
});

socket.on('playersConnected', () => {
    document.getElementById('startGame').style.display = 'none';
    document.getElementById('waitingRoom').style.display = 'none';
    document.getElementById('gameRoom').style.display = 'block';
});

//error checking for invalid code
socket.on('invalidCode', () => {
    alert("Invalid code, please make sure you are entering the right code.");
});

socket.on('p1Choice', (value) => {
    if(!playerOne) {
        showOpponentChoice(value);
    }
});

socket.on('p2Choice', (value) => {
    if(playerOne) {
        showOpponentChoice(value);
    }
});

socket.on('result', (value) => {
    let winnerText = "";
    if(value.winner == 'draw') {
        winnerText = "it's a draw!";
    } else {
        if(value.winner == 'p1' && playerOne) {
            winnerText = "Congrats, you won!";
            //create new image (it kept failing)
            /*let winnerImage = document.createElement('img');
            winnerImage.id = 'winnerImage';
            winnerImage.src = "https://www.rd.com/wp-content/uploads/2019/10/shutterstock_706603864-scaled.jpg";
            winnerImage.width = "50%";
            document.getElementById('winnerArea').appendChild(winnerImage);*/
        } else if(value.winner == 'p1' && !playerOne) {
            winnerText = "You lost, better luck next time!";
            //create new image
            /*let winnerImage = document.createElement('img');
            winnerImage.id = 'winnerImage';
            winnerImage.src = "https://transcode-v2.app.engoo.com/image/fetch/f_auto,c_lfill,w_300,dpr_3/https://assets.app.engoo.com/images/QyDHB4YHkK2V6TA6QkDzSIMbQpg9IIUKO5tn8KuDcJ1.jpeg";
            winnerImage.width = "50%";
            document.getElementById('winnerArea').appendChild(winnerImage);*/
        } else if(value.winner == 'p2' && !playerOne) {
            winnerText = "Congrats, you won!";
            //create new image
            /*let winnerImage = document.createElement('img');
            winnerImage.id = 'winnerImage';
            winnerImage.src = "https://www.rd.com/wp-content/uploads/2019/10/shutterstock_706603864-scaled.jpg";
            winnerImage.width = "50%";
            document.getElementById('winnerArea').appendChild(winnerImage);*/
        } else if(value.winner == 'p2' && playerOne) {
            winnerText = "You lost, better luck next time!";
            //create new image
            /*let winnerImage = document.createElement('img');
            winnerImage.id = 'winnerImage';
            winnerImage.src = "https://transcode-v2.app.engoo.com/image/fetch/f_auto,c_lfill,w_300,dpr_3/https://assets.app.engoo.com/images/QyDHB4YHkK2V6TA6QkDzSIMbQpg9IIUKO5tn8KuDcJ1.jpeg";
            winnerImage.width = "50%";
            document.getElementById('winnerArea').appendChild(winnerImage);*/
        }
    }
    document.getElementById('opponentState').style.display = 'none';
    document.getElementById('opponentButton').style.display = 'block';
    document.getElementById('winnerArea').innerHTML = winnerText;
});

function sendChoice(playerChoice) {
    let choiceEvent = null;
    if(playerOne) {
        choiceEvent = "p1Choice";
    } else {
        choiceEvent = "p2Choice";
    }
    socket.emit(choiceEvent, {
        playerChoice: playerChoice,
        roomId: roomId
    });

    let playerChoiceButton = document.createElement('button');
    playerChoiceButton.style.display = 'block';
    playerChoiceButton.innerText = playerChoice;
    playerChoiceButton.style.margin = "auto";
    playerChoiceButton.style.marginBottom = "5%";
    document.getElementById('p1choice').innerHTML = "";
    document.getElementById('opponentMove').style.marginBottom = "0";
    document.getElementById('p1choice').appendChild(playerChoiceButton);
    document.getElementById('yourMove').innerHTML = "Your move:";
}

function showOpponentChoice(value) {
    document.getElementById('opponentState').innerHTML = "Opponent has made their move";
    let opponentButton = document.createElement('button');
    opponentButton.id = 'opponentButton';
    opponentButton.style.display = 'none';
    opponentButton.style.margin = "auto";
    opponentButton.innerText = value.playerChoice;
    document.getElementById('opponentMove').style.marginBottom = "0";
    document.getElementById('p2choice').appendChild(opponentButton);
}
