

class MotorController {


    constructor(socket, id) {
        this.socket = socket
        this.id = id
    }

    calculate_steps() {
        
    }

    getId() {
        return this.id
    }

    calculateMoveDistance(ball, moveUp, moveStepSize) {
        console.log("calculateMoveDistance: ", ball, moveUp, moveStepSize)
        var moveValue = 0

        // todo: generate Distance

        if (!moveUp) {
            moveValue *= -1
        }

        // todo: Constraint check current Position; adapt value or set zero


        return moveValue
    }

    sendMoveCommand(moveValue, ballIndex) {
        console.log("sendMoveCommand: ", moveValue, ballIndex)
        var moveCommandValue = {
            targetBallIndex: ballIndex,
            moveValue: moveValue,
        }
        this.socket.emit("setPosition", moveCommandValue)
    }
}

module.exports = MotorController