#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ArduinoJson.h>

#include <WebSocketsClient.h>
#include <SocketIoClient.h>

#include <Hash.h>
#define USE_SERIAL Serial


ESP8266WiFiMulti WiFiMulti;
SocketIoClient socketIO;

const char[] id = "Framework1_Ball1";

void event(const char * payload, size_t length) {
  USE_SERIAL.printf("got message: %s\n", payload);
}

void setup() {
    USE_SERIAL.begin(115200);

    USE_SERIAL.setDebugOutput(true);

    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

      for(uint8_t t = 4; t > 0; t--) {
          USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
          USE_SERIAL.flush();
          delay(1000);
      }

    WiFiMulti.addAP("Internet-QI-119", "QI.W-LAN!neu*23072019");

    while(WiFiMulti.run() != WL_CONNECTED) {
        delay(100);
    }

    socketIO.on("event", event);
    socketIO.on("requestID", sendID);
    socketIO.on("go", startOperation); // function to execute once all balls are connected
    socketIO.begin("192.168.178.111", 3000);
    // use HTTP Basic Authorization this is optional remove if not needed
    //webSocket.setAuthorization("username", "password");
}

//touch up, touch down, touch both
void sendID(const char * payload, size_t event) {
    socketIO.emit("registerID", id);
}

void start(const char * payload, size_t event) {
    // Start listening for these events
    socketIO.on("setPosition", setPosition);
    socketIO.on("callibrate", callibrate); // TODO do send the command or do we just sent positions from the server
}


void switchcolor(const char* payload, size_t len)
{ 
  // TO DO - check the led circuit connection
  }

void setVibration(const char* payload, size_t len)
{ 
  }

void switchLED(const char* payload, size_t len)
{ 
  }

void startOperation(const char* payload, size_t len)
{ 
    USE_SERIAL.print("Received go command \n");
    USE_SERIAL.println(payload); 
    socketIO.on("SetColor", switchColor); // function 1
    socketIO.on("SetVibration", setVibration); //function 2
    socketIO.on("SetBlinking", switchLED); // function 3
  }  


void checkLEDstate()
{
  
  }   

void checkTouchState()
{
  // Sensor touch - digital out to indicate whether sensor is touched or not , top/bottom/both
  }  

void loop() {
    socketIO.loop();
    checkTouchState();
}
