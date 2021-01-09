class Framework {

    balls = []
    sportsUser = "Ball 5"

    sportsUsers= Array(5).fill(-1)
    
    // caller has to make sure it is ordered
    constructor(ballParameters, controllerParameter) { 
        

        for (var i=0; i < ballParameters.length; i++)  {
            this.balls.push(Ball(ballParameters[i].socket, ballParameters[i].id))
        }
        this.motorController = MotorController(controllerParameter.socket, controllerParameter.id)
    }
}












































































