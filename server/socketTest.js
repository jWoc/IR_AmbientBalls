// creates io socket webserver and when on server browser connects here 


const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);


const AmbientBallSystem = require("./AmbientBallSystem")
let system = new AmbientBallSystem(io) // delete listeners after initialization
// init system


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// io.use create middleware and check if yopu can ignore calls that wer send from self(e.g website) since we dont want to log these 
// if there is no browser connected messages will be backlogged not sure if this is correct behaviour

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
      });

      socket.on("registerBrowser", () => { // can use rooms for browser
        // register a browser as listener
        console.log(socket.id)
      })


      socket.on('registerID', (id, isBall) => {
        console.log(id, isBall)
        system.addClient(id, socket.id, isBall)
        // call my own function isBall specifys if it is a ball or a motror
        checkConnected(id, isBall);
    })
    socket.emit('requestID') // emit request to get ball id. ignored by browser

  });


  // Checks how many balls are registered right now and decides if it is a ball or motor controller
var ids_balls = []
var ids_motors = []
function checkConnected(id, isBall) {
    if (isBall) {
        ids_balls.push(id)
    }
    else {
        ids_motors.push(id)
    }
}


http.listen(3000, () => {
  console.log('listening on *:3000');
});


// to send the messages when the framework does it 
// Following this I can use https://riptutorial.com/socket-io/example/30273/example-server-side-code-for-handling-users
// it to create the balls and then give it to the framework


// use middleware to io.use() to act as middleware()
// then format the message and send it to the webserver
// then use next

// good write up https://stackoverflow.com/questions/9709912/separating-file-server-and-socket-io-logic-in-node-js?rq=1
// how to seperate the initial logic