import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const boardRows = [];
    for (let i = 0; i < 9;) {
      const squares = [];
      for (let j = 0; j < 3; i++, j++) {
        squares.push(this.renderSquare(i));
      }
      boardRows.push(
        <div className="board-row">{squares}</div>
      );
    }

    return (
      <div>{boardRows}</div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        locationIndex: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      orderIsAsc: true,
      activeMove: null,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        locationIndex: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  handleClickOrderToggleButton() {
    this.setState({
      orderIsAsc: !this.state.orderIsAsc,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  handleMoveClick(step) {
    this.setState({
      activeMove: step,
    });
    this.jumpTo(step);
  }

  convertIndexToLocation(index) {
    const col = index % 3 + 1;
    const row = Math.floor(index / 3) + 1;
    return `(${col}, ${row})`;
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const active = (this.state.activeMove === move).toString();
      const desc = move ?
        'Go to move #' + move + ' ' + this.convertIndexToLocation(step.locationIndex) :
        'Go to game start';
      return (
        <li key={move} active={active}>
          <button onClick={() => this.handleMoveClick(move)}>{desc}</button>
        </li>
      );
    });

    if (!this.state.orderIsAsc) moves.reverse();

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    const orderToggleButtonLabel = this.state.orderIsAsc ? 'Desc' : 'Asc';

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.handleClickOrderToggleButton()}>
            {orderToggleButtonLabel}
          </button>
          <ol id="moves">{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
