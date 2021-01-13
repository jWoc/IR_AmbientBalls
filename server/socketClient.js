
const io = require('socket.io-client');
const socket = io('http://localhost:3000');  // Server endpoint

socket.on('connect', () => {
    console.log("Successfuly conneczted")
});

/*socket.on('message', function (data) {
  console.log(data);
});
*/

socket.on('go', function () {
    console.log("Received go Command !");
  });

socket.on("requestID", () => {
    console.log("Request received Registering....")
    socket.emit("registerID", "1", false); // your id you need to create a client and then switch the code here to false to create a controller client 
})
// Create 3 clients and let them live even if you kill the server. Websockets are smart enough to reconnect again
// See https://stackoverflow.com/questions/15509231/unit-testing-node-js-and-websockets-socket-io for unit tests

const repl = require('repl');
const chalk = require('chalk');
repl.start({
  prompt: '',
  eval: (cmd) => {
    let event, args;
      [event, args] = cmd.split(" ") // the args do not have the correct type since they ayre strings so be careful !
      console.log(event);
      socket.emit(event, args)
  }
})