
// should be a json file 
// Needs to be given to the constructors

ballsPerFramework = 5
minFrameworks = 2

testMode = false

if (testMode) {
    ballsPerFramework = 1
    minFrameworks = 1
}

sportsUsers =  [
    {   name: "Johannes Wocker", 
        id: "asdfmasdoifasdfsdfasfo",
    },
]




/**
 * required commands:
 * 
 *  Communication Commands
 *      "connection"
 *      "disconnection"
 * 
 *  Interaction input
 *      "ChangeBallMode"
 *      "ChangeMode"
 *      "Touch"             append enum value to identify touch area
 * 
 *  Ball Commands
 *      "setColor"
 *      "setVibration"
 *      "setBlinking"       append value: boolean
 * 
 *  Controller Commands
 *      "calibrate"
 *      "setPosition"
 * 
 */
/*



testFunction (data, fn){

}
/*socket.on('touch', (touchState) => {
            
    console.log('user touched on: ' + touchState);
});

socket.on('formData', testFunction); 

socket.emit('requestID')

socket.on('registerID', (id) => {
    console.log(id)
})

*/