#include <Arduino.h>
#include <Stepper.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ArduinoJson.h>

#include <WebSocketsClient.h>
#include <SocketIoClient.h>

#include <Hash.h>
#define USE_SERIAL Serial

ESP8266WiFiMulti WiFiMulti;
SocketIoClient socketIO;

bool pressed = false;
const int pinButton = 0; // Used for the button, number is the Pin we connect to

const char[] id = "Framework2_Controller";
// Define Stepper constants
const int stepsPerRevolution = 200;  // change this to fit the number of steps per revolution
// for your motor

// 5 steppers for 5 balls
Stepper stepper0(stepsPerRevolution, 8, 9, 10, 11);
Stepper stepper1(stepsPerRevolution, 8, 9, 10, 11);
Stepper stepper2(stepsPerRevolution, 8, 9, 10, 11);
Stepper stepper3(stepsPerRevolution, 8, 9, 10, 11);
Stepper stepper4(stepsPerRevolution, 8, 9, 10, 11);

// for easy indexing
const Stepper steppers[] = {stepper0, stepper1, stepper2, stepper3, stepper4};


void event(const char * payload, size_t length) {
  USE_SERIAL.printf("got message: %s\n", payload);
}

void setup() {
    USE_SERIAL.begin(115200);

    USE_SERIAL.setDebugOutput(true);
    // Pin intitlaizations
    pinMode(pinButton, INPUT); // specify that Pin used is INPUT so we receive data


    // set the speed at 60 rpm for all stepper motors
    for (int i = 0; i < 5; i++) {
        steppers[i].setSpeed(60);
    }

    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

      for(uint8_t t = 4; t > 0; t--) {
          USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
          USE_SERIAL.flush();
          delay(1000);
      }

    //WiFiMulti.addAP("Internet-QI-119", "QI.W-LAN!neu*23072019");

    while(WiFiMulti.run() != WL_CONNECTED) {
        delay(100);
    }

    // Since this is ued to control stepper motors we need to receive events
    socketIO.on("requestID", sendID)
    socketIO.on("go", start);
    socketIO.begin("192.168.178.111", 3000);

}

void sendID(const char * payload, size_t event) {
    socketIO.emit("registerID", id);
}

void start(const char * payload, size_t event) {
    // Start listening for these events
    socketIO.on("setPosition", setPosition);
    socketIO.on("callibrate", callibrate); // TODO do send the command or do we just sent positions from the server
}

void setPosition(const char * payload, size_t event) {
    // We need to check that inside the payload we have a number to specify which stepper mototr 

    // 1. Extract the stepper number from the payload and the position
    int step_num = 0;
    Stepper stepper = steppers[step_num];
    // maybe conversion of position
    int placeholder = 200;
    stepper.step(placeholder); // negative number is counterclockwise 
}

void callibrate(const char * payload, size_t event) {
    // Do rotations until twe reachj the top
    // TODO How is the stepper motot behaving when ball is reaching top position?
}

void checkButtonState() {
    // 
    // Condtion if we detected that the button is pressed
    if (digitalRead(pinButton)) { // we read a 1 and not a 0
        socketIO.emit("ChangeMode");
        // If the button is pressed we want to sleep for a second to not spam the server with changeMode events
        delay(1000); 
    }
}

void loop() {
    socketIO.loop();
    checkButtonState()
    // maybe we delay here aswell
}
