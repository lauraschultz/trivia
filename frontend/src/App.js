import React, { Component} from "react";
import io from "socket.io-client";
import axios from "axios";
import "./tailwind.css";
import InitPage from "./InitPage";
import JoinPage from "./JoinPage";

function GameCountdown({ number }) {
  return (
    <div className="absolute w-screen h-screen flex items-center">
      <div className="max-w-sm mx-auto content-center font-thin text-purple-700">
        starting game in
        <div className="text-6xl font-black text-gray-900 text-center">
          {number}
        </div>
      </div>
    </div>
  );
}

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
      this.setState({
        currentQuestion: undefined,
        // correctAnswer: undefined,
        userAnswer: "-1",
        gameOver: true,
      });
    });
  }

  emitJoining = () => {
    this.socket.emit("joining", { numInc: -1, gameID: this.state.gameID });
  };

  countdownTimer = (n, timerName) => {
    this.setState({ [timerName]: n });
    if (n > 0) {
      setTimeout(() => this.countdownTimer(n - 1, timerName), 1000);
    }
  };

  handleNewGameID = (gameID) => {
    this.setState({ gameID: gameID });
  };

  joinGame = (gameID, joinGameCallback) => {
    console.log(`join game, game id: ${gameID}`)
    this.setState({ isGameCreator: false, gameID: gameID });
    this.socket.emit("join game", gameID, joinGameCallback);
  };

  createNewGame = () => {
    this.setState({ isGameCreator: true, appState: "join" });
    this.socket.emit("create new game", {}, (gameID) => {
      console.log(`got gameid from callback: ${gameID}`);
      this.setState({ gameID: gameID });
    });
    axios.get(`${this.SERVER}/categories`).then((cats) => {
      this.categories= cats.data;
    });
  };

  startGame = (gameProps) => {
    this.socket.emit("start game", gameProps);
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


  submitName = (gameID, playerName) => {
    this.socket.emit("submit name", {
      gameID: gameID,
      playerName: playerName,
    });
  };


  render() {
    const currentQ = this.state.currentQuestion;
    if (this.state.appState === "init") {
      return <JoinPage
        joinGame={this.joinGame}
        createGame={this.createNewGame}
        cont={() => this.setState({appState:"join"})}
      ></JoinPage>
    }
    if (this.state.appState === "join") {
      return (
        <InitPage
          gameID={this.state.gameID}
          players={this.state.players}
          numberJoiners={this.state.numJoiners}
          isGameCreator={this.state.isGameCreator}
          categories={this.categories}
          submitName={this.submitName}
          startGame={this.startGame}
          emitJoining={this.emitJoining}
        ></InitPage>
      );
    } else if (this.state.appState === "countdown") {
      return <GameCountdown number={this.state.gameCountdown} />;
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
            <div className="mx-auto min-w-0 pt-1 w-min-content">
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
