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

let players = [];
let currentTurn = 0;
let gameStarted = false;

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

    sock.on('playerReadyToStart', (playerName) => {
        idx = players.findIndex(obj => obj.name === playerName)
        players[idx].ready = !players[idx].ready
        io.emit('playerListUpdateed', players);

        let StartCountdown = new Interval(function(){
            io.emit('message', counter);
            counter--
            if (counter === 0) {
              io.sockets.emit('message', "Iniciando partida...");
              currentTurn == 0;
              clearInterval(StartCountdown);
              StartCountdown.stop();
              newTurn();
            }
          }, 1000);

        if (players.every(el => el.ready == true))
        {
            io.emit('message', "Todos os jogadores prontos, começando em:");
            var counter = 3;
            StartCountdown.start();

        } else 
        {
            if (StartCountdown.isRunning()) {
                io.emit('message', "Início interrompido!");
                gameStarted = false;
                StartCountdown.stop();
            }
        }
               
    });

    sock.on('disconnect', (reason) => {
        if(sock.playerName !== undefined) {
            let removedPlayer = players.splice(players.indexOf(sock.playerName), 1);
            io.emit('playerListUpdateed', players);
            io.emit('message', sock.playerName + ' desconectou...');
            
            if (players.length < 1)
                resetGame();
        }
    });

    sock.on('choiceMade', (c) => {
        io.emit('message', `${sock.playerName} escolheu "${parseInt(c[1]) + parseInt(c[2])}" e "${parseInt(c[3]) + parseInt(c[4])}", deixando "${c[0]}"`);
        const player = players.find(p => p.name === sock.playerName);
        player.ready = true;
        io.emit('playerListUpdateed', players);

        if (players.every(el => el.ready == true))
            newTurn();
        else
            sock.emit('message', 'Aguardando a escolha dos outros jogadores');
    });      
});

server.on('error', (err) => {
    console.error(err);
});

server.listen(port, () => {
    console.log('Servidor pronto. Escutando a porta 8080...');
});

function resetGame() {
    currentTurn = 0;
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
    players.forEach((p) => {
        p.ready = false;
    });
    io.emit('awaitingPlayersChoice');
    io.emit('playerListUpdateed', players);
};