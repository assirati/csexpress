let choices = [];

const log = (text) => {
    const parent = document.querySelector('#events');
    const el = document.createElement('li');
    el.innerHTML = text;
  
    parent.appendChild(el);
    parent.scrollTop = parent.scrollHeight;
};

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
    sock.playername = playername.value;
    sock.emit('newPlayer', playername.value);
    return false;
};

const onPlayerListUpdateed = (data, players) => {
    const table = document.getElementById("players-table");
    table.innerHTML = '<tr><th>Nome</th><th>Pronto?</th></tr>';
    data.forEach((player) => {
        players.push(new Player(player.id, player.name, player.ready));
        table.innerHTML += `<tr><td>${player.name}</td>
                                <td>${(player.ready) ? '✔️' : '❌'}</td></tr>`;
    });
};

const onStatusChange = (sock) => (e) => {
    e.preventDefault();
    sock.emit('statusChanged', sock.playername);
};

const onBtnTesteClick = () => (e) => {
    e.preventDefault();
    document.getElementById('newPlayerForm').submit();
};

const onBtnChoiceClick = (sock) => (e) => {
    e.preventDefault();
    const clickedThing = e.target;
    let chiceNum = clickedThing.value;

    let c = choices[chiceNum].split('');

    sock.emit('message', `${sock.playername} escolheu "${parseInt(c[1]) + parseInt(c[2])}" e "${parseInt(c[3]) + parseInt(c[4])}", deixando "${c[0]}"`);

    let elements = document.getElementsByClassName('btnChoice');

    Array.from(elements).forEach((el) => {
        el.disabled = true;
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

    sock.on('diceRolled', (dataDices, dataChoices) => {
        choices = dataChoices;
        document.getElementById("dice1").src = `img/dice${dataDices.dice1}.png`;
        document.getElementById("dice2").src = `img/dice${dataDices.dice2}.png`;
        document.getElementById("dice3").src = `img/dice${dataDices.dice3}.png`;
        document.getElementById("dice4").src = `img/dice${dataDices.dice4}.png`;
        document.getElementById("dice5").src = `img/dice${dataDices.dice5}.png`;

        const table = document.getElementById("choices-table");
        table.innerHTML = `<thead>
                                <tr>
                                <th class="tg-c3ow">5º dado</th>
                                <th class="tg-c3ow" colspan="3">Par 1</th>
                                <th class="tg-c3ow" colspan="3">Par 2</th>
                                <th class="tg-0pky"></th>
                                </tr>
                            </thead>
                            <tbody>`;

        let i = 0;

        dataChoices.forEach((choice) => {
            var c = choice.split('');
            table.innerHTML += `<tr>
            <td class="tg-9wq8"><img src="img/dice${c[0]}.png" alt="" class="fifthdice-choice" /></td>
            <td class="tg-9wq8"><img src="img/dice${c[1]}.png" alt="" class="dice-choice" /></td>
            <td class="tg-9wq8"><img src="img/dice${c[2]}.png" alt="" class="dice-choice" /></td>
            <td class="tg-9wq8"> =${parseInt(c[1]) + parseInt(c[2])}</td>
            <td class="tg-9wq8"><img src="img/dice${c[3]}.png" alt="" class="dice-choice" /></td>
            <td class="tg-9wq8"><img src="img/dice${c[4]}.png" alt="" class="dice-choice" /></td>
            <td class="tg-9wq8"> =${parseInt(c[3]) + parseInt(c[4])}</td>
            <td class="tg-9wq8"><button id="choice${i}" value="${i}" class="btnChoice">Escolher</button> </td>
          </tr>`;
            i++;
        });
        table.innerHTML += `</tbody>`;

        sock.dataChoices = dataChoices;

        for (let i = 0; i < dataChoices.length; i++)
            document
            .getElementById("choice" + i)
            .addEventListener('click', onBtnChoiceClick(sock));
    });

    //Quando o servidor avisa que um novo jogador entrou
    sock.on('playerListUpdateed', (data) => onPlayerListUpdateed(data, players));

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

    document
        .getElementById("ready-checkbox")
        .addEventListener('change', onStatusChange(sock));

})();

class Player {
    constructor(id, name, ready) {
      this.id = id;
      this.name = name;
      this.ready;
    }
}