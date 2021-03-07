
const AmbientBallSystem = require("../AmbientBallSystem")
const BallDef = require("../components/Ball")
const TOUCHSTATES = BallDef.TOUCHSTATES

socketDict = {}

function registerSocketEventFunction(socketID, message, handler) {
    // console.log("function registered: " + socketID, message,  handler)

    // register function so that it can be used later
    socketDict[socketID][message] = handler
}

function createFakeSockets(socketID) {
    // room id should be equal to socket id (according current implementation)
    var fakeSocket = {
        on: (message, handler) => {registerSocketEventFunction(socketID, message, handler)},
        use: (data) => {},
        eventNames: () => {},
        emit: (message, data) => {console.log("socket send command triggered: ", message, data)},
        id: socketID,
    }
    socketDict[socketID] = fakeSocket;

    return fakeSocket
}


// for simple socket and io simulation
var io = {
    emit: (command) => {},
    of: (roomid) => {return {
        sockets: {
            get: createFakeSockets,
        }
    }}
    //sockets: { to: userId => {return socketDict[userId]} }
}
io.sockets = { to: (userId) => {return socketDict[userId]} };

// let system = new AmbientBallSystem(new IO_Test()) // delete listeners after initialization
let system = new AmbientBallSystem(io)



system.add_client("Framework1_Ball1", "socketID_B1", true)
system.add_client("Framework1_Ball2", "socketID_B2", true)
system.add_client("Framework1_Ball3", "socketID_B3", true)
system.add_client("Framework1_Ball4", "socketID_B4", true)
system.add_client("Framework1_Ball5", "socketID_B5", true)

system.add_client("Framework2_Ball1", "socketID_B6", true)
system.add_client("Framework2_Ball2", "socketID_B7", true)
system.add_client("Framework2_Ball3", "socketID_B8", true)
system.add_client("Framework2_Ball4", "socketID_B9", true)
system.add_client("Framework2_Ball5", "socketID_B10", true)


system.add_client("Framework1_Controller", "socketID_C1", false)
system.add_client("Framework2_Controller", "socketID_C2", false)

socketDict["socketID_C1"]["changeMode"]()
socketDict["socketID_C1"]["changeMode"]()
socketDict["socketID_B3"]["touch"]("Both")
socketDict["socketID_B8"]["touch"]("Both")

console.log("test finished");






/*
var testDict = {hallo:"def"}
// access unknown value
console.log(testDict["abc"] == undefined)
console.log(testDict["abc"] == null)

console.log(testDict.hallo)
console.log(testDict["hallo"])

// dict length
testDict = {"1":1, "2":2, "3":3}
console.log(Object.keys(testDict).length)
// adaption pointer
var testArray = []
testDict["1"] = testArray
testDict["3"] = testArray
testArray.push(1)
console.log(testDict["1"])
testDict["3"].push(2)
console.log(testDict["1"])
console.log(testDict[1])
testDict["test"] = "access test"
console.log(testDict["test"])
// console.log(testDict[test]) < -- does not work, value test interpreted as object
console.log(testDict.test)

function abc() {
    return ["test", 1, {2: "abc"}]
}

console.log(abc())

const [string, number, dict] = abc()
console.log(string)
console.log(number)
console.log(dict)
*/