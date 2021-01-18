const server = require('http').createServer();

const io = require('socket.io')(server, {
  path: '/test',
  serveClient: false,
  // below are engine.IO options
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

server.on('connection', function (client) {
    console.log("New connection");
  });

server.on('data', function (client) {
    console.log("New data");
});

server.on('close', () => {
    console.log('Subscriber disconnected.');
});

server.listen(8080);

// got this example from  the below link
// https://stackoverflow.com/questions/64911095/example-of-c-client-and-node-js-server?newreg=18bda68644d94641bc20e2deab47998a

// facing problems in my local machine  while installing SOCKET.IO Llibrary.
// so,couldn't try yet
