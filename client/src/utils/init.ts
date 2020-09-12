let setRem = () => {
  let curWidth = document.documentElement.clientWidth || window.screen.width;
  const basicWidth = 375;
  const basicFontSize = 20;
  let calcFontSize = 0;
  curWidth = curWidth > 640 ? 640 : curWidth < 320 ? 320 : curWidth;
  calcFontSize = (curWidth / basicWidth) * basicFontSize;
  document.documentElement.style.fontSize = calcFontSize + 'px';
};
setRem();
window.addEventListener('resize', () => {
  setRem();
});
