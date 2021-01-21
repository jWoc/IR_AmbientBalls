

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
}

module.exports = MotorController