#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>
#include <SocketIOclient.h>
#include <Hash.h>
#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
 #include <avr/power.h> // Required for 16 MHz Adafruit Trinket
#endif

ESP8266WiFiMulti WiFiMulti;
SocketIOclient socketIO;

const char id[] = "Framework1_Ball1";

bool started = false;
// For led control
bool blinking = false;
bool led_on = false; // this is only used for blinking not for actual setColor (since the led should always be on
unsigned long messageTimestamp = 0;
const long blink_interval = 1000; // in ms
unsigned long prev_millis = 0;

// Which pin on the Arduino is connected to the NeoPixels?
#define LEDPIN        6 
#define TOUCHPINTOP   9
#define TOUCHPINBOT   10
#define VIBPIN        11 // vibration motor

// How many NeoPixels are attached to the Arduino?
#define NUMPIXELS 16 //

// When setting up the NeoPixel library, we tell it how many pixels,
// and which pin to use to send signals.
Adafruit_NeoPixel pixels(NUMPIXELS, LEDPIN, NEO_GRB + NEO_KHZ800);

#define DELAYVAL 500 // Time (in milliseconds) to pause between pixels


//touch up, touch down, touch both
void sendID() {
       
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

void switchcolor(int r, int g, int b)
{ 
  // TO DO - check the led circuit connection
  // value range is between 0 and 255 3 values RGB format  
  // we could use fill command
  for(int i=0; i<NUMPIXELS; i++) { // For each pixel...

    // pixels.Color() takes RGB values, from 0,0,0 up to 255,255,255
    // Here we're using a moderately bright green color:
    pixels.setPixelColor(i, pixels.Color(r, g, b));

    pixels.show();   // Send the updated pixel colors to the hardware.

    delay(DELAYVAL); // Pause before next pass through loop
  }
}

void setVibration(int strength)
{ 
  // If I read correctly we set vib motor with analogWrite (for PWM) this is a value between 0 and 255 (max is dependent on the current
  // so for a ramp up effect we would call analogWrite in a loop
  // for other effects we need to send additional data or create new functions we could also say that we ramp up
  analogWrite(VIBPIN, strength);
  }


void startOperation()
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
            serializeJson(doc, Serial);
              if(strcmp(eventName.c_str(), "requestID") == 0)
              {
                sendID();
              }
              else if(strcmp(eventName.c_str(), "setColor") == 0 ) 
               {
                    if (doc.size() != 2) {
                      Serial.printf("Received wrong number of arguments, size was %d", doc.size());
                      break;
                    }
                    if (!doc[1].containsKey("rgb")) {
                      Serial.println("Argument does not have key rgb, Breaking");
                      break;
                    }
                    JsonArray v= doc[1]["rgb"]; // get the key from the object returns an array for 3 values if ke does not exist it does not throw an error
                    int r = v[0]; // implicit type convwersion happens here ote that we dont check the range
                    int g = v[1];
                    int b = v[2];
                    switchcolor(r, g, b);
               }
              else if(strcmp(eventName.c_str(), "SetVibration") == 0)  
               {     
                    if (doc.size() != 2) {
                      Serial.printf("Received wrong number of arguments, size was %d", doc.size());
                      break;
                    }
                    if (!doc[1].containsKey("strength")) {
                      Serial.println("Argument does not have key strength, Breaking");
                      break;
                    }
                    int strength = doc[1]["strength"];
                    setVibration(strength);
               }
              else if(strcmp(eventName.c_str(), "SetBlinking") == 0)
               { 
                    blinking = true;
                    prev_millis = millis(); // since if turned off it still runs and then now and prev are out of synv      
                    led_on = false; // so they will turn on at start         
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

    // define PINS as input
      for(uint8_t t = 4; t > 0; t--) {
          Serial.printf("[SETUP] BOOT WAIT %d...\n", t);
          Serial.flush();
          delay(1000);
      }

    // disable AP
    if(WiFi.getMode() & WIFI_AP) {
        WiFi.softAPdisconnect(true);
    }

    WiFiMulti.addAP("blabla", "blabla");

    //WiFi.disconnect();
    while(WiFiMulti.run() != WL_CONNECTED) {
        delay(100);
    }

    String ip = WiFi.localIP().toString();
    Serial.printf("[SETUP] WiFi Connected %s\n", ip.c_str());

    // server address, port and URL
    socketIO.begin("192.168.1.152", 3000);
    
    // LED stuff activate when connected
    //pixels.begin(); // init for pixels
    // pixels.set_brightness()
    //pixels.show(); // intis all to off
    
    // event handler
    socketIO.onEvent(socketIOEvent);
}


void checkTouchState()
{
  int pressureTop = analogRead(TOUCHPINTOP); // val between 0 and 1023
  int pressureBot = analogRead(TOUCHPINBOT);

  // For now we just have one threshold pressed or not pressed but we could detect light toucvh medium touch etc
  if(pressureTop < 10 && pressureBot < 10) {
    return;
  }

  String location = "";
  if(pressureTop >= 10 && pressureBot >= 10) {
    location = "Both";
  }
  else if(pressureTop >= 10) {
    location = "Top";
  }
  else if(pressureBot >= 10) {
    location = "Bot";
  }
  // Sensor touch - digital out to indicate whether sensor is touched or not , top/bottom/both
  // Check how we wanto to send data
  DynamicJsonDocument doc(1024);
  JsonArray array = doc.to<JsonArray>();
  
  array.add("touch");

  // add payload (parameters) for the event
  JsonObject param1 = array.createNestedObject();
  param1["location"] = location; // possivle values dependent on what si pressedBottom Both Top

  String output;
  serializeJson(doc, output);

  // Send event        
  socketIO.sendEVENT(output);
} 

void switchLED() {
  // depending on state turn the stripe on or off
  int val;
  if(led_on) {
    val = 0;
  }
  else {
    val = 255;
  }
  led_on = !led_on; // switch the state
  
  for(int i=0; i<NUMPIXELS; i++) { // For each pixel...
    pixels.fill(i, val); // fill uses val for r g b 
  }
  pixels.show();   // Send the updated pixels colors to the hardware.
  
}


void loop() {
    socketIO.loop();
    uint64_t now = millis();
    if (now - messageTimestamp > 200) { // we check the state of teh buttons every 200ms
      messageTimestamp = now;
      if(started) {
        checkTouchState();
      }
    }
    
    if (blinking) {
      // we blink in an interval
      if (now - prev_millis >= blink_interval) {
        prev_millis = now;
        switchLED();
      }
    }
}
