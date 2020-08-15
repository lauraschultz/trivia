var express = require("express");
var socket = require("socket.io");
var axios = require("axios");

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
const selectInterval = 6000;
const displayInterval = 3500;

io.on("connection", function (socket) {
  console.log("made connection");
  socket.on("start game", startGame);
  //   socket.on('respond to question')
  // fakeData.forEach(question => {
  //     io.sockets.emit('question', question);
  // })
});

var startGame = () => {
  i = 0;
  axios.get("https://opentdb.com/api.php?amount=10").then((response) => {
    triviaQuestions = response.data.results;
    sendQuestion();
  });
};

var sendQuestion = () => {
  var currentQuestion = triviaQuestions[i];
  currentQuestion = {
    question: currentQuestion.question,
    answers: Object.entries(currentQuestion.incorrect_answers)
      .map(([_, i]) => i)
      .concat([currentQuestion.correct_answer]),
  };
  io.sockets.emit("question", currentQuestion);
  const ans = triviaQuestions[i].correct_answer
  setTimeout(() => showAnswer(ans), selectInterval);
  i = i + 1;
  if (i < triviaQuestions.length) {
    setTimeout(sendQuestion, selectInterval + displayInterval);
  }
};

var showAnswer = (ans) => {
  io.sockets.emit("answer", ans);
};
