# MedSafe Donanım Stajı Raporu — TAM METİN (formatlamaya hazır içerik)

> **DESKTOP CLAUDE İÇİN TALİMAT:** Aşağıdaki metin, DEÜ Bilgisayar Mühendisliği staj raporu
> formatında bir **.docx** belgesine dönüştürülecektir. İçeriği DEĞİŞTİRME/KISALTMA; yalnızca
> biçimlendir. Uygulanacak kurallar:
> - A4; kenar boşlukları sol 3 cm, sağ 2 cm, üst-alt 3 cm; tek yüz.
> - Gövde metni 12 punto **Times New Roman**, iki yana dayalı (justified), 1,5 satır aralığı.
> - Paragraf ilk satırı 0,5 cm girintili; paragraflar arası bir boş satır.
> - Bölüm başlıkları (BÖLÜM 1 vb.) 18 punto, büyük, koyu; alt başlıklar ondalık numaralı.
> - Her sayfada üst/alt bilgi: "Adı Soyadı: Esma Oruç | Firma Ünvanı: Dokuz Eylül Üniversitesi"
>   ve "Staj Türü: Donanım | Tarih: Hafta 1–Hafta 2 | Sayfa: N".
> - Kapak + iç kapak + **İçindekiler** + **Tablo Listesi** + **Şekil Listesi** otomatik oluştur.
> - Tablolar sola dayalı, başlık tablonun üstünde ("Tablo X.Y …"); şekiller ortalı, açıklama
>   altta ("Şekil X.Y …"). `[ŞEKİL: …]` etiketli yerlere ilgili görsel konacak (Esma sağlayacak);
>   görsel yoksa boş çerçeve/placeholder bırak.
> - `Ek A`'daki kodu monospace (Consolas) blok ya da ekran görüntüsü olarak ekle.

---

## KAPAK
DOKUZ EYLÜL ÜNİVERSİTESİ
MÜHENDİSLİK FAKÜLTESİ
STAJ RAPORU
Öğrencinin Bölümü: Bilgisayar Mühendisliği
Adı Soyadı: Esma Oruç
Numarası: 2022510140
İZMİR

## STAJ SİCİL FORMU (bilgiler)
- Adı Soyadı: Esma Oruç — Numara: 2022510140
- Firma Ünvanı: Dokuz Eylül Üniversitesi — Staj Yetkilisi: Semih Utku
- Staj Türü: **Donanım** — Süre: 2 hafta (Hafta 1 – Hafta 2)

---

# BÖLÜM 1 — GİRİŞ

## 1.1 Staj Amacı ve Genel Plan

Bu donanım stajı, lisans bitirme projesi olarak geliştirilen MedSafe ilaç takip
sisteminin fiziksel bir donanım bileşeniyle genişletilmesi amacıyla yürütülmüştür. MedSafe,
hastaların ilaçlarını takip etmesini, yan etkilerini kaydetmesini ve doz hatırlatmaları
almasını; bakıcıların ise hastalarının ilaç uyumunu uzaktan izlemesini sağlayan bir mobil
uygulama ve sunucu (backend) bütünüdür. Ancak yalnızca akıllı telefon üzerinden verilen
dijital hatırlatmalar; telefonun sessizde olması, hastadan uzakta bulunması veya yaşlı
kullanıcıların ekran bildirimlerini gözden kaçırması gibi durumlarda yetersiz kalabilmektedir.
Bu stajın amacı, ilaç vaktini sesli ve görsel olarak çevreye duyuran, telefondan bağımsız
çalışabilen bir fiziksel uyarı düğümü tasarlamak ve bunu mevcut MedSafe sistemine entegre
etmektir. Hedeflenen cihaz, bir masaüstü/komodin aygıtı gibi konumlandırılarak hastayı ilaç
saatinde buzzer sesi ve kırmızı ışıkla uyarmakta, ilacı aldığında ise bir butonla alarmı
susturup yeşil ışıkla geri bildirim vermektedir.

