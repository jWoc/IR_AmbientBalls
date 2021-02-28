#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>
#include <SocketIOclient.h>
#include <Hash.h>

ESP8266WiFiMulti WiFiMulti;
SocketIOclient socketIO;

const char id[] = "Framework1_Ball1";

bool started = false;

//touch up, touch down, touch both
void sendID(/*const char * payload, size_t event*/) {
       
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

void switchcolor(/*const char* payload, size_t len*/)
{ 
  // TO DO - check the led circuit connection
  }

void setVibration(/*const char* payload, size_t len*/)
{ 
  }

void switchLED(/*const char* payload, size_t len*/)
{ 
  }

void startOperation(/*const char* payload, size_t len*/)
{ 
    Serial.print("Received go command \n");
    started = true;
    //Serial.println(payload); 

  } 

void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case sIOtype_DISCONNECT:
            Serial.printf("[IOc] Disconnected!\n");
            break;
        case sIOtype_CONNECT:
            Serial.printf("[IOc] Connected to url: %s\n", payload);

            // join default namespace (no auto join in Socket.IO V3)
            socketIO.send(sIOtype_CONNECT, "/");
            break;
        case sIOtype_EVENT:
               // Start listening for these events
                       
                //  socketIO.on("SetColor", switchColor); // function 1
                //  socketIO.on("SetVibration", setVibration); //function 2
                //  socketIO.on("SetBlinking", switchLED); // function 3
            {
            Serial.printf("[IOc] get event: %s\n", payload);
            DynamicJsonDocument doc(1024);
            DeserializationError error = deserializeJson(doc, payload, length);
            if(error) {
                Serial.print(F("deserializeJson() failed: "));
                Serial.println(error.c_str());
                return;
            }
            String eventName = doc[0];
            Serial.printf("[IOc] event name: %s\n", eventName.c_str());
      
              if(strcmp(eventName.c_str(), "requestID") == 0)
              {
                Serial.print("inside case");
                sendID();
                }
              else if(strcmp(eventName.c_str(), "SetColor") == 0 ) 
               {
                    switchcolor();
               }
              else if(strcmp(eventName.c_str(), "SetVibration") == 0)  
               {     
                    setVibration();
               }
              else if(strcmp(eventName.c_str(), "SetBlinking") == 0)
               { 
                    switchLED();                     
               }  

               else if(strcmp(eventName.c_str(), "go") == 0)
               { 
                    startOperation();                     
               }          
                
             }

             break;
        case sIOtype_ACK:
            Serial.printf("[IOc] get ack: %u\n", length);
            hexdump(payload, length);
            break;
        case sIOtype_ERROR:
            Serial.printf("[IOc] get error: %u\n", length);
            hexdump(payload, length);
            break;
        case sIOtype_BINARY_EVENT:
            Serial.printf("[IOc] get binary: %u\n", length);
            hexdump(payload, length);
            break;
        case sIOtype_BINARY_ACK:
            Serial.printf("[IOc] get binary ack: %u\n", length);
            hexdump(payload, length);
            break;
    }
}


void setup() {
    Serial.begin(115200);
    Serial.setDebugOutput(true);
      for(uint8_t t = 4; t > 0; t--) {
          Serial.printf("[SETUP] BOOT WAIT %d...\n", t);
          Serial.flush();
          delay(1000);
      }

    // disable AP
    if(WiFi.getMode() & WIFI_AP) {
        WiFi.softAPdisconnect(true);
    }

    WiFiMulti.addAP("Internet-QI-119", "QI.W-LAN!neu*23072019");

    //WiFi.disconnect();
    while(WiFiMulti.run() != WL_CONNECTED) {
        delay(100);
    }

    String ip = WiFi.localIP().toString();
    Serial.printf("[SETUP] WiFi Connected %s\n", ip.c_str());

    // server address, port and URL
    socketIO.begin("192.168.178.111", 3000);

    // event handler
    socketIO.onEvent(socketIOEvent);
}


void checkLEDstate()
{
  
}   

void checkTouchState()
{
  // Sensor touch - digital out to indicate whether sensor is touched or not , top/bottom/both
} 

unsigned long messageTimestamp = 0;
void loop() {
    socketIO.loop();
    if(started){
    checkTouchState();}

    uint64_t now = millis();

    if(now - messageTimestamp > 2000) {
        messageTimestamp = now;

        // creat JSON message for Socket.IO (event)
        DynamicJsonDocument doc(1024);
        JsonArray array = doc.to<JsonArray>();
        
        // add event name
        // Hint: socket.on('event_name', ....
        array.add("Touch");

        // add payload (parameters) for the event
        JsonObject param1 = array.createNestedObject();
        param1["now"] = (uint32_t) now;

        // JSON to String (serializion)
        String output;
        serializeJson(doc, output);

        // Send event        
        socketIO.sendEVENT(output);

        // Print JSON for debugging
        Serial.println(output);
    }
}
