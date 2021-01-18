const config = require('./config')

// TODO we need to handle when we lose a  client 
// what should happen then? or because we have a prototype we ignore it and assume best conditions?
class AmbientBallSystem {

    // temporary values used during initialisation
    ballParameters = []
    controllerParameters = []


    socketID_to_id = {} // map for later debug meesages {scoketID: ID}
    // parameters construction: list of dictionaries like: {socket: <Socket>, id: <String>} and the socket server instance
    constructor(io) {
        this.io = io
        this.idToSyncedObjects = this.createSyncMapper()
        console.log(this.idToSyncedObjects)
    }
    
    createSyncMapper() {
        var idToSyncedObjects = {}

        // ballsPerFramework is used to check constraints (each framework should have same amount of IDs)
        //  -> used to check validity of config
        var ballsPerFramework = config.frameworks[0].orderedBallIds.length

        var controllerSync = []
        var ballSyncs = []

        
        var frameworks = config.frameworks
        // first iteration: combine all synced values
        for (var frameworkCounter = 0; frameworkCounter < frameworks.length; frameworkCounter++) {
            var framework = frameworks[frameworkCounter]
            // sync controller
            controllerSync.push(framework.controllerId)

            
            var orderedBallIds = framework.orderedBallIds
            // condition check: same amount of balls at each framework
            if (orderedBallIds.length != ballsPerFramework) {
                throw new Exception("config error: wrong count of balls per framework")
            }

            // combine all synced balls related to its index
            for (var i = 0; i < orderedBallIds.length; i++) {
                if (frameworkCounter == 0) {
                    // push element at index as one element array
                    ballSyncs.push([orderedBallIds[i]])
                } else {
                    // add id at corresponding position
                    ballSyncs[i].push(orderedBallIds[i])
                } 
            }
        }

        // create mapping
        // mapping for controller:
        controllerSync.forEach((controllerID) => {
            idToSyncedObjects[controllerID] = controllerSync
        })
        // mapping for balls per index:
        ballSyncs.forEach((ballSync) => {
            // each ball
            ballSync.forEach((ballID) => {
                idToSyncedObjects[ballID] = ballSync
            })
        })
        return idToSyncedObjects
    }

    callibrate() {

    }

    sort_parameters() {
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
        this.sort_parameters();
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
        // initialize balls and controllers with the socket so a ball can emit a command (willbe used in changeMode)
        // emit the go command
        // can just be broadcasted
        this.io.emit("go")
    }   

    add_client(id, socketID, isBall) {
        

        // check if there is no mapping for this id in the config
        if (this.idToSyncedObjects[id] == undefined) {
            throw new Error("No mapping in config for id =\"" + id + "\"")
        }

        // check that the id is not given twice
        if( this.ballParameters.map((parameter) => parameter.id).includes(id)
        || this.controllerParameters.map((parameter) => parameter.id).includes(id)) {
            throw new Error("ID defined twice: id =\"" + id + "\"")
        }

        if (isBall) {
            this.ballParameters.push({"socketID" : socketID, "id" : id})
        }
        else {
            this.controllerParameters.push({"socketID" : socketID, "id" : id})
        }

        console.log("client registered: " + id)

        // check if all clients connected
        if ((this.ballParameters.length + this.controllerParameters.length) == Object.keys(this.idToSyncedObjects).length) {
            console.log("call finish_intialization\n");
            this.finish_initialization()
        }
    }

    touch_handler(data) {
            
        // identify 
        // id -> framework
        // id -> ball / controller
        // id -> ball + synchronized ball
        //define mapping function ball -> sync ball[]
        // check constraints (is ball top position or bottom?)
        
        calculate_steps()
        // get all synced objects 
        // send command to all synchronized balls e.g 
        // define funcitons inside the framework
        // update internal model

    }

    add_events_balls(socket) {
        // create all events for the sockets
        
        // create room for all balls that are connected together
        socket.on("touch", this.touch_handler);

        // create room for all balls that are connected together
        socket.on("changeMode", () => { // incrementally changed

            // determine changes
            // apply changes on internal model
            // get synchronized objects
            // apply changes on real objects



            const ballId = 
            // identify 
            // id -> framework
            // id -> ball / controller
            // id -> ball + synchronized ball
            // define mapping function ball -> sync ball[]
            // check constraints (is ball top position or bottom?)
            
            calculate_steps()
            // get all synced objects 
            // send command to all synchronized balls e.g 
            // define funcitons inside the framework
            // update internal model

        })



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

    // when we lose connnection we to need to delete the instance of the socket ( ball/ controler) and need to go into a state of waiting for a aconnection
    // test disconnect event 

    // Error handling 
    // middlware intercept all commands except registerID or in common message to block sockets 
    // on disconnect send command to start virbating and blinkling to notify user that in error state
    // on Reconnect check which id is missing and add it again
    // then callibrate this specific socket

    // Or if connections is lost just rtestart the server and restart he client 

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