Staj, iki hafta süresince planlanmış ve yürütülmüştür. **Birinci haftada** donanım
bileşenlerinin seçimi ve temini gerçekleştirilmiş; ESP32 geliştirme kartı, OLED ekran, buzzer,
kırmızı ve yeşil LED'ler, buton ve akım sınırlama dirençleri bir breadboard üzerinde jumper
kablolarla birbirine bağlanmıştır. Aynı hafta içinde Arduino IDE geliştirme ortamı kurulmuş,
ESP32 kart paketi tanımlanmış ve basit bir "blink" testiyle kart, kablo, sürücü ve derleme
zincirinin doğru çalıştığı doğrulanmıştır. Ardından OLED ekran ve temel giriş-çıkış birimleri
(LED ve buton) ayrı ayrı denenmiştir. **İkinci haftada** ise cihazın gömülü yazılımı (firmware)
geliştirilmiştir: ESP32'nin kablosuz ağa bağlanması, bir HTTP web sunucusunun açılması, alarm
ve durum uç noktalarının (endpoint) tanımlanması, OLED arayüzünün tasarlanması ve buzzer ile
LED'leri yöneten alarm mantığının yazılması bu aşamada tamamlanmıştır. Haftanın sonunda cihaz,
MedSafe mobil uygulaması ve sunucusuyla entegre edilerek uçtan uca test edilmiştir.

## 1.2 Donanım Mimarisi ve Bileşen Seçimi

Cihazın donanım mimarisi; bir mikrodenetleyici (ESP32), bir gösterge birimi (OLED ekran), sesli
ve görsel uyarı elemanları (buzzer, kırmızı ve yeşil LED) ve bir kullanıcı girişi (buton)
etrafında kurgulanmıştır. Bu bölümde her bileşenin seçim gerekçesi ve sistemdeki rolü
açıklanmaktadır.

### 1.2.1 Mikrodenetleyici Seçimi: ESP32

Sistemin beyni olarak ESP32 geliştirme kartı seçilmiştir. Bu tercihte belirleyici etken,
ESP32'nin dahili Wi-Fi modülüne sahip olmasıdır; böylece cihazın MedSafe sunucusuyla kablosuz
haberleşmesi için ek bir ağ modülü gerekmemiştir. ESP32 ayrıca çift çekirdekli işlemcisi, çok
sayıda programlanabilir giriş-çıkış (GPIO) pini, düşük maliyeti ve Arduino çekirdeği (core)
desteğiyle hızlı prototipleme için elverişlidir [1], [2]. Alternatif olarak değerlendirilen
Arduino Uno gibi kartlar, kablosuz bağlantı için harici bir modüle ihtiyaç duyduğundan ve
işlem gücü daha sınırlı olduğundan, bu proje için ESP32 daha uygun bulunmuştur.

### 1.2.2 Gösterge Birimi: OLED Ekran (SSD1306)

İlaç adının ve sonraki doza kalan sürenin gösterilmesi için SSD1306 sürücülü, 128×64 piksel
çözünürlüklü bir OLED ekran kullanılmıştır. Karakter tabanlı bir LCD yerine OLED ekranın tercih
edilmesinin başlıca nedenleri; I2C arayüzü sayesinde yalnızca iki veri hattı (SDA ve SCL) ile
sürülebilmesi, düşük güç tüketimi, yüksek kontrastı ve grafik ile çok satırlı metni esnek bir
biçimde gösterebilmesidir. Bu esneklik, ilaç adının büyük puntoyla, geri sayımın ise alt satırda
küçük puntoyla gösterilmesine olanak tanımıştır. Ekran, I2C veri yolunda `0x3C` adresiyle
çalışmakta ve Adafruit SSD1306 ile Adafruit GFX kütüphaneleri aracılığıyla sürülmektedir [3], [4].

### 1.2.3 Görsel-İşitsel Uyarı Bileşenleri

