const log = (text) => {
    const parent = document.querySelector('#events');
    const el = document.createElement('li');
    el.innerHTML = text;
  
    parent.appendChild(el);
    parent.scrollTop = parent.scrollHeight;
};

let currentPlayer;

const onChatSubmitted = (sock) => (e) => {
    e.preventDefault();

    const input = document.querySelector('#chat');
    const text = input.value;
    input.value = '';

    sock.emit('message', text);
};

const onRoll = (sock) => (e) => {
    e.preventDefault();
    sock.emit('rollDice');
};

const onCurrentPlayerJoins = (sock, players) => (e) => {
    e.preventDefault();
    const playername = document.getElementById('playername');
    currentPlayer = new Player(players.length, playername.value);
    sock.playername = playername.value;
    sock.emit('newPlayer', playername.value);
    playername.value = '';

    return false;
};

const onNewPlayerJoined = (data, players) => {
    const table = document.getElementById("players-table");
    table.innerHTML = '';
    data.forEach((player) => {
        players.push(new Player(player.id, player.name));
        table.innerHTML += `<tr><td>${player.name}</td></tr>`;
    });
};

const disableFormElems = (options) => {
    const modalContainer = document.querySelector('.modal-container');
    modalContainer.getElementsByTagName('input')[0].setAttribute('disabled', options);
    modalContainer.getElementsByTagName('button')[0].setAttribute('disabled', options);
};

const  onAwaitingConnection = ( data ) => {
    disableFormElems(true);
    const newPlayerForm = document.getElementById("newPlayerForm");
};

(() => {

    let players = [];

    //const canvas = document.querySelector('canvas');
    //const ctx = canvas.getContext('2d');

    const sock = io();

    sock.on('message', log);

    sock.on('diceRolled', (data) => {
        document.getElementById("dice1").src = `img/dice${data.dice1}.png`;
        document.getElementById("dice2").src = `img/dice${data.dice2}.png`;
        document.getElementById("dice3").src = `img/dice${data.dice3}.png`;
        document.getElementById("dice4").src = `img/dice${data.dice4}.png`;
        document.getElementById("dice5").src = `img/dice${data.dice5}.png`;
    });

    //Quando o servidor avisa que um novo jogador entrou
    sock.on('newPlayerJoined', (data) => onNewPlayerJoined(data, players));

    //Quando o servidor avisa que está aguardando jogadores
    sock.on('awaitingPlayers', (data) => onAwaitingConnection(data));

    // Mostra um evento modal
    sock.on('show modal', () => {
        disableFormElems(true);
        const modalContainer = document.querySelector('.modal-container');
        modalContainer.modalContainer.style.display = 'block';
        modalContainer.modalOverlay.style.display = 'block';
    });

    // Fecha o evento modal
    sock.on('close modal', () => {
        disableFormElems(false);
        //newElem = document.createElement('strong');
        //newElem.textContent = '';
        const modalContainer = document.querySelector('.modal-container');
        modalContainer.style.display = 'none';

        const modalOverlay = document.querySelector('.modal-overlay');
        modalOverlay.style.display = 'none';
    });

    //document
    //    .querySelector('#chat-form')
    //    .addEventListener('submit', onChatSubmitted(sock));

    document
        .getElementById("roll-button")
        .addEventListener("click", onRoll(sock));

    document
        .getElementById("newPlayerForm")
        .addEventListener('submit', onCurrentPlayerJoins(sock, players));

})();

class Player {
    constructor(id, name) {
      this.id = id;
      this.name = name;
    }
}