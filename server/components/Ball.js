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

    next_active_mode() {
        var mode = this.active_state;

        if (mode === AmbientBallModes.EMOTIONS) {
            return AmbientBallModes.SPORT;
        }
        else if (mode === AmbientBallModes.SPORT) {
            return AmbientBallModes.TOUCH
        }
        else if (mode === AmbientBallModes.TOUCH) {
            return AmbientBallModes.EMOTIONS;
        }
        else {
            console.log("Error" + mode + "was not a valid mode");
        }
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
        this.color = this.modeToColor();
        this.touch = TOUCHSTATES.NOTHING;
        this.blink = false;
        this.vibrate = false;
    }

    modeToColor() {
        switch(this.mode) {
            case AmbientBallModes.EMOTIONS: 
                return Color('rgb(0,153,9)')
            case AmbientBallModes.SPORT:
                return Color('rgb(255, 128,0)');
            case AmbientBallModes.TOUCH:
                return Color('rgb(255, 51, 51)'); // light red
        }
    }

    distance(targetState) {
        return this.position.distance(targetState.position)
    }

    setPosition(targetPosition) {
        this.position = targetPosition
    }

    applyPositionChange(changeValue) {
        return this.position.applyChange(changeValue)
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

    applyChange(changeValue) {
        var newPos = this.pos + changeValue

        // boundary condition check
        if (newPos > 1) {
            newPos = 1
        } else if (newPos < 0) {
            newPos = 0
        }
        var adaptedChangeValue = newPos - this.pos
        console.log(adaptedChangeValue, newPos, this.pos)
        this.pos = newPos
        

        return adaptedChangeValue
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
    AmbientBallModes:AmbientBallModes,
}