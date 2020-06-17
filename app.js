                                                              /**
                                                               *  virtual board
                                                               */
const virtualBoard = (() => {
  const matrixCommand = (elem) => {
                                                   // handle incoming arguments
    const _buildBoard = () => (elem === 'init-board');
    const _buildMatrix = () => (elem === 'init-matrix');
    const _checkForWin = () => (elem[0] === 'XXX' || elem[0] === 'OOO');
    const _checkForTie = () => (elem[0] === 'tie');
    const _disableClick = () => (elem === 'disable-click');
    const _showChamp = () => (elem[0] === 'champ');

    let _newMatrix = (_buildMatrix()) ? [] : null;
    let _coords = (_showChamp()) ? elem[1] : null;

    for (let _row = 0; _row < 3; _row++) {
      
      if (_buildMatrix()) _newMatrix.push([]);

      if (_checkForWin() && elem[0] === elem[1][_row].join('')) {
        matrixCommand('disable-click');
        return [[_row, 0], [_row, 1], [_row, 2], 'coords'];
      }

      let _pillar = (_checkForWin) ? '' : null;

      for (let _column = 0; _column < 3; _column++) {
        if (_buildBoard()) {
          let _cell = document.createElement('button');
              _cell.id = display.cell.getId(_row, _column);
          display.container.innerHTML += _cell.outerHTML;
        }
        if (_buildMatrix()) {
          _newMatrix[_row][_column] = null;
          display.cell.renderCell(_row, _column, ' ');

          let _cell = display.cell.getCell(_row, _column);

          _cell.addEventListener('click', (_event) => {
            game.clickHandler(_event);
          });
          _cell.addEventListener('mouseleave', () => {
            _cell.classList.remove('hover');
          });
          _cell.addEventListener('mouseenter', () => {
              _cell.classList.add('hover');
          });
        }
        if (_checkForWin()) {
          let _matrix = elem[1];
          _pillar += _matrix[_column][_row];
        }
        if (_disableClick()) {
          display.cell.getCell(_row, _column).disabled = true;
        }
        if (_checkForTie()) {
          // TODO
        }
        if (_showChamp()) {
              // extract winning squares' coordinates from elem to complete ids
          const _champCell1 = () => `cell-${_coords[0][0]}x${_coords[0][1]}`;
          const _champCell2 = () => `cell-${_coords[1][0]}x${_coords[1][1]}`;
          const _champCell3 = () => `cell-${_coords[2][0]}x${_coords[2][1]}`;
                                               // return current cell of matrix
          const _displayedCell = () => display.cell.getId(_row, _column);

          const _tic = () => (_displayedCell() === _champCell1());
          const _tac = () => (_displayedCell() === _champCell2());
          const _toe = () => (_displayedCell() === _champCell3());
          
          let _cell = display.cell.getCell(_row, _column);

          if (_tic() || _tac() || _toe()) {
            _cell.classList.remove('blackout');
            _cell.classList.add('blink');
            _cell.style.borderColor = '#222222';
            _cell.classList.add('glow');
            _cell.classList.remove('blink');
          }
          else {
            display.cell.renderCell(_row, _column, 'blackout');
            _cell.classList.add('blackout');
            _cell.style.borderColor = '#222222';
            setTimeout(() => {
              _cell.style.background = 'none';
            }, 2523);
          }
        }
      }
      if (_checkForWin() && elem[0] === _pillar) {
        matrixCommand('disable-click');
        elem = [[0, _row], [1, _row], [2, _row], 'coords'];
      }
    }
    if (_buildMatrix()) elem = _newMatrix;
    
    console.log(elem);
    return elem;
  };
  const display = (() => {
    const container = document.getElementById('container');

    const homeScreen = document.createElement('button');    //    TODO
    homeScreen.id = 'homescreen';
    homeScreen.innerText = 'START';
    container.innerHTML = homeScreen.outerHTML;

    const champ = (coords) => matrixCommand(['champ', coords]);
    const initBoard = () => matrixCommand('init-board');

    const cell = (() => {
      const getId = (_row, _column) => 'cell-' + _row + 'x' + _column;
      const getCell = (_row, _column) => {
        if (isNaN(_row)) {
          return document.getElementById(_row);
        }
        else {
          return document.getElementById(getId(_row, _column));
        }
      };
      const renderCell = (_row, _column, _mark) => {
        if (_mark === 'blackout') _mark = ' ';
        return getCell(_row, _column).innerText = _mark;
      };
      return { getCell, getId, renderCell }
    })();
    return { container, homeScreen, champ, initBoard, cell }
  })();
  return { matrixCommand, display }
})();


                                                             /**
                                                              *  player factory
                                                              */
