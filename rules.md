. Mimari Prensipler (Loose Coupling)
Dependency Injection: Servisler ve logic katmanları birbirine sıkı sıkıya bağlı olmamalı. Mümkünse fonksiyonel inject yöntemlerini veya tRPC context yapısını kullan.

Single Responsibility: Her fonksiyon veya component sadece bir iş yapmalı. 200 satırı geçen dosyaları otomatik olarak parçalamayı öner.

Encapsulation: İç mantığı dışarıya sızdırma. Component'ler sadece ihtiyacı olan propları almalı (Prop drilling'den kaçın).

2. Kod Kalitesi (Clean Code)
Naming: Değişken isimleri açıklayıcı olmalı (data yerine medicationList). Boolean değişkenler is, has, should gibi eklerle başlamalı.

DRY (Don't Repeat Yourself): Tekrar eden mantıkları hooks veya utils altına taşı.

Early Returns: İçiçe geçmiş if-else blokları yerine "early return" paternini kullan.

Zod First: Tüm dış veriler (API, Form) için Zod şemalarını kullan ve tip güvenliğini sağla.

3. Teknoloji Spesifik Kurallar (Frontend & Backend)
React: Priority, functional components ve hooks kullanımındadır. useEffect kullanımını minimize et, event-driven mantığı tercih et.

TypeScript: any kullanımı kesinlikle yasaktır. Interfaceler yerine type kullanmayı tercih et (tutarlılık için).

Error Handling: Hataları sessizce yutma. try-catch bloklarında kullanıcıya anlamlı feedback verecek yapılar kur.

4. Agent Çalışma Disiplini
Her büyük değişiklikten önce tasks.md dosyasını oku ve planını oraya yaz.

Kod yazdıktan sonra mutlaka lint komutunu çalıştır ve hataları düzelt.

5. Mobil & Klavye Yönetimi (Android & iOS)
Chat ekranları gibi input ağırlıklı sayfalarda, klavye altında kalma veya "double jump" sorunlarını önlemek için:
- `app.json`: `softwareKeyboardLayoutMode` değerini `pan` olarak ayarla.
- `KeyboardAvoidingView`: `behavior="padding"` ve `enabled={true}` kullan.

6. Veri & Zaman Yönetimi
İlaç alım (intake) kayıtlarında her zaman opsiyonel bir `takenAt` (timestamp) parametresini destekle. Bu, hem AI asistanının geriye dönük kayıt yapabilmesini sağlar hem de UI esnekliğini artırır.

7. Git & Commit Standartları
Commit mesajlarında `type: description` formatını takip et:
- `feat`: Yeni özellik (ör: feat: add ai assistant tab)
- `fix`: Hata düzeltme
- `refactor`: Kod iyileştirme (fonksiyonalite değişmeden)
- `style`: UI/UX, CSS, ikon değişiklikleri
- `chore`: Konfigürasyon, paket güncelleme, temizlik