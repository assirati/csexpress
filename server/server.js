const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Player = require('../lib/player');
const Roll = require('../lib/roll');

const port = process.env.PORT || 8080;

const app = express();

app.use(express.static(`${__dirname}/../client`));

const server = http.createServer(app);
const io = socketio(server);

// To store the names of active players
let players = [];

let StartCountdown = false;

let currentTurn = 0;

io.on('connection', (sock) => {

    sock.on('message', (text) => io.emit('message', text));

    sock.on('rollDice', () => {
        let roll = new Roll();
        io.emit('diceRolled', {
            dice1: roll.dices[0],
            dice2: roll.dices[1],
            dice3: roll.dices[2],
            dice4: roll.dices[3],
            dice5: roll.dices[4]},
            roll.choices);
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
            io.emit('message', "Todos os jogadores prontos, começando em:");
            var counter = 5;
            StartCountdown = new Interval(function(){
              io.emit('message', counter);
              counter--
              if (counter === 0) {
                //io.sockets.emit('gameStart');
                io.sockets.emit('message', "Iniciando partida...");
                clearInterval(StartCountdown);
                StartCountdown.stop();
                newTurn();
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

const newTurn = () => {
    currentTurn++;
    io.emit('message', currentTurn + "ª rodada");
    let roll = new Roll();
    io.emit('diceRolled', {
        dice1: roll.dices[0],
        dice2: roll.dices[1],
        dice3: roll.dices[2],
        dice4: roll.dices[3],
        dice5: roll.dices[4]},
        roll.choices);
};