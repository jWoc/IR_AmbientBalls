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
    socketIO.begin("192.168.178.111", 3000);
    // use HTTP Basic Authorization this is optional remove if not needed
    //webSocket.setAuthorization("username", "password");
}

void loop() {
    socketIO.loop();
}
