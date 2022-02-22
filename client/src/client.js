let choices = [];
let scoreTotal = []
let score = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let scoreRef = [100, 70, 60, 50, 40, 30, 40, 50, 60, 70, 100];
let fifthDice = {};

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
    table.innerHTML = '<tr><th>Nome</th><th>Pronto?</th><th>Placar</th></tr>';
    data.forEach((player) => {
        players.push(new Player(player.id, player.name, player.ready));
        table.innerHTML += `<tr><td>${player.name}</td>
                                <td>${(player.ready) ? '✔️' : '❌'}</td>
                                <td>${player.score}</td></tr>`;

    });
};

const onPlayerReady = (sock) => (e) => {
    e.preventDefault();

    document.getElementById('ready-button').disabled = true;

    sock.emit('playerReadyToStart', sock.playername);
};

const onBtnTesteClick = () => (e) => {
    e.preventDefault();
    document.getElementById('newPlayerForm').submit();
};

const onBtnChoiceClick = (sock) => (e) => {
    e.preventDefault();
    const clickedThing = e.target;
    let chiceNum = clickedThing.value;

    let c = choices[chiceNum];

    let elements = document.getElementsByClassName('btnChoice');

    Array.from(elements).forEach((el) => {
        el.disabled = true;
    });

    calculateScore(sock, c);

    sock.emit('choiceMade', c);
};

function calculateScore(sock, choice) {

    let c = choice.split('');
    let f = parseInt(c[0]);
    let v1 = parseInt(c[1]) + parseInt(c[2]);
    let v2 = parseInt(c[3]) + parseInt(c[4]);

    if (Object.keys(fifthDice).length <= 3)
    {
        fifthDice[f] = (fifthDice[f] || 0) + 1;
    }
    else {
        if (fifthDice.hasOwnProperty(int(c[0])))
            fifthDice[f] = fifthDice.get(f) + 1;
        else
            return;
            //Gerar erro
    }

    if (score[v1 - 2] < 9)
        score[v1 - 2] = score[v1 - 2] + 1;
        
    if (score[v2 - 2] < 9)
        score[v2 - 2] = score[v2 - 2] + 1;
    
    soma = 0;
    score.forEach((e, index) => {
        sock.emit('message', (index+2) + ' = ' + e);
        if (e > 0 && e <= 4)
            soma -= 200;
        else 
            if (e === 5)
                soma += 0;
            else 
                if (e > 5 && e <= 9)
                    soma += ( e - 5 ) *scoreRef[index];
                //else valor invalido
    });

    scoreTotal = soma;

    var tstart = `<thead>
    <tr>
      <th class="tg-uzvj">Soma</th>
      <th class="tg-uzvj">Pontos</th>
      <th class="tg-uzvj" colspan="3">Contagem</th>
      <th class="tg-uzvj" colspan="2" rowspan="2">5º Dado</th>
      <th class="tg-uzvj" rowspan="2">Fim de<br>Jogo</th>
    </tr>
    <tr>
      <th class="tg-efol"></th>
      <th class="tg-uzvj">X</th>
      <th class="tg-uzvj">-200</th>
      <th class="tg-uzvj">0</th>
      <th class="tg-uzvj">+ X para cada</th>
    </tr>
  </thead>
  <tbody>`
    var tMiddle = `
    <tr>
      <td class="tg-uzvj">2</td>
      <td class="tg-uzvj">100</td>
      <td class="tg-uzvj">☑️⬜⬜⬜</td>
      <td class="tg-uzvj">⬜</td>
      <td class="tg-uzvj">⬜⬜⬜⬜</td>
      <td class="tg-uzvj">5</td>
      <td class="tg-uzvj">⬜⬜⬜⬜⬜⬜⬜⬜</td>
      <td class="tg-uzvj">⬜</td>
    </tr>
    <tr>
      <td class="tg-uzvj">3</td>
      <td class="tg-uzvj">70</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
      <td class="tg-7btt">⬜</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
      <td class="tg-7btt">5</td>
      <td class="tg-7btt">⬜⬜⬜⬜⬜⬜⬜⬜</td>
      <td class="tg-7btt">⬜</td>
    </tr>
    <tr>
      <td class="tg-uzvj">4</td>
      <td class="tg-uzvj">60</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
      <td class="tg-7btt">⬜</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
      <td class="tg-7btt">5</td>
      <td class="tg-7btt">⬜⬜⬜⬜⬜⬜⬜⬜</td>
      <td class="tg-7btt">⬜</td>
    </tr>
    <tr>
      <td class="tg-uzvj">5</td>
      <td class="tg-uzvj">50</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
      <td class="tg-7btt">⬜</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
      <td class="tg-uzvj" colspan="3" rowspan="8"></td>
    </tr>
    <tr>
      <td class="tg-uzvj">6</td>
      <td class="tg-uzvj">40</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
      <td class="tg-7btt">⬜</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
    </tr>
    <tr>
      <td class="tg-uzvj">7</td>
      <td class="tg-uzvj">30</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
      <td class="tg-7btt">⬜</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
    </tr>
    <tr>
      <td class="tg-uzvj">8</td>
      <td class="tg-uzvj">40</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
      <td class="tg-7btt">⬜</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
    </tr>
    <tr>
      <td class="tg-uzvj">9</td>
      <td class="tg-uzvj">50</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
      <td class="tg-7btt">⬜</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
    </tr>
    <tr>
      <td class="tg-uzvj">10</td>
      <td class="tg-uzvj">60</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
      <td class="tg-7btt">⬜</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
    </tr>
    <tr>
      <td class="tg-uzvj">11</td>
      <td class="tg-uzvj">70</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
      <td class="tg-7btt">⬜</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
    </tr>
    <tr>
      <td class="tg-uzvj">12</td>
      <td class="tg-uzvj">100</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
      <td class="tg-7btt">⬜</td>
      <td class="tg-7btt">⬜⬜⬜⬜</td>
    </tr>`
    var tEnd = `
  </tbody>`

    const table = document.getElementById("scoreboardTable");
    table.innerHTML = tstart + tMiddle + tEnd;

    sock.emit('message', sock.playername + ' tem ' + scoreTotal + ' pontos');

    if (fifthDice[f] >= 9) {
        sock.emit('message', 'Jogo terminou para ' + sock.playername);
        //sock.emit('statusChanged');
    }

}

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

    document
        .getElementById("newPlayerForm")
        .addEventListener('submit', onCurrentPlayerJoins(sock, players));

    document
        .getElementById("ready-button")
        .addEventListener('click', onPlayerReady(sock));

})();

class Player {
    constructor(id, name, ready) {
      this.id = id;
      this.name = name;
      this.ready = ready;
      this.score = 0;
    }
}