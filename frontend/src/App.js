import React, { Component } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./index.css";
import "./tailwind.css";

export class App extends Component {
  constructor(props) {
    super(props);
    this.SERVER = "http://localhost:4000"; //"https://crazytrivia.herokuapp.com/"
    this.socket = io.connect(this.SERVER);
    this.state = {
      userAnswer: "-1",
      isCorrectAnswer: 0,
      // ⬆️ https://stackoverflow.com/a/4666482/4493137
      gameID: "",
      playerName: "",
      appState: "init",
      isGameCreator: false,
      numTypers: 0,
      numberQuestions: 10,
      difficulty: "-1",
      category: "-1",
    };
  }

  componentDidMount() {
    this.socket.on("start countdown", (countdownLength) => {
      this.countdownTimer(countdownLength);
      this.setState({
        appState: "play",
      });
    });
    this.socket.on("question", (q) => {
      console.log("got a question: " + q);
      this.setState({
        currentQuestion: q,
        correctAnswer: undefined,
        userAnswer: "-1",
      });
    });
    this.socket.on("request answer", () => {
      // validate on client or server side????????
      // server also needs to know for the score... so might as well do it there....
      this.socket.emit(
        "validate answer",
        {
          answer: this.state.userAnswer,
          questionNum: this.state.currentQuestion.index,
          gameID: this.state.gameID,
        },
        ({ isCorrect, correctAnswer }) => {
          this.setState({ correctAnswer: correctAnswer });
        }
      );
    });
    this.socket.on("number typers", (n) => this.setState({ numTypers: n }));
    this.socket.on("players", (p) => this.setState({ players: p }));
    this.socket.on("joining", (n) => {
      console.log("num joiners is " + n);
      this.setState({ numJoiners: n });
    });
    // this.socket.on("game over", () =>
    //   this.setState({
    //     currentQuestion: undefined,
    //     correctAnswer: undefined,
    //     userAnswer: "-1",
    //   })
    // );
  }

  countdownTimer = (n) => {
    this.setState({ countdownTime: n });
    if (n > 0) {
      setTimeout(() => this.countdownTimer(n - 1), 1000);
    }
  };

  handleNewGameID = (gameID) => {
    this.setState({ gameID: gameID });
  };

  joinGame = () => {
    this.setState({ isGameCreator: false });
    this.socket.emit("join game", this.state.gameID, (callbackData) => {
      if (callbackData.sucess) {
        this.setState({ appState: "join" });
        // this.handleTyping(true);
      } else {
        console.log(callbackData.errorMsg);
      }
    });
  };

  createNewGame = () => {
    this.setState({ isGameCreator: true, appState: "join" });
    this.socket.emit("create new game", {}, (gameID) => {
      console.log("got gameid from callback: " + gameID);
      this.setState({ gameID: gameID });
    });
    axios.get(`${this.SERVER}/categories`).then((cats) => {
      console.log(cats.data);
      this.setState({ categories: cats.data });
    });
  };

