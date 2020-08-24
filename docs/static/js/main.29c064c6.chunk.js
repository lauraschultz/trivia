(this.webpackJsonpfrontend=this.webpackJsonpfrontend||[]).push([[0],{45:function(e,t,a){e.exports=a(99)},79:function(e,t){},98:function(e,t,a){},99:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),s=a(38),l=a.n(s),o=a(15),i=a(14),c=a(39),m=a(40),u=a(44),d=a(43),h=a(41),p=a.n(h),g=a(42),b=a.n(g),w=(a(98),function(e){Object(u.a)(a,e);var t=Object(d.a)(a);function a(e){var n;return Object(c.a)(this,a),(n=t.call(this,e)).countdownTimer=function(e,t){n.setState(Object(i.a)({},t,e)),e>0&&setTimeout((function(){return n.countdownTimer(e-1,t)}),1e3)},n.handleNewGameID=function(e){n.setState({gameID:e})},n.joinGame=function(){n.setState({isGameCreator:!1}),n.socket.emit("join game",n.state.gameID,(function(e){e.sucess?n.setState({appState:"join"}):n.setState({initError:{error:!0,msg:e.errorMsg}})}))},n.createNewGame=function(){n.setState({isGameCreator:!0,appState:"join"}),n.socket.emit("create new game",{},(function(e){console.log("got gameid from callback: ".concat(e)),n.setState({gameID:e})})),b.a.get("".concat(n.SERVER,"/categories")).then((function(e){n.setState({categories:e.data})}))},n.startGame=function(){if(n.state.nameSubmitted){var e=+n.state.numberQuestions;isNaN(e)?n.setState({joinError:{error:!0,msg:"Please enter a number in the Number of Questions field."}}):e<1||e>50?n.setState({joinError:{error:!0,msg:"Please enter a number of questions that is between 1 and 50."}}):(n.socket.emit("start game",{gameID:n.state.gameID,category:n.state.selectedCategory,difficulty:n.state.difficulty,numberQuestions:n.state.numberQuestions}),n.setState({appState:"countdown"}))}else n.setState({joinError:{error:!0,msg:"Please submit a name for yourself before starting the game."}})},n.handleChange=function(e){n.setState(Object(i.a)({},e.target.name,e.target.value)),"gameID"===e.target.name&&n.setState({joinError:{error:!1,msg:""}})},n.handleSubmitName=function(){n.state.nameSubmitted||n.socket.emit("joining",{numInc:-1,gameID:n.state.gameID}),n.socket.emit("submit name",{gameID:n.state.gameID,playerName:n.state.playerName}),n.setState({nameSubmitted:!0})},n.SERVER="https://crazytrivia.herokuapp.com",n.socket=p.a.connect(n.SERVER),n.state={userAnswer:"-1",playerName:"",gameID:"",nameSubmitted:!1,appState:"init",isGameCreator:!1,numTypers:0,numberQuestions:10,difficulty:"-1",selectedCategory:"-1",updatedIndex:0,gameOver:!1,initError:{error:!1,msg:""},joinError:{error:!1,msg:""}},n}return Object(m.a)(a,[{key:"componentDidMount",value:function(){var e=this;this.socket.on("start countdown",(function(t){var a=t.countdownLength,n=t.questionLength,r=t.numberQuestions;e.countdownTimer(a,"gameCountdown"),e.setState({appState:"countdown",questionLength:n,countdownLength:a,numberQuestions:r})})),this.socket.on("question",(function(t){console.log("recieved question:  ".concat(JSON.stringify(t))),e.setState({appState:"play",currentQuestion:t,correctAnswer:void 0,userAnswer:"-1"}),e.countdownTimer(e.state.questionLength,"questionCountdown")})),this.socket.on("request answer",(function(){e.socket.emit("validate answer",{answer:e.state.userAnswer,questionNum:e.state.currentQuestion.index,gameID:e.state.gameID},(function(t){t.isCorrect;var a=t.correctAnswer;e.setState((function(e){return{correctAnswer:a,updatedIndex:e.updatedIndex+1}}))}))})),this.socket.on("players",(function(t){console.log("update players:  ".concat(JSON.stringify(t))),e.setState({players:t})})),this.socket.on("joining",(function(t){e.setState({numJoiners:e.state.nameSubmitted?t:t-1})})),this.socket.on("game over",(function(){console.log("GAME OVER"),e.setState({currentQuestion:void 0,userAnswer:"-1",gameOver:!0})}))}},{key:"render",value:function(){var e=this,t=this.state.currentQuestion;return"init"===this.state.appState?r.a.createElement("div",{className:"prism-bg object-cover h-screen w-screen absolute flex items-center justify-center"},r.a.createElement("div",{className:"max-w-sm bg-gray-100 mx-4 p-6 shadow-lg rounded-md"},r.a.createElement("h1",{className:"font-hairline mb-2 text-4xl"},"Multiplayer Trivia"),r.a.createElement("div",{className:"w-full mb-4"},r.a.createElement("label",{htmlFor:"gameID",className:"block font-bold mx-2"},"Join a game:"),r.a.createElement("input",{className:"p-2 shadow rounded-l text-sm "+(this.state.initError.error?" border-2 border-red-800":""),id:"gameID",name:"gameID",placeholder:"game code",value:this.state.gameID,onChange:this.handleChange}),r.a.createElement("button",{className:"bg-purple-800 hover:bg-purple-700 text-white uppercase shadow py-2 px-4 pr-10 tracking-wide text-sm rounded-r",onClick:this.joinGame},"join",r.a.createElement("svg",{viewBox:"0 0 20 20",fill:"currentColor",className:"user-group w-6 h-6 pl-1 pb-1 absolute inline"},r.a.createElement("path",{d:"M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"}))),this.state.initError.error&&r.a.createElement("div",{className:"rounded border-red-800 border-l-4 bg-red-200 p-2 my-2 flex items-center text-red-800 text-sm leading-tight"},r.a.createElement("svg",{viewBox:"0 0 20 20",fill:"currentColor",className:"exclamation w-8 h-8 inline pr-2 flex-initial"},r.a.createElement("path",{fillRule:"evenodd",d:"M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z",clipRule:"evenodd"})),r.a.createElement("span",{className:"flex-1"},this.state.initError.msg))),r.a.createElement("hr",{className:"my-2"}),r.a.createElement("div",{className:"font-bold mx-2"},"Start a game:"),r.a.createElement("button",{className:"w-full bg-teal-600 hover:bg-teal-500 text-white uppercase shadow py-2 px-4 tracking-wide rounded text-sm",onClick:this.createNewGame},r.a.createElement("svg",{viewBox:"0 0 20 20",fill:"currentColor",className:"plus-circle w-6 h-6 pr-1 inline"},r.a.createElement("path",{fillRule:"evenodd",d:"M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z",clipRule:"evenodd"})),"create new game"))):"join"===this.state.appState?r.a.createElement("div",{className:"bg-gray-100 w-screen h-screen absolute overflow-scroll"},r.a.createElement("div",{className:"max-w-md mx-auto px-2 py-1"},r.a.createElement("div",{className:"text-sm uppercase tracking-wide text-gray-700 w-max-content mx-auto"},"your game code:"),r.a.createElement("span",{className:"block uppercase tracking-wider text-xl font-mono px-3 py-1 rounded border-gray-700 border-2 bg-white shadow text-gray-800 font-hairline mx-auto w-min-content"},this.state.gameID),r.a.createElement("div",{className:"text-gray-600 italic text-xs leading-none text-center mt-2 mb-4"},"share this code with friends who want to join the game"),r.a.createElement("div",{className:"w-max-content mx-auto"},r.a.createElement("input",{className:"p-2 shadow rounded-l text-sm",name:"playerName",onChange:this.handleChange,value:this.state.playerName,placeholder:"your name"}),r.a.createElement("button",{className:"bg-purple-800 hover:bg-purple-700 text-white uppercase shadow py-2 px-4 tracking-wider text-sm rounded-r",onClick:this.handleSubmitName},"submit")),r.a.createElement("h2",{className:"uppercase tracking-wide text-sm text-gray-700 mb-2 mt-4"},"Players:"),this.state.players&&r.a.createElement("ul",null,Object.entries(this.state.players).map((function(e){var t=Object(o.a)(e,2),a=t[0],n=t[1];return r.a.createElement("li",{key:a},r.a.createElement("svg",{viewBox:"0 0 20 20",fill:"currentColor",className:"user w-8 h-8 inline pr-1"},r.a.createElement("path",{fillRule:"evenodd",d:"M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z",clipRule:"evenodd"})),n.name)}))),!this.state.players&&0===this.state.numJoiners&&r.a.createElement("p",{className:"px-3 py-1 mx-4 bg-gray-200 italic border-l-4 border-gray-800 rounded w-max-content"},"Nobody has joined the game."),this.state.numJoiners>0&&r.a.createElement("ul",null,r.a.createElement("li",{className:"animate-pulse"},r.a.createElement("svg",{viewBox:"0 0 20 20",fill:"currentColor",className:"user w-8 h-8 inline pr-1"},r.a.createElement("path",{fillRule:"evenodd",d:"M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z",clipRule:"evenodd"})),r.a.createElement("span",{className:"italic gray-600 text-sm"},"someone is joining..."))),this.state.isGameCreator&&r.a.createElement("div",null,r.a.createElement("h2",{className:"uppercase tracking-wide text-sm text-gray-700 mb-2 mt-4"},"Select a category:"),this.state.categories&&r.a.createElement("select",{className:"p-2 rounded shadow max-w-full",name:"selectedCategory",onChange:this.handleChange},r.a.createElement("option",{value:"-1"},"Any category"),this.state.categories.map((function(e){return r.a.createElement("option",{key:e.id,value:e.id},e.name)}))),r.a.createElement("h2",{className:"uppercase tracking-wide text-sm text-gray-700 mb-2 mt-4"},"Select difficulty:"),r.a.createElement("label",{className:"block mb-1"},r.a.createElement("input",{type:"radio",name:"difficulty",value:-1,onChange:this.handleChange,checked:"-1"===this.state.difficulty}),r.a.createElement("span",{className:"ml-2"},"Any difficulty")),r.a.createElement("label",{className:"block mt-1"},r.a.createElement("input",{type:"radio",name:"difficulty",value:"easy",onChange:this.handleChange,checked:"easy"===this.state.difficulty}),r.a.createElement("span",{className:"ml-2"},"Easy")),r.a.createElement("label",{className:"block"},r.a.createElement("input",{type:"radio",name:"difficulty",value:"medium",onChange:this.handleChange,checked:"medium"===this.state.difficulty}),r.a.createElement("span",{className:"ml-2"},"Medium")),r.a.createElement("label",null,r.a.createElement("input",{type:"radio",name:"difficulty",value:"hard",onChange:this.handleChange,checked:"hard"===this.state.difficulty}),r.a.createElement("span",{className:"ml-2"},"Hard")),r.a.createElement("h2",{className:"uppercase tracking-wide text-sm text-gray-700 mb-2 mt-4"},"Number of questions:"),r.a.createElement("input",{className:"p-2 rounded shadow",type:"number",value:this.state.numberQuestions,name:"numberQuestions",inputMode:"numeric",onChange:this.handleChange}),r.a.createElement("button",{className:"block mx-auto bg-teal-700 hover:bg-teal-600 text-white uppercase shadow py-2 px-4 tracking-wide text-sm rounded mt-4",onClick:this.startGame},"start game"),this.state.joinError.error&&r.a.createElement("div",{className:"rounded border-red-800 border-l-4 bg-red-200 p-2 my-2 flex items-center text-red-800 text-sm leading-tight"},r.a.createElement("svg",{viewBox:"0 0 20 20",fill:"currentColor",className:"exclamation w-8 h-8 inline pr-2 flex-initial"},r.a.createElement("path",{fillRule:"evenodd",d:"M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z",clipRule:"evenodd"})),r.a.createElement("span",{className:"flex-1"},this.state.joinError.msg))))):"countdown"===this.state.appState?r.a.createElement("div",{class:"absolute w-screen h-screen flex items-center"},r.a.createElement("div",{className:"max-w-sm mx-auto content-center font-thin text-purple-700"},"starting game in",r.a.createElement("div",{className:"text-6xl font-black animate-ping text-gray-900 text-center"},this.state.gameCountdown))):r.a.createElement("div",{className:"bg-gray-100 w-screen h-screen absolute"},t&&r.a.createElement("div",{className:"absolute w-full uppercase bg-purple-900 text-gray-300 text-xs tracking-wider shadow"},r.a.createElement("div",{className:"max-w-sm mx-auto px-2 py-1"},"question ",t.index+1," of ",this.state.numberQuestions)),r.a.createElement("div",{className:"max-w-sm mx-auto my-8 p-2"},r.a.createElement("div",{className:"number"===typeof this.state.correctAnswer?"hidden":"fixed bottom-0 right-0 lg:absolute lg:-ml-16 lg:-mt-1 lg:bottom-auto lg:right-auto font-black text-2xl h-12 w-12 m-4 rounded-full bg-teal-700 text-gray-100 shadow"},r.a.createElement("div",{className:"mx-auto animate-bounce min-w-0 pt-3 w-min-content"},this.state.questionCountdown)),t&&r.a.createElement("div",null,r.a.createElement("p",null,t.question),t.answers.map((function(t,a){return r.a.createElement("label",{key:a,className:"transition relative block bg-white py-2 px-4 border-solid rounded my-2 box-border border-2 "+(e.state.userAnswer===a.toString()?"shadow-xl z-40 border-l-8 ":"shadow z-20 ")+("number"===typeof e.state.correctAnswer?e.state.correctAnswer===a?"border-green-500":"border-red-500":"border-gray-800")},r.a.createElement("input",{className:"hidden",type:"radio",name:"userAnswer",value:a,onChange:e.handleChange,checked:e.state.userAnswer===a.toString(),disabled:"number"===typeof e.state.correctAnswer}),"number"===typeof e.state.correctAnswer&&e.state.correctAnswer!==a&&r.a.createElement("svg",{viewBox:"0 0 20 20",fill:"currentColor",className:"x w-6 h-6 inline text-red-500"},r.a.createElement("path",{fillRule:"evenodd",d:"M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",clipRule:"evenodd"})),e.state.correctAnswer===a&&r.a.createElement("svg",{viewBox:"0 0 20 20",fill:"currentColor",className:"check w-6 h-6 inline text-green-500"},r.a.createElement("path",{fillRule:"evenodd",d:"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",clipRule:"evenodd"})),r.a.createElement("span",{className:"pl-2"},t))})),r.a.createElement("hr",{className:"my-1"})),this.state.gameOver&&r.a.createElement("h1",{className:"text-3xl mx-2 font-black"},"Game over"),this.state.players&&r.a.createElement("ul",null,r.a.createElement("h2",{className:"uppercase tracking-wide text-sm m-1 text-gray-700"},"Leaderboard:"),Object.entries(this.state.players).map((function(t){var a=Object(o.a)(t,2),n=a[0],s=a[1],l=0===e.state.updatedIndex?0:s.score/e.state.updatedIndex*100;return r.a.createElement("li",{key:n,className:"bg-pink-300 overflow-hidden relative rounded shadow mb-2"},r.a.createElement("span",{className:"bg-pink-600 pl-2 py-1 whitespace-no-wrap inline-block text-white font-bold",style:{width:l+"%"}},s.name),r.a.createElement("span",{className:"py-1 pr-2 text-white right-0 absolute"},s.score," / ",e.state.updatedIndex))})))))}}]),a}(n.Component));Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));l.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(w,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[45,1,2]]]);
//# sourceMappingURL=main.29c064c6.chunk.js.map