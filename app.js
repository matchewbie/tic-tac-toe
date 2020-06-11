const displayController = (() => {
  const _container = document.getElementById('container');
  const initBoard = () => {
    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 3; column++) {
        let _cell = document.createElement('div');
        _cell.id = 'cell-' + row + 'x' + column;
        _container.innerHTML += _cell.outerHTML;
      }
    }
  };
  const renderCell = (row, column, mark) => {
    let id = 'cell-' + row + 'x' + column;
    let cell = document.getElementById(id);
    console.log(cell);
    return cell.innerText = mark;
  };
  return { initBoard, renderCell }
})();

const gameBoard = (() => {
  displayController.initBoard();

  // build 3x3 matrix of empty strings
  const _initMatrix = () => {
    let matrix = [];
    for (let row = 0; row < 3; row++) {
      matrix.push([]);
      for (let column = 0; column < 3; column++) {
        matrix[row][column] = ' ';
        displayController.renderCell(row, column, ' ');
      }
    }
    return matrix;
  };
  let _matrix = _initMatrix();
  const _getMatrix = () => _matrix;   // <<-- for DEV only // delete!
  const _secureInput = (mark) => (mark === 'X' || mark === 'O');
  const _emptyCell = (row, column) => (_matrix[row][column] === ' ');
  const reset = () => _matrix = _initMatrix();
  const playerInput = (row, column, mark) => {
    if (_emptyCell(row, column) && _secureInput(mark)) {
      displayController.renderCell(row, column, mark);
      return _matrix[row][column] = mark;
    }
  };
  return { _getMatrix, reset, playerInput }
})();   // _getMatrix included for DEV // delete!



const Player = (xOrO) => {
  const _getPlayer = () => xOrO;
  const current = () => _getPlayer();
  const mark = (row, column) => {
    return gameBoard.playerInput(row, column, _getPlayer());
  };
  return { current, mark }
};



const player1 = Player('X');
const player2 = Player('O');
