const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const port = process.env.PORT || 8080;

const app = express();

app.use(express.static(`${__dirname}/../client`));

const server = http.createServer(app);
const io = socketio(server);

// To store the names of active players
let players = [];

// To store the count of connected players
let connections = [];

io.on('connection', (sock) => {

    sock.on('message', (text) => io.emit('message', text));

    sock.on('rollDice', () => {
        io.emit('diceRolled', {
            dice1: rollDice(),
            dice2: rollDice(),
            dice3: rollDice(),
            dice4: rollDice(),
            dice5: rollDice(),
          });
    });

    sock.on('newPlayer', (playerName) => {
        newPlayer = new Player(players.length, playerName);
        players.push(newPlayer);
        sock.emit('message', 'Você está conectado...');
        io.emit('message', newPlayer.name + ' entrou no jogo!');
        io.emit('message', 'Aguardando mais jogadores entrarem...');
        io.emit('newPlayerJoined', players);
        sock.emit('close modal');
    });
});

server.on('error', (err) => {
    console.error(err);
});

server.listen(port, () => {
    console.log('Servidor pronto. Escutando a porta 8080...');
});

function rollDice() {
    const number = Math.ceil(Math.random() * 6);
    return number;
}

class Player {
    constructor(id, name) {
      this.id = id;
      this.name = name;
    }
}