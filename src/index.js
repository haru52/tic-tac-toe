import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
  const classNames = ['square'];
  if (props.won) classNames.push('winning');

  return (
    <button className={classNames.join(' ')} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        won={this.props.winningLine.includes(i)}
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
        <div key={i / 3} className="board-row">{squares}</div>
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
      selectedMove: null,
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
      selectedMove: null,
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

  handleClickMove(step) {
    this.setState({
      selectedMove: step,
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
    const winnerInfo = calculateWinner(current.squares);
    const winner = winnerInfo?.winner;
    const winningLine = winnerInfo ? winnerInfo.line : [];

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + ' ' + this.convertIndexToLocation(step.locationIndex) :
        'Go to game start';
      return (
        <li key={move} className={this.state.selectedMove === move ? 'selected' : ''}>
          <button onClick={() => this.handleClickMove(move)}>{desc}</button>
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
            winningLine={winningLine}
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
      return {winner: squares[a], line: lines[i]};
    }
  }
  return null;
}
