const game = (() => {

  const matrix = (() => {
    let _matrix = [];
    const _createRow = () => _matrix.push([]);
    const _createCell = (row, column) => {
      _matrix[row][column] = null;
    };
    const _prompt = (cmd) => {
      // handle incoming arguments
      const buildBoard  = () => (cmd.is === 'init-board');
      const buildMatrix = () => (cmd.is === 'init-matrix');
      const checkForWin = () => (cmd.is === 'XXX' || cmd.is === 'OOO');
      const findNulls   = () => (cmd.is === 'nulls');
      const decideMark  = () => (cmd.is === 'mark');
      const maximizing  = () => (cmd.is === 'maximize');
      const minimizing  = () => (cmd.is === 'minimize');
      const stopClick   = () => (cmd.is === 'disable-click');
      const startClick  = () => (cmd.is === 'enable-click');
      const showChamp   = () => (cmd.is === 'champ');
      const showDraw    = () => (cmd.is === 'draw');

      const _matrix = (
        buildMatrix() ||
        checkForWin() ||
        showDraw()    ||
        findNulls()   ||
        decideMark()  ||
        maximizing()  ||
        minimizing() ) ? getMatrix() : null;
      const _nulls = (
        findNulls()  ) ? [] : null;
      const _ai = (
        decideMark() ||
        maximizing() ||
        minimizing()) ? gameplay.ai : null;
      const _computer = (
        decideMark() ||
        maximizing()) ? players.grab(1).whichMark() : null;
      const _user = (
        minimizing() ) ? players.grab(0).whichMark() : null;
      let _best = (
        decideMark() ||
        maximizing()) ? -Infinity : Infinity;

      if (decideMark() && gameplay.round.clicks() === 1) {
        return _ai.optimizeFirstMove(_matrix);
      }

      for (let row = 0; row < 3; row++) {

        if (buildMatrix()) _createRow();
        if (checkForWin() && cmd.is === _matrix[row].join('')) {
          return [[row, 0], [row, 1], [row, 2], 'coords'];
        }
        let _pillar = (checkForWin) ? '' : null;

        for (let column = 0; column < 3; column++) {
          const _isNull = () => (_matrix[row][column] === null);
          if (buildMatrix()) _createCell(row, column);
          if (buildBoard()) display.cell.render(row, column);
          if (checkForWin()) {
            _pillar += _matrix[column][row];
          }
          if (findNulls() && _isNull()) {
            _nulls.push([row, column]);
          }
          if (decideMark() && _isNull()) {
            _matrix[row][column] = _computer;
            let _value = _ai.minimax(_matrix, -Infinity, Infinity, false);
            _matrix[row][column] = null;
            if (_value > _best) {
              _ai.move.save(row, column);
              _best = _value;
            }
          }
          if (maximizing() && _isNull()) {
            _matrix[row][column] = _computer;
            let _value =
              _ai.minimax(_matrix, cmd.alpha, cmd.beta, !cmd.maximizing);
            _best = Math.max(_best, _value);
            _matrix[row][column] = null;
            cmd.alpha = Math.max(cmd.alpha, _best);
            if (cmd.alpha >= cmd.beta){
              return _best;
            }
          }
          if (minimizing() && _isNull()) {
            _matrix[row][column] = _user;
            let _value =
              _ai.minimax(_matrix, cmd.alpha, cmd.beta, !cmd.maximizing);
            _best = Math.min(_best, _value);
            _matrix[row][column] = null;
            cmd.beta = Math.min(cmd.beta, _best);
            if (cmd.beta <= cmd.alpha) {
              return _best;
            }
          }
          if (stopClick()) display.cell.grab(row, column).disabled = true;
          if (startClick()) display.cell.grab(row, column).disabled = false;
          if (showChamp()) display.animate.champion(row, column, cmd.coords);
          if (showDraw()) display.animate.tie(row, column);
        }
        if (checkForWin() && cmd.is === _pillar) {
          return [[0, row], [1, row], [2, row], 'coords'];
        }
      }
      if (buildMatrix()) cmd = _matrix;
      if (findNulls()) cmd = _nulls;
      if (decideMark() ||
          maximizing() ||
          minimizing()) cmd = _best;

      return cmd;
    };
    const getMatrix = () => _matrix;
    const clear = () => {
      return _matrix = [];
    };
    const command = (cmd) => _prompt(cmd); 

  return { getMatrix, clear, command };
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
    const device = document.getElementById('device');
    const container = document.getElementById('container');
    const initBoard = () => matrix.command({is: 'init-board'});
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
        _cell.id = getId(row, column);
        container.appendChild(_cell);
        renderMark(row, column, ' ');
  
        _cell = grab(row, column);

        _cell.addEventListener('mouseenter', () => {
          _cell.classList.add('hover');
        });
        _cell.addEventListener('mouseleave', () => {
          _cell.classList.remove('hover');
        });
        _cell.addEventListener('click', (event) => {
          gameplay.clickHandler(event);
        });
      };
      const renderMark = (row, column, mark) => {
        if (mark === 'blackout') mark = ' ';
        return grab(row, column).innerText = mark;
      };
      return {
        grab,
        getId,
        render,
        renderMark
      }
    })();
    const nextScreen = (screen, milliseconds) => {
      setTimeout(() => {
        container.innerHTML = '';
        screen();
        device.style.backgroundColor = '#111111';
        device.style.opacity = '1';
        device.style.zIndex = '100';
        device.style.transition = '250ms';
        
        setTimeout(() => {
          device.style.opacity = '0';
          device.style.zIndex = '-1';
        }, 250);
      }, milliseconds);
    };
    const _toggle = (currentButton, otherButton) => {
      currentButton.classList.remove('btn-group-inactive');
      currentButton.classList.add('btn-group-active');
      otherButton.classList.remove('btn-group-active');
      otherButton.classList.add('btn-group-inactive');
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
      const _playerSelect = (howMany) => {
        const _select = (screen) => {
          const _selection = () => {
            animate.navClick(_player);
            setTimeout(() => {
              device.style.opacity = '1';
              device.style.zIndex = '420666';
            }, 125);
            setTimeout(() => {
              device.style.opacity = '0';
              device.style.zIndex = '-1';
              device.style.transition = '250ms';
              nextScreen(screen, 0);
            }, 250);
          };
          _player.onmouseup = (event) => {
            event.preventDefault();
            _selection();
          };
          _player.ontouchend = (event) => {
            event.preventDefault();
            _selection();
          };
        };
        let _which = (howMany === 'one');
        let _player = (_which) ? onePlayer : twoPlayer;
        let _other = (_which) ? twoPlayer : onePlayer;
        let btnStatus = (_which) ? 'btn-group-active' : 'btn-group-inactive';
        _player.id = `${howMany}-player`;
        _player.innerText = (_which) ? 's i n g l e' : 'v s';
        _player.classList.add(btnStatus);
        _player.onmouseenter = () => _toggle(_player, _other);
        _player.ontouchstart = (event) => {
          event.preventDefault();
          let _view = (_player.style.height === '18vh') ? 'vh' : 'vw';
          _player.style.backgroundColor = 'burlywood';
          _player.style.color = '#222222';
          _player.style.boxShadow = `0 0 3.5${_view} burlywood`;
          _player.style.webkitBoxShadow = `0 0 3.5${_view} burlywood`;
          _player.style.mozBoxShadow = `0 0 3.5${_view} burlywood`;
          _player.style.zIndex = '50';
          _other.style.background = 'none';
          _other.style.color = 'burlywood';
          _other.style.textShadow = `0 0 0.75${_view} burlywood`;
          _other.style.boxShadow = `0 0 4.75${_view} burlywood inset`;
          _other.style.webkitBoxShadow = `0 0 4.75${_view} burlywood inset`;
          _other.style.mozBoxShadow = `0 0 4.75${_view} burlywood inset`;
        };
        if (_which) {
          _select(single);
        }
        else {
          _select(vs);
        }
      };
      _playerSelect('one');
      _playerSelect('two');

      const _horizon = document.createElement('div');
      _horizon.id = 'horizon';

      let _which = (_horizon.style.height === '44.5vh') ? 'vh' : 'vw';
      if (_which === 'vh') {
        _horizon.style.width = `100${_which}`;
        _horizon.style.top = `33${_which}`;
      }
      else {
        _horizon.style.width = `95${_which}`;
        _horizon.style.top = `67.5${_which}`;
      }
      
      _horizon.style.zIndex = '-1';
      _horizon.style.opacity = '0';
      _horizon.style.transition = '2000ms';

      [logo, onePlayer, twoPlayer, author, _horizon].forEach(elem => {
        _homescreen.appendChild(elem);
      });
      container.appendChild(_homescreen);
      animate.homeLoad();
    };
    const single = () => {
      const _helloUser = document.createElement('div');
      const _you = document.createElement('input');

      _helloUser.id = 'greeting';
      _helloUser.style.opacity = '0';

      let _text = [
        'hello, User',
        'my name is O',
        'enter an alias below',
        'or do not, User',
        'you shall not defeat O'
      ];

      _you.id = 'you';
      _you.placeholder = 'User';
      _you.oninput = () => {

        let _input = () => document.getElementById(_you.id);
        const _nonAlpha = /[^a-z]/gi;
        let _value = _input().value;

        if (_nonAlpha.test(_value)) {
          _input().value = _value.replace(_nonAlpha, '');
        }
        
        if (_value.length > 12) {
          let _text = _value;
          _text = _text.substring(0, _text.length - 1);
          _input().value = _text;
        }
      }
      _you.style.visibility = 'hidden';

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
      _login.style.borderColor = '#111111';
      _login.style.opacity = '0';
      _login.ontouchstart = (event) => {
        event.preventDefault();
        _login.style.backgroundColor = 'burlywood';
        _login.style.color = '#222222';
      };
      _login.onmouseup = (event) => {
        event.preventDefault();
        animate.navClick(_login);
        device.style.opacity = '1';
        device.style.zIndex = '100';
        setTimeout(() => {
          _name(_you, players.playerOne);
          players.playerTwo('c0mput3r');
          device.style.opacity = '0';
          device.style.zIndex = '-1';
          return animate.gameOpening.start();
        }, 250);
      };
      _login.ontouchend = (event) => {
        event.preventDefault();
        animate.navClick(_login);
        device.style.opacity = '1';
        device.style.zIndex = '100';
        setTimeout(() => {
          _name(_you, players.playerOne);
          players.playerTwo('c0mput3r');
          device.style.opacity = '0';
          device.style.zIndex = '-1';
          return animate.gameOpening.start();
        }, 250);
      };

      const _singleScreen = document.createElement('div');
      _singleScreen.id = 'homescreen';
      _singleScreen.style.background = 'none';

      [_helloUser, _you, _login].forEach(elem => {
        _singleScreen.appendChild(elem);
      });

      container.appendChild(_singleScreen);

      animate.loginLoad();
      animate.aiSay(_text, 'greeting');
    };
    const vs = () => {
      const _playerOne = document.createElement('input');
      const _playerTwo = document.createElement('input');
      const _stylePrompt = (mark) => {
        let _which = (mark === 'X');
        let _player = (_which) ? _playerOne : _playerTwo;
        _player.id = (_which) ? 'login-one' : 'login-two';
        _player.placeholder = `Player ${mark}`;
        _player.oninput = () => {
          
          let _input = () => document.getElementById(_player.id);
          const _nonAlpha = /[^a-z]/gi;
          let _value = _input().value;

          if (_nonAlpha.test(_value)) {
            _input().value = _value.replace(_nonAlpha, '');
          }
          
          if (_value.length > 12) {
            let _text = _value;
            _text = _text.substring(0, _text.length - 1);
            _input().value = _text;
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
      _login.style.borderColor = '#111111';
      _login.style.opacity = '0';
      _login.ontouchstart = (event) => {
        event.preventDefault();
        _login.style.backgroundColor = 'burlywood';
        _login.style.color = '#222222';
      };
      _login.onmouseup = (event) => {
        event.preventDefault();
        animate.navClick(_login);
        device.style.opacity = '1';
        device.style.zIndex = '100';
        setTimeout(() => {
          _name(_playerOne, players.playerOne);
          _name(_playerTwo, players.playerTwo);
          device.style.opacity = '0';
          device.style.zIndex = '-1';
          return animate.gameOpening.start();
        }, 250);
      };
      _login.ontouchend = (event) => {
        event.preventDefault();
        animate.navClick(_login);
        device.style.opacity = '1';
        device.style.zIndex = '100';
        setTimeout(() => {
          _name(_playerOne, players.playerOne);
          _name(_playerTwo, players.playerTwo);
          device.style.opacity = '0';
          device.style.zIndex = '-1';
          return animate.gameOpening.start();
        }, 250);
      };

      const _vsScreen = document.createElement('div');
      _vsScreen.id = 'homescreen';

      [_playerOne, _playerTwo, _login].forEach(elem => {
        _vsScreen.appendChild(elem);
      });

      container.appendChild(_vsScreen);

      animate.loginLoad();
    };
    const nav = (drawOrWin) => {
      const _reset = document.createElement('button');
      const _logout = document.createElement('button');

      _reset.id = 'reset';
      _reset.innerText = 'r e m a t c h';
      _reset.classList.add('btn-group-active');
      _reset.onmouseenter = (event) => {
        event.preventDefault();
        _toggle(_reset, _logout);
      };
      _reset.ontouchstart = (event) => {
        event.preventDefault();
        let _view = (_reset.style.height === '18vh') ? 'vh' : 'vw';
        _reset.style.backgroundColor = 'burlywood';
        _reset.style.color = '#222222';
        _reset.style.boxShadow = `0 0 3.5${_view} burlywood`;
        _reset.style.webkitBoxShadow = `0 0 3.5${_view} burlywood`;
        _reset.style.mozBoxShadow = `0 0 3.5${_view} burlywood`;
        _reset.style.zIndex = '50';
        _logout.style.background = 'none';
        _logout.style.color = 'burlywood';
        _logout.style.textShadow = `0 0 0.75${_view} burlywood`;
        _logout.style.boxShadow = `0 0 4.75${_view} burlywood inset`;
        _logout.style.webkitBoxShadow = `0 0 4.75${_view} burlywood inset`;
        _logout.style.mozBoxShadow = `0 0 4.75${_view} burlywood inset`;
      };
      _reset.onmouseup = (event) => {
        event.preventDefault();
        animate.navClick(_reset);
        device.style.backgroundColor = 'blanchedalmond';
        device.style.opacity = '1';
        device.style.zIndex = '100';
        device.style.transition = '125ms';
        setTimeout(() => {
          gameplay.reset();
          device.style.opacity = '0';
          device.style.zIndex = '-1';
          device.style.transition = '250ms';
        }, 125);
      }
      _reset.ontouchend = (event) => {
        event.preventDefault();
        animate.navClick(_reset);
        device.style.backgroundColor = 'blanchedalmond';
        device.style.opacity = '1';
        device.style.zIndex = '100';
        device.style.transition = '125ms';
        setTimeout(() => {
          gameplay.reset();
          device.style.opacity = '0';
          device.style.zIndex = '-1';
          device.style.transition = '250ms';
        }, 125);
      };

      _logout.id = 'logout';
      _logout.innerText = 'l o g o u t';
      _logout.classList.add('btn-group-inactive');
      _logout.onmouseenter = (event) => {
        event.preventDefault();
        _toggle(_logout, _reset);
      };
      _logout.ontouchstart = (event) => {
        event.preventDefault();
        let _view = (_reset.style.height === '18vh') ? 'vh' : 'vw';
        _logout.style.backgroundColor = 'burlywood';
        _logout.style.color = '#222222';
        _logout.style.boxShadow = `0 0 3.5${_view} burlywood`;
        _logout.style.webkitBoxShadow = `0 0 3.5${_view} burlywood`;
        _logout.style.mozBoxShadow = `0 0 3.5${_view} burlywood`;
        _logout.style.zIndex = '50';
        _reset.style.background = 'none';
        _reset.style.color = 'burlywood';
        _reset.style.textShadow = `0 0 0.75${_view} burlywood`;
        _reset.style.boxShadow = `0 0 4.75${_view} burlywood inset`;
        _reset.style.webkitBoxShadow = `0 0 4.75${_view} burlywood inset`;
        _reset.style.mozBoxShadow = `0 0 4.75${_view} burlywood inset`;
      };
      _logout.onmouseup = (event) => {
        event.preventDefault();
        animate.navClick(_logout);
        device.style.backgroundColor = '#111111';
        device.style.opacity = '1';
        device.style.zIndex = '100';
        device.style.transition = '250ms';
        setTimeout(() => {
          container.innerHTML = '';
          gameplay.reset(false);
          players.clear();
          device.style.opacity = '0';
          device.style.zIndex = '-1';
          device.style.transition = '250ms';
          return nextScreen(home, 0);
        }, 250);
      };
      _logout.ontouchend = (event) => {
        event.preventDefault();
        animate.navClick(_logout);
        device.style.backgroundColor = '#111111';
        device.style.opacity = '1';
        device.style.zIndex = '100';
        device.style.transition = '250ms';
        setTimeout(() => {
          container.innerHTML = '';
          gameplay.reset(false);
          players.clear();
          device.style.opacity = '0';
          device.style.zIndex = '-420';
          device.style.transition = '250ms';
          return nextScreen(home, 0);
        }, 250);
      };
     

      [_reset, _logout].forEach(elem => {
        drawOrWin.appendChild(elem);
      });
    };
    const draw = () => {
      const _draw = document.createElement('div');
      const _thaddeus = document.createElement('iframe');
      const _message = document.createElement('p');

      _draw.id = 'end';
      _thaddeus.id = 'thaddeus';
      _thaddeus.src = './meow.html';
      _message.id = 'message';

      let _text = ['that\'s a scratch.'];

      [_thaddeus, _message].forEach(elem => {
        _draw.appendChild(elem);
      });

      container.appendChild(_draw);

      animate.aiSay(_text, 'message');

      device.style.opacity = '1';
      device.style.zIndex = '100';
      device.style.transition = '250ms';

      setTimeout(() => {
        device.style.opacity = '0';
        device.style.zIndex = '-420';
      }, 250);

      setTimeout(() => {
        let _message = document.getElementById('message');
        let _thaddeus = document.getElementById('thaddeus');

        _thaddeus.style.opacity = '1';

        setTimeout(() => {
          nav(document.getElementById('end'));  
        }, 2750);
        

        setTimeout(() => {
          _message.style.opacity = '0';
        }, 5000);
        setTimeout(() => {
          _message.style.opacity = '1';
          _message.innerHTML = '';
          animate.aiSay(['thanks for playing.'], 'message');
        }, 35000);
      }, 250);

    };
    const win = () => {
      const _win = document.createElement('div');
      const _robot = document.createElement('iframe');
      const _champ = document.createElement('iframe');
      const _message = document.createElement('p');
      let _winner = players.winner.grab().name();
      let _loser = players.grab(0).name();

      _win.id = 'end';
      _robot.id = 'robot';
      _robot.src = './computer.html';
      _champ.id = 'champ';
      _champ.src = './champ.html';
      _message.id = 'message';

      let _text = null;

      if (_winner === 'c0mput3r') {
        _text = [`${_loser}, don't cry.`];
        _win.appendChild(_robot);
      }
      else {
        _text = [`${_winner}, the champion.`];
        _win.appendChild(_champ);
      }
      _win.appendChild(_message);

      container.appendChild(_win);

      animate.aiSay(_text, 'message');

      device.style.opacity = '1';
      device.style.zIndex = '100';
      device.style.transition = '250ms';      

      setTimeout(() => {
        device.style.opacity = '0';
        device.style.zIndex = '-420';
      }, 250);

      setTimeout(() => {
        let _message = document.getElementById('message');
        let _robot = document.getElementById('robot');
        let _champ = document.getElementById('champ');

        if (_robot !== null) {
          _robot.style.opacity = '1';
        }

        if (_champ !== null) {
          _champ.style.opacity = '1';
        }

        setTimeout(() => {
          nav(document.getElementById('end'));
        }, 2750);
        
        setTimeout(() => {
          _message.style.opacity = '0';
        }, 5000);
        setTimeout(() => {
          _message.style.opacity = '1';
          _message.innerHTML = '';
          animate.aiSay(['thanks for playing.'], 'message');
        }, 35000);
      }, 250);
    };
    const animate = (() => {
      const mark = (button) => {
        button.classList.add('mark');
        setTimeout(() => {
          button.classList.remove('mark');
        }, 75);
      };
      const navClick = (button) => {
        button.style.border = 'none';
        button.style.transition = '125ms';
        button.style.backgroundColor = 'blanchedalmond';
        setTimeout(() => {
          button.style.backgroundColor = 'burlywood';
          button.style.color = '#111111';
        }, 125);

      };
      const homeLoad = () => {
        const _logo = document.getElementById('logo');
        const _author = document.getElementById('author');
        const _single = document.getElementById('one-player');
        const _vs = document.getElementById('two-player');
        const _horizon = document.getElementById('horizon');

        device.style.opacity = '1';
        device.style.zIndex = '100';

        setTimeout(() => {
          device.style.opacity = '0';
          device.style.zIndex = '-420';
          _logo.style.opacity = '1';
          _author.style.opacity = '0.1';
        }, 325);

        setTimeout(() => {
          _single.style.visibility = 'visible';
          _vs.style.visibility = 'visible';
        
          _logo.style.transition = '725ms';
          let _which = (_logo.style.fontSize === '14vh') ? 'vh' : 'vw';
          _logo.style.textShadow = `0 0 50${_which} blanchedalmond`;

          _horizon.style.opacity = '1'

          device.style.transition = '250ms';
        }, 750);

        setTimeout(() => {
          let _which = (_logo.style.fontSize === '14vh') ? 'vh' : 'vw';
          _logo.style.textShadow = `0 0 0.75${_which} blanchedalmond`;
        }, 1375);
      };
      const aiSay = (text, id) => {
        let _screen = document.getElementById(id);
        text.forEach((frame, index) => {
          let _add = (index === 0) ? 575 : 1675 * (index + 1);
          let _remove = (index === 0) ? 3350 : 1675 + _add;
          let _scene = document.createElement('span');
          let _line = frame.split('');

          setTimeout(() => {
            _screen.appendChild(_scene);
          }, _add);
          if (index !== text.length - 1) {
            setTimeout(() => {
              _screen.removeChild(_scene);
            }, _remove);
          }

          let _lastMils = 0;

          _line.forEach((character, id) => {
            let _milliseconds = Math.floor(Math.random() * 125);
            let _letter = document.createElement('span');    
            
            _letter.id = `letter-${id}`;
            _letter.innerText = character;
            _letter.style.backgroundColor = 'burlywood';
            _letter.style.color = '#222222';

            setTimeout(() => {
              setTimeout(() => {
                _letter.style.background = 'none';
                _letter.style.color = 'burlywood';
                _letter.style.textShadow = '0 0 3vh burlywood';
              }, 75);
              _scene.appendChild(_letter);
            }, _milliseconds + _lastMils + _add);

            _lastMils += _milliseconds;       
          });
        });
      };
      const loginLoad = () => {
        const p1 = document.getElementById('login-one');
        const p2 = document.getElementById('login-two');
        const u = document.getElementById('you');
        const o = document.getElementById('greeting');
        const log = document.getElementById('login');
  
        device.style.opacity = '1';
        device.style.zIndex = '100';

        setTimeout(() => {
          device.style.opacity = '0';
          device.style.zIndex = '-420';
        }, 250);

        if (o !== null) {
          setTimeout(() => {
            o.style.opacity = '1';
          }, 125);
        }

        [p1, p2, u].forEach(elem => {
          if (elem !== null) {
            setTimeout(() => {
                elem.style.visibility = 'visible';
            }, 125);
          }
        });

        setTimeout(() => {
          log.style.transition = '1s';
          log.style.opacity = '1';
          log.style.transition = '2475ms';
          setInterval(() => {
            let _light = (log.style.borderColor === 'rgb(17, 17, 17)');
            let _which = (log.style.width === '18vh') ? 'vh' : 'vw';
            let _color = (_light) ? 'rgb(222, 184, 135)' : 'rgb(17, 17, 17)';
            
            log.style.borderColor = _color;
            
            if (_light) {
              log.style.boxShadow = `0 0 1${_which} ${_color}`;
              log.style.webkitBoxShadow = `0 0 1${_which} ${_color}`;
              log.style.mozBoxShadow = `0 0 1${_which} ${_color}`;
            }
            else {
              log.style.boxShadow = 'none';
              log.style.webkitBoxShadow = 'none';
              log.style.mozBoxShadow = 'none';
            }
          }, 2500);
        }, 275);
      };
      const gameOpening = (() => {
        let _board = matrix.getMatrix();
  
        const tic = () => {
          _board[1][0] = cell.renderMark(1,0,'T');
          _board[1][1] = cell.renderMark(1,1,'I');
          _board[1][2] = cell.renderMark(1,2,'C');
          matrix.command({is: 'disable-click'});
          let coords = [[1, 0], [1, 1], [1, 2]];
          return matrix.command({is: 'champ', coords});
        };
        const tac =  () => {
          gameplay.reset();
          _board[0][1] = cell.renderMark(0,1,'T');
          _board[1][1] = cell.renderMark(1,1,'A');
          _board[2][1] = cell.renderMark(2,1,'C');
          matrix.command({is: 'disable-click'});
          let coords = [[0, 1], [1, 1], [2, 1]];
          return matrix.command({is: 'champ', coords});
        };
        const toe = () => {
          gameplay.reset();
          _board[0][0] = cell.renderMark(0,0,'T');
          _board[1][1] = cell.renderMark(1,1,'O');
          _board[2][2] = cell.renderMark(2,2,'E');
          matrix.command({is: 'disable-click'});
          let coords = [[0, 0], [1, 1], [2, 2]];
          return matrix.command({is: 'champ', coords});
        };
        const start = (funk) => {
          _funk = funk || tic;
          gameplay.start();
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
            device.style.backgroundColor = 'blanchedalmond';
            device.style.opacity = '0';
            device.style.transition = '125ms';
            setTimeout(() => {
              gameplay.reset();
              container.style.opacity = '1';
              device.style.opacity = '1';
              device.style.zIndex = '100';
              setTimeout(() => {
                device.style.backgroundColor = '#111111';
                device.style.opacity = '0';
                device.style.zIndex = '-420';
                device.style.transition = '250ms';
              }, 125);
            }, 1000);
          }, 1250);
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
          device.style.backgroundColor = '#111111';
          setTimeout(() => {
            device.style.opacity = '1';
            device.style.zIndex = '100';
            device.style.transition = '250ms';
          }, 780);
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
          setTimeout(() => {
            _cell.classList.remove('blink');
            _cell.classList.add('glow');
          }, 375);
          setTimeout(() => {
            _cell.style.borderColor = '#222222';
          }, 415);
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
        if (_command === 'coords') {
          device.style.backgroundColor = '#111111';
          setTimeout(() => {
            device.style.opacity = '1';
            device.style.zIndex = '100';
            device.style.transition = '250ms';
          }, 3085);
          return nextScreen(win, 3335);
        }
      };
      return {
        mark,
        navClick,
        homeLoad,
        loginLoad,
        aiSay,
        gameOpening,
        tie,
        champion
      }
    })();

    return home(), {
      device,
      container,
      initBoard,
      cell,
      nextScreen,
      home,
      vs,
      nav,
      draw,
      win,
      animate
    };
  })();

  return { matrix, players, display }
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



const gameplay = (() => {

  const _players = () => {
    return [ 
      game.players.grab(0),
      game.players.grab(1)
    ];
  };

  const round = (() => {
    let _board = game.matrix.getMatrix();
    let _clickCount = 0;
    let _turn = 0;

    const click = () => {
      return _clickCount++;
    }
    const board = () => _board;
    const clicks = () => _clickCount;
    const turn = () => _turn;
    const currentPlayer = () => {
      return _players()[turn()];
    };
    const changePlayer = () => {
        return _turn = (_turn === 0) ? _turn + 1 : _turn - 1;
    };
    const reset = () => {
      return _turn = 0, _clickCount = 0;
    };
    const init = () => {
      game.display.initBoard();
      _board = game.matrix.command({is: 'init-matrix'});
    };
    return {
      click,
      board,
      clicks,
      turn,
      currentPlayer,
      changePlayer,
      reset,
      init
    }
  })();

  const _emptyCell = (row, column) => (round.board()[row][column] === null);
  const _mark = (row, column, mark) => {
    game.display.cell.renderMark(row, column, mark);
    game.display.cell.grab(row, column).style.borderColor = 'burlywood';
    round.click();
    return round.board()[row][column] = mark;
  };
  const clickHandler = (event) => {
    game.matrix.command({is: 'disable-click'});
    let _id = game.display.cell.grab(event.target.id).id.split(''),
        _row = _id[5],
        _column = _id[7];
    if (_emptyCell(_row, _column)) {
      game.display.animate.mark(game.display.cell.grab(_row, _column));
      _mark(_row, _column, round.currentPlayer().whichMark());
      ai.think();
      if (round.currentPlayer().name() === 'c0mput3r') {
        if (round.clicks() === 1) ai.move.save(_row, _column);
        setTimeout(() => {
          ai.mark();
          round.click();
          ai.think();
        }, 125);
      }
    }
    game.matrix.command({is: 'enable-click'});
  };
  const start = () => {
    game.display.container.innerHTML = '';
    
    const _backdrop = document.createElement('div');
    _backdrop.id = 'homescreen';
    _backdrop.style.zIndex = '-99';
    _backdrop.style.position = 'fixed';

    game.display.container.appendChild(_backdrop);
    round.init();
  };
  const reset = (command) => {
    _command = (command === undefined) ? true : command;
    game.matrix.clear();
    if (_command) {
      round.reset();
      return start();
    }
  };

  const ai = (() => {
    const move = (() => {
      let _move = {};
      const save = (_row, _column) => {
        _move.row = _row;
        _move.column = _column;
      };
      const row = () => _move.row;
      const column = () => _move.column;
      return {
        save,
        row,
        column
      }
    })();
    const logic = (player) => {
      let _symbol = player.whichMark().repeat(3);
  
      const _checkRowsAndColumns = (symbol) => {
        return game.matrix.command({is: symbol});
      };
      const _checkDiags = (symbol) => {
        const _board = round.board();
        const _backslash = _board[0][0] + _board[1][1] + _board[2][2];
        const _forwardslash = _board[0][2] + _board[1][1] + _board[2][0];
        if (symbol === _backslash) {
          return [[0, 0], [1, 1], [2, 2], 'coords'];
        }
        if (symbol === _forwardslash) {
          return [[0, 2], [1, 1], [2, 0], 'coords'];
        }
      };
  
      if (_checkDiags(_symbol)) {
        return _checkDiags(_symbol);
      }
      if (_checkRowsAndColumns(_symbol)) {
        return _checkRowsAndColumns(_symbol);
      }
    };
    const tieOrAutoWin = (currentMark) => {
      let _matrix = game.matrix.getMatrix();
      let _which = (currentMark === 'X');
      let _otherMark = (_which) ? 'O' : 'X';
      let _spaces = game.matrix.command({is: 'nulls'});   
      let _coord = (_spaces !== []) ? _spaces.pop() : false;

      if (_coord) {
        _matrix[ _coord[0] ][ _coord[1] ] = _otherMark;

        if (game.matrix.command(_otherMark.repeat(3))[3] !== 'coords') {
          return tieOrAutoWin(_otherMark);
        }
        else {
          let _turn = (_which) ? 1 : 0;
          game.players.winner.save(_turn);
          game.display.cell.renderMark(_coord[0], _coord[1], _otherMark);
          let coords = game.matrix.command(_otherMark.repeat(3));
          return game.matrix.command({is: 'champ', coords});
        }
      }
      else {
        return game.matrix.command({is: 'draw'});
      }
    };
    const think = () => {
      let coords = logic(round.currentPlayer());
      let _clicks = round.clicks();
      
      if (_clicks > 4 && coords[3] === 'coords') {
        coords.forEach(coord => {
          if (coord !== 'coords') {
            game.display.cell.grab(coord[0], coord[1]).classList.remove('glow');
          }
        });
        game.matrix.command({is: 'disable-click'});
        game.players.winner.save(round.turn());
        return game.matrix.command({is: 'champ', coords});
      }
      if (_clicks > 7) {
        return ai.tieOrAutoWin(round.currentPlayer().whichMark());
      }
      return round.changePlayer();
    };
    const _evaluate = () => {
      let _computer = game.players.grab(1);
      let _user = game.players.grab(0);

      if (logic(_computer)[3] === 'coords') {
        return +10;
      }
      else if (logic(_user)[3] === 'coords') {
        return -10;
      }
      else {
        return 0;
      }
    };
    const minimax = (board, alpha, beta, maximizing) => {
      let _value = _evaluate(board);

      if (_value !== 0) {
        return _value;
      }
      if (game.matrix.command({is: 'nulls'}).length === 0) {
        return 0;
      }

      if (maximizing) {
        return game.matrix.command({ is: 'maximize', alpha, beta, maximizing });
      }
      else {
        return game.matrix.command({ is: 'minimize', alpha, beta, maximizing });
      }
    };
    const optimizeFirstMove = (board) => {
      if (board[1][1] === null) {
        return move.save(1,1);
      }
      else {
        return move.save(0,0);
      }
    };
    const mark = () => {
      game.matrix.command({ is: 'mark' });

      let _computer = game.players.grab(1).whichMark();
      let _cell = game.display.cell.grab(move.row(), move.column());
      _cell.style.borderColor = 'burlywood';
      game.display.animate.mark(_cell);
      game.display.cell.renderMark(move.row(), move.column(), _computer);
      return round.board()[move.row()][move.column()] = _computer;
    };
    return {
      move,
      logic,
      tieOrAutoWin,
      think,
      minimax,
      optimizeFirstMove,
      mark
    }
  })();
  return {
    round,
    clickHandler,
    start,
    reset,
    ai
  }
})();