  startGame = () => {
    this.socket.emit("start game", {
      gameID: this.state.gameID,
      category: this.state.selectedCategory,
      difficulty: this.state.difficulty,
      numberQuestions: this.state.numberQuestions,
    });
    this.setState({ appState: "play" });
  };

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
    console.log("changed " + event.target.name + " to " + event.target.value);
  };

  // handleTyping = (isTyping) => {
  //   this.socket.emit("handle typer", {
  //     gameID: this.state.gameID,
  //     incNum: isTyping ? 1 : -1,
  //   });
  // };

  handleSubmitName = () => {
    // this.handleTyping(false);
    this.socket.emit("submit name", {
      gameID: this.state.gameID,
      playerName: this.state.playerName,
    });
    this.socket.emit("joining", { numInc: -1, gameID: this.state.gameID });
  };

  render() {
    if (this.state.appState === "init") {
      return (
        <div className="prism-bg object-cover h-screen w-screen absolute">
          <div className="max-w-sm mx-auto my-8 bg-gray-100 p-8 shadow-lg rounded-md">
            <h1 className="font-hairline mb-2 text-4xl">Trivia</h1>
            <div className="w-full mb-4">
            <label for="gameID" className="block font-bold mx-2">
              Join a Game:
            </label>
            <input
              className="p-2 shadow rounded-l-md text-sm w-auto overflow-hidden"
              id="gameID"
              name="gameID"
              placeholder="game code"
              value={this.state.gameID}
              onChange={this.handleChange}
            />
            <button
              className="bg-purple-800 hover:bg-purple-700 text-white uppercase shadow py-2 px-4 tracking-wider text-sm rounded-r-md"
              onClick={this.joinGame}
            >
              join
            </button>
            </div>
            <div className="font-bold mx-2">or:</div>
            <button
              className="w-full bg-teal-600 hover:bg-teal-500 text-white uppercase shadow py-2 px-4 tracking-wide rounded-md"
              onClick={this.createNewGame}
            >
              create new game
            </button>
          </div>
        </div>
      );
    }
    if (this.state.appState === "join") {
      return (
        <div>
          <p>{this.state.gameID}</p>
          <input
            name="playerName"
            onChange={this.handleChange}
            value={this.state.playerName}
            placeholder="your name"
          />
          <button onClick={this.handleSubmitName}>submit</button>

          {this.state.numJoiners > 0 && (
            <p>
              <i>someone is joining...</i>
            </p>
          )}
          {this.state.players && (
            <ul>
              <h2>Players:</h2>
              {Object.entries(this.state.players).map(([id, pl]) => {
                return <li key={id}>{pl.name}</li>;
              })}
            </ul>
          )}

          {this.state.isGameCreator && (
            <div>
              <h2>Select a category:</h2>
              {this.state.categories && (
                <div>
                  <label>
                    <input
                      type="radio"
                      name="selectedCategory"
                      value={-1}
                      onChange={this.handleChange}
                      checked={this.state.selectedCategory === "-1"}
                    />
                    Any category
                  </label>
                  {this.state.categories.map((cat) => (
                    <label key={cat.id}>
                      <input
                        type="radio"
                        name="selectedCategory"
                        value={cat.id}
                        onChange={this.handleChange}
                        checked={
                          this.state.selectedCategory === cat.id.toString()
                        }
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              )}
              <h2>Select difficulty:</h2>
              <label>
                <input
                  type="radio"
                  name="difficulty"
                  value={-1}
                  onChange={this.handleChange}
                  checked={this.state.difficulty === "-1"}
                />
                Any difficulty
              </label>
              <label>
                <input
                  type="radio"
                  name="difficulty"
                  value="easy"
                  onChange={this.handleChange}
                  checked={this.state.difficulty === "easy"}
                />
                Easy
              </label>
              <label>
                <input
                  type="radio"
                  name="difficulty"
                  value="medium"
                  onChange={this.handleChange}
                  checked={this.state.difficulty === "medium"}
                />
                Medium
              </label>
              <label>
                <input
                  type="radio"
                  name="difficulty"
                  value="hard"
                  onChange={this.handleChange}
                  checked={this.state.difficulty === "hard"}
                />
                Hard
              </label>
              <h2>Number of questions</h2>
              <input
                type="number"
                value={this.state.numberQuestions}
                name="numberQuestions"
                onChange={this.handleChange}
              ></input>
              <button onClick={this.startGame}>start game</button>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="bg-gray-100 w-screen h-screen content-center">
        <div className="max-w-sm ">
        {this.state.countdownTime > 0 && (
          <p>starting game in {this.state.countdownTime}</p>
        )}
        {this.state.currentQuestion && (
          <div>
            <p>{this.state.currentQuestion.question}</p>
            {this.state.currentQuestion.answers.map((a, idx) => (
              <label key={idx} className={"block bg-white py-2 px-4 border-solid rounded my-2 box-border "
                    + (this.state.userAnswer===idx.toString() ? "shadow-xl border-4 " : 'shadow border-2 ')
                    + (this.state.correctAnswer ? (this.state.correctAnswer===idx.toString() ? "border-green-500" : "border-red-500") : "border-gray-800")}>
                <input
                  className="hidden"
                  type="radio"
                  name="userAnswer"
                  value={idx}
                  onChange={this.handleChange}
                  checked={this.state.userAnswer === idx.toString()}
                  disabled={this.state.correctAnswer}
                />
                {this.state.correctAnswer && this.state.correctAnswer!==idx.toString() && <svg viewBox="0 0 20 20" fill="currentColor" className="x w-6 h-6 inline text-red-500"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
                {this.state.correctAnswer===idx.toString() && <svg viewBox="0 0 20 20" fill="currentColor" className="check w-6 h-6 inline text-green-500"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                <span className="pl-2">{a}</span>
              </label>
            ))}
          </div>
        )}

        {this.state.players && (
          <ul>
            <h2>Leaderboard:</h2>
            {Object.entries(this.state.players).map(([id, pl]) => {
              return (
                <li key={id}>
                  <b>{pl.name}</b>: {pl.score}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      </div>
    );
  }
}

export default App;
