

class MotorController {


    constructor(parentFramwork, socket, id) {
        this.parentFramwork = parentFramwork
        this.socket = socket
        this.id = id
    }

    getFramework() {
        return this.parentFramwork
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

    updatePosition(ballIndex, ballState, moveValue) {
        console.log("updatePosition: ", moveValue, ballIndex)


        // TODO: Condition Check


        // TODO: calculate steps from percentage
        var calculatedSteps = 0

        var moveCommandValue = {
            targetBallIndex: ballIndex,
            moveValue: moveValue,
            calculatedSteps: calculatedSteps,
        }
        this.socket.emit("setPosition", moveCommandValue)

        // TODO: generate target Pos
        // TODO: update internal model:
        // ballState.setPosition(targetPos)
    }
}

module.exports = MotorController