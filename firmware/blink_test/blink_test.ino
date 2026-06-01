// MedSafe ESP32 - baglanti testi
// Onboard LED (GPIO 2) yanip soner + Serial'a sayi basar.
// Amac: board, kablo, surucu, IDE zinciri calisiyor mu?

const int LED = 2;  // ESP32 Dev Module onboard mavi LED

void setup() {
  Serial.begin(115200);
  pinMode(LED, OUTPUT);
  delay(500);
  Serial.println();
  Serial.println("MedSafe blink test basladi");
}

void loop() {
  static unsigned long n = 0;
  digitalWrite(LED, HIGH);
  Serial.print("tick "); Serial.println(n++);
  delay(500);
  digitalWrite(LED, LOW);
  delay(500);
}
