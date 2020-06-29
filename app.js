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
    const _prompt = (elem) => {
      // handle incoming arguments
      const _buildBoard = () => (elem === 'init-board');
      const _buildMatrix = () => (elem === 'init-matrix');
      const _checkForWin = () => (elem === 'XXX' || elem === 'OOO');
      const _findNulls = () => (elem === 'nulls');
      const _stopClick = () => (elem === 'disable-click');
      const _showChamp = () => (elem[0] === 'champ');
      const _showDraw = () => (elem === 'draw');

      const _matrix = (
        _buildMatrix() ||
        _checkForWin() ||
        _showDraw()    ||
        _findNulls()  ) ? getMatrix() : null;

      const _coords = (_showChamp()) ? elem[1] : null;
      const _nulls = (_findNulls()) ? [] : null;

      for (let _row = 0; _row < 3; _row++) {

        if (_buildMatrix()) _createRow();

        if (_checkForWin() && elem === _matrix[_row].join('')) {
          _prompt('disable-click');
          return [[_row, 0], [_row, 1], [_row, 2], 'coords'];
        }

        let _pillar = (_checkForWin) ? '' : null;

        for (let _column = 0; _column < 3; _column++) {
          if (_buildMatrix()) _createCell(_row, _column);
          if (_buildBoard()) display.cell.render(_row, _column);
          if (_checkForWin()) {
            _pillar += _matrix[_column][_row];
          }
          if (_findNulls() && _matrix[_row][_column] === null) {
            _nulls.push([_row, _column]);
          }
          if (_stopClick()) display.cell.grab(_row, _column).disabled = true;
          if (_showChamp()) display.animate.champion(_row, _column, _coords);
          if (_showDraw()) display.animate.tie(_row, _column);
        }
        if (_checkForWin() && elem === _pillar) {
          _prompt('disable-click');
          return [[0, _row], [1, _row], [2, _row], 'coords'];
        }
      }
      if (_buildMatrix()) elem = _matrix;
      if (_findNulls()) elem = _nulls;

      return elem;
    };
    const getMatrix = () => _matrix;
    const clear = () => {
      return _matrix = [];
    };
    const command = (elem) => _prompt(elem); 

  return { getMatrix, clear, command };
  })();

  const ai = (() => {
    const _nulls = () => matrix.command('nulls');

    const tieOrAutoWin = (currentMark) => {
      let _matrix = matrix.getMatrix();
      let _which = (currentMark === 'X');
      let _mark = (_which) ? currentMark : 'O';
      let _otherMark = (_which) ? 'O' : 'X';
      let _spaces = _nulls();
      let _coord = (_spaces !== []) ? _spaces.pop() : false;

      if (_coord) {
        _matrix[ _coord[0] ][ _coord[1] ] = _mark;

        if (matrix.command(_mark.repeat(3))[3] !== 'coords') {
          return tieOrAutoWin(_otherMark);
        }
        else {
          let _turn = (_which) ? 0 : 1;
          players.winner.save(_turn);
          display.cell.renderMark(_coord[0], _coord[1], _mark);
          return matrix.command(['champ', matrix.command(_mark.repeat(3))]);
        }
      }
      else {
        matrix.command('disable-click');
        return matrix.command('draw');
      }
    };

    return {
      tieOrAutoWin,
    }
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

    const _toggle = (currentButton, otherButton) => {
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
      _homescreen.id = 'homescreen';

      const logo = document.createElement('p');
      logo.id = 'logo';
      logo.innerText = 'TIC TAC TOE';

      const author = document.createElement('p');
      author.id = 'author';
      author.innerText = 'by matchewbie'

      const onePlayer = document.createElement('button');
      const twoPlayer = document.createElement('button');
      const _stylePlayerSelect = (howMany) => {
        let _which = (howMany === 'one');
        let _player = (_which) ? onePlayer : twoPlayer;
        let _other = (_which) ? twoPlayer : onePlayer;
        let btnStatus = (_which) ? 'btn-group-active' : 'btn-group-inactive';
        _player.id = `${howMany}-player`;
        _player.innerText = (_which) ? 's i n g l e' : 'v s';
        _player.classList.add(btnStatus);
        _player.onmouseenter = () => _toggle(_player, _other);
        if (_which) {
          _player.disabled = true;
        }
        else {
          _player.onclick = () => nextScreen(login, 0);
        }
      };
      _stylePlayerSelect('one');
      _stylePlayerSelect('two');
      [logo, onePlayer, twoPlayer, author].forEach(elem => {
        _homescreen.appendChild(elem);
      });
      return container.appendChild(_homescreen), animate.homeLoad();
    };
    const login = () => {
      const _playerOne = document.createElement('input');
      const _playerTwo = document.createElement('input');
      const _stylePrompt = (mark) => {
        let _which = (mark === 'X');
        let _player = (_which) ? _playerOne : _playerTwo;
        _player.id = (_which) ? 'login-one' : 'login-two';
        _player.placeholder = `Player ${mark}`;
        _player.oninput = () => {
          let _input = () => document.getElementById(_player.id);
          if (_input().value.length > 12) {
            let _text = _input().value;
            _text = _text.substring(0, _text.length - 1);
            _input().value = _text;
          }
          else {
            return true;
          } 
        }
        _player.style.visibility = 'hidden';

      };
      _stylePrompt('X');
      _stylePrompt('O');

      const _login = document.createElement('button');
      const _name = (user, createPlayer) => {
        if (user.value === '') {
          return createPlayer(user.placeholder);
        }
        else {
          return createPlayer(user.value);
        }
      };
      _login.id = 'login';
      _login.innerText = 'l o g i n';
      _login.style.opacity = '0';
      _login.onclick = () => {
        _name(_playerOne, players.playerOne);
        _name(_playerTwo, players.playerTwo);
        return animate.gameOpening.start();
      };

      [_playerOne, _playerTwo, _login].forEach(elem => {
        container.appendChild(elem);
      });

      animate.loginLoad();
    };
    const nav = (drawOrWin) => {
      const _reset = document.createElement('button');
      const _logout = document.createElement('button');

      _reset.id = 'reset';
      _reset.innerText = 'r e s e t';
      _reset.classList.add('btn-group-active');
      _reset.onmouseenter = () => _toggle(_reset, _logout);
      _reset.onclick = () => game.reset();

      _logout.id = 'logout';
      _logout.innerText = 'l o g o u t';
      _logout.classList.add('btn-group-inactive');
      _logout.onmouseenter = () => _toggle(_logout, _reset);
      _logout.onclick = () => {
        container.innerHTML = '';
        game.reset(false);
        players.clear();
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
      _message.innerText = 'a w  ,  D R A W';
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
      let _winner = players.winner.grab().name();
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
    const animate = (() => {
      const homeLoad = () => {
        const _message = document.getElementById('logo');
        const _author = document.getElementById('author');
        const _single = document.getElementById('one-player');
        const _vs = document.getElementById('two-player');

        return setTimeout(() => {
          _message.style.color = 'blanchedalmond';
        }, 250),
        setTimeout(() => {
          _author.style.color = 'burlywood';
        }, 250),
        setTimeout(() => {
          _single.style.visibility = 'visible';
          _vs.style.visibility = 'visible';
        }, 1250);
      };
      const loginLoad = () => {
        const p1 = document.getElementById('login-one');
        const p2 = document.getElementById('login-two');
        const log = document.getElementById('login');
  
        return [p1, p2].forEach(elem => {
          setTimeout(() => {
              elem.style.visibility = 'visible';
          }, 250);
        }),
          setTimeout(() => {
            log.style.transition = '2s';
            log.style.opacity = '1';
          }, 250),
          setTimeout(() => {
            log.style.transition = 'none';
          }, 1000);
      }
      const gameOpening = (() => {
        let _board = matrix.getMatrix();
  
        const tic = () => {
          _board[1][0] = cell.renderMark(1,0,'T');
          _board[1][1] = cell.renderMark(1,1,'I');
          _board[1][2] = cell.renderMark(1,2,'C');
          matrix.command('disable-click');
          return matrix.command(['champ', [[1, 0], [1, 1], [1, 2]]]);
        };
        const tac =  () => {
          game.reset();
          _board[0][1] = cell.renderMark(0,1,'T');
          _board[1][1] = cell.renderMark(1,1,'A');
          _board[2][1] = cell.renderMark(2,1,'C');
          matrix.command('disable-click');
          return matrix.command(['champ', [[0, 1], [1, 1], [2, 1]]]);
        };
        const toe = () => {
          game.reset();
          _board[0][0] = cell.renderMark(0,0,'T');
          _board[1][1] = cell.renderMark(1,1,'O');
          _board[2][2] = cell.renderMark(2,2,'E');
          matrix.command('disable-click');
          return matrix.command(['champ', [[0, 0], [1, 1], [2, 2]]]);
        };
        const start = (funk) => {
          _funk = funk || tic;
          game.start();
          return _funk();
        };
  
        return {
          tic,
          tac,
          toe,
          start
        }
      })();
      const _ticTacToe = (cell, previousCell) => {
        if (cell.innerText === 'C') {
          const _nextWord = (funk) => {
            return setTimeout(() => {
              gameOpening.start(funk);
            }, 1250);
          };
          let _previous = document.getElementById(previousCell).innerText;
  
          if (_previous === 'I') {
            return _nextWord(gameOpening.tac);
          }
          if (_previous === 'A') {
            return _nextWord(gameOpening.toe);
          }
        }
        if (cell.innerText === 'E') {
          return setTimeout(() => {
            container.style.opacity = '0';
            setTimeout(() => {
              game.reset();
              container.style.opacity = '1';
            }, 1000);
          }, 1500);
        }
      };
      const _blackout = (spot, coords, milliseconds) => {
        cell.renderMark(coords[0], coords[1], 'blackout');
        spot.classList.add('blackout');
        spot.style.borderColor = '#222222';
        setTimeout(() => {
          spot.style.background = 'none';
        }, milliseconds);
      };
      const tie = (row, column) => {
        let _cell = cell.grab(row, column);
        _blackout(_cell, [row, column], 310);
        if (row + column === 4) {
          return nextScreen(draw, 1030);
        }
      };
      const champion = (row, column, coords) => {
        let _command = (coords[3] === 'coords') ? coords.pop() : 'opening';
  
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
          _blackout(_cell, [row, column], 2523);
        }
  
        if (_command === 'opening') _ticTacToe(_cell, _champCell2());
        if (_command === 'coords') nextScreen(win, 3335);
      };
      return {
        homeLoad,
        loginLoad,
        gameOpening,
        tie,
        champion
      }
    })();

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
      animate
    };
  })();

  return { matrix, ai, players, display }
})();



