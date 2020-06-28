const virtualBoard = (() => {

  const matrix = (() => {
    let _matrix = [];
    const _createRow = () => _matrix.push([]);
    const _createCell = (row, column) => {
      _matrix[row][column] = null;
      display.cell.renderMark(row, column, ' ');
  
      let _cell = display.cell.grab(row, column);

      _cell.addEventListener('mouseenter', () => {
        _cell.classList.add('hover');
      });
      _cell.addEventListener('mouseleave', () => {
        _cell.classList.remove('hover');
      });
      _cell.addEventListener('click', (event) => {
        game.clickHandler(event);
      });
    };
    const _getNullCoords = () => command('nulls');
    const getMatrix = () => _matrix;
    const clear = () => {
      return _matrix = [];
    };
    const command = (elem) => {
      // handle incoming arguments
      const _buildBoard = () => (elem === 'init-board');
      const _buildMatrix = () => (elem === 'init-matrix');
      const _checkForWin = () => (elem === 'XXX' || elem === 'OOO');
      const _checkForTie = () => (elem[0] === 'tie');
      const _findNulls = () => (elem === 'nulls');
      const _stopClick = () => (elem === 'disable-click');
      const _showChamp = () => (elem[0] === 'champ');
      const _showDraw = () => (elem === 'draw');

      const _matrix = (
        _buildMatrix() ||
        _checkForWin() ||
        _checkForTie() ||
        _showDraw()    ||
        _findNulls()  ) ? getMatrix() : null;

      const _coords = (_showChamp()) ? elem[1] : null;
      const _player = (_checkForTie()) ? elem[1] : null;
      const _nulls = (_findNulls()) ? [] : null;

      for (let _row = 0; _row < 3; _row++) {

        if (_buildMatrix()) _createRow();

        if (_checkForWin() && elem === _matrix[_row].join('')) {
          command('disable-click');
          return [[_row, 0], [_row, 1], [_row, 2], 'coords'];
        }

        let _pillar = (_checkForWin) ? '' : null;

        for (let _column = 0; _column < 3; _column++) {
          if (_buildMatrix()) _createCell(_row, _column);
          if (_buildBoard()) display.cell.render(_row, _column);
          if (_checkForWin()) {
            _pillar += _matrix[_column][_row];
          }
          if (_checkForTie() && _matrix[_row][_column] === null) {
            //////////////////////    check out findNulls   \\\\\\\\\\\\\\\\\\\\\
            _matrix[_row][_column] = _player;

            if (command(_player.repeat(3))[3] !== 'coords' && _row + _column === 4) {
              command('disable-click');
              return command('draw');
            }
            else {
              _matrix[_row][_column] = null;
            }

          }
          if (_findNulls() && _matrix[_row][_column] === null) {
            _nulls.push([_row, _column]);
          }
          if (_stopClick()) display.cell.grab(_row, _column).disabled = true;
          if (_showChamp()) display.animateChampion(_row, _column, _coords);
          if (_showDraw()) display.animateDraw(_row, _column);
        }
        if (_checkForWin() && elem === _pillar) {
          command('disable-click');
          return [[0, _row], [1, _row], [2, _row], 'coords'];
        }
      }
      if (_buildMatrix()) elem = _matrix;
      if (_findNulls()) elem = _nulls;

      return elem;
    };
  return { getMatrix, clear, command };
  })();

  const ai = (() => {
    
  })();

  const players = (() => {
    let _players = [];
    const grab = (index) => _players[index];
    const playerOne = (name) => {
      _players.push(Player(name, 'X'));
    };
    const playerTwo = (name) => {
      _players.push(Player(name, 'O'));
    };
    const winner = (() => {
      let _winner = '';
      const save = (index) => {
        _winner = _players[index];
      }
      const grab = () => _winner;
      return { save, grab }
    })();
    const clear = () => {
      return _players = [];
    };
    return {
      grab,
      playerOne,
      playerTwo,
      winner,
      clear
    }
  })();

  const display = (() => {

    const _toggleButtonHover = (currentButton, otherButton) => {
      currentButton.classList.remove('btn-group-inactive');
      currentButton.classList.add('btn-group-active');
      otherButton.classList.remove('btn-group-active');
      otherButton.classList.add('btn-group-inactive');
    };

    const container = document.getElementById('container');
    const initBoard = () => matrix.command('init-board');
    const cell = (() => {
      const getId = (row, column) => 'cell-' + row + 'x' + column;
      const grab = (row, column) => {
        if (isNaN(row)) {
          return document.getElementById(row);
        }
        else {
          return document.getElementById(getId(row, column));
        }
      };
      const render = (row, column) => {
        let _cell = document.createElement('button');
        _cell.id = display.cell.getId(row, column);
        display.container.appendChild(_cell);
      };
      const renderMark = (row, column, mark) => {
        if (mark === 'blackout') mark = ' ';
        return grab(row, column).innerText = mark;
      };

      return { grab, getId, render, renderMark }
    })();
    const nextScreen = (screen, milliseconds) => {
      setTimeout(() => {
        container.innerHTML = '';
        screen();
      }, milliseconds);
    };
    const home = () => {
      const _homescreen = document.createElement('p');
      const logo = document.createElement('p');
      const author = document.createElement('p');
      const onePlayer = document.createElement('button');               //  TODO
      const twoPlayer = document.createElement('button');

      _homescreen.id = 'homescreen';

      logo.id = 'logo';
      logo.innerText = 'TIC TAC TOE';

      author.id = 'author';
      author.innerText = 'by matchewbie'

      onePlayer.id = 'one-player';
      onePlayer.innerText = 's i n g l e';
      onePlayer.classList.add('btn-group-active');
      onePlayer.onmouseenter = () => _toggleButtonHover(onePlayer, twoPlayer);
      onePlayer.disabled = true;                                  // delete later
      
      twoPlayer.id = 'two-player';
      twoPlayer.innerText = 'v s';
      twoPlayer.classList.add('btn-group-inactive');
      twoPlayer.onmouseenter = () => _toggleButtonHover(twoPlayer, onePlayer);
      twoPlayer.onclick = () => nextScreen(login, 0);


      [logo, onePlayer, twoPlayer, author].forEach(elem => {
        _homescreen.appendChild(elem);
      });

      return container.appendChild(_homescreen),
             setTimeout(() => {
               let _message = document.getElementById('logo');
               _message.style.color = 'blanchedalmond';
             }, 250),
             setTimeout(() => {
               let _author = document.getElementById('author');
               _author.style.color = 'burlywood';
             }, 250),
             setTimeout(() => {
               let _single = document.getElementById('one-player');
               let _vs = document.getElementById('two-player');
               _single.style.visibility = 'visible';
               _vs.style.visibility = 'visible';
             }, 1250);;
    };
    const login = () => {
      const _name = (player, funk) => {
        if (player.value === '') {
          return funk(player.placeholder);
        }
        else {
          return funk(player.value);
        }
      };
      const _playerOne = document.createElement('input');
      const _playerTwo = document.createElement('input');
      const _login = document.createElement('button');

      _playerOne.id = 'login-one';
      _playerOne.placeholder = 'Player X';
      _playerOne.style.visibility = 'hidden';

      _playerTwo.id = 'login-two';
      _playerTwo.placeholder = 'Player O';
      _playerTwo.style.visibility = 'hidden';
      
      _login.id = 'login';
      _login.innerText = 'l o g i n';
      _login.style.opacity = '0';
      _login.onclick = () => {
        _name(_playerOne, players.playerOne);
        _name(_playerTwo, players.playerTwo);
        return game.start();
      };

      [_playerOne, _playerTwo, _login].forEach(elem => {
        container.appendChild(elem);
      });

      const p1 = document.getElementById('login-one');
      const p2 = document.getElementById('login-two');
      const log = document.getElementById('login');

      return [p1, p2].forEach(elem => {
        setTimeout(() => {
            elem.style.visibility = 'visible';
        }, 425);
      }),
        setTimeout(() => {
          log.style.transition = '2s';
          log.style.opacity = '1';
        }, 250),
        setTimeout(() => {
          log.style.transition = '250ms';
        }, 2000);;
    };
    const nav = (drawOrWin) => {
      const _reset = document.createElement('button');
      const _logout = document.createElement('button');

      _reset.id = 'reset';
      _reset.innerText = 'r e s e t';
      _reset.classList.add('btn-group-active');
      _reset.onmouseenter = () => _toggleButtonHover(_reset, _logout);
      _reset.onclick = () => game.reset();

      _logout.id = 'logout';
      _logout.innerText = 'l o g o u t';
      _logout.classList.add('btn-group-inactive');
      _logout.onmouseenter = () => _toggleButtonHover(_logout, _reset);
      _logout.onclick = () => {
        game.reset();
        virtualBoard.players.clear();
        return nextScreen(home, 0);
      };

      [_reset, _logout].forEach(elem => {
        drawOrWin.appendChild(elem);
      });
    };
    const draw = () => {
      const _draw = document.createElement('div');
      const _message = document.createElement('div');
      _draw.id = 'end';
      _message.id = 'message';
      _message.innerText = 'D R A W';
      _draw.appendChild(_message);
      nav(_draw);
      return container.appendChild(_draw),
             setTimeout(() => {
               let _message = document.getElementById('message');
               _message.style.color = 'blanchedalmond';
             }, 250);

    };
    const win = () => {
      const _win = document.createElement('div');
      const _message = document.createElement('p');
      let _winner = players.winner.grab().name;
      _win.id = 'end';
      _message.id = 'message';
      _message.innerText = `Well done, ${_winner}`;
      _win.appendChild(_message);
      nav(_win);
      return container.appendChild(_win),
             setTimeout(() => {
              let _message = document.getElementById('message');
               _message.style.color = 'blanchedalmond';
             }, 250);
    };
    const animateBlackout = (spot, coords, milliseconds) => {
      cell.renderMark(coords[0], coords[1], 'blackout');
      spot.classList.add('blackout');
      spot.style.borderColor = '#222222';
      setTimeout(() => {
        spot.style.background = 'none';
      }, milliseconds);
    };
    const animateDraw = (row, column) => {
      let _cell = display.cell.grab(row, column);
      display.animateBlackout(_cell, [row, column], 310);
      if (row + column === 4) {
        return nextScreen(draw, 1030);
      }
    };
    const animateChampion = (row, column, coords) => {
      // extract winning squares' coordinates from elem to complete ids
      const _champCell1 = () => `cell-${coords[0][0]}x${coords[0][1]}`;
      const _champCell2 = () => `cell-${coords[1][0]}x${coords[1][1]}`;
      const _champCell3 = () => `cell-${coords[2][0]}x${coords[2][1]}`;
                                       // return current cell of matrix
      const _displayedCell = () => cell.getId(row, column);

      const _tic = () => (_displayedCell() === _champCell1());
      const _tac = () => (_displayedCell() === _champCell2());
      const _toe = () => (_displayedCell() === _champCell3());

      let _cell = cell.grab(row, column);

      if (_tic() || _tac() || _toe()) {
        _cell.classList.remove('blackout');
        _cell.classList.add('blink');
        _cell.style.borderColor = '#222222';
        _cell.classList.add('glow');
        _cell.classList.remove('blink');
        setTimeout(() => {
          _cell.classList.add('blackout');
        }, 1315);
        setTimeout(() => {
          _cell.style.opacity = 0;
        }, 2325);
      }
      else {
        animateBlackout(_cell, [row, column], 2523);
      }
      nextScreen(win, 3335);
    };

    return home(), {
      container,
      initBoard,
      cell,
      nextScreen,
      home,
      login,
      nav,
      draw,
      win,
      animateBlackout,
      animateDraw,
      animateChampion
    };
  })();

  return { matrix, players, display }
})();



