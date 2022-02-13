const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();

app.use(express.static(`${__dirname}/../client`));

const server = http.createServer(app);
const io = socketio(server);

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
        sock.emit('message', 'Você está conectado...');
        io.emit('message', playerName + ' entrou no jogo!');
        io.emit('message', 'Aguardando mais jogadores entrarem...');
        io.emit('close modal');
    });
});

server.on('error', (err) => {
    console.error(err);
});

server.listen(8080, () => {
    console.log('Servidor pronto. Escutando a porta 8080...');
});


function rollDice() {
    const number = Math.ceil(Math.random() * 6);
    return number;
  }