

// TODO we need to handle when we lose a  client 
// what should happen then? or because we have a prototype we ignore it and assume best conditions?
class AmbientBallSystem {
    ballParameters = []
    controllerParameters = []
    socketID_to_id = {} // map for later debug meesages {scoketID: ID}
    // parameters construction: list of dictionaries like: {socket: <Socket>, id: <String>} and the socket server instance
    constructor(io) {
        this.io = io
        
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
        console.log("Finishing Initialization by creating Balls and motors")
        console.log("Further sorting the input after the ids")
        this.sortParameters();
        this.ballParameters.forEach(item => {
            let socket = this.io.of("/").sockets.get(item.socketID)
            this.add_events_balls(socket);
            this.socketID_to_id[item.socketID] = item.id
            
        });
        this.controllerParameters.forEach(item =>  {
            let socket = this.io.of("/").sockets.get(item.socketID) // of gets the correct namespace where / is the global namespacce I think
            this.add_events_controller(socket);
            this.socketID_to_id[item.socketID] = item.id // add to map
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
        // We add a middleware for each socket. we do it here and not in the beginning to filter browser sockets and get access to naming the sockets by their ball id
        // We could also use a standard browser but now we automatically get all incoming calls
        // Note that outgoing is missing!
        socket.use((args, next) => { // it actually has to be a namespace
            //console.log("LOGGER: ", socket.handshake) // print if it is from browser (browser is loopback address ::1)
            // console.log(socket)
            let event = args[0] // if we only send data this is not correct (I thikn) but we assume to always send a command
            let id = this.socketID_to_id[socket.id]
            let msg = `Ball ${id} with the event [${event}] with data ${args.slice(1)}` // check interpolated strings
            this.io.emit("server message", msg) // chat message used for the browser
            next();
            })
    }

    add_events_controller(socket) {
        // create all events for the sockets in here

        socket.on("testConroller", () => {
            console.log("test called")
        })

        socket.use((args, next) => { // it actually has to be a namespace
            let event = args[0] // if we only send data this is not correct (I thikn) but we assume to always send a command
            let id = this.socketID_to_id[socket.id]
            let msg = `Controller ${id} with the event [${event}] with data ${args.slice(1)}` // check interpolated strings
            this.io.emit("server message", msg)
            next();
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

