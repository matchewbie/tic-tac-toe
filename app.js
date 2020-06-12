/**
 *  virtual board
 */
const gameBoard = (() => {
  const _iterateMatrix = (elem) => {
    const _isBoard = (elem === 'initBoard');
    const _isMatrix = (typeof(elem) === 'object');
    for (let row = 0; row < 3; row++) {
      if (_isMatrix) elem.push([]);
      for (let column = 0; column < 3; column++) {
        if (_isBoard) {
          let _cell = document.createElement('button');
          _cell.id = 'cell-' + row + 'x' + column;
          display.container.innerHTML += _cell.outerHTML;
        }
        if (_isMatrix) {
          elem[row][column] = ' ';
          display.renderCell(row, column, ' ');
        }
      }
    }
    return elem;
  };
  const display = (() => {
    const container = document.getElementById('container');
    const initBoard = () => _iterateMatrix('initBoard');
    const renderCell = (row, column, mark) => {
      let id = 'cell-' + row + 'x' + column;
      let cell = document.getElementById(id);
      return cell.innerText = mark;
    };
    return { container, initBoard, renderCell }
  })();
  display.initBoard();
  // build 3x3 matrix object
  const _initMatrix = () => {
    let _newMatrix = [];
    _newMatrix = _iterateMatrix(_newMatrix);
    return _newMatrix;
  };
  let _matrix = _initMatrix();
  const _getMatrix = () => _matrix;
  const _secureInput = (mark) => (mark === 'X' || mark === 'O');
  const _emptyCell = (row, column) => (_matrix[row][column] === ' ');
  const reset = () => _matrix = _initMatrix();
  const playerInput = (row, column, mark, changePlayerFunc) => {
    if (_emptyCell(row, column) && _secureInput(mark)) {
      display.renderCell(row, column, mark);
      changePlayerFunc();
      return _matrix[row][column] = mark;
    }
  };
  const win = (player) => {
    const _symbolHandler = (symbol) => {
      let tempSymbol = symbol.split('');
      symbol = tempSymbol[0];
      return symbol;
    };
    const _checkRows = (symbol) => {
      for (let row = 0; row < 3; row++) {
        if (symbol === _matrix[row].join('')) {
          return _symbolHandler(symbol);
        }
      }
    };
    const _checkColumns = (symbol) => {
      for (let column = 0; column < 3; column++) {
        let vertical = '';
        for (let row = 0; row < 3; row++) {
          vertical += _matrix[row][column];
        }
        if (symbol === vertical) {
          return _symbolHandler(symbol);
        }
      }
    };
    const _checkDiagonals = (symbol) => {
      const backslash = _matrix[0][0] + _matrix[1][1] + _matrix[2][2];
      const forwardslash = _matrix[0][2] + _matrix[1][1] + _matrix[2][0];
      if (symbol === backslash || symbol === forwardslash) {
        return _symbolHandler(symbol);
      }
    };
    let symbol = player.whichMark();
        symbol += symbol + symbol;
    if (_checkRows(symbol)) {
      return console.log('Player ' + _checkRows(symbol) + ' wins!');
    }
    if (_checkColumns(symbol)) {
      return console.log('Player ' + _checkColumns(symbol) + ' wins!');
    }
    if (_checkDiagonals(symbol)) {
      return console.log('Player ' + _checkDiagonals(symbol) + ' wins!');
    }
    // if (_checkTie){

    // }
  };
  return { _getMatrix, reset, playerInput, win }
})();   // _getMatrix included for DEV // delete!


/**
 *  player factory 
 */
const Player = (xOrO) => {
  const _getPlayer = () => xOrO;
  const whichMark = () => _getPlayer();
  const mark = (row, column, changePlayerFunc) => {
    return gameBoard.playerInput(row, column, _getPlayer(), changePlayerFunc);
  };
  return { mark, whichMark }
};


/**
 *  gameplay
 */
const game = (() => {
  const players = [ Player('X'), Player('O') ];
  const _buttons = document.querySelectorAll('button');
  let turn = 0;
  const _currentPlayer = () => {
    return players[turn];
  };
  const _changePlayer = () => {
    turn = (turn === 0) ? turn + 1 : turn - 1;
    return _currentPlayer();
  };
  const _checkOutcome = (player) => gameBoard.win(player);
  const _clickHandler = (event) => {
    let _cell = document.getElementById(event.target.id),
        _id = _cell.id.split(''), // array of split string 'cell-*x*'
        row = _id[5],
        column = _id[7],
        player = _currentPlayer();
    player.mark(row, column, _changePlayer);
    return _checkOutcome(player);
  };
  const reset = () => {
    return turn = 0, gameBoard.reset();
  };
  _buttons.forEach(button => button.addEventListener('click', (event) => {
    _clickHandler(event);
  }));
  return { reset }
})();
