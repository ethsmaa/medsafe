// MedSafe ESP32 alarm node
// Telefon POST /alarm -> buzzer + kirmizi LED
// Butona basinca -> buzzer susar, yesil LED yanar
// OLED'de alinacak ilac ve sonraki doza kalan sure

#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ---- WiFi ----
const char* WIFI_SSID = "WIFI_ADIN";
const char* WIFI_PASS = "WIFI_SIFREN";

// ---- Pinler ----
const int PIN_BUZZER    = 25;
const int PIN_LED_RED   = 26;
const int PIN_LED_GREEN = 27;
const int PIN_BUTTON    = 14;   // INPUT_PULLUP -> basinca LOW

// ---- OLED ----
#define SCREEN_W 128
#define SCREEN_H 64
#define OLED_RESET -1
#define OLED_ADDR 0x3C
Adafruit_SSD1306 oled(SCREEN_W, SCREEN_H, &Wire, OLED_RESET);

// ---- Durum ----
WebServer server(80);

struct AlarmState {
  bool active = false;
  String medication = "-";
  unsigned long nextDoseEpoch = 0; // millis() referansli
  unsigned long firedAt = 0;
};
AlarmState state;

unsigned long lastButtonMs = 0;
const unsigned long BUTTON_DEBOUNCE_MS = 200;
unsigned long lastBuzzerToggle = 0;
bool buzzerOn = false;

// ---- Yardimci ----
void setLeds(bool red, bool green) {
  digitalWrite(PIN_LED_RED, red ? HIGH : LOW);
  digitalWrite(PIN_LED_GREEN, green ? HIGH : LOW);
}

void stopBuzzer() {
  digitalWrite(PIN_BUZZER, LOW);
  buzzerOn = false;
}

void drawScreen() {
  oled.clearDisplay();
  oled.setTextColor(SSD1306_WHITE);

  oled.setTextSize(1);
  oled.setCursor(0, 0);
  oled.println(state.active ? "ALARM!" : "MedSafe");

  oled.drawLine(0, 10, SCREEN_W, 10, SSD1306_WHITE);

  oled.setCursor(0, 16);
  oled.println("Ilac:");
  oled.setTextSize(2);
  oled.setCursor(0, 26);
  oled.println(state.medication);

  oled.setTextSize(1);
  oled.setCursor(0, 50);
  if (state.nextDoseEpoch > millis()) {
    unsigned long remainMs = state.nextDoseEpoch - millis();
    unsigned long mins = remainMs / 60000UL;
    unsigned long secs = (remainMs / 1000UL) % 60UL;
    oled.print("Sonraki: ");
    if (mins < 60) {
      oled.print(mins); oled.print("d ");
      oled.print(secs); oled.print("s");
    } else {
      oled.print(mins / 60); oled.print("s ");
      oled.print(mins % 60); oled.print("d");
    }
  } else {
    oled.print("Sonraki: --");
  }

  oled.display();
}

// ---- HTTP ----
void handleAlarm() {
  if (server.method() != HTTP_POST) {
    server.send(405, "application/json", "{\"error\":\"POST only\"}");
    return;
  }
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, server.arg("plain"));
  if (err) {
    server.send(400, "application/json", "{\"error\":\"bad json\"}");
    return;
  }
  state.medication   = (const char*)(doc["medication"] | "Ilac");
  unsigned long mins = doc["nextDoseMinutes"] | 0UL;
  state.nextDoseEpoch = millis() + mins * 60000UL;
  state.active       = true;
  state.firedAt      = millis();

  Serial.printf("[ALARM] %s, sonraki: %lu dk\n", state.medication.c_str(), mins);
  server.send(200, "application/json", "{\"ok\":true}");
}

void handleStatus() {
  StaticJsonDocument<256> doc;
  doc["active"]     = state.active;
  doc["medication"] = state.medication;
  unsigned long remainSec = state.nextDoseEpoch > millis()
      ? (state.nextDoseEpoch - millis()) / 1000UL : 0UL;
  doc["nextDoseSeconds"] = remainSec;
  String out; serializeJson(doc, out);
  server.send(200, "application/json", out);
}

void handleStop() {
  state.active = false;
  stopBuzzer();
  setLeds(false, true);
  server.send(200, "application/json", "{\"ok\":true}");
}

// ---- Setup / Loop ----
void setup() {
  Serial.begin(115200);
  delay(200);

  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  setLeds(false, true);
  stopBuzzer();

  Wire.begin(21, 22);
  if (!oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println("OLED bulunamadi");
  }
  oled.clearDisplay();
  oled.setTextColor(SSD1306_WHITE);
  oled.setTextSize(1);
  oled.setCursor(0, 0);
  oled.println("WiFi baglanyor...");
  oled.display();

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 20000) {
    delay(300);
    Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("IP: "); Serial.println(WiFi.localIP());
    oled.clearDisplay();
    oled.setCursor(0, 0);
    oled.println("IP:");
    oled.println(WiFi.localIP());
    oled.display();
  } else {
    Serial.println("WiFi yok, sadece Serial ile test edebilirsin");
  }

  server.on("/alarm",  handleAlarm);
  server.on("/status", handleStatus);
  server.on("/stop",   handleStop);
  server.begin();

  delay(1500);
  drawScreen();
}

void loop() {
  server.handleClient();

  // Buton: alarm aktifken susturma
  if (digitalRead(PIN_BUTTON) == LOW &&
      millis() - lastButtonMs > BUTTON_DEBOUNCE_MS) {
    lastButtonMs = millis();
    if (state.active) {
      state.active = false;
      stopBuzzer();
      setLeds(false, true);
      Serial.println("[BUTON] alarm susturuldu");
    }
  }

  // Buzzer/LED davranisi
  if (state.active) {
    setLeds(true, false);
    if (millis() - lastBuzzerToggle > 400) {
      lastBuzzerToggle = millis();
      buzzerOn = !buzzerOn;
      digitalWrite(PIN_BUZZER, buzzerOn ? HIGH : LOW);
    }
  } else {
    stopBuzzer();
  }

  // Serial test: "ALARM Parol 30" -> ilac Parol, sonraki 30 dk
  if (Serial.available()) {
    String line = Serial.readStringUntil('\n');
    line.trim();
    if (line.startsWith("ALARM")) {
      int sp1 = line.indexOf(' ');
      int sp2 = line.indexOf(' ', sp1 + 1);
      if (sp1 > 0 && sp2 > 0) {
        state.medication = line.substring(sp1 + 1, sp2);
        unsigned long mins = line.substring(sp2 + 1).toInt();
        state.nextDoseEpoch = millis() + mins * 60000UL;
        state.active = true;
        Serial.println("Serial alarm tetiklendi");
      }
    } else if (line == "STOP") {
      state.active = false;
      stopBuzzer();
      setLeds(false, true);
    }
  }

  static unsigned long lastDraw = 0;
  if (millis() - lastDraw > 500) {
    lastDraw = millis();
    drawScreen();
  }
}
