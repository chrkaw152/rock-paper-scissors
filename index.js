//require these dependencies (listed in package.json) so you can use it
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

//initialize app to be a function handler that you can supply to an http server
const app = express();
//create a server
const server = createServer(app);
//intialize new instance of socket.io by passing the server object
const io = new Server(server);
//list of rooms
const rooms = {};

//allows app to use files in public folder
app.use(express.static("./public"));

//displays index.html on screen when get /
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '/public/index.html'));
});

//listen on the connection event for incoming sockets (incoming users)
io.on('connection', (socket) => {
    console.log('user connected');
    //listens on the disconnection event
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    //when someone creates a game
    socket.on('createGame', () => {
      const roomId = makeid(6);
      rooms[roomId] = {};
      //connect client to room
      socket.join(roomId);
      //server returns a new game
      socket.emit('newGame', {roomId: roomId});
    });

    //when someone joins a game
    socket.on('joinGame', (id) => {
      if(rooms[id.roomId] != null) {
        //if valid room
        socket.join(id.roomId);
        socket.to(id.roomId).emit('playersConnected', {});
        socket.emit('playersConnected');
      } else {
        //if invalid room
        socket.emit('invalidCode');
      }
    });

    socket.on('p1Choice', (value) => {
        let playerChoice = value.playerChoice;
        rooms[value.roomId].p1Choice = playerChoice;
        socket.to(value.roomId).emit('p1Choice', {playerChoice: value.playerChoice}); 
        if(rooms[value.roomId].p2Choice != null) {
          declareWinner(value.roomId);
        }
    });

    socket.on('p2Choice', (value) => {
      let playerChoice = value.playerChoice;
      rooms[value.roomId].p2Choice = playerChoice;
      socket.to(value.roomId).emit('p2Choice', {playerChoice: value.playerChoice}); 
      if(rooms[value.roomId].p1Choice != null) {
        declareWinner(value.roomId);
      }
  });
  });

function declareWinner(roomId) {
  let p1Choice = rooms[roomId].p1Choice;
  let p2Choice = rooms[roomId].p2Choice;
  let winner = null;
  if(p1Choice === p2Choice) {
    winner = 'draw';
  } else if((p1Choice == "scissors" && p2Choice == "paper") || (p1Choice == "rock" && p2Choice == "scissors") || (p1Choice == "paper" && p2Choice == "rock")) {
    winner = 'p1';
  } else if ((p2Choice == "scissors" && p1Choice == "paper") || (p2Choice == "rock" && p1Choice == "scissors") || (p2Choice == "paper" && p1Choice == "rock")) {
    winner = 'p2';
  }
  io.sockets.to(roomId).emit('result', {
    winner: winner
  });
  rooms[roomId].p1Choice = null;
  rooms[roomId].p2Choice = null;
}

//make server listen on port 3000
server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});

//make id
function makeid(length) {
  var result = "";
  var characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  for(var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random()*characters.length));
  }
  return result;
}