const Player = (playerName, xOrO) => {
  const name = playerName;
  const whichMark = () => xOrO;
  const mark = (row, column) => {
    return game.playerInput(row, column, whichMark());
  };
  return {
    name,
    whichMark,
    mark
  }
};



const game = (() => {
  let _board = virtualBoard.matrix.getMatrix();
  let _clickCount = 0;
  let _turn = 0;

  const _players = () => {
    return [ 
      virtualBoard.players.grab(0),
      virtualBoard.players.grab(1)
    ];
  };
  const _currentPlayer = () => _players()[_turn];
  const _changePlayer = () => {
    _turn = (_turn === 0) ? _turn + 1 : _turn - 1;
    return _currentPlayer();
  };
  const _initMatrix = () => {
    virtualBoard.display.initBoard();
    return virtualBoard.matrix.command('init-matrix');
  };
  const _secureInput = (mark) => (mark === 'X' || mark === 'O');
  const _emptyCell = (row, column) => (_board[row][column] === null);
  const playerInput = (row, column, mark) => {
    if (_secureInput(mark)) {
      virtualBoard.display.cell.renderMark(row, column, mark);
      _clickCount++;
      // _changePlayer();
      return _board[row][column] = mark;
    }
  };
  const _logic = (player) => {
    let _symbol = player.whichMark().repeat(3);

    const _checkRowsAndColumns = (symbol) => {
      return virtualBoard.matrix.command(symbol);
    };
    const _checkDiags = (symbol) => {
      const _backslash = _board[0][0] + _board[1][1] + _board[2][2];
      const _forwardslash = _board[0][2] + _board[1][1] + _board[2][0];
      if (symbol === _backslash) {
        virtualBoard.matrix.command('disable-click');
        return [[0, 0], [1, 1], [2, 2], 'coords'];
      }
      if (symbol === _forwardslash) {
        virtualBoard.matrix.command('disable-click');
        return [[0, 2], [1, 1], [2, 0], 'coords'];
      }
    };

    if (_checkDiags(_symbol)) {
      return _checkDiags(_symbol);
    }
    if (_checkRowsAndColumns(_symbol)) {
      return _checkRowsAndColumns(_symbol);
    }
    // console.log(symbol);
  };
  const _sendOutcome = (player) => {
    let _result = _logic(player);
    _result.pop();
    return _result;
  };
  const clickHandler = (event) => {
                                  // array of split string: 'cell-[num]x[num]'
    let _id = virtualBoard.display.cell.grab(event.target.id).id.split(''),
        _row = _id[5],
        _column = _id[7],
        _player = _currentPlayer();

    if (_emptyCell(_row, _column)) {
      _player.mark(_row, _column);

      let _query = _logic(_player);
      
      if (_clickCount > 4 && _query[3] === 'coords') {
        let _coords = _sendOutcome(_player);
        virtualBoard.players.winner.save(_turn);
        virtualBoard.matrix.command(['champ', _coords]);
      }
      _changePlayer();

      if (_clickCount > 7 && _query[3] !== 'coords') {
        virtualBoard.matrix.command(['tie', _currentPlayer().whichMark()]);
      }
    }
  };
  const start = () => {
    virtualBoard.display.container.innerHTML = '';
    _board = _initMatrix();
    return 0;
  };
  const reset = () => {
    virtualBoard.matrix.clear();
    _clickCount = 0;
    _turn = 0;
    return start();
  };
  return { _players, playerInput, clickHandler, start, reset }
})();

