## Implementation Report
This file was made by all 3 of us in a discord call
It specifies the different parts of our implementation, especially on server side.
It further describes the command interface we use 
I also think we can use typescript in our project. We get types 
We should use npm init to start the project (since it gives s a package.json file and dependency managemnt -> or do we not need it=)
## Commands
### Connection
- We use websockets ( good because we dont need to create mutliple Tcp connections over time)
- Websockets libraries are defined for ESP
- One Tutorial is [here](https://tttapa.github.io/ESP8266/Chap14%20-%20WebSocket.html)
- We can even run normal Web servers on an ESP (Could be useful for debugging or some statistics)

Other library is socket IO

## Conifg
For sports we need a config to specify the amount of sports needed for the persons
This should also be on the server website and should be changeable


## State
We need to define the state of our device. The state is only defined on the server side. We have to devices but their state is shared (embed image here)

- We need IP addresses of the ESPs. 
- Abstract away from ESP addresses with constants (BALL1 BALL2 etc.)
- The 2 devices are just parts of the state. They have internal mappings for BALL1 to IP address and are called when a command has to be sent to the corresponding ball

Each Ball has the socket and a unique identifier to know when they are registered.

How is a command received? On the device and it notifys the state ? 
So  ESP -> Device -> State

- Once a command is received the corresponding handler has to be called (Mapping of commands to functions)
- These functions change the state of the whole thing. (Since these functions also depend on the state they are not entirely pure and can have side effects)
-  All functions return an event that has to be sent back to the caller (We could think about a Empty response when this is actually not needed)


Define functions and class here
Class
- logger
- devices
- Balls 
	-  position 
	- Type
	-  id
	-  device / IP Address / socket
	-  color (encoded in the color)
	-  sport ball user (get from config to know where 100% is) fixed  (e.g leftmost)
	- Enum for touch (TOP; BOTTOM; NOTHING; BOTH)
	-  ?

If a device received a command correctly select balls and handle input with functions is  the main responsibility of that class. Also some computations

We further need to maintain state if the ball is touched from both sides or not
Functions
- switchType() -> Called when button is pressed
-	moveUp() -> Called when bottom touch sensor is touched
-	moveDown() -> Called when top is pressed. Changes position and calculates how to get there 
-	calcMovement() -> Helper to calculate the amount of rotations (Maybe not needed)
-	touchOnBothSides() -> Used for touch ball. If only one of the 2 synced balls is touched the other one starts vibrating and changing its color
	-	startVibrate() -> subroutine called when only one is touched, used for the other one
	- Otherwise if both balls are touched change vibration and maybe color
- getSportsData() -> For the sports ball. Query sports data (every 30 seconds or minute). Then update the sports ball. Note that the update should only happen when the ball is a sports ball otherwise we just calculate the position and safe it. If the ball changes type to a sports ball we use this safed position to move the ball there
- MoveDiffPosition(pos1, pos2) -> Helper to calculate from two positions the amount of rotations needed to move it from pos1 to pos2. Very useful 


All the motor functions should have high abstractions. I would say we use position ranges that we can esasily change (depends on motor) eg [0,100] or [0,50] and we compute positions only in this range and map it back to steps for the stepper motor
So position should be an own class aswell.

We need assertions and checks. For example in the touch ball case is the only case where we press both sides of the ball. If it is not a touch ball and we press both sides nothing should happen



General when we receive a command we search the ball that changes and send command to linked ball

We could draw a state diagramm (Like we tried)


We send commands on the hardware and then sleep for a few milliseconds to not flood the server.

we have a model for each type that is internal and an applyModel() function that we call when we switch the state.
For example sports model api gives an update and we apply it to the internal state. Then we switch we use applyModel() to change the state.

### Implementation
- Classes


## Logs
For debugging purposes it would be nice to log all commands received and print some messages on the server side. This way it is easier to debug when it is actually running.
So we log the caller the command received and which function was called with the argument.
This file has to be deleted daily I think
Maybe not since we only notify about changes in the balls.
This is very easy to add. Since the server is running we could display the logs on a website. 

## Testing
Tests are needed to check if our implementation correctly handles input and correclty synchronizes
- We mock web socket connections to our server and send and receive commands
- Then we can check the state and the response to see if it worked





## Open questions
Questions that are not fully answered right now since a part of the implementation needs to be done first
- How do we do the inital synchronization? So the setup -> Callibration. Move to top. say after e.g 12 seconds that all bals should have moved up. Then stop callibration.
- What if the stepper motor cant move up or gets stuck? Does it send something else that we can detect?
- Should all balls move to the middle of the line? They could all start at top and then the server moves them to the middle. When finished they start blinking and notify that they now can be used
- How are extra sports balls used? (When we only have to persons how do we identify the sports ball for that person? take balls mod 2?) -> Answered on top

- Do we have one button or 5? So does the type of all 5 balls change or of each individiually? - SIngle button for all the five balls
- Should we touch top or bottom of ball to move it up?
	Also depends on sensor

## Nice to have
- A ball slider on the server website to move the balls up and down. (You could even have a record functionality. Maybe even with)
- Again sliders but use them to define the "Emotion" alphabet. Change th eballs on the slide and define a word for it. (Should generally be easy to do with some javascript)
- These words are then shown on the server and safed. Can be deleted aswell. Needs some css to make it look nicer.
- Maybe a implementation of battle ships on the webiste using the balls


### TODOs 08-01-2021
- Set up Arduino environment with simulator
	- TCP client on hardware side (C C++)
- Testing Framework
- Commands / Commands structure
- State representation


### TODOs 09-01-2021 -> Deadline - 
	- Testing Framework 

    (- start implementing server functions)

  	
	- Johannes
    	- Strava API connect
    	- preprocessing sports data 
  	- Brindha
    	- implement socket io communication setup on arduino framework
  	- Xaver
    	- implementing socket connection: send id
    	- create ambient ball system with correct data

### TODOs 18.01.2021 -> Deadline 25.01
	- add all the functions and events
    	- Ball Commands
    	- ChangeMode / Touch
	- Integration Tests ( specific scenarios)
	-  Xaver
      	-  Ball Commands
      	-  logging on the server side
   	- Johannes
     	- ChangeMode / Touch
     	- connect sports handler to the system
	- Brindha 
    	- Client implementation
    	- maybe a better way to test (mock connections, send fake requests)



