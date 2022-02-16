class Roll {

    constructor(dice1 = this.rollDie(), dice2 = this.rollDie(), 
                dice3 = this.rollDie(), dice4 = this.rollDie(), 
                dice5 = this.rollDie()) {
        this.dices = [dice1, dice2, dice3, dice4, dice5];
        this.dices.sort();
        this.choices = [];
        this.possibleChoices();
    }

    possibleChoices() {
        let ps = [];
        for(let i = 0; i < 5; i++){
            if (i > 0 && this.dices[i] === this.dices[i-1])
                continue;

            var dados = this.dices.slice();
            var fifth = dados.splice(i,1);
            var p1 = '' + dados[0] + dados[1];
            var p2 = '' + dados[2] + dados[3];

            var p3 = '' + dados[0] + dados[2];
            var p4 = '' + dados[1] + dados[3];

            var p5 = '' + dados[0] + dados[3];
            var p6 = '' + dados[1] + dados[2];

            var pos1 = fifth + p1 + p2;
            var pos2 = fifth + p3 + p4;
            var pos3 = fifth + p5 + p6;
            
            ps.push(pos1);
            ps.push(pos2);
            if (p3 !== p6 && p4 !== p5)
                ps.push(pos3);
        }

        this.choices = [...new Set(ps)];
    }

    rollDie() {
        const number = Math.ceil(Math.random() * 6);
        return number;
    }
}

module.exports = Roll;

//let j = new Jogada(1, 1, 1, 4, 5);
//let j = new Jogada();
//console.log(j);