Kullanıcıyı uyarmak için bir aktif buzzer ile kırmızı ve yeşil olmak üzere iki LED
kullanılmıştır. Aktif buzzer, üzerine uygulanan lojik sinyalle doğrudan ses ürettiğinden ek bir
frekans üretimi gerektirmemiş ve yazılımda basit aç/kapa kontrolüyle sürülmüştür. Renk
kodlaması sezgisel olacak biçimde tasarlanmıştır: kırmızı LED ilaç vaktinin geldiğini ve
alarmın aktif olduğunu, yeşil LED ise sistemin sakin durumda olduğunu veya alarmın
susturulduğunu belirtir. Bu görsel ayrım, işitme güçlüğü çeken kullanıcılar için de uyarının
algılanabilirliğini artırmaktadır.

### 1.2.4 Devre Kurulumu: Breadboard ve Jumper Bağlantıları

Prototip aşamasında, lehimleme gerektirmeden hızlı ve değiştirilebilir bağlantı sağlaması
nedeniyle lehimsiz bir breadboard kullanılmış; tüm bileşenler jumper kablolarla ESP32'nin
ilgili pinlerine bağlanmıştır. Aktif çıkış üreten bileşenlerde (LED'ler ve buzzer) akımı
sınırlamak amacıyla seri dirençler kullanılmıştır. Sistemde kullanılan bileşenler Tablo 1.1'de,
bileşenlerin ESP32 üzerindeki pin eşlemeleri ise Tablo 1.2'de verilmiştir. Kurulan devrenin
fiziksel görünümü Şekil 1.1'de gösterilmektedir.

Tablo 1.1 Sistemde kullanılan donanım bileşenleri.

| Bileşen | Açıklama |
|---|---|
| ESP32 geliştirme kartı | Dahili Wi-Fi'li mikrodenetleyici, sistemin denetleyicisi |
| OLED ekran (SSD1306) | 128×64 piksel, I2C, bilgi göstergesi |
| Aktif buzzer | Sesli alarm |
| Kırmızı LED | Alarm/ilaç vakti göstergesi |
| Yeşil LED | Sakin durum/susturuldu göstergesi |
| Buton | Alarmı susturma girişi |
| Breadboard ve jumper kablolar | Lehimsiz prototip bağlantısı |
| Seri dirençler | LED ve buzzer için akım sınırlama |

Tablo 1.2 Bileşenlerin ESP32 pin bağlantıları.

| Bileşen | ESP32 Pini | Mod / Not |
|---|---|---|
| Buzzer | GPIO 25 | Çıkış (aktif buzzer, seri dirençli) |
| Kırmızı LED | GPIO 26 | Çıkış (seri dirençli) |
| Yeşil LED | GPIO 27 | Çıkış (seri dirençli) |
| Buton | GPIO 14 | Giriş (INPUT_PULLUP; basınca LOW) |
| OLED SDA | GPIO 21 | I2C veri hattı |
| OLED SCL | GPIO 22 | I2C saat hattı |

`[ŞEKİL 1.1: Breadboard üzerinde kurulan MedSafe alarm devresi — Esma'nın çektiği devre fotoğrafı buraya konacak]`

---

# BÖLÜM 2 — GÖMÜLÜ YAZILIM (FIRMWARE) GELİŞTİRME

## 2.1 Geliştirme Ortamı: Arduino IDE ve ESP32 Kurulumu

Cihazın gömülü yazılımı Arduino IDE üzerinde, C/C++ dilinde geliştirilmiştir. Geliştirmeye
başlamadan önce IDE'ye ESP32 kart paketi tanımlanmış, kart türü "ESP32 Dev Module" olarak
seçilmiş ve doğru seri port ayarlanmıştır [2]. Proje boyunca; kablosuz bağlantı için `WiFi`,
HTTP sunucusu için `WebServer`, JSON ayrıştırma için `ArduinoJson`, I2C haberleşmesi için
`Wire` ve ekran sürümü için `Adafruit_GFX` ile `Adafruit_SSD1306` kütüphaneleri kullanılmıştır
[3], [4], [5].

## 2.2 Bağlantı Testi (blink_test)

Asıl yazılıma geçmeden önce, donanım ve yazılım zincirinin doğru kurulduğundan emin olmak için
küçük bir test programı (`blink_test`) yazılmıştır. Bu program, ESP32'nin kart üzerindeki
yerleşik LED'ini (GPIO 2) yarım saniye aralıklarla yakıp söndürmekte ve seri porta (115200
baud) artan bir sayaç değeri basmaktadır. Böylece kartın, USB kablosunun, sürücünün ve derleme
zincirinin sorunsuz çalıştığı en küçük çalışan örnek üzerinden doğrulanmıştır. Mühendislik
açısından bu adım, karmaşık yazılıma geçmeden önce olası donanım ve kurulum sorunlarını erken
tespit etmeyi sağlamıştır.

