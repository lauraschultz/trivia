var express = require("express");
var socket = require("socket.io");
var axios = require("axios");
var Hashids = require("hashids/cjs");

const fakeData = [
  { question: "first question", answers: ["a", "b", "c"] },
  { question: "second question", answers: ["2a", "2b", "2c"] },
  { question: "third question", answers: ["3a", "3b", "3c"] },
];

var triviaQuestions;

var app = express();
var server = app.listen(4000, () => console.log("listening on port 4000..."));
var io = socket(server, { origins: "*:*" });
var i = 0;
const selectInterval = 3000;
const displayInterval = 3500;
var activeGames = {};
var hashids = new Hashids("get stupid", 4, "ABCDEFGHIJKLMNPQRSTUVWXY3456789");

io.on("connection", function (socket) {
  console.log("made connection, ID: " + socket.id);
  socket.on("start game", startGame);
  socket.on("create new game", (_, callback) =>
    createNewGame(socket, callback)
  );
  socket.on("join game", (gameID, callback) =>
    joinGame(gameID, socket, callback)
  );
//   socket.on("handle typer", (data) => handleTyper(data, socket));
  socket.on("submit name", (data) => handleSubmitName(data, socket));
});

var handleSubmitName = ({ gameID, playerName }, socket) => {
  const gameNum = decode(gameID);
  activeGames[gameNum].players[socket.id] = { name: playerName, score: 0 };
  io.in(gameNum).emit("players", activeGames[gameNum].players);
};

// var handleTyper = ({ gameID, incNum }, socket) => {
//     console.log('handletyper, inc is ' + incNum)
//   const gameNum = decode(gameID);
//   var numTypers = activeGames[gameNum].numTypers;
//   activeGames[gameNum].numTypers = numTypers + incNum;
//   console.log('number typers is now ' + activeGames[gameNum].numTypers);
//   socket.in(gameNum).emit("number typers", numTypers);
// };

var createNewGame = (socket, callback) => {
  // find unused number
  var j = 0;
  while (activeGames[j]) {
    j++;
  }
  //hash it
  const gameID = hashids.encode(j);
  console.log("gameID is " + gameID);
  callback(gameID);
  activeGames[j] = {
    canJoin: true,
    numTypers: 0,
    players: {},
  };
  socket.join(j);
  console.log("the socket joined " + j);
};

var decode = (gameID) => {
  return hashids.decode(gameID.toUpperCase())[0];
};

var joinGame = (gameID, socket, callback) => {
  const gameNumber = decode(gameID);
  console.log("computed game number: " + gameNumber);
  console.log(activeGames[gameNumber]);
  if (!activeGames[gameNumber]) {
    callback({
      sucess: false,
      errorMsg:
        "the game you requested was not found. ensure you have the correct game code and try again.",
    });
  } else if (activeGames[gameNumber].canJoin) {
    callback({
      sucess: true,
    });
    socket.join(gameNumber);
    console.log("the socket joined " + gameNumber);
  } else {
    callback({
      sucess: false,
      errorMsg: "you can't join a game that is already in progress.",
    });
  }
};

var startGame = (gameData) => {
  console.log(shuffle([1, 2, 3, 4]));
  const gameNum = decode(gameData.gameID);
  // console.log('starting game: ' + gameID)
  i = 0;
  axios.get("https://opentdb.com/api.php?amount=10").then((response) => {
    triviaQuestions = response.data.results;
    console.log("got response from api: " + triviaQuestions);
    sendQuestion(gameNum);
  });
  activeGames[gameNum].canJoin = false;
};

var sendQuestion = (gameNum) => {
  //   console.log("beginning sendquestion, i is " + i);
  var currentQuestion = triviaQuestions[i];
  const answers = [currentQuestion.correct_answer].concat(
    Object.values(currentQuestion.incorrect_answers)
  );
  currentQuestion = {
    question: currentQuestion.question,
    answers: answers,
  };
  io.in(gameNum).emit("question", currentQuestion);
  const ans = triviaQuestions[i].correct_answer;
  setTimeout(() => showAnswer(gameNum, ans), selectInterval);
  i = i + 1;
  if (i < triviaQuestions.length) {
    // console.log("setting timeout for sendquestion, i is " + i);
    setTimeout(() => sendQuestion(gameNum), selectInterval + displayInterval);
  }
};

//DOESNT WORK!!!!!
function shuffle(arr) {
  console.log("shuffling " + arr);
  var i = arr.length;
  var randIdx;
  var correctAnsIdx = 0;

  while (i > 0) {
    randIdx = Math.floor(Math.random * i);
    i -= 1;
    if (randIdx === 0) {
      correctAnsIdx = i;
    }
    const temp = arr[i];
    arr[i] = arr[randIdx];
    arr[randIdx] = temp;
  }
  console.log("ending; CAI is " + correctAnsIdx);
  console.log("    arr is " + arr);
  return { arr, correctAnsIdx };
}

var showAnswer = (gameNum, ans) => {
  io.in(gameNum).emit("answer", ans);
};
