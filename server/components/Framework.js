const BallDef = require("./Ball")
const Ball = BallDef.Ball
const MotorController = require("./MotorController")

class Framework {

    balls = []
    sportsUser = "Ball 5"
    
    // caller has to make sure it is ordered
    constructor(id, ballParameters, controllerParameter) { 
        
        this.id = id

        for (var i=0; i < ballParameters.length; i++)  {
            this.balls.push(new Ball(this, ballParameters[i].socket, ballParameters[i].id))
        }
        this.motorController = new MotorController(this, controllerParameter.socket, controllerParameter.id)
    }

    getIndex(ball) {
        return this.balls.indexOf(ball)
    }

    changeMode() {

    }

    getBalls() {
        return this.balls
    }



    getId() {
        return this.id
    }

    getMotorController() {
        return this.motorController;
    }
}

module.exports = Framework












































































