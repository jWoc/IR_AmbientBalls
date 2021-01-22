
config = {
    // should be a json file 
    // Needs to be given to the constructors
    ballsPerFramework:  5,
    minFrameworks: 2,

    // ball Movement
    moveStepSize: 10/100,

    testMode: false,

    // framework setup
    frameworks: [
        {
            id: "Framwork1",
            controllerId: "Framework1_Controller",
            orderedBallIds: [
                "Framework1_Ball1",
                "Framework1_Ball2",
                "Framework1_Ball3",
                "Framework1_Ball4",
                "Framework1_Ball5",
            ],
        }, {
            id: "Framwork2",
            controllerId: "Framework2_Controller",
            orderedBallIds: [
                "Framework2_Ball1",
                "Framework2_Ball2",
                "Framework2_Ball3",
                "Framework2_Ball4",
                "Framework2_Ball5",
            ],
        },
    ],


    sportsUsers:  [
        {   name: "Johannes Wocker", 
            id: "asdfmasdoifasdfsdfasfo",
        },
    ],
}

if (config.testMode) {
    config.ballsPerFramework = 1
    config.minFrameworks = 1
}

module.exports = config


/**
 * required commands:
 * 
 *  Communication Commands
 *      "connection"
 *      "disconnection"
 * 
 *  Interaction input
 *      "changeMode"
 *      "touch"             append enum value to identify touch area
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