
function convertBase( numberString, fromBase, toBase ) {
  let numberToTen = toTen(numberString, fromBase)
  let str = ''
  while (numberToTen) {
    let toNumber = numberToTen % toBase.base
    str += toBase.map[toNumber]
    numberToTen = Math.floor(numberToTen / toBase.base)
  }
  return str
}

function toTen(numberString, fromBase) {
  let baseMap = fromBase.map.split('')
  let numberArr = numberString.split('')
  let sum = 0
  for (let i = 0; i <= numberArr.length - 1; i++) {
    let currNumber = numberArr[i]
    let baseIndex = baseMap.findIndex(b => b === currNumber)
    sum += ((baseIndex + 1) * fromBase.base ** (numberArr.length - 1 - i))
  }
  return sum
}
