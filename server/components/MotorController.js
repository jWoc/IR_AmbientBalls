const config = require('../config');

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

    updatePosition(ballIndex, ballState, moveValue, isActiveState, changeMode = false) {
        console.log("updatePosition: ", moveValue, ballIndex)

        // move value can be changed by Condition Check
        var adaptedMoveValue = moveValue;
        if (!changeMode) {
            adaptedMoveValue = ballState.applyPositionChange(moveValue);
        }


        if ((adaptedMoveValue != 0) && isActiveState) {
            var calculatedSteps = Math.round(adaptedMoveValue * config.maxStepCount); //Steps you need from top to bottom
            
            var moveCommandValue = {
                id: ballIndex,
                position: calculatedSteps,
            }
            this.socket.emit("setPosition", moveCommandValue)
            // console.log(moveCommandValue)
        }
    }
}

module.exports = MotorController