export default (cards: string []) => {
  const cardNumber = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
  const color = ['♦', '♣', '♥', '♠'];
  return cards?.map((c: string) => {
    const cNumber = c.charCodeAt(0) - 97;
    const cColor = Number(c[1]) - 1;
    return [`${cardNumber[cNumber]}`, `${color[cColor]}`];
  });
};
