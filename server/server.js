const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Player = require('../lib/player');

const port = process.env.PORT || 8080;

const app = express();

app.use(express.static(`${__dirname}/../client`));

const server = http.createServer(app);
const io = socketio(server);

// To store the names of active players
let players = [];

let StartCountdown = false;

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
        newPlayer = new Player(players.length, playerName, false);
        players.push(newPlayer);
        sock.emit('message', 'Você está conectado...');
        sock.playerName = newPlayer.name;
        sock.playerId = newPlayer.id;
        io.emit('message', newPlayer.name + ' entrou no jogo!');
        io.emit('message', 'Aguardando mais jogadores entrarem...');
        io.emit('playerListUpdateed', players);
        sock.emit('close modal');
    });

    sock.on('statusChanged', (playerName) => {
        idx = players.findIndex(obj => obj.name === playerName)
        players[idx].ready = !players[idx].ready
        io.emit('playerListUpdateed', players);

        if (players.every(el => el.ready == true))
        {
            io.emit('message', "Todos os jogadores prontos, começando em 5");
            var counter = 4;
            StartCountdown = new Interval(function(){
              io.emit('message', counter);
              counter--
              if (counter === 0) {
                io.sockets.emit('message', "Iniciando partida...");
                clearInterval(StartCountdown);
                counter = 4;
              }
            }, 1000);
            StartCountdown.start();

        } else 
        {
            if (StartCountdown.isRunning()) {
                io.emit('message', "Início interrompido!");            
                StartCountdown.stop();
            }
        }
               
    });

    sock.on('disconnect', ( reason ) => {
        if(sock.playerName !== undefined) {
            let removedPlayer = players.splice(players.indexOf(sock.playerName), 1);
            io.emit('playerListUpdateed', players);
            io.emit('message', sock.playerName + ' desconectou...');
        }
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

function Interval(fn, time) {
    var timer = false;
    this.start = function () {
        if (!this.isRunning())
            timer = setInterval(fn, time);
    };
    this.stop = function () {
        clearInterval(timer);
        timer = false;
    };
    this.isRunning = function () {
        return timer !== false;
    };
}