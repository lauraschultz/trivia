import React, { Component } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./tailwind.css";

export class App extends Component {
  constructor(props) {
    super(props);
    this.SERVER = "https://crazytrivia.herokuapp.com"; //"http://localhost:4000"
    this.socket = io.connect(this.SERVER);
    this.state = {
      userAnswer: "-1",
      playerName: "",
      gameID: "",
      nameSubmitted: false,
      appState: "init",
      isGameCreator: false,
      numTypers: 0,
      numberQuestions: 10,
      difficulty: "-1",
      selectedCategory: "-1",
      updatedIndex: 0,
      gameOver: false,
      initError: {
        error: false,
        msg: "",
      },
      joinError: {
        error: false,
        msg: "",
      },
    };
  }

  componentDidMount() {
    this.socket.on(
      "start countdown",
      ({ countdownLength, questionLength, numberQuestions }) => {
        this.countdownTimer(countdownLength, "gameCountdown");
        this.setState({
          appState: "countdown",
          questionLength: questionLength,
          countdownLength: countdownLength,
          numberQuestions: numberQuestions,
        });
      }
    );
    this.socket.on("question", (q) => {
      console.log(`recieved question:  ${JSON.stringify(q)}`);
      this.setState({
        appState: "play",
        currentQuestion: q,
        correctAnswer: undefined,
        userAnswer: "-1",
      });
      this.countdownTimer(this.state.questionLength, "questionCountdown");
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
          this.setState((prevState) => {
            return {
              correctAnswer: correctAnswer,
              updatedIndex: prevState.updatedIndex + 1,
            };
          });
        }
      );
    });
    this.socket.on("players", (p) => {
      console.log(`update players:  ${JSON.stringify(p)}`);
      this.setState({ players: p });
    });
    this.socket.on("joining", (n) => {
      this.setState({ numJoiners: this.state.nameSubmitted ? n : n - 1 });
    });
    this.socket.on("game over", () => {
      console.log("GAME OVER");
      this.setState({
        currentQuestion: undefined,
        // correctAnswer: undefined,
        userAnswer: "-1",
        gameOver: true,
      });
    });
  }

  countdownTimer = (n, timerName) => {
    this.setState({ [timerName]: n });
    if (n > 0) {
      setTimeout(() => this.countdownTimer(n - 1, timerName), 1000);
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
      } else {
        this.setState({
          initError: { error: true, msg: callbackData.errorMsg },
        });
      }
    });
  };

  createNewGame = () => {
    this.setState({ isGameCreator: true, appState: "join" });
    this.socket.emit("create new game", {}, (gameID) => {
      console.log(`got gameid from callback: ${gameID}`);
      this.setState({ gameID: gameID });
    });
    axios.get(`${this.SERVER}/categories`).then((cats) => {
      this.setState({ categories: cats.data });
    });
  };

  startGame = () => {
    if (!this.state.nameSubmitted) {
      this.setState({
        joinError: {
          error: true,
          msg: "Please submit a name for yourself before starting the game.",
        },
      });
      return;
    }
    const nQ = +this.state.numberQuestions;
    if (isNaN(nQ)) {
      this.setState({
        joinError: {
          error: true,
          msg: "Please enter a number in the Number of Questions field.",
        },
      });
      return;
    }
    if (nQ < 1 || nQ > 50) {
      this.setState({
        joinError: {
          error: true,
          msg: "Please enter a number of questions that is between 1 and 50.",
        },
      });
      return;
    }
    this.socket.emit("start game", {
      gameID: this.state.gameID,
      category: this.state.selectedCategory,
      difficulty: this.state.difficulty,
      numberQuestions: this.state.numberQuestions,
    });
    this.setState({ appState: "countdown" });
  };

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
    if (event.target.name === "gameID") {
      this.setState({
        joinError: { error: false, msg: "" },
      });
    }
  };

  // handleTyping = (isTyping) => {
  //   this.socket.emit("handle typer", {
  //     gameID: this.state.gameID,
  //     incNum: isTyping ? 1 : -1,
  //   });
  // };

  handleSubmitName = () => {
    if (!this.state.nameSubmitted) {
      // the player is submitting name for the first time
      this.socket.emit("joining", { numInc: -1, gameID: this.state.gameID });
    }
    this.socket.emit("submit name", {
      gameID: this.state.gameID,
      playerName: this.state.playerName,
    });
    this.setState({ nameSubmitted: true });
  };

  render() {
    const currentQ = this.state.currentQuestion;
    if (this.state.appState === "init") {
      return (
        <div className="prism-bg object-cover h-screen w-screen absolute flex items-center justify-center">
          <div className="max-w-sm bg-gray-100 mx-4 p-6 shadow-lg rounded-md">
            <h1 className="font-hairline mb-2 text-4xl">Multiplayer Trivia</h1>
            <div className="w-full mb-4">
              <label htmlFor="gameID" className="block font-bold mx-2">
                Join a game:
              </label>
              <input
                className={
                  "p-2 shadow rounded-l text-sm " +
                  (this.state.initError.error ? " border-2 border-red-800" : "")
                }
                id="gameID"
                name="gameID"
                placeholder="game code"
                value={this.state.gameID}
                onChange={this.handleChange}
              />
              <button
                className="bg-purple-800 hover:bg-purple-700 text-white uppercase shadow py-2 px-4 pr-10 tracking-wide text-sm rounded-r"
                onClick={this.joinGame}
              >
                join
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="user-group w-6 h-6 pl-1 pb-1 absolute inline"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </button>
              {this.state.initError.error && (
                <div className="rounded border-red-800 border-l-4 bg-red-200 p-2 my-2 flex items-center text-red-800 text-sm leading-tight">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="exclamation w-8 h-8 inline pr-2 flex-initial"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="flex-1">{this.state.initError.msg}</span>
                </div>
              )}
            </div>
            <hr className="my-2" />
            <div className="font-bold mx-2">Start a game:</div>
            <button
              className="w-full bg-teal-600 hover:bg-teal-500 text-white uppercase shadow py-2 px-4 tracking-wide rounded text-sm"
              onClick={this.createNewGame}
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="plus-circle w-6 h-6 pr-1 inline"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
              create new game
            </button>
          </div>
        </div>
      );
    }
    if (this.state.appState === "join") {
      return (
        <div className="bg-gray-100 w-screen h-screen absolute overflow-scroll">
          <div className="max-w-md mx-auto px-2 py-1">
            <div className="text-sm uppercase tracking-wide text-gray-700 w-max-content mx-auto">
              your game code:
            </div>
            <span className="block uppercase tracking-wider text-xl font-mono px-3 py-1 rounded border-gray-700 border-2 bg-white shadow text-gray-800 font-hairline mx-auto w-min-content">
              {this.state.gameID}
            </span>

            <div className="text-gray-600 italic text-xs leading-none text-center mt-2 mb-4">
              share this code with friends who want to join the game
            </div>

            <div className="w-max-content mx-auto">
              <input
                className="p-2 shadow rounded-l text-sm"
                name="playerName"
                onChange={this.handleChange}
                value={this.state.playerName}
                placeholder="your name"
              />
              <button
                className="bg-purple-800 hover:bg-purple-700 text-white uppercase shadow py-2 px-4 tracking-wider text-sm rounded-r"
                onClick={this.handleSubmitName}
              >
                submit
              </button>
            </div>

            <h2 className="uppercase tracking-wide text-sm text-gray-700 mb-2 mt-4">
              Players:
            </h2>
            {this.state.players && (
              <ul>
                {Object.entries(this.state.players).map(([id, pl]) => {
                  return (
                    <li key={id}>
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="user w-8 h-8 inline pr-1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {pl.name}
                    </li>
                  );
                })}
              </ul>
            )}
            {!this.state.players && this.state.numJoiners === 0 && (
              <p className="px-3 py-1 mx-4 bg-gray-200 italic border-l-4 border-gray-800 rounded w-max-content">Nobody has joined the game.</p>
            )}
            {this.state.numJoiners > 0 && (
              <ul>
                <li className="animate-pulse">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="user w-8 h-8 inline pr-1"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="italic gray-600 text-sm">
                    someone is joining...
                  </span>
                </li>
              </ul>
            )}

            {this.state.isGameCreator && (
              <div>
                <h2 className="uppercase tracking-wide text-sm text-gray-700 mb-2 mt-4">
                  Select a category:
                </h2>
                {this.state.categories && (
                  <select
                    className="p-2 rounded shadow max-w-full"
                    name="selectedCategory"
                    onChange={this.handleChange}
                  >
                    <option value="-1">Any category</option>
                    {this.state.categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
                <h2 className="uppercase tracking-wide text-sm text-gray-700 mb-2 mt-4">
                  Select difficulty:
                </h2>
                <label className="block mb-1">
                  <input
                    type="radio"
                    name="difficulty"
                    value={-1}
                    onChange={this.handleChange}
                    checked={this.state.difficulty === "-1"}
                  />
                  <span className="ml-2">Any difficulty</span>
                </label>
                {/* <hr className=" w-32"/> */}
                <label className="block mt-1">
                  <input
                    type="radio"
                    name="difficulty"
                    value="easy"
                    onChange={this.handleChange}
                    checked={this.state.difficulty === "easy"}
                  />
                  <span className="ml-2">Easy</span>
                </label>
                <label className="block">
                  <input
                    type="radio"
                    name="difficulty"
                    value="medium"
                    onChange={this.handleChange}
                    checked={this.state.difficulty === "medium"}
                  />
                  <span className="ml-2">Medium</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="difficulty"
                    value="hard"
                    onChange={this.handleChange}
                    checked={this.state.difficulty === "hard"}
                  />
                  <span className="ml-2">Hard</span>
                </label>
                <h2 className="uppercase tracking-wide text-sm text-gray-700 mb-2 mt-4">
                  Number of questions:
                </h2>
                <input
                  className="p-2 rounded shadow"
                  type="number"
                  value={this.state.numberQuestions}
                  name="numberQuestions"
                  inputMode="numeric"
                  onChange={this.handleChange}
                ></input>
                <button
                  className="block mx-auto bg-teal-700 hover:bg-teal-600 text-white uppercase shadow py-2 px-4 tracking-wide text-sm rounded mt-4"
                  onClick={this.startGame}
                >
                  start game
                </button>
                {this.state.joinError.error && (
                  <div className="rounded border-red-800 border-l-4 bg-red-200 p-2 my-2 flex items-center text-red-800 text-sm leading-tight">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="exclamation w-8 h-8 inline pr-2 flex-initial"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="flex-1">{this.state.joinError.msg}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    } else if (this.state.appState === "countdown") {
      return (
        <div class="absolute w-screen h-screen flex items-center">
          <div className="max-w-sm mx-auto content-center font-thin text-purple-700">
            starting game in
            <div className="text-6xl font-black animate-ping text-gray-900 text-center">
              {this.state.gameCountdown}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-gray-100 w-screen h-screen absolute">
        {currentQ && (
          <div className="absolute w-full uppercase bg-purple-900 text-gray-300 text-xs tracking-wider shadow">
            <div className="max-w-sm mx-auto px-2 py-1">
              question {currentQ.index + 1} of {this.state.numberQuestions}
            </div>
          </div>
        )}

        <div className="max-w-sm mx-auto my-8 p-2">
          <div
            className={
              typeof this.state.correctAnswer === "number"
                ? "hidden"
                : "fixed bottom-0 right-0 lg:absolute lg:-ml-16 lg:-mt-1 lg:bottom-auto lg:right-auto font-black text-2xl h-12 w-12 m-4 rounded-full bg-teal-700 text-gray-100 shadow"
            }
          >
            <div className="mx-auto animate-bounce min-w-0 pt-3 w-min-content">
              {this.state.questionCountdown}
            </div>
          </div>

          {currentQ && (
            <div>
              <p>{currentQ.question}</p>
              {currentQ.answers.map((a, idx) => (
                <label
                  key={idx}
                  className={
                    "transition relative block bg-white py-2 px-4 border-solid rounded my-2 box-border border-2 " +
                    (this.state.userAnswer === idx.toString()
                      ? "shadow-xl z-40 border-l-8 "
                      : "shadow z-20 ") +
                    (typeof this.state.correctAnswer === "number"
                      ? this.state.correctAnswer === idx
                        ? "border-green-500"
                        : "border-red-500"
                      : "border-gray-800")
                  }
                >
                  <input
                    className="hidden"
                    type="radio"
                    name="userAnswer"
                    value={idx}
                    onChange={this.handleChange}
                    checked={this.state.userAnswer === idx.toString()}
                    disabled={typeof this.state.correctAnswer === "number"}
                  />
                  {typeof this.state.correctAnswer === "number" &&
                    this.state.correctAnswer !== idx && (
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="x w-6 h-6 inline text-red-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  {this.state.correctAnswer === idx && (
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="check w-6 h-6 inline text-green-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="pl-2">{a}</span>
                </label>
              ))}
              <hr className="my-1" />
            </div>
          )}
          {this.state.gameOver && (
            <h1 className="text-3xl mx-2 font-black">Game over</h1>
          )}
          {this.state.players && (
            <ul>
              <h2 className="uppercase tracking-wide text-sm m-1 text-gray-700">
                Leaderboard:
              </h2>
              {Object.entries(this.state.players).map(([id, pl]) => {
                const width =
                  this.state.updatedIndex === 0
                    ? 0
                    : (pl.score / this.state.updatedIndex) * 100;
                return (
                  <li
                    key={id}
                    className="bg-pink-300 overflow-hidden relative rounded shadow mb-2"
                  >
                    <span
                      className="bg-pink-600 pl-2 py-1 whitespace-no-wrap inline-block text-white font-bold"
                      style={{ width: width + "%" }}
                    >
                      {pl.name}
                    </span>
                    <span className="py-1 pr-2 text-white right-0 absolute">
                      {pl.score} / {this.state.updatedIndex}
                    </span>
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