console.log( { virtualBoard, game } ); // delete



const viewportHandler = () => {
  let width = window.innerWidth ||
              document.documentElement.clientWidth ||
              document.body.clientWidth;
  let height = window.innerHeight ||
               document.documentElement.clientHeight ||
               document.body.clientHeight;

  const _logo = document.getElementById('logo');
  const _author = document.getElementById('author');
  const _onePlayer = document.getElementById('one-player');
  const _twoPlayer = document.getElementById('two-player');
  const _login = document.getElementById('login');
  const _reset = document.getElementById('reset');
  const _logout = document.getElementById('logout');

  if (width > height) {    
    return virtualBoard.display.container.style.height = '95vh',
           virtualBoard.display.container.style.width = '100vh',
           virtualBoard.display.container.style.margin = '2vh auto 0 auto',
           _logo.style.margin = '20vh auto 0 auto';
  }

  if (width < height) {
    return () => {
      virtualBoard.display.container.style.height = '100vw',
      virtualBoard.display.container.style.width = '95vw',
      virtualBoard.display.container.style.margin = '2vw auto 0 auto',

      _logo.style.margin = '20vw auto 0 auto',
      _logo.style.fontSize = '14vw',
      
      _author.style.margin = '55vw auto 0 auto',
      _author.style.fontSize = '4vw',
      
      _onePlayer.style.margin = '35vw auto 0 auto',
      _onePlayer.style.height = '18vw',
      _onePlayer.style.borderRadius = '5vw 5vw 10vw 10vw',
      _onePlayer.style.fontSize = '8vw',
      
      _twoPlayer.style.margin = '51vw auto 0 auto',
      _twoPlayer.style.height = '18vw',
      _twoPlayer.style.borderRadius = '5vw 5vw 10vw 10vw',
      _twoPlayer.style.fontSize = '8vw',
      
      _login.style.margin = '70vw auto 0 auto',
      _login.style.height = '18vw',
      _login.style.borderRadius = '5vw 5vw 10vw 10vw',
      _login.style.fontSize = '8vw',
      
      _reset.style.margin = '35vw auto 0 auto',
      _reset.style.height = '18vw',
      _reset.style.borderRadius = '5vw 5vw 10vw 10vw',
      _reset.style.fontSize = '8vw',
      
      _logout.style.margin = '51vw auto 0 auto',
      _logout.style.height = '18vw',
      _logout.style.borderRadius = '5vw 5vw 10vw 10vw',
      _logout.style.fontSize = '8vw';
      
    }
  }
};

window.addEventListener('orientationchange', viewportHandler)