## 2.3 Wi-Fi Bağlantısı ve Web Sunucusu

Cihaz, açılışında istasyon (STA) modunda yapılandırılarak belirtilen kablosuz ağa
bağlanmaktadır. Bağlantı, en fazla 20 saniyelik bir zaman aşımı içinde denenmekte; bağlantı
kurulduğunda atanan IP adresi hem seri porta hem de OLED ekrana yazdırılmaktadır. Bağlantı
sağlanamadığında cihaz çökmemekte, bunun yerine seri port üzerinden test edilebilecek bir geri
düşüş (fallback) durumuna geçmektedir; bu yaklaşım, ağın bulunmadığı ortamlarda da geliştirmeye
devam edilmesini sağlamıştır. Bağlantının ardından ESP32 üzerinde 80 numaralı port üzerinden
bir HTTP web sunucusu başlatılmaktadır.

## 2.4 REST Tarzı API ve JSON Haberleşmesi

Cihaz, MedSafe sunucusundan gelen komutları HTTP üzerinden, JSON biçiminde almaktadır. Web
sunucusunda üç uç nokta tanımlanmıştır: `POST /alarm` ilaç adı ve sonraki doza kalan dakikayı
içeren bir JSON gövdesi (`{"medication": ..., "nextDoseMinutes": ...}`) alarak alarmı tetikler;
`GET /status` cihazın güncel durumunu (etkin olup olmadığı, ilaç adı ve kalan saniye) JSON
olarak döndürür; `/stop` ise alarmı uzaktan durdurur. Gelen JSON gövdesi `ArduinoJson`
kütüphanesiyle ayrıştırılmakta, hatalı veya eksik veride 400, beklenmeyen HTTP metodunda ise
405 durum kodu döndürülerek temel düzeyde hata yönetimi sağlanmaktadır.

## 2.5 OLED Ekran Arayüzü

OLED ekran, hastaya o an alınacak ilacı ve sonraki doza kalan süreyi göstermek üzere
tasarlanmıştır. Ekranın üst kısmında, alarmın etkin olup olmamasına göre "ALARM!" ya da
"MedSafe" başlığı yer almakta; bunun altında bir ayraç çizgisinin ardından "İlaç:" etiketiyle
birlikte ilaç adı büyük puntoyla gösterilmektedir. En alt satırda ise sonraki doza kalan süre,
`millis()` zaman tabanına göre hesaplanarak; altmış dakikanın altında dakika ve saniye,
üzerinde ise saat ve dakika biçiminde yazdırılmaktadır. Ekran içeriği, bilgilerin güncel
kalması için belirli aralıklarla yeniden çizilmektedir.

## 2.6 Alarm Mantığı: Buzzer ve LED Kontrolü

Alarm etkin durumdayken kırmızı LED yakılmakta ve buzzer, yaklaşık 400 milisaniyede bir açılıp
kapanarak kesik kesik bir uyarı sesi üretmektedir. Bu yanıp sönme ve bip etkisi, bloklayıcı
`delay()` çağrıları yerine `millis()` tabanlı bir zaman karşılaştırmasıyla gerçekleştirilmiştir.
Böylece buzzer çalarken dahi web sunucusu gelen istekleri işleyebilmekte ve buton anında tepki
verebilmektedir. Bu bloklamayan (non-blocking) tasarım, gerçek zamanlı davranış gerektiren
gömülü sistemlerde tepkiselliğin korunması açısından kritik olmuştur.

## 2.7 Buton ile Susturma ve Debounce