const Player = (playerName, xOrO) => {
  const _name = playerName;
  const name = () => _name;
  const whichMark = () => xOrO;
  return {
    name,
    whichMark
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
  const _mark = (row, column, mark) => {
    if (_secureInput(mark)) {
      virtualBoard.display.cell.renderMark(row, column, mark);
      _clickCount++;
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
  const clickHandler = (event) => {
                                  // array of split string: 'cell-[num]x[num]'
    let _id = virtualBoard.display.cell.grab(event.target.id).id.split(''),
        _row = _id[5],
        _column = _id[7],
        _player = _currentPlayer();

    if (_emptyCell(_row, _column)) {
      _mark(_row, _column, _player.whichMark());

      let _matrix = virtualBoard.matrix;
      let _coords = _logic(_player);
      
      if (_clickCount > 4 && _coords[3] === 'coords') {
        virtualBoard.players.winner.save(_turn);
        return _matrix.command(['champ', _coords]);
      }
      if (_clickCount > 7) {
        virtualBoard.ai.tieOrAutoWin(_currentPlayer().whichMark());
      }
      _changePlayer();
    }
  };
  const start = () => {
    virtualBoard.display.container.innerHTML = '';
    _board = _initMatrix();
    return 0;
  };
  const reset = (command) => {
    _command = command || null;
    virtualBoard.matrix.clear();
    _clickCount = 0;
    _turn = 0;
    if (!_command) start();
  };
  return { clickHandler, start, reset }
})();


