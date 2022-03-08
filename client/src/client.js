let choices = [];
let scoreTotal = []
let scoreRows = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let scoreRef = [100, 70, 60, 50, 40, 30, 40, 50, 60, 70, 100];
let fifthDice = {};

const log = (text) => {
    const parent = document.querySelector('#events');
    const el = document.createElement('li');
    el.innerHTML = text;
  
    parent.appendChild(el);
    parent.scrollTop = parent.scrollHeight;
};

const disableFormElems = (options) => {
    const modalContainer = document.querySelector('.modal-container');
    modalContainer.getElementsByTagName('input')[0].disabled = options;
    modalContainer.getElementsByTagName('button')[0].disabled = options;
};

const onCurrentPlayerJoins = (sock, players) => (e) => {
    e.preventDefault();
    const playername = document.getElementById('playername');
    sock.playername = playername.value;
    sock.emit('newPlayer', playername.value);
    return false;
};

const onPlayerListUpdated = (data, players) => {
    const table = document.getElementById("players-table");
    table.innerHTML = '<tr><th>Nome</th><th>Pronto?</th><th>Placar</th></tr>';
    data.forEach((player) => {
        players.push(new Player(player.id, player.name, player.ready, player.score));
        table.innerHTML += `<tr><td>${player.name}</td>
                                <td>${(player.ready) ? '✔️' : '❌'}</td>
                                <td>${player.score}</td></tr>`;
    });
};

const onNotifyLoginEvent = (data) => {
    disableFormElems(data.blocking);
    const e = document.querySelector('#newPlayerForm > div > strong');
    e.textContent = data.error;
};