Hasta ilacını aldığında, alarmı susturmak için tek bir butona basması yeterlidir. Buton,
ESP32'nin dahili çekme direnci etkinleştirilerek `INPUT_PULLUP` modunda tanımlanmış; bu nedenle
basılmadığında lojik HIGH, basıldığında LOW değeri okunmaktadır. Mekanik butonların tek bir
basışta ürettiği çoklu sıçrama (bounce) sinyallerinin yanlış algılanmaması için yaklaşık 200
milisaniyelik bir debounce eşiği uygulanmıştır. Butona basıldığında alarm devre dışı bırakılmakta,
buzzer susturulmakta ve yeşil LED yakılarak kullanıcıya işlemin başarıyla gerçekleştiği geri
bildirilmektedir.

## 2.8 Mobil Uygulama ile Entegrasyon

Geliştirilen donanım, MedSafe ekosistemine üç katmanlı bir mimariyle entegre edilmiştir: mobil
uygulama, sunucu (backend) ve ESP32 cihazı. Mobil uygulama, cihaza doğrudan bağlanmak yerine
MedSafe sunucusuna istek göndermekte; sunucu da bu isteği yerel ağdaki ESP32'ye iletmektedir.
Hasta panosunda, sonraki doz bilgisi düzenli aralıklarla kontrol edilmekte ve doz vakti
geldiğinde sunucu üzerinden cihaza alarm komutu gönderilmektedir. Ayrıca ilaç detay ekranında,
cihazı denemek için "Test Et" ve alarmı durdurmak için "Durdur" butonları yer almaktadır.
Sunucu tarafında cihazla yapılan HTTP haberleşmesi belirli bir zaman aşımıyla sınırlandırılmış,
cihaza ulaşılamadığında uygulamaya uygun bir hata bildirimi döndürülmüştür. Bu mimari, önceki
yazılım stajında geliştirilen sunucunun fiziksel bir donanımı sürmek için yeniden
kullanılabildiğini göstermesi açısından da önemlidir. Cihaz; hem bu uygulama–sunucu–cihaz HTTP
zinciri üzerinden hem de doğrudan seri port üzerinden gönderilen test komutlarıyla (`ALARM`
ve `STOP`) denenebilecek biçimde tasarlanmıştır.

---

# BÖLÜM 3 — KARŞILAŞILAN ZORLUKLAR VE ÇÖZÜMLERİ

## 3.1 Bloklamayan Zamanlama (delay yerine millis)

Geliştirmenin ilk aşamasında buzzer ve LED'lerin yanıp sönme davranışı, basit `delay()`
çağrılarıyla gerçekleştirilmişti. Ancak bu yaklaşım, `delay()` süresince işlemciyi tamamen
meşgul ettiğinden, alarm çalarken web sunucusunun istekleri işleyememesine ve butonun tepki
vermemesine yol açtı. Sorun, tüm zamanlama mantığının `millis()` ile geçen süreyi karşılaştıran
bloklamayan bir durum makinesine taşınmasıyla çözüldü. Böylece tüm görevler (sunucu dinleme,
buton okuma, buzzer sürme ve ekran yenileme) aynı döngü içinde, birbirini engellemeden
yürütülebildi.

## 3.2 Buton Sıçraması (Debounce)

Mekanik butonun her basışında ürettiği kısa süreli sıçrama sinyalleri, alarmın tek basışta
birden çok kez susturulup yeniden tetiklenmesi gibi kararsız davranışlara neden oluyordu. Bu
sorun, iki geçerli basış arasında yaklaşık 200 milisaniyelik bir bekleme süresi (debounce
eşiği) tanımlanarak giderildi; bu süre içinde algılanan tekrar sinyalleri yok sayıldı.

## 3.3 I2C/OLED Başlatma Sorunları

OLED ekran ilk denemelerde görüntü vermedi. Sorunun, ekranın I2C veri yolundaki adresinin ve
veri/saat hatlarının doğru tanımlanmasıyla ilgili olduğu görüldü. Ekranın `0x3C` adresinde
çalıştığı ve ESP32 üzerinde I2C hatlarının SDA için GPIO 21, SCL için GPIO 22 pinlerine
karşılık geldiği belirlenerek bağlantı doğru biçimde yapılandırıldı. Ayrıca ekran başlatma
çağrısının başarısız olması durumunda seri porta uyarı mesajı basılarak hata ayıklama
kolaylaştırıldı.

