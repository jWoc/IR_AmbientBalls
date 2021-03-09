const config = require('./config')
const Color = require('color')
const Framework = require("./components/Framework")
const BallDef = require("./components/Ball")
const TOUCHSTATES = BallDef.TOUCHSTATES
const Position = BallDef.Position
const AmbientBallModes = BallDef.AmbientBallModes
const StravaSportsDataCollector = require("./api/strava")
const { io } = require('socket.io-client')


// TODO we need to handle when we lose a  client 
// what should happen then? or because we have a prototype we ignore it and assume best conditions?
class AmbientBallSystem {

    // temporary values used during initialisation
    allBallParameters = []
    allControllerParameters = []

    frameworks = []


    // mapper
    socketID_to_id = {} // map for later debug meesages {scoketID: ID}
    idToSyncedObjects = {}
    idToObject = {}


    // parameters construction: list of dictionaries like: {socket: <Socket>, id: <String>} and the socket server instance
    constructor(io) {
        this.io = io
        this.idToSyncedObjects = this.createSyncMapper()

        // initiate Sports-API Connection
        this.sportsConnection = new StravaSportsDataCollector()
    }
    
    createSyncMapper() {
        var idToSyncedObjects = {}

        // ballsPerFramework is used to check constraints (each framework should have same amount of IDs)
        //  -> used to check validity of config
        var ballsPerFramework = config.frameworks[0].orderedBallIds.length

        var frameworkSync = []
        var controllerSync = []
        var ballSyncs = []

        
        var frameworks = config.frameworks
        // first iteration: combine all synced values
        for (var frameworkCounter = 0; frameworkCounter < frameworks.length; frameworkCounter++) {
            var framework = frameworks[frameworkCounter]

            // sync framework
            frameworkSync.push(framework.id)

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
        // mapping for framework:
        frameworkSync.forEach((frameworkID) => {
            idToSyncedObjects[frameworkID] = frameworkSync
        })

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
        this.allBallParameters.sort((a, b) => {
            return a.id.localeCompare(b.id); // be careful with capitallizations))
        });

        this.allControllerParameters.sort((a, b) => {
            return a.id.localeCompare(b.id); // be careful with capitallizations))
        })
    }

    getSocketById(socketID) {
        return this.io.of("/").sockets.get(socketID)
    }

    setupSocket(param, eventRegistrationHandler) {
        let socket = this.getSocketById(param.socketID)
        eventRegistrationHandler.call(this, socket);
        this.socketID_to_id[param.socketID] = param.id
        param["socket"] = socket
    }
    getParamById(paramList, id) {
        for (var i=0; i<paramList.length; i++) {
            if (paramList[i].id == id) {
                return paramList[i]
            }
        }
        throw new Error("Search Error: param with the following id does not exist: " + id)
    }


    finish_initialization() {
        console.log("Finishing Initialization by creating Balls and motors")
        
        // todo delete: sort by config on server: fixed sorting
        // this.sort_parameters();


        // build up components
        for (var frameworkCounter=0; frameworkCounter < config.frameworks.length; frameworkCounter++) {
            var framework = config.frameworks[frameworkCounter]

            // get socket and register events
            var controllerParameter = this.getParamById(this.allControllerParameters, framework.controllerId)
            this.setupSocket(controllerParameter, this.add_events_controller)
            var ballParameters = []
            for (var i=0; i<framework.orderedBallIds.length; i++) {
                var ballID = framework.orderedBallIds[i]
                var ballParameter = this.getParamById(this.allBallParameters, ballID)
                ballParameters.push(ballParameter)
                this.setupSocket(ballParameter, this.add_events_balls)
            }

            // create framework
            var frameworkObject = new Framework(framework.id, ballParameters, controllerParameter)
            this.frameworks.push[frameworkObject]

            // create mapper (id to object)
            this.idToObject[frameworkObject.getId()] = frameworkObject
            var motorController = frameworkObject.getMotorController()
            this.idToObject[motorController.getId()] = motorController
            frameworkObject.getBalls().forEach((ball) => {
                this.idToObject[ball.getId()] = ball
            })
        }

        /*this.allBallParameters.forEach(item => {
            
            this.add_events_balls(socket);
            this.socketID_to_id[item.socketID] = item.id
        });
        this.controllerParameters.forEach(item =>  {
            let socket = this.io.of("/").sockets.get(item.socketID) // of gets the correct namespace where / is the global namespacce I think
            this.add_events_controller(socket);
            this.socketID_to_id[item.socketID] = item.id // add to map
            // console.log(socket.eventNames())
        });*/
        

        // now create balls and motors
        // initialize balls and controllers with the socket so a ball can emit a command (willbe used in changeMode)
        // emit the go command
        // can just be broadcasted
        this.io.emit("go")


        // activate sport synchronizer
        if (config.activateSportSync) {
            // trigger sports model updater
            this.updateSportsState()
            this.sportsTimer = setInterval(() => {
                this.updateSportsState()
            }, config.sporstUpdateIntervall)
        }
    }   

    add_client(id, socketID, isBall) {
        

        // check if there is no mapping for this id in the config
        if (this.idToSyncedObjects[id] == undefined) {
            throw new Error("No mapping in config for id =\"" + id + "\"")
        }

        // check that the id is not given twice
        if( this.allBallParameters.map((parameter) => parameter.id).includes(id)
        || this.allControllerParameters.map((parameter) => parameter.id).includes(id)) {
            throw new Error("ID defined twice: id =\"" + id + "\"")
        }

        if (isBall) {
            this.allBallParameters.push({"socketID" : socketID, "id" : id})
        }
        else {
            this.allControllerParameters.push({"socketID" : socketID, "id" : id})
        }

        console.log("client registered: " + id)

        // check if all clients connected
        if ((this.allBallParameters.length + this.allControllerParameters.length) == (config.frameworks.length * (1+config.frameworks[0].orderedBallIds.length))) {
            console.log("call finish_intialization\n");
            this.finish_initialization()
        }
    }

    // resolves objects from list of IDs
    getObjectsById(idList) {
        var referencedObjects = []
        idList.forEach((id) => {
            referencedObjects.push(this.idToObject[id])
        })
        return referencedObjects
    }


    getObjectBySocketId(socketID) {
        var id = this.socketID_to_id[socketID]
        var object = this.idToObject[id]
        return object
    }

    getSyncedObjectsById(id) {
        var syncedIds = this.idToSyncedObjects[id]
        return this.getObjectsById(syncedIds)
    }

    moveHandler(touchState, socketID) {
        // get relevant objects
        var ball = this.getObjectBySocketId(socketID)
        if (ball.active_state == AmbientBallModes.EMOTIONS) {
            var framework = ball.getFramework()
            var ballIndex = framework.getIndex(ball)
            var syncedFrameworks = this.getSyncedObjectsById(framework.getId())


            // determine move direction
            var moveUp = touchState == TOUCHSTATES.BOTTOM

            // determine move command
            var moveValue = config.moveStepSize
            if (!moveUp) {
                moveValue *= -1
            }


            syncedFrameworks.forEach((syncedFramework)=> {
                syncedFramework.getMotorController().updatePosition(ballIndex, ball.getState(), moveValue, true)
            })

        } else {
            console.error("moveHandler: You can not move a ball which is not in EMOTIONS mode")
        }
    }

    changeSkinBall_notifyTouched_setBallTouched(ball) {
        var ballState = ball.getState();
        ballState.blink = false;
        ballState.vibrate = false;
        this.message(ball.socketID, "setBlinking", {start: ballState.blink} );
        this.message(ball.socketID, "setVibrating", {start: ballState.vibrate} );
    }

    changeSkinBall_notifyTouched_setBallUnTouched(ball) {
        var untouchedState = ball.getState();
        untouchedState.blink = true;
        untouchedState.vibrate = true;
        this.message(untouchedBall.socketID, "setBlinking", {start: untouchedState.blink} );
        this.message(untouchedBall.socketID, "setVibrating", {start: untouchedState.vibrate} );
    }



    changeBallColors(ballList, color) {
        ballList.forEach(ball => this.message(ball.socketID, "setColor", {rgb: color.rgb().array()}))
    }   

    skinHandler(newTouchState, socketID) {
        // get relevant objects
        var ball = this.getObjectBySocketId(socketID)
        var syncedBalls = this.getSyncedObjectsById(ball.getId())

        if (ball.active_state === AmbientBallModes.TOUCH) {

            var ballState = ball.getState();
            var oldTouchState = ball.getState().touch;
            ballState.touch = newTouchState;
            var notTouchedBalls = syncedBalls.filter(ball => ball.getState().touch != TOUCHSTATES.BOTH);

            //console.log(syncedBalls.length)
            //console.log(notTouchedBalls.length)
            // 2 special cases
            if (oldTouchState != newTouchState && newTouchState === TOUCHSTATES.NOTHING) {
                // we remove hand
                // a ) no ball is touched
                // b) there are some that are still touched then your own should start blinking
                // c) there are some still touched and all were touched so we need to change color                 

                if (notTouchedBalls.length == 1) { // c) there are still some touched
                    this.changeBallColors(syncedBalls, ball.modeToColor()) // modeToColor is default color
                    this.changeSkinBall_notifyTouched_setBallUnTouched(notTouchedBalls[0]); // ball should now vobrate
                }

                else if (notTouchedBalls.length == syncedBalls.length) { // a
                    notTouchedBalls.forEach(ball1 => this.resetBall(ball1));
                }
                else { // b

                    notTouchedBalls.forEach(ball1 => this.changeSkinBall_notifyTouched_setBallUnTouched(ball1));

                    
                }
            }
            else if (oldTouchState != TOUCHSTATES.BOTH && newTouchState === TOUCHSTATES.BOTH) { // was not touched before from both sides
                // cases (so ball will be touched)
                // a) all are now touched
                // b) some are still not touched

                // reset blinking and vibrating of the ball that is now touched
                if (notTouchedBalls.length == 0) { // a)
                    console.log("Case a) when you start touching. All touched")
                    this.changeBallColors(syncedBalls, Color("rgb(139,0,0)"));
                    this.changeSkinBall_notifyTouched_setBallTouched(ball); // stop vibrating
                }
                else { // b)
                    this.changeSkinBall_notifyTouched_setBallTouched(ball);
                }
            }
            else {
                console.log("SkinHandler error. Good Luck. newTouchState was: " + newTouchState + "and oldTouchstate was: " + oldTouchState);
            }

        }
        else {
            console.log("If not in Touch mode pressing both sides has no effect");
        }
        // TODO
        // 1 Check if both balls are in the touch state right now (otherwise nothing hppens)
        // Check if ypur own ball is in tpuched red color (that pulses)
        // 2.1 If not set it to pulse red / just blink aswell
        // 3 Then check if the synced  ball is touched from both sides aswell 
        // 3.1 If not tpuched let it vibrate and blinking red
        // 3.2 If touched from both sides change vibrating and stop blinking 
        // 3.3 Now vibration should pulse (shoulc be maybe controlled on client that we staarted it )
        // Now if one of them leaves repeat to 2

    }

    convert_touchstate(touch_str) {
        if (touch_str === "Top") {
            return TOUCHSTATES.TOP;
        }
        else if (touch_str === "Bot") {
            return TOUCHSTATES.BOTTOM;
        }
        else if (touch_str === "Both") {
            return TOUCHSTATES.BOTH
        }
        else if (touch_str === "Nothing") {
            return TOUCHSTATES.NOTHING;
        }
        else {
            console.log("The touchState" + touch_str + "that was sent from the ball does not work")
        }
    }

    touchHandler(touchState, socketID) {

        var touchState = this.convert_touchstate(touchState) // convert touchState since it is just a string to the enum
        switch(touchState) {
            case TOUCHSTATES.TOP:
            case TOUCHSTATES.BOTTOM: 
                    this.moveHandler(touchState, socketID)
                break;
            case TOUCHSTATES.BOTH: 
            case TOUCHSTATES.NOTHING: // if nothing is pressed
                    this.skinHandler(touchState, socketID)
                break;
            default:
                throw new Error("Touch event \"" + touchState + "\" should not be received on the server")
                break;
        }
    }

    resetBall(ball) {
        var ballState = ball.getState();
        ballState.color = ballState.modeToColor(); // reset color (can happen if we are in touch case)
        ballState.blink = false;
        ballState.vibrate = false;
        this.message(ball.socketID, "setColor", {rgb: ballState.color.rgb().array()});
        this.message(ball.socketID, "setBlinking", {start: ballState.blink});
        this.message(ball.socketID, "setVibrating", {start: ballState.vibrate});
    }

    applyState(ball) {
        var next_mode = ball.next_active_mode()
        ball.active_state = next_mode;
        var ballState = ball.getState();
        this.resetBall(ball);
        

    }

    applyNextStates(ballList) {
        ballList.forEach((ball) => {
            this.applyState(ball)
        })
    }

    // iterate over all ball changes and execute them
    updateMotorController(moveValues, motorController, isActiveState) {
        for (var ballIndex=0; ballIndex < moveValues.length; ballIndex++) {
            if (moveValues[ballIndex] > 0) {
                motorController.updatePosition(ballIndex, null, moveValues[ballIndex], isActiveState, true)
            }
        }
    }

    changeModeHandler(socketID) {
        // incrementally changed

        // get relevant objects
        var motorController = this.getObjectBySocketId(socketID)
        var framework = motorController.getFramework()
        var syncedFrameworks = this.getSyncedObjectsById(framework.getId())

        var moveValues = []

        framework.getBalls().forEach(ball =>  {
            var moveValue = ball.getState().distance(ball.state[ball.next_active_mode()]) // calculate the distance between two states
            moveValues.push(moveValue)
        });
        /*
        for (var ball in framework.getBalls()) {
            console.log(ball)
            var moveValue = ball.getState().distance(ball.state[ball.next_active_mode()]) // calculate the distance between two states
            moveValues.push(moveValue);
        }*/

        // update frameworks
        syncedFrameworks.forEach((syncedFramework) => {
            // update ball positions
            this.updateMotorController(moveValues, syncedFramework.getMotorController(), true)

            this.applyNextStates(syncedFramework.getBalls())
        })
    }


    add_events_balls(socket) {
        // create all events for the sockets
        
        // create room for all balls that are connected together
        socket.on("touch", (touchState) => {this.touchHandler(touchState, socket.id)});

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

        socket.on("changeMode", () =>{this.changeModeHandler(socket.id)})

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
        //io.sockets.to(userId).emit(event, data);
    }

    // Used for logging format the msg as in socket.use code
    log(msg) {
        io.emit("server message", msg)
    }

    updateAthleteState(athlete, stats) {
        console.log(stats)
        // get relevant object
        var ball = this.idToObject[athlete.syncedBall]
        var ballState = ball.getSportsState()

        // calculate target position
        var activeHours = stats[1]
        var targetPercentagePos = activeHours / athlete.baseline
        if (targetPercentagePos > 1) {
            targetPercentagePos = 1
        }
        // console.log("targetPos: ", targetPos)
        var targetPos = new Position(targetPercentagePos)
        var distance = ballState.position.distance(targetPos)
        if (distance != 0) {
            var controller = ball.getFramework().getMotorController()
            var ballIndex = ball.getFramework().getIndex(ball)
            controller.updatePosition(ballIndex, ballState, distance, ball.active_state == AmbientBallModes.SPORT)
        }

    }

    updateSportsState() {
        config.athletes.forEach((athlete) =>  {
            console.log("name: ", athlete.name)
            this.sportsConnection.getSportsStatistics(athlete.access_token)
                .then((stats) => {this.updateAthleteState(athlete, stats)})
        })
        
    }
}

module.exports = AmbientBallSystem





/*socket.on('touch', (touchState) => {
            
    console.log('user touched on: ' + touchState);
});*/