const onPlayerReady = (sock) => (e) => {
    e.preventDefault();

    document.getElementById('ready-button').disabled = true;

    sock.emit('playerReadyToStart', sock.playername);
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

    sock.emit('choiceMade', c, scoreTotal);
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
        if (c[0] in fifthDice)
            if (fifthDice.get(f) < 8)
                fifthDice[f] = fifthDice.get(f) + 1;
        else
            return;
            //Gerar erro
    }

    if (scoreRows[v1 - 2] < 9)
        scoreRows[v1 - 2] = scoreRows[v1 - 2] + 1;
        
    if (scoreRows[v2 - 2] < 9)
        scoreRows[v2 - 2] = scoreRows[v2 - 2] + 1;
    
    soma = 0;
    scoreRows.forEach((e, index) => {
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

    var tHead = `
    <thead>
      <tr>
        <th class="tg-18eh">Soma</th>
        <th class="tg-18eh">Pontos</th>
        <th class="tg-18eh">Contagem</th>
        <th class="tg-18eh"></th>
        <th class="tg-18eh"></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="tg-18eh"></td>
        <td class="tg-18eh">X</td>
        <td class="tg-18eh">-200</td>
        <td class="tg-18eh">0</td>
        <td class="tg-18eh">+ X para cada</td>
      </tr>`;

    var tMiddle = '';
    for (let i = 0; i < 11; i++){
      tMiddle += `
      <tr>
        <td class="tg-18eh">${i+2}</td>
        <td class="tg-18eh">${scoreRef[i]}</td>
        <td class="tg-18eh">`;
      for (let j = 1; j <= 4; j++)
        if (scoreRows[i] >= j )
          tMiddle += `☑️`;
        else
          tMiddle += `⬜`;

      tMiddle += `</td><td class="tg-18eh">${(scoreRows[i] >= 5 ? '☑️' : '⬜')}</td>
        <td class="tg-18eh">`;
        
      for (let j = 6; j <= 9; j++)
        if (scoreRows[i] >= j )
          tMiddle += `☑️`;
        else
          tMiddle += `⬜`;

      tMiddle += `  </td>
      </tr>`;
    }

    var tEnd = `</tbody>`;

    const tableScore = document.getElementById("scoreboardTable");
    tableScore.innerHTML = tHead + tMiddle + tEnd;

    tHead = `<thead>
        <tr>
          <th class="tg-18eh" colspan="2">5ª Dado</th>
          <th class="tg-18eh">Fim de<br>Jogo</th>
          <th class="tg-18eh">Sua Pontuação</th>
        </tr>
      </thead>
      <tbody>`;

    tMiddle = '';
    cont = 0;
    for (const [key, value] of Object.entries(fifthDice)) {
      tMiddle += `<tr>
        <td class="tg-18eh">${key}</td>
        <td class="tg-18eh">`;
        
        for (let i = 1; i <= 7; i++)
          if (value >= i )
            tMiddle += `☑️`;
          else
            tMiddle += `⬜`;

        tMiddle += `</td>
          <td class="tg-18eh">${(value == 8 ? '☑️' : '⬜')}</td>
          ${(cont == 0 ? '<td class="tg-18eh" rowspan="3">' + scoreTotal + '</td>' : '')}
        </tr>`;

        cont++;
    }

    for (let i = 3 - cont; i > 0; i--)
      tMiddle += `<tr>
        <td class="tg-18eh">&nbsp;&nbsp;</td>
        <td class="tg-18eh">⬜⬜⬜⬜⬜⬜⬜</td>
        <td class="tg-18eh">⬜</td>
      </tr>`;
    
    tEnd = `</tbody>`;

    const table5thDice = document.getElementById("fiftyDiceTable");
    table5thDice.innerHTML = tHead + tMiddle + tEnd;

    sock.emit('message', sock.playername + ' tem ' + scoreTotal + ' pontos');
    sock.emit('reportScore', scoreTotal);

    if (fifthDice[f] >= 8) {
        sock.emit('message', 'Jogo terminou para ' + sock.playername);
        //sock.emit('statusChanged');
    }
}

function onDiceRolled(sock, dataDices, dataChoices) {
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
    let pular = [];
    let optionHTML = [];

    //Montar as saídas para cada possibilidade de escolha    
    dataChoices.forEach((choice) => {        
        var c = choice.split('');

        optionHTML.push(`<tr>
            <td class="tg-9wq8"><img src="img/dice${c[0]}.png" alt="" class="fifthdice-choice" /></td>
            <td class="tg-9wq8"><img src="img/dice${c[1]}.png" alt="" class="dice-choice" /></td>
            <td class="tg-9wq8"><img src="img/dice${c[2]}.png" alt="" class="dice-choice" /></td>
            <td class="tg-9wq8"> =${parseInt(c[1]) + parseInt(c[2])}</td>
            <td class="tg-9wq8"><img src="img/dice${c[3]}.png" alt="" class="dice-choice" /></td>
            <td class="tg-9wq8"><img src="img/dice${c[4]}.png" alt="" class="dice-choice" /></td>
            <td class="tg-9wq8"> =${parseInt(c[3]) + parseInt(c[4])}</td>
            <td class="tg-9wq8"><button id="choice${i}" value="${i}" class="btnChoice" onclick>Escolher</button> </td>
            </tr>`);

        if (Object.keys(fifthDice).length >= 3 && !(c[0] in fifthDice))
            pular.push(true);
        else
            pular.push(false);

        i++;
    });

    //percorre as escolhas decidindo quem mostra e quem pular
    for(let j = 0; j < pular.length; j++) {
        //mostra a opção se não estiver marcada para pular 
        // ou se todas as opções estiverem (jogada grátis)
        if (!pular[j] || pular.every((p) => p === true))
            table.innerHTML += optionHTML[j];
    }

    table.innerHTML += `</tbody>`;

    pular.forEach((pula, idx) => {
        if (!pula) {
            document
            .getElementById("choice" + idx)
            .addEventListener('click', onBtnChoiceClick(sock));            
        }
    });
};

(() => {

    let players = [];

    const sock = io();

    sock.on('message', log);

    sock.on('loginEvent', (data) => onNotifyLoginEvent(data));

    sock.on('diceRolled', (dataDices, dataChoices) => onDiceRolled(sock, dataDices, dataChoices));

    sock.on('playerListUpdated', (data) => onPlayerListUpdated(data, players));

    sock.on('close modal', () => {
        disableFormElems(false);
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