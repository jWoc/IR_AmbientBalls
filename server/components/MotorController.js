

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

    updatePosition(ballIndex, ballState, moveValue, isActiveState) {
        console.log("updatePosition: ", moveValue, ballIndex)

        // move value can be changed by Condition Check
        var adaptedMoveValue = ballState.applyPositionChange(moveValue)

        if ((adaptedMoveValue != 0) && isActiveState) {
            // TODO: calculate steps from percentage (adaptedMoveValue)
            var calculatedSteps = 0

            var moveCommandValue = {
                targetBallIndex: ballIndex,
                moveValue: adaptedMoveValue,
                calculatedSteps: calculatedSteps,
            }
            this.socket.emit("setPosition", moveCommandValue)
        }
    }
}

module.exports = MotorController