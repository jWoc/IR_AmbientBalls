#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "wifiNetworkName";
const char* password = "wifiNetworkPassword"; 

void setup() {

    Serial.begin(115200);

    Serial.println();
    Serial.println();
    Serial.println();

    for(uint8_t t = 4; t > 0; t--) {
        Serial.printf("[SETUP] WAIT %d...\n", t);
        Serial.flush();
        delay(1000);
    }

    WiFi.begin("Galaxy", "12345678");  //WiFi.begin("ssid", "password")
    while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    }
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());


}

void loop() {

    if(WiFi.status() == WL_CONNECTED)
    {
        HTTPClient http;
        Serial.print("[HTTP] begin...\n");
      
        // configure server and url
        http.begin("http://jsonplaceholder.typicode.com/comments?id=10"); //HTTP
        //http.begin("http://localhost:8080/comments?id=1");  // localhost, desired url
      
        Serial.print("[HTTP] GET...\n");
        // start connection and send HTTP header
        int httpCode = http.GET();

        // httpCode will be negative on error
        if(httpCode > 0) {
            // HTTP header has been send and Server response header has been handled
            Serial.printf("[HTTP] GET... code: %d\n", httpCode);

            // file found at server
            if(httpCode == HTTP_CODE_OK) {
                String payload = http.getString();
                Serial.println(payload);
            }
        } 
           else {
            Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
        }

        http.end();
    }
    delay(5000);
}
