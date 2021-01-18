require('color');


class Ball {
    state = [];
    active_state = AmbientBallModes.EMOTIONS;

    constructor(socket, id = -1) {
        this.socket= socket;
        this.id = id
        state.push(BallState(0, AmbientBallModes.EMOTIONS))
        state.push(BallState(0, AmbientBallModes.SPORT))
        state.push(BallState(0, AmbientBallModes.TOUCH))
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
}


const AmbientBallModes  = {
    EMOTIONS: 0, 
    SPORT: 1,
    TOUCH: 2,
};

class BallState {
    
    constructor(position = 0, mode = AmbientBallModes.EMOTIONS) {
        this.position = position  
        this.mode = mode;  
        this.color = Color('rgb(255, 255, 255)');
        this.touch = TOUCHSTATES.NOTHING;
    }
}


class Position {
    
    constructor() {
        
    }

    distance(pos2) {
        // calculates distance between the two
        // returns an integer / float
    }
    
}

const TOUCHSTATES = {
    NOTHING: 1,
    TOP: 2,
    BOTTOM: 3,
    BOTH: 4
}