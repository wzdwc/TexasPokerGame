import { Poker } from '../../src/app/core/Poker';

function calcProb(times: number, players: number) {
  let sameColorCount = 0;

  for (let i = 0; i < times; i++) {
    const poker = new Poker();

    // should send cards to players
    for (let j = 0; j < players * 2; j++) {
      poker.getCard();
    }

    // fire one card
    poker.getCard();

    const cards: string[] = [];
    cards.push(poker.getCard());
    cards.push(poker.getCard());
    cards.push(poker.getCard());
    if (cards[0][1] === cards[1][1] && cards[1][1] === cards[2][1]) {
      sameColorCount += 1;
    }
  }

  console.log(
    `---times:${times}, players:${players}, same color count:${sameColorCount}, prob:${
      (sameColorCount / times) * 100
    }%`,
  );
}

for (let players = 2; players < 10; players++) {
  calcProb(50, players);
}
