const Ball = require("./Ball")
const MotorController = require("./MotorController")

class Framework {

    balls = []
    sportsUser = "Ball 5"

    sportsUsers= Array(5).fill(-1)
    
    // caller has to make sure it is ordered
    constructor(ballParameters, controllerParameter) { 
        

        for (var i=0; i < ballParameters.length; i++)  {
            this.balls.push(new Ball(ballParameters[i].socket, ballParameters[i].id))
        }
        this.motorController = new MotorController(controllerParameter.socket, controllerParameter.id)
    }

    changeMode() {

    }
}

module.exports = Framework












































































