


class AmbientBallSystem {
    ballParameters = []
    controllerParameters = []
    // parameters construction: list of dictionaries like: {socket: <Socket>, id: <String>} and the socket server instance
    constructor(io) {
        this.io = io
        // server sends go command to all clients after  set up was finished  (once all ids were gathered)
        
    }
    
    callibrate() {

    }

    sortParameters() {
        this.ballParameters.sort((a, b) => {
            return a.id.localeCompare(b.id); // be careful with capitallizations))
        });

        this.controllerParameters.sort((a, b) => {
            return a.id.localeCompare(b.id); // be careful with capitallizations))
        })
    }

    finish_initialization() {
        // Now create the middleware to be used 
        console.log("Finishing Initialization by creating Balls and motors")
        console.log("Further sorting the input after the ids")
        this.sortParameters();
        this.ballParameters.forEach(item => {
            let socket = this.io.of("/").sockets.get(item.socketID)
            this.add_events_balls(socket);
            
        });
        this.controllerParameters.forEach(item =>  {
            let socket = this.io.of("/").sockets.get(item.socketID) // of gets the correct namespace where / is the global namespacce I think
            this.add_events_controller(socket);
            console.log(socket.eventNames())
        });
        
        // now create balls and motors

        // emit the go command
        // can just be broadcasted
        this.io.emit("go")
    }   

    addClient(id, socketID, isBall) {
        console.log("addClient is called")
        if (isBall) {
            this.ballParameters.push({"socketID" : socketID, "id" : id})
        }
        else {
            this.controllerParameters.push({"socketID" : socketID, "id" : id})
        }
        if (this.ballParameters.length > 1 && this.controllerParameters.length == 1) {
            this.finish_initialization()
        }
    }

    add_events_balls(socket) {
        // create all events for the sockets

        socket.on("test", () => {
            console.log("test called")
        })
    }

    add_events_controller(socket) {
        // create all events for the sockets

        socket.on("testConroller", () => {
            console.log("test called")
        })
    }

    // example on how to send message
    message (userId, event, data) {
        io.sockets.to(userId).emit(event, data);
      }
}

module.exports = AmbientBallSystem





/*socket.on('touch', (touchState) => {
            
    console.log('user touched on: ' + touchState);
});*/