const Player = (xOrO) => {
  const _getPlayer = () => xOrO;
  const whichMark = () => _getPlayer();
  const mark = (row, column, changePlayerFunc) => {
    return game.playerInput(row, column, _getPlayer(), changePlayerFunc);
  };
  return { mark, whichMark }
};


                                                                   /**
                                                                    *  gameplay
                                                                    */
const game = (() => {
  let _matrix = null;

  const _players = () => [ Player('X'), Player('O') ];

                                                     // build 3x3 matrix object
   const _initMatrix = () => {
    virtualBoard.display.initBoard();
    return virtualBoard.matrixCommand('init-matrix');
  };
  const _getMatrix = () => _matrix;                     // for DEV only, delete
  const _secureInput = (mark) => (mark === 'X' || mark === 'O');
  const _emptyCell = (row, column) => (_matrix[row][column] === null);

  let _clickCount = 0;

  const playerInput = (row, column, mark, changePlayerFunc) => {
    if (_emptyCell(row, column) && _secureInput(mark)) {

      virtualBoard.display.cell.renderCell(row, column, mark);
      
      let _cell = virtualBoard.display.cell.getCell(row, column);
      
      _cell.classList.add('blackout');
      _cell.removeEventListener('mouseleave', () => {
        _cell.classList.remove('dim');
      });
      _cell.removeEventListener('mouseenter', () => {
        if (_cell.innerText !== 'X' || _cell.innerText !== 'O') {
          _cell.classList.add('dim');
        }
      });
      changePlayerFunc();
      _clickCount++;
      return _matrix[row][column] = mark;
    }
  };
  const _winLogic = (player) => {
    const _checkRowsAndColumns = (symbol) => {
      return virtualBoard.matrixCommand([symbol, _matrix]);
    };
    const _checkDiags = (symbol) => {
      const _backslash = _matrix[0][0] + _matrix[1][1] + _matrix[2][2];
      const _forwardslash = _matrix[0][2] + _matrix[1][1] + _matrix[2][0];
      if (symbol === _backslash) {
        virtualBoard.matrixCommand('disable-click');
        return [[0, 0], [1, 1], [2, 2], 'coords'];
      }
      if (symbol === _forwardslash) {
        virtualBoard.matrixCommand('disable-click');
        return [[0, 2], [1, 1], [2, 0], 'coords'];
      }
    };


    // ***** implement in matrixCommand to check next player's mark to auto tie
    const _checkTie = () => {
      return virtualBoard.matrixCommand(['tie', player, _matrix]);
    };
    // *******************************************************************

    let symbol = player.whichMark();
    let diagSymbol = symbol + symbol + symbol;
    let iterativeSymbol = symbol + symbol + symbol;

    if (_checkDiags(diagSymbol)) {
      return _checkDiags(diagSymbol);
    }
    else if (_checkRowsAndColumns(iterativeSymbol)) {
      return _checkRowsAndColumns(iterativeSymbol);
    }
    else {
      if (_clickCount > 7 && _checkTie()) {
        return _checkTie();
      }
    }
    // console.log(symbol);
  };
  
  
  let _turn = 0;
  const _currentPlayer = () => {
    return _players()[_turn];
  };
  const _changePlayer = () => {
    _turn = (_turn === 0) ? _turn + 1 : _turn - 1;
    return _currentPlayer();
  };
  const _sendOutcome = (player) => {
    let _result = _winLogic(player);
    _result.pop();
    return _result;
  };
  const clickHandler = (event) => {
                                   // array of split string: 'cell-[num]x[num]'
    let _id = virtualBoard.display.cell.getCell(event.target.id).id.split(''),
        _row = _id[5],
        _column = _id[7],
        _player = _currentPlayer();
    _currentPlayer().mark(_row, _column, _changePlayer);

    if (_clickCount > 4 && _winLogic(_player)[3] === 'coords') {
      let ion = _sendOutcome(_player);
      virtualBoard.display.champ(ion);

      let _cells = [
        virtualBoard.display.cell.getCell(ion[0][0], ion[0][1]),
        virtualBoard.display.cell.getCell(ion[1][0], ion[1][1]),
        virtualBoard.display.cell.getCell(ion[2][0], ion[2][1])
      ];
      setTimeout(() => {
        for (let _cell in _cells) {
          _cells[_cell].classList.add('blackout');
        }
      }, 1315);
      setTimeout(() => {
        for (let _cell in _cells) {
          _cells[_cell].style.opacity = 0;
        }
      }, 2325);

    }
  };
  const start = () => {
    virtualBoard.display.container.innerHTML = '';
    _matrix = _initMatrix();
    return 0;
  };
  const reset = () => {
    _clickCount = 0;
    _turn = 0;
    return start();
  };
  return { _getMatrix, playerInput, clickHandler, start, reset }
})();   // _getMatrix for DEV only - delete

let home = document.getElementById('homescreen');
home.addEventListener('click', () => game.start());
