import './Terminal.scss';
import React from 'react';

class Terminal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      pid: null,
      wsopen: false,
      idx: null,
      data: [],
    };
    this.bashSocket = new WebSocket("ws://192.168.211.211:8080", ["http", "https"]);
    this.keyDown = this.keyDown.bind(this);
  }

  ws = () => {
    const {
      bashSocket,
      props : { match : { params : { name, context, namespace } } }
    } = this;

    const init = () => {
      bashSocket.onopen = () => {
        this.setState({ wsopen: true });
        bashSocket.send(JSON.stringify({ name, context, namespace, connect: true }));
      }
      bashSocket.onmessage = (e) => {
        const { data, error, pid} = JSON.parse(e.data);
        if (pid) {
            this.setPid(pid);
        } else {
          const splittedData = data.split('\n');
          splittedData.forEach((elem, key) => {
            if (elem === 'DISPLAYNEWLINE' || (key === splittedData.length - 1 && error)) {
              this.newLine();
            } else {
              this.addLine(elem, false);
            }
          });
        }
      }
    }
    const revive = () => {
      bashSocket.send(JSON.stringify({ name, context, namespace, connect: true }));
    }
    return { init, revive }
  }

  setPid = (newPid) => {
    const { pid } = this.state;

    if (!pid || newPid === null) {
      this.setState({ pid: newPid });
    }
  }

  sendCommand = (cmd)  =>{
    const { pid } = this.state;

    fetch('http://192.168.211.211:8080/bashCmd', {
      method: 'POST',
      body: JSON.stringify({ pid, cmd }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
        .then(data => {
          if (data.error && cmd !== 'exit') {
            this.addLine('ERROR: Pod disconnected');
          }
        });
  }

  scrollDown = () => {
    window.scrollTo(0, document.getElementById('console').clientHeight);
  }

  newLine = () => {
    const { match: { params: { name } } } = this.props;

    if (document.getElementsByClassName('line--active').length)
      document.getElementsByClassName('line--active')[0].classList.remove('line--active');
    document.getElementById('console').innerHTML += `<p class="line line--active" data-user="${name}" data-host="server" data-path="~"></p>`;
  }

  addLine = (content, newLine = true) => {
    document.getElementById('console').innerHTML += '<p class="termline">' + content + '</p>';
    this.scrollDown();
    if (newLine) {
      this.newLine();
    }
  }

  history = () => {
    const add = (cmd) => {
      const { data } = this.state;

      this.setState({ idx: null, data: data.concat(cmd) });
    }

    const getLast = (direction) => {
      const { idx, data } = this.state;
      let tmpIdx = idx;

      if (tmpIdx === null)
        tmpIdx = data.length;
      if (direction === '-' && tmpIdx > 0)
        tmpIdx--;
      else if (direction === '+' && idx <= data.length - 1)
        tmpIdx++;

      this.setState({ idx: tmpIdx });
      return data[tmpIdx];
    }
    return { add, getLast };
  }

  command = (cmd) => {
    const { newLine, addLine, sendCommand, setPid } = this;

    if (cmd === '') {
      newLine();
    } else if (cmd === 'help') {
      addLine('--- KcSSH by Tlux HELP ---', false);
      addLine('pid    : Displays current machine PID', false);
      addLine('clear  : Clear window', false);
      addLine('exit   : Kills bash connection', false);
      addLine('revive : Revives bash connection (Kills the current if connected)');
    }  else if (cmd === 'clear') {
      document.getElementById('console').innerHTML = '';
      newLine();
    } else if (cmd === 'exit') {
      addLine('Bash connection terminated with code 0.');
      sendCommand(cmd);
      setPid(null);
    } else if (cmd === 'pid') {
      addLine(`Current PID: ${this.state.pid}`);
    }  else if (cmd === 'revive') {
      sendCommand('exit');
      setPid(null);
      addLine('Bash connection restarted.');
      this.ws().revive();
    } else {
      sendCommand(cmd);
    }
  }

   keyDown (e) {
    let char = e.key;
    const line = document.getElementsByClassName('line--active')[0];

    if (e.key === 'Backspace') {
      line.innerText = line.innerText.substr(0, line.innerText.length - 1);
    } else if (e.key === 'Tab') {
      e.preventDefault();
    } else if (e.key === 'Dead') {
      char = '~';
    } else if (e.key === 'ArrowUp') {
      line.innerHTML = this.history().getLast('-') || '';
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      line.innerHTML = this.history().getLast('+') || '';
      e.preventDefault();
    } else if (e.key === 'Space') {
      char = " ";
    } else if (e.key === 'Enter') {
      this.history().add(line.innerText);
      this.command(line.innerText);
    } else if (e.key.length === 1) {
      line.innerText += char;
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyDown, false);
  }

  componentDidMount() {
    this.ws().init();
    document.addEventListener('keydown', this.keyDown, false);
    document.getElementById('console').innerHTML += '<p class="termline">Last login: ' + (new Date()).toUTCString() + ' on ttys000</p><p>KubeSSH by Tlux</p><br />';
    this.newLine();
  }

  render() {
    return <pre id="console"></pre>
  }
}

export default Terminal;