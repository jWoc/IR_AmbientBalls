#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

#include <ArduinoJson.h>

#include <WebSocketsClient.h>
#include <SocketIOclient.h>

#include <Hash.h>

ESP8266WiFiMulti WiFiMulti;
SocketIOclient socketIO;

#define USE_SERIAL Serial1

const int pinButton = 0; // Used for the button, number is the Pin we connect to

bool started = false; // used to control if we can press button

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


void sendID(const char * payload, size_t event) {
    // creat JSON message for Socket.IO (event)
    DynamicJsonDocument doc(1024);
    JsonArray array = doc.to<JsonArray>();
    
    // add event name
    // Hint: socket.on('event_name', ....
    array.add("registerID");

    // add payload (parameters) for the event
    JsonObject param1 = array.createNestedObject();
    JsonObject param2 = array.createNestedObject();
    param1["id"] = id;
    param2["isBall"] = true;
    
    // JSON to String (serializion)
    String output;
    serializeJson(doc, output);
    Serial.print(output);

    socketIO.sendEVENT(output);
}

void start() {
    // Start listening for these events
    started = true;
}

void setPosition(const char * payload) {
    // We need to check that inside the payload we have a number to specify which stepper mototr 

    // 1. Extract the stepper number from the payload and the position
    int step_num = 0;
    Stepper stepper = steppers[step_num];
    // maybe conversion of position
    int placeholder = 200;
    stepper.step(placeholder); // negative number is counterclockwise 
}

void callibrate() {
    // Do rotations until twe reachj the top
    // TODO How is the stepper motot behaving when ball is reaching top position?
}

void checkButtonState() {
    // 
    // Condtion if we detected that the button is pressed
    if (digitalRead(pinButton)) { // we read a 1 and not a 0
    // Create Json object
        socketIO.sendEvent("ChangeMode");
        // If the button is pressed we want to sleep for a second to not spam the server with changeMode events
        delay(1000); 
    }
}



void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case sIOtype_DISCONNECT:
            USE_SERIAL.printf("[IOc] Disconnected!\n");
            break;
        case sIOtype_CONNECT:
            USE_SERIAL.printf("[IOc] Connected to url: %s\n", payload);

            // join default namespace (no auto join in Socket.IO V3)
            socketIO.send(sIOtype_CONNECT, "/");
            break;
        case sIOtype_EVENT: {
            USE_SERIAL.printf("[IOc] get event: %s\n", payload);

            DynamicJsonDocument doc(1024);
            DeserializationError error = deserializeJson(doc, payload, length);
            if(error) {
                Serial.print(F("deserializeJson() failed: "));
                Serial.println(error.c_str());
                return;
            }
            String eventName = doc[0];
            Serial.printf("[IOc] event name: %s\n", eventName.c_str());
            // TODO do send the command or do we just sent positions from the server

            if(strcmp(eventName.c_str(), "requestID") == 0)
            {
                sendID();
            }
            else if(strcmp(eventName.c_str(), "go") == 0)
            { 
                start();                     
            }
            else if(strcmp(eventName.c_str(), "setPosition") == 0)
            { 
                // TODO we need to parse payload argument from doc here
                setPosition()                
            }
            else if(strcmp(eventName.c_str(), "callibrate") == 0)
            { 
                callibrate()               
            }    
        }
            break;
        case sIOtype_ACK:
            USE_SERIAL.printf("[IOc] get ack: %u\n", length);
            hexdump(payload, length);
            break;
        case sIOtype_ERROR:
            USE_SERIAL.printf("[IOc] get error: %u\n", length);
            hexdump(payload, length);
            break;
        case sIOtype_BINARY_EVENT:
            USE_SERIAL.printf("[IOc] get binary: %u\n", length);
            hexdump(payload, length);
            break;
        case sIOtype_BINARY_ACK:
            USE_SERIAL.printf("[IOc] get binary ack: %u\n", length);
            hexdump(payload, length);
            break;
    }
}

void setup() {
    // USE_SERIAL.begin(921600);
    USE_SERIAL.begin(115200);

    //Serial.setDebugOutput(true);
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

    // disable AP
    if(WiFi.getMode() & WIFI_AP) {
        WiFi.softAPdisconnect(true);
    }

    WiFiMulti.addAP("Internet-QI-119", "QI.W-LAN!neu*23072019");

    while(WiFiMulti.run() != WL_CONNECTED) {
        delay(100);
    }

    String ip = WiFi.localIP().toString();
    USE_SERIAL.printf("[SETUP] WiFi Connected %s\n", ip.c_str());

    // server address, port and URL
    socketIO.begin("192.168.178.111", 3000);

    // event handler
    socketIO.onEvent(socketIOEvent);
}

unsigned long messageTimestamp = 0;

void loop() {
    socketIO.loop();
    if (started) {
        checkButtonState(); // Now dependent if we want to receive events all 200ms or inside button
    }

    uint64_t now = millis();

    if(now - messageTimestamp > 2000) {
        messageTimestamp = now;

        // creat JSON message for Socket.IO (event)
        DynamicJsonDocument doc(1024);
        JsonArray array = doc.to<JsonArray>();
        
        // add evnet name
        // Hint: socket.on('event_name', ....
        array.add("event_name");

        // add payload (parameters) for the event
        JsonObject param1 = array.createNestedObject();
        param1["now"] = (uint32_t) now;

        // JSON to String (serializion)
        String output;
        serializeJson(doc, output);

        // Send event        
        socketIO.sendEVENT(output);

        // Print JSON for debugging
        USE_SERIAL.println(output);
    }
}

