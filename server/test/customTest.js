
const AmbientBallSystem = require("../AmbientBallSystem")
const IO_Test = require('./IO_Test')

// for simple socket and io simulation
const io = {
    emit: (command) => {},
    of: (roomid) => {return {
        sockets: {
            get: (socketID) => {return {
                on: (data) => {},
                use: (data) => {},
                eventNames: () => {},
            }}
        }
    }}
}

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