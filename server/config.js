
config = {

    // ball Movement
    moveStepSize: 10/100,
    maxStepCount: 10000,
    sporstUpdateIntervall: 5000, // miliseconds
    activateSportSync: true,

    // get new access token (valid for 6 h)
    // command for athlete 1 (Johannes Wocker):
    // curl -X POST "https://www.strava.com/oauth/token" -F "client_id=59386" -F "client_secret=27d294934a5246889b33d591bf8818af2941a5b2" -F "refresh_token=fe5576ae90d96d619de120ce07ed9348a23c8a70" -F "grant_type=refresh_token"
    // command for athlete 2 (Test Account: Forrest Gump):
    // curl -X POST "https://www.strava.com/oauth/token" -F "client_id=60765" -F "client_secret=be665ad1818f3c79e9e8544580c32a3d270c876e" -F "refresh_token=7702f32d873ab71141ac5e0ec871f4cdae4010fa" -F "grant_type=refresh_token"
    athletes: [
        {
            name: "Johannes Wocker",
            access_token: "45e062fc6d50088ebd0afd9b2ab039ec9c6ab973",
            refresh_token: "fe5576ae90d96d619de120ce07ed9348a23c8a70",
            syncedBall: "Framework1_Ball1",
            baseline: 3, // target amount of active hours
        }, {
            name: "Forrest Gump",
            access_token: "106cf69733f79698f9bb2c91b863c0698a109708",
            refresh_token: "7702f32d873ab71141ac5e0ec871f4cdae4010fa",
            syncedBall: "Framework1_Ball2",
            baseline: 2, // target amount of active hours
        },

    ],

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
            ],
        }, {
            id: "Framwork2",
            controllerId: "Framework2_Controller",
            orderedBallIds: [
                "Framework2_Ball1",
                "Framework2_Ball2",
                "Framework2_Ball3",
                "Framework2_Ball4",
            ],
        },
    ],
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