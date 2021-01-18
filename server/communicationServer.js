// creates io socket webserver and when on server browser connects here 

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const AmbientBallSystem = require("./AmbientBallSystem")
let system = new AmbientBallSystem(io) // delete listeners after initialization

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {

    socket.on('server message', (msg) => {
        io.emit('server message', msg);
      });
    

      socket.on("registerBrowser", () => { // can use rooms for browser to send message to all or we use the server message
        // register a browser as listener
        console.log(socket.id)
      })

      socket.on('registerID', (id, isBall) => {
        console.log(id, isBall)
        system.add_client(id, socket.id, isBall)
        // call my own function isBall specifys if it is a ball or a motror

    })
    socket.emit('requestID') // emit request to get ball id. ignored by browser

  });

http.listen(3000, () => {
  console.log('listening on *:3000');
});



// good write up https://stackoverflow.com/questions/9709912/separating-file-server-and-socket-io-logic-in-node-js?rq=1
// how to seperate the initial logic
// We can safe the not the socket but a socket id and can use io.to(id) to send a message of the specified socket
// This socket id is different from the ball id that is send initally

// What to do if we lose connectin to one of the balls?
// The system somehow needs to block


// are commands received asynchronous ? if yes we need to take care that the state does not go out of sync => but most commands influence only one ball and not more
// this can be given to the function If two commands are sent from the same ball we need to be careful

// otherwise we want to work the commands in the order they are received

// we can overwarite console log to send stuff to a websocket connected inside the browser
