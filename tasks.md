YAPILACAK TASKLER   

her seyden once ugrasacagimiz yeni alan su:
ai agent servisi yapmak. once oturup bunu planlayacagiz sonrasnda asagidaki planlari da yapariz. 
ajanin yetenekleri: (sen de biraz dusunup bir seyler ekle)
İlaç Geçmişi ve Durum Sorgulama (Hafıza):

Kullanıcı: "Bugün tansiyon ilacımı içtim mi?"

Ajan: Veritabanına bakar ve "Evet, sabah 09:00'da içtiğinizi işaretlemişsiniz." der.

Kullanıcı: "Ben bu ilacı kaç gündür kullanıyorum?"

Ajan: "Bu ilaca 15 gün önce başladınız, 5 günlük dozunuz kaldı."

Planlama ve Hatırlatma (Asistanlık):

Kullanıcı: "Bir sonraki ilacım ne zaman?"

Ajan: "Saat 14:00'te tok karnına almanız gereken vitamininiz var."

Kullanım Talimatı Okuma: (İnternetten uydurarak değil, sadece senin veritabanındaki prospektüs/doktor notu verisinden okuyarak)

Kullanıcı: "Bu hapı aç karnına mı içecektim?"

Ajan: "Doktorunuz bu ilacı tok karnına almanızı not düşmüş."

Semptom ve Yan Etki Günlüğü Tutma:

Kullanıcı: "Bugün bu ilacı içtikten sonra midem çok bulandı."

Ajan: "Bunu not alıyorum. Bir sonraki doktor kontrolünüzde bu kayıtları doktorunuza gösterebilirsiniz." (Bu veri Prisma ile SideEffects tablosuna yazılır).

2. Neler YAPAMAZ? (Kesin Sınırlar - Guardrails)
Sağlık söz konusu olduğu için ajana çok katı kurallar (System Prompt içinde) vermelisin. Jüri üyeleri de mezuniyet projende en çok bu güvenlik sınırlarına dikkat edecektir.

Teşhis Koyamaz ve İlaç Öneremez:

Kullanıcı: "Çok başım ağrıyor, ne içeyim?"

Ajan (Yanlış): "Aspirin içebilirsiniz."

Ajan (Doğru): "Baş ağrınız için geçmiş olsun. Doktorunuzun yazdığı ilaçlar listesinde ağrı kesici bulunmuyor, bu nedenle size ilaç öneremem. Lütfen doktorunuza danışın."

Doz Değişikliği Yapamaz:

Kullanıcı: "Bugün tansiyonum çok yüksek, 2 tane hap yutsam olur mu?"

Ajan: "Kesinlikle hayır. Doktorunuz günde 1 adet almanızı belirtmiş. Lütfen dozu aşmayın ve kendinizi kötü hissediyorsanız bir yakınınızı arayın."

Tıbbi Yorum Yapamaz: İlaçların birbiriyle etkileşimi hakkında, eğer veritabanında kesin bir uyarı yoksa, kendi kendine internetten bilgi derleyip riskli yorumlar yapmamalıdır.

3. Karakter ve İletişim Tarzı Sınırları
Kısa ve Net Cevaplar: Yaşlı kullanıcılar uzun ve karmaşık paragrafları okumakta zorlanır. Cevaplar en fazla 1-2 cümle olmalı.

Teknik Terim Yasağı: "Veritabanına baktım, log kayıtlarında..." gibi cümleler yerine "Kayıtlarınıza baktım..." demeli.

Panik Yaratmamak: Kullanıcı ilacını unutmuşsa, "İlacınızı kaçırdınız, bu çok tehlikeli!" demek yerine, "Sabahki ilacınızı unutmuş görünüyorsunuz, doktorunuzun tavsiyesine göre telafi edebilirsiniz." gibi sakinleştirici bir dil kullanmalı.

1. activite gunlugudne notification okunmadiysa kirmizi nokta var gayet guzel ama o taba tiklayip loglari gordugume gore o kirmizi cizgi de gitmeli. caregiverni bakmadigi yeni log varsa tekrar kirmizi nokta olur. ayrica kac tane yeni log varsa home kismindaki pending alertsde de o kadar log var diye gorunmesi gerek.
2. caregiver tarafinda da dil destegi gelecek
3. medication list kismindaki tum ilaclarda eger ai ile olsuturulnus not varsa veya hasta not eklemisse kucuk bi not iconu da olsun.
4. caregiver ilac dolabi gidecek tabi ki hastlaarim olacak oranina adi. tikladigi zaman hastanin loglari orada da gozukecek.
5. caregiver dashbairdundaki active patient kismina bakinca hastalarim tabina gec. 
6. hasta ilaclarina uzun basio tek tek secerek birden fazla ilaci silebilsin. 
7. ilac refill kismi aktivite edilecek. hastanin ilaci bittiyse -3'e dusme durumu falanan olmamali onu duzeltelim,
8. emojiler yerine react-iconstan vs icon kkullanalim. 
9. tdays schedule kisminda henuz gelmdiyse veri gelen veriyle ayni boyda loading stateler skeletonlar olsun. 
10. kodda natiewind kullanilsin duz css degil ve bu yapiyi hic bozma
11. ilaci alis saatini falan da tutmaliyiz. ilaci take kismini daha cok gelistirelim.

12. alarm customization(gerekirse ai ile alarm uretecegim, ya da kullanicinin kendi mp3'u)
