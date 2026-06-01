# Donanım Stajı Raporu — Yazım Brief'i (TEK BAŞINA YETERLİ Devir Dökümanı)

> **Bu dosyayı, hiçbir ön bilgisi olmayan bir ajana (ör. Desktop Claude) tek başına
> verebilirsin.** Gerekli her şey içinde: yazım kuralları, künye, bölüm planı, görsel
> listesi, referanslar, koddan kesin teknik bulgular ve EN SONDA tam firmware kodu +
> eski raporun iskeleti/üslubu. Ajanın bizim sohbetimize veya dosya sistemine erişimi
> GEREKMEZ.
>
> **Bu dosya raporun kendisi değildir** — plandır. Görev: bu plana ve EK'lerdeki gerçek
> koda dayanarak, DEÜ Bilgisayar Müh. staj raporu kurallarına uygun, akademik Türkçe bir
> **donanım stajı raporu** (defteri) yaz. İçeriği uydurma; her teknik detay EK A koddan gelir.
>
> **Esma'nın ayrıca ekleyeceği tek şey:** elindeki **tek gerçek fotoğraf = devre/breadboard
> fotosu** (görsel listesi #2). Diğer görseller yok; diyagram da çizilmedi → writer placeholder
> koyar veya basit akış üretir. Geri kalan tüm bilgiler aşağıda yazılı.
> İstenirse fidelity için eski rapor PDF'i de eklenebilir ama zorunlu değil — iskelet aşağıda.

---

## 0) Yazım kuralları (DEÜ Bilgisayar Müh. — özet, writer'a)
**Baskı:** A4; kenar boşlukları sol 3 cm, sağ 2 cm, üst-alt 3 cm. Tek yüz.
**Yazı:** 12 punto Times New Roman, iki yana dayalı (justified), 1,5 satır aralığı.
Paragraf ilk satırı 0,5 cm içeride; paragraflar arası bir boş satır. Noktalama sonrası 1 boşluk.
**Başlıklar:** ondalık numaralama (1, 1.1, 1.1.1 …), en fazla 6 seviye. Ana bölümler "BÖLÜM No".
Bölüm başlıkları 18 punto, büyük ve koyu.
**Sıra:** Kapak → İç Kapak → İçindekiler → Tablo Listesi → Şekil Listesi → Giriş (haftalar
bazında) → Stajda yapılanlar (alt başlıklara ayrılarak) → Ekler (kod vb.).
**Üst/alt bilgi (her sayfa):** Adı Soyadı, Firma Ünvanı, **Staj Türü: Donanım**, tarih/hafta
aralığı, sayfa no. (İmza alanı hariç doldurulur.)
**Tablo/Şekil:** Tablo sola dayalı, başlık+no üst sol köşede ("Table X.Y …"). Şekil ortalı,
no+açıklama altta ortalı. Önce metinde çapraz-başvuruyla an, sonra sun; önce-sonra birer boş
satır. NOT: Eski rapor şekilleri "Tablo X.Y" diye etiketlemiş — **aynı etiketlemeyi koru.**
**Üslup şablonu (her alt başlıkta):** (a) bu bileşen/teknoloji neden seçildi (alternatifle
kıyas) → (b) nasıl uygulandı → (c) kaynak [N].

## 1) Künye / Sicil Formu
- Adı Soyadı: **Esma Oruç** — No: **2022510140** — Bölüm: Bilgisayar Mühendisliği
- Firma Ünvanı: **Dokuz Eylül Üniversitesi** — Staj Yetkilisi: **Semih Utku**
- **Staj Türü: Donanım** (önceki rapordaki "Yazılım" yerine)
- Staj süresi: **2 hafta** (Hafta 1 – Hafta 2). Kesin gün tarihleri verilirse Esma ekler;
  yoksa üst bilgide "Hafta 1 / Hafta 2" etiketi kullanılır.

---

## 2) Bölüm bazında paragraf planı (4 bölüm)

### BÖLÜM 1 — GİRİŞ
**1.1 Staj Amacı ve Genel Plan**
- P1: MedSafe nedir (hasta + bakıcı ilaç takip sistemi); donanım stajının amacı: mobil
  uygulamanın dijital hatırlatmalarını **fiziksel bir uyarı düğümüyle** tamamlamak —
  telefon sessiz/uzaktayken bile hastayı sesli + görsel uyaran masaüstü/komodin cihazı.
- P2: **Hafta bazında plan** (kurallar gereği giriş haftalar bazında; staj 2 hafta):
  - **Hafta 1:** bileşen seçimi ve temini; breadboard üzerinde devrenin kurulumu (ESP32,
    OLED, buzzer, LED'ler, buton, seri dirençler); Arduino IDE + ESP32 kart paketi ortam
    kurulumu; `blink_test` ile board/kablo/sürücü/IDE zincirinin doğrulanması; OLED ve
    temel giriş-çıkış (LED/buton) denemeleri.
  - **Hafta 2:** firmware geliştirme — Wi-Fi bağlantısı ve web sunucusu, `/alarm`-`/status`-
    `/stop` uçları, OLED arayüzü, alarm mantığı (buzzer + LED), buton ile susturma ve
    debounce; mobil uygulama ile entegrasyon ve uçtan uca test.

**1.2 Donanım Mimarisi ve Bileşen Seçimi**
- **1.2.1 Mikrodenetleyici Seçimi: ESP32** — dahili Wi-Fi (app ile haberleşme için ek modül
  gerektirmez), çift çekirdek, bol GPIO, düşük maliyet, Arduino çekirdeği desteği; Arduino
  Uno + harici Wi-Fi modülü alternatifine üstünlüğü. Kaynak: ESP32 datasheet.
- **1.2.2 Gösterge Birimi: OLED (SSD1306)** — karakter LCD yerine OLED tercihi: I2C ile 2 hat
  (SDA/SCL), düşük güç, yüksek kontrast, grafik + çok satır metin esnekliği (ilaç adı büyük
  punto + geri sayım). 128×64, I2C adres `0x3C`. Kaynak: Adafruit SSD1306.
- **1.2.3 Görsel-İşitsel Uyarı Bileşenleri** — **aktif buzzer** (sesli alarm; kod
  `digitalWrite HIGH/LOW` ile sürüyor ve stajda çalıştığı doğrulandı), kırmızı LED (alarm/ilaç
  vakti), yeşil LED (boşta/susturuldu). Sezgisel renk kodlaması.
- **1.2.4 Devre Kurulumu: Breadboard ve Jumper Bağlantıları** — lehimsiz prototipleme için
  breadboard, jumper kablolarla bağlantı. **Tüm aktif bileşenlerde (LED'ler ve buzzer dâhil)
  akım sınırlama amaçlı seri direnç kullanıldı.** (LED direnç değeri kayıt altında değil —
  raporda kesin sayı yazma; net değer Esma'dan gelirse eklenir. LED için tipik değer 220–330 Ω.)
  **Pin bağlantı tablosu** (koddan birebir):

  | Bileşen | ESP32 Pini | Mod / Not |
  |---|---|---|
  | Buzzer | GPIO 25 | OUTPUT (aktif buzzer, seri dirençli) |
  | Kırmızı LED | GPIO 26 | OUTPUT (+ seri direnç) |
  | Yeşil LED | GPIO 27 | OUTPUT (+ seri direnç) |
  | Buton | GPIO 14 | INPUT_PULLUP (basınca LOW) |
  | OLED SDA | GPIO 21 | I2C veri |
  | OLED SCL | GPIO 22 | I2C saat |

### BÖLÜM 2 — Gömülü Yazılım (Firmware) Geliştirme
- **2.1 Geliştirme Ortamı: Arduino IDE ve ESP32 Kurulumu** — ESP32 kart paketinin eklenmesi,
  kart (ESP32 Dev Module) + port seçimi; kullanılan kütüphaneler: `WiFi`, `WebServer`,
  `ArduinoJson`, `Wire`, `Adafruit_GFX`, `Adafruit_SSD1306`.
- **2.2 Bağlantı Testi (blink_test)** — `blink_test.ino` ile board+kablo+sürücü+IDE zincirinin
  doğrulanması: onboard LED (GPIO 2) yanıp söner, seri porta (115200) sayaç basılır. "Önce en
  küçük çalışan parçayı doğrula" yaklaşımı.
- **2.3 Wi-Fi Bağlantısı ve Web Sunucusu** — STA modunda ağa bağlanma, **20 sn** zaman aşımı,
  IP'nin seri porta/OLED'e yazdırılması, **80** portunda `WebServer`. Wi-Fi yoksa seri port
  üzerinden test (zarif geri düşüş).
- **2.4 REST Tarzı API ve JSON Haberleşmesi** — üç uç nokta: `POST /alarm`
  (`{"medication","nextDoseMinutes"}` → alarmı tetikler), `GET /status` (durum + kalan saniye
  JSON), `/stop` (uzaktan susturma). `ArduinoJson` ile (de)serialize; hatalı JSON'da 400,
  yanlış metotta 405 → temel hata yönetimi.
- **2.5 OLED Ekran Arayüzü** — `Adafruit_SSD1306` + `Adafruit_GFX`: başlık (`ALARM!`/`MedSafe`),
  ayraç çizgisi, "İlaç:" + ilaç adı (büyük punto), "Sonraki:" geri sayım (dk/sn; 60 dk üstünde
  saat:dk). `millis()` referanslı kalan süre.
- **2.6 Alarm Mantığı: Buzzer ve LED Kontrolü** — alarm aktifken kırmızı LED yanar, buzzer
  `millis()` ile **her 400 ms**'de aç/kapa (kesik bip). **Bloklamayan (non-blocking) tasarım**:
  `delay()` yerine `millis()` → buzzer çalarken sunucu ve buton tepkisel kalır.
- **2.7 Buton ile Susturma ve Debounce** — `INPUT_PULLUP` butona basınca (LOW) alarm susar,
  yeşil LED yanar; **200 ms debounce** ile mekanik sıçrama engellenir.
- **2.8 Mobil Uygulama ile Entegrasyon (üç katmanlı mimari)** — akış: **Telefon (Expo app) →
  Backend (Hono) → ESP32**. App cihaza DOĞRUDAN gitmez; backend'e `POST /api/device/alarm`
  atar (`deviceApi.ts`). Backend (`device/route.ts`) gövdeyi doğrular ve `esp32-client.ts`
  ile cihaza `http://${ESP32_HOST}/alarm` isteğini **4 sn timeout** ile iletir; cihaz
  ulaşılamazsa **502** döner. Mobil tarafta: hasta panosunda (`(tabs)/index.tsx`) her **10
  sn**'de bir kontrol; doz vakti gelince bir kez alarm tetiklenir, ilaç detayında manuel
  **"Test Et" / "Durdur"** butonları vardır. Bu bölüm, önceki **yazılım** stajında geliştirilen
  backend'in donanımı sürdüğünü göstererek iki rapor arasında köprü kurar.
  > **DİKKAT (abartma):** Backend/app ayrıca canlı OLED güncellemesi için `/info` ucunu
  > çağırır, ANCAK repodaki firmware (`medsafe_alarm.ino`) yalnızca `/alarm`, `/status`,
  > `/stop` tanımlar — `/info` yoktur. Yani mevcut firmware'de yalnızca anlık alarm tetikleme
  > (`/alarm`) çalışır; "OLED sürekli canlı güncelleniyor" diye yazma. (Firmware, app/backend'den
  > biraz eski sürüm görünüyor.) Doğru ifade: "Cihaz, app→backend→ESP32 HTTP zinciri ÜZERİNDEN
  > ve ayrıca seri port üzerinden test edilebilecek şekilde tasarlandı."

### BÖLÜM 3 — Karşılaşılan Zorluklar ve Çözümleri
- **3.1 Bloklamayan Zamanlama (delay → millis):** `delay()` ile buzzer çaldırınca sunucu/buton
  donuyordu; tüm zamanlama `millis()` tabanlı durum makinesine taşındı.
- **3.2 Buton Sıçraması (Debounce):** tek basışın çoklu algılanması → 200 ms eşik.
- **3.3 I2C/OLED Başlatma:** ekranın `0x3C` adresinde bulunması, `Wire.begin(21,22)` ile doğru
  pin eşlemesi; `oled.begin` başarısızsa seri porta uyarı.
- **(Opsiyonel) 3.4 Wi-Fi Dayanıklılığı:** 20 sn timeout ve Wi-Fi yokken seri-port fallback'i.

### BÖLÜM 4 — Sonuç ve Değerlendirme
- Kazanımlar: gömülü sistemde kaynak kısıtı, gerçek zamanlı/non-blocking düşünme,
  I2C/GPIO/Wi-Fi entegrasyonu, donanım-yazılım birlikte hata ayıklama; MedSafe'in dijital
  katmanının fiziksel dünyaya taşınması. Gelecek iyileştirmeler: RTC ile gerçek saat, kalıcı
  bellek (NVS), pil beslemesi, 3D baskı muhafaza/kutu.

### Ek A — Kod Parçaları
- Aşağıdaki EK-1'deki tam kod, önceki rapordaki gibi kod görüntüsü/bloğu olarak eklenir.

---

## 3) Görsel (Şekil) listesi  — GÜNCEL DURUM
Elde **tek gerçek foto var: devre/breadboard fotoğrafı.** Diyagram çizilmedi. Bu yüzden:

**Kullanılacak (mevcut):**
- ✅ **Breadboard / devre fiziksel kurulum fotoğrafı** — Esma ekleyecek (Şekil olarak konur).
- 📋 **Pin bağlantı tablosu** — writer üretir (yukarıdaki tablodan).
- 📋 **Bileşen listesi (BOM) tablosu** — writer üretir.

**Yok → placeholder ya da writer üretir:**
- Devre şeması (Fritzing): YOK. Writer placeholder bırakır; gerekirse pin tablosu + metin
  tasviri yeterli sayılır.
- Sistem akış diyagramı (telefon → ESP32 → uyarı → buton → susturma): YOK. Writer basit bir
  akış (mermaid/metin kutuları) üretebilir ya da placeholder koyar.
- OLED ekran fotoları, LED/buzzer aktif foto, blink_test seri çıktısı, Arduino IDE ekranı,
  Postman `POST /alarm`, `/status` JSON: foto YOK → bunlara yer verme ya da placeholder.

> Not: Sadece 1 gerçek foto olduğu için rapor görselce yalın olacak; ağırlık tablolar +
> devre fotosu + (varsa) writer'ın ürettiği basit akış diyagramında.

## 4) Referanslar (önerilen biçim: başlık, yıl, URL, erişim tarihi)
1. Espressif, ESP32 Technical Reference Manual / Datasheet.
2. Arduino, Arduino-ESP32 core dokümantasyonu.
3. Adafruit, SSD1306 OLED kütüphanesi ve kılavuzu.
4. Adafruit, GFX grafik kütüphanesi dokümantasyonu.
5. B. Blanchon, ArduinoJson dokümantasyonu.
6. Arduino, Wire (I2C) kütüphanesi referansı.
7. Arduino-ESP32, WebServer kütüphanesi referansı.
8. (Giriş motivasyonu) İlaç uyumu / akıllı ilaç hatırlatıcı üzerine bir akademik kaynak.

## 5) Cevaplanan / kalan sorular
**Cevaplandı (Esma):**
- [x] Staj süresi: **2 hafta** (Hafta 1 / Hafta 2). Kesin gün tarihleri opsiyonel.
- [x] Buzzer: **aktif buzzer**, çalıştığı doğrulandı.
- [x] Dirençler: LED'ler ve buzzer dâhil hepsinde seri direnç var; **LED değeri net değil**
  → raporda kesin sayı yazılmayacak.
- [x] Görsel: yalnızca **devre fotosu** mevcut; diyagram yok.

- [x] Test yolu: **Hem app hem seri port.** Kodda tam bir app→backend→ESP32 HTTP entegrasyonu
  var (mobil `deviceApi.ts`, backend `device/route.ts` + `esp32-client.ts`); firmware'de ayrıca
  seri test komutu var. Doğru ifade: "app→backend→ESP32 HTTP zinciri ve seri port üzerinden test".

**Kalan (opsiyonel, raporu bloklamaz):**
- [ ] Kesin staj başlangıç/bitiş günleri (varsa).
- [ ] LED direnç değeri (Esma dirençleri bulursa).
- [ ] (İsteğe bağlı) Firmware'e `/info` ucu eklenip OLED canlı güncelleme tamamlanacak mı —
  yoksa rapor yalnızca `/alarm` tetiklemeyi anlatır.

## 6) Kodtan kesin teknik bulgular (writer uydurmasın diye)
- Kütüphaneler: WiFi, WebServer, ArduinoJson, Wire, Adafruit_GFX, Adafruit_SSD1306.
- Pinler: Buzzer 25, Kırmızı LED 26, Yeşil LED 27, Buton 14 (INPUT_PULLUP), I2C SDA 21 / SCL 22.
- OLED: 128×64, adres 0x3C, SSD1306_SWITCHCAPVCC.
- Wi-Fi: STA mod, 20000 ms timeout, IP seri porta + OLED'e yazılır.
- WebServer port 80; uçlar: /alarm (POST), /status (GET, JSON: active/medication/nextDoseSeconds), /stop.
- handleAlarm girdisi: medication (string), nextDoseMinutes (sayı) → nextDoseEpoch = millis()+min*60000.
- Buzzer: alarm aktifken her 400 ms toggle. Buton debounce: 200 ms. Ekran tazeleme: 500 ms.
- Seri test komutu: `ALARM <ilaç> <dakika>` ve `STOP`.
- Durum: active, medication, nextDoseEpoch, firedAt.
- blink_test: onboard LED GPIO 2, 500 ms blink, Serial 115200 sayaç.

**Entegrasyon (app/backend tarafı — koddan):**
- Akış: Telefon (Expo) → Backend (Hono `/api/device/*`) → ESP32 (`http://ESP32_HOST/...`).
- Mobil `deviceApi.ts`: fireDeviceAlarm/updateDeviceInfo/stopDeviceAlarm/getDeviceStatus →
  backend'e POST/GET (dev: `http://<host>:3001`, prod: `https://api.medsafe.app`).
- Backend `device/route.ts`: /alarm, /info, /stop (POST), /status (GET); doğrulama + 502.
- Backend `esp32-client.ts`: cihaza HTTP, **4 sn timeout** (AbortController), ESP32_HOST env'den.
- Dashboard: her 10 sn tick; doz vakti → 1 kez alarm; manuel "Test Et"/"Durdur" butonları.
- **UYUMSUZLUK:** backend/app `/info` çağırır; firmware'de `/info` YOK (yalnız /alarm,/status,/stop).
  app `/status`'tan `ip` bekler; firmware `nextDoseSeconds` döner. → firmware muhtemelen eski sürüm.

---

## EK-1) Tam firmware kaynak kodu (Ek A için — birebir bu kod kullanılacak)

### `medsafe_alarm.ino`
```cpp
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
```

### `blink_test.ino`
```cpp
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
```

---

## EK-2) Eski (yazılım) rapor — referans iskelet ve üslup
Writer bunu **tarz/derinlik referansı** olarak kullansın (içeriği KOPYALAMA; donanıma çevir).

**Üslup:** Resmî/akademik Türkçe, iki yana dayalı, ağırlıkla edilgen + "çalışma/proje"
öznesi. Her alt başlık: gerekçe → uygulama → kaynak [N]. Şekiller "Tablo X.Y açıklama"
ile altta ortalı. Bol resmî dokümantasyon/akademik atıf. ~23 sayfa (kapak+form dahil).

**Eski raporun içindekiler iskeleti (yazılım):**
- BÖLÜM 1 GİRİŞ: 1.1 Staj Amacı ve Genel Plan · 1.2 Mimari Tasarım, Altyapı Kurulumu ve
  Teknoloji Yığını Optimizasyonu (1.2.1 Monorepo & TurboRepo · 1.2.2 Hono · 1.2.3 tRPC ·
  1.2.4 Prisma ORM/PostgreSQL)
- BÖLÜM 2 Mobil Uygulama: 2.1 React Native & Expo · 2.2 Navigasyon (Expo Router, rol tabanlı)
  · 2.3 Hasta Modülü (Dashboard, doz) · 2.4 İlaç Ekleme Formu · 2.5 Erişilebilirlik ·
  2.6 Bildirim & Sesli Uyarı · 2.7 Bakıcı Modülü · 2.8 Durum Yönetimi (TanStack Query) ·
  2.9 Custom Hook Mimarisi
- BÖLÜM 3 Karşılaşılan Zorluklar ve Çözümleri: 3.1 Dependency Hell · 3.2 Rol bazlı
  navigasyonda zamanlama · 3.3 Native saat seçimi UI
- Sonuç ve Değerlendirme · Ek A Kod Parçaları · Referanslar [1]–[12]

> Donanım raporu da bu 4-bölümlük omurgayı izler; yukarıdaki Bölüm 2 (mimari planı) bunun
> donanıma uyarlanmış hâlidir.