## 3.4 Kablosuz Bağlantı Dayanıklılığı

Geliştirme ortamının ağ koşullarının her zaman elverişli olmaması nedeniyle, cihazın kablosuz
ağa bağlanamadığı durumlarda kilitlenmemesi gerekiyordu. Bu amaçla bağlantı denemesine 20
saniyelik bir zaman aşımı eklendi ve bağlantı kurulamadığında cihazın seri port üzerinden test
edilebildiği bir çalışma kipine geçmesi sağlandı.

---

# BÖLÜM 4 — SONUÇ VE DEĞERLENDİRME

İki haftalık donanım stajı süresince, MedSafe ilaç takip sisteminin dijital katmanı fiziksel
dünyaya taşınarak telefondan bağımsız çalışabilen bir ilaç alarmı cihazı tasarlanmış ve
gerçeklenmiştir. Proje kapsamında ESP32 mikrodenetleyicisi; OLED ekran, buzzer, LED'ler ve buton
gibi çevre birimleriyle bir breadboard üzerinde birleştirilmiş, cihazın gömülü yazılımı Arduino
IDE ortamında geliştirilmiş ve cihaz MedSafe sunucusu aracılığıyla mobil uygulamaya entegre
edilmiştir.

Bu staj, yazılım geliştirme deneyiminin donanım dünyasına taşınması açısından öğretici
olmuştur. Sınırlı bellek ve işlem kaynağına sahip bir gömülü sistemde çalışmak; bloklamayan,
gerçek zamanlı bir programlama anlayışını, GPIO, I2C ve Wi-Fi gibi farklı arayüzlerin bir arada
yönetilmesini ve donanım ile yazılımın birlikte hata ayıklanmasını gerektirmiştir. Elde edilen
cihaz, ilaç uyumunu artırmaya yönelik somut bir fiziksel uyarı çözümü ortaya koymuştur.

Gelecekte yapılabilecek iyileştirmeler arasında; cihaza gerçek zaman saati (RTC) modülü
eklenerek zamanlamanın cihaz üzerinde bağımsız tutulması, ayar bilgilerinin kalıcı bellekte
(NVS) saklanması, pil ile taşınabilir çalışma ve bileşenlerin 3B baskı bir muhafaza içinde
bütünleştirilmesi sayılabilir. Ayrıca firmware'in, sunucudaki güncel uç noktalarla tam uyum
sağlayacak biçimde (canlı bilgi güncellemesi dâhil) genişletilmesi planlanmaktadır.

---

# EK A — KOD PARÇALARI

Cihazın ana gömülü yazılımı (`medsafe_alarm.ino`) ve bağlantı testi (`blink_test.ino`)
aşağıda verilmiştir. (Desktop Claude: kod, `donanim_staj_brief.md` dosyasının EK-1 bölümünden
birebir alınacak; monospace blok veya ekran görüntüsü olarak eklenecek.)

---

# REFERANSLAR

[1] Espressif Systems, "ESP32 Series Datasheet / Technical Reference Manual", Erişim: 01.06.2026,
    https://www.espressif.com
[2] Arduino, "Arduino-ESP32 Core Documentation", Erişim: 01.06.2026, https://docs.espressif.com/projects/arduino-esp32
[3] Adafruit, "Adafruit SSD1306 OLED Library and Guide", Erişim: 01.06.2026, https://learn.adafruit.com/monochrome-oled-breakouts
[4] Adafruit, "Adafruit GFX Graphics Library", Erişim: 01.06.2026, https://learn.adafruit.com/adafruit-gfx-graphics-library
[5] B. Blanchon, "ArduinoJson Documentation", Erişim: 01.06.2026, https://arduinojson.org
[6] Arduino, "Wire (I2C) Library Reference", Erişim: 01.06.2026, https://www.arduino.cc/reference/en/language/functions/communication/wire/
[7] Arduino-ESP32, "WebServer Library Reference", Erişim: 01.06.2026, https://docs.espressif.com/projects/arduino-esp32
