const Color = require('color');


class Ball {
    state = [];
    active_state = AmbientBallModes.EMOTIONS;

    constructor(parentFramework, socket, id = -1) {
        this.parentFramework = parentFramework
        this.socket= socket;
        this.id = id
        this.state.push(new BallState(new Position(0), AmbientBallModes.EMOTIONS))
        this.state.push(new BallState(new Position(0), AmbientBallModes.SPORT))
        this.state.push(new BallState(new Position(0), AmbientBallModes.TOUCH))
    }

    getState() {
        return this.state[this.active_state]
    }

    getFramework() {
        return this.parentFramework
    }

    // Calculate distance to other ball comparison of internal states
    distanceNextState() {
        // distance between two positions 
        // return an integer / float
        // call pos code
        // get internal state position for yourself and the ball
    }

    next_active_state() {

    }

    getId() {
        return this.id
    }
    getSportsState() {
        return this.state[AmbientBallModes.SPORT]
    }
}


const AmbientBallModes  = {
    EMOTIONS: 0, 
    SPORT: 1,
    TOUCH: 2,
};

class BallState {
    
    constructor(position, mode = AmbientBallModes.EMOTIONS) {
        this.position = position  
        this.mode = mode;  
        this.color = Color('rgb(255, 255, 255)');
        this.touch = TOUCHSTATES.NOTHING;
    }

    distance(targetPosition) {
        return this.position.distance(targetPosition)
    }

    setPosition(targetPosition) {
        this.position = targetPosition
    }
}


class Position {
    constructor(pos) {
        this.pos = pos
    }

    distance(targetPosition) {
        // calculates distance between the two
        // returns an integer / float
        return (targetPosition.getPercentagePosition() - this.getPercentagePosition())
    }
    getPercentagePosition() {
        return this.pos
    }
}

const TOUCHSTATES = {
    NOTHING: 1,
    TOP: 2,
    BOTTOM: 3,
    BOTH: 4
}


module.exports = {
    Ball: Ball, 
    TOUCHSTATES:TOUCHSTATES,
    Position:Position,
}