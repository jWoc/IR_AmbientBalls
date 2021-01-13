
const io = require('socket.io-client');
const socket = io('http://localhost:3000');  // Server endpoint

socket.on('connect', () => {
    console.log("Successfuly conneczted")
});

socket.on('message', function (data) {
  console.log(data);
});

socket.on('go', function () {
    console.log("Received go Command !");
  });

socket.on("requestID", () => {
    console.log("Request received Registering....")
    socket.emit("registerID", "2", true); // your id you need to create a client and then switch the code here to false to create a controller client 
})