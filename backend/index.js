const express = require("express"),
socket = require("socket.io"),
axios = require("axios"),
Hashids = require("hashids/cjs");

const PORT = process.env.PORT || 4000;

let triviaQuestions,
  app = express(),
  server = app.listen(PORT, () => console.log(`listening on port ${PORT}`)),
  io = socket(server, { origins: "*:*" }),
  i = 0,
  activeGames = {},
  hashids = new Hashids("get stupid", 4, "ABCDEFGHIJKLMNPQRSTUVWXY3456789");

const selectInterval = 6000,
  displayInterval = 3500,
  countdownLength = 3;

io.on("connection", function (socket) {
  console.log(`made connection, ID: ${socket.id}`);
  socket.on("start game", startGame);
  socket.on("create new game", (_, callback) =>
    createNewGame(socket, callback)
  );
  socket.on("join game", (gameID, callback) =>
    joinGame(gameID, socket, callback)
  );
  socket.on("validate answer", (answerInfo, callback) =>
    validateAnswer(socket.id, answerInfo, callback)
  );
  socket.on("submit name", (data) => handleSubmitName(data, socket));
  socket.on("joining", (info) => handleJoining(info, socket));
});

let emitPlayers = (gameNum) => {
  io.in(gameNum).emit("players", activeGames[gameNum].players);
};

let handleJoining = ({ numInc, gameID }, socket) => {
  const gameNum = decode(gameID);
  activeGames[gameNum].numJoiners += numInc;
  socket.in(gameNum).emit("joining", activeGames[gameNum].numJoiners);
  emitPlayers(gameNum);
};

var validateAnswer = (socketID, { answer, questionNum, gameID }, callback) => {
  const gameNum = decode(gameID);
  const correctAnsIdx =
    activeGames[gameNum].questions[questionNum].correctAnswer;
  callback({
    isCorrect: correctAnsIdx === answer,
    correctAnswer: correctAnsIdx,
  });
  if (correctAnsIdx === answer) {
    activeGames[gameNum].players[socketID].score++;
  }
  emitPlayers(gameNum);
};

var handleSubmitName = ({ gameID, playerName }, socket) => {
  console.log(playerName + " submitted name");
  const gameNum = decode(gameID);
  activeGames[gameNum].players[socket.id] = { name: playerName, score: 0 };
  console.log("added entry for " + socket.id);
  emitPlayers(gameNum);
};

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
    questions: {}, // 0: {correctAnswer: x}
    numJoiners: 0,
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
    handleJoining({ numInc: 1, gameID: gameID }, socket);
  } else {
    callback({
      sucess: false,
      errorMsg: "you can't join a game that is already in progress.",
    });
  }
};

var startGame = (gameData) => {
  const gameNum = decode(gameData.gameID);
  io.in(gameNum).emit("start countdown", countdownLength);
  // console.log('starting game: ' + gameID)
  i = 0;
  axios.get("https://opentdb.com/api.php?amount=5").then((response) => {
    triviaQuestions = response.data.results;
    setTimeout(() => sendQuestion(gameNum), countdownLength * 1000);
  });
  activeGames[gameNum].canJoin = false;
};

var sendQuestion = (gameNum) => {
  //   console.log("beginning sendquestion, i is " + i);
  var currentQuestion = triviaQuestions[i];
  const answers = [currentQuestion.correct_answer].concat(
    Object.values(currentQuestion.incorrect_answers)
  );
  const correctAnswerIndex = shuffle2(answers);
  console.log("the shuffled array is now" + answers);
  console.log("correctAnswerIndex is " + correctAnswerIndex);
  currentQuestion = {
    index: i,
    question: currentQuestion.question,
    answers: answers,
  };
  activeGames[gameNum].questions[i] = {
    correctAnswer: correctAnswerIndex.toString(),
  };
  io.in(gameNum).emit("question", currentQuestion);
  const ans = triviaQuestions[i].correct_answer;
  setTimeout(() => requestAnswer(gameNum, ans), selectInterval);
  i = i + 1;
  if (i < triviaQuestions.length) {
    // console.log("setting timeout for sendquestion, i is " + i);
    setTimeout(() => sendQuestion(gameNum), selectInterval + displayInterval);
  } else {
    setTimeout(
      () => io.in(gameNum).emit("game over"),
      selectInterval + displayInterval
    );
  }
};

function shuffle2(array) {
  var correctAnsIdx = 0;
  for (let idx = array.length - 1; idx > 0; idx--) {
    let j = Math.floor(Math.random() * (idx + 1));
    if (j === 0) {
      correctAnsIdx = JSON.parse(JSON.stringify(idx));
    }
    [array[idx], array[j]] = [array[j], array[idx]];
  }
  return correctAnsIdx;
}

var requestAnswer = (gameNum) => {
  io.in(gameNum).emit("request answer");
};
