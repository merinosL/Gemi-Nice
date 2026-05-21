# Podo - Gamified Task & Virtual Pet Application

## 🌟 Proje Hakkında (Amacımız Nedir?)
**Podo**, kullanıcıların günlük görevlerini (çalışma, ödev vb.) yerine getirirken motivasyonlarını artırmayı hedefleyen **oyunlaştırılmış (gamified) bir verimlilik ve eğitim** uygulamasıdır. 

Sıradan bir "yapılacaklar listesi (To-Do)" uygulamasından farklı olarak Podo'da, size emanet edilmiş **sanal bir hayvanınız** bulunur.
- Kullanıcılar sisteme ders notlarını veya görevlerini PDF olarak yükler.
- Arka planda çalışan **Google Gemini AI**, bu dosyalardan otomatik olarak **Quiz'ler (testler)** üretir.
- Kullanıcılar bu testleri başarıyla çözdüklerinde sanal paralar (kemik/ödül) kazanırlar.
- Kazanılan bu ödüllerle sanal hayvanları olan Podo'yu besleyip mutlu edebilirler. Görevler aksatılırsa Podo hastalanabilir ve en nihayetinde onu kaybedebilirsiniz.

**Kısacası:** *Öğrenmeyi ve görev yapmayı eğlenceli, alışkanlık yaratan ve sevimli bir deneyime dönüştürüyoruz!*

---

Bu proje bir hackathon kapsamında geliştirilmiştir. Proje hem **Frontend (React Native / Expo)** hem de **Backend (Node.js / Express)** bileşenlerinden oluşmaktadır. 

Ancak jüri değerlendirmesi veya test amaçlı kullanımlar için **Backend kısmı tarafımızca Render üzerinde canlıya alınmıştır (deploy edilmiştir).** Dolayısıyla uygulamayı denemek için sadece Frontend kısmını yerel makinenizde çalıştırmanız yeterlidir.

## 🚀 Kurulum ve Çalıştırma

Aşağıdaki adımları takip ederek uygulamayı kendi bilgisayarınızda kolayca test edebilirsiniz:

### 1. Gereksinimler
- Bilgisayarınızda **Node.js** (v18 veya üzeri önerilir) kurulu olmalıdır.
- Mobil cihazınızda testi yapabilmek için telefonunuza **Expo Go** uygulamasını (App Store veya Google Play'den) indirmelisiniz.

### 2. Frontend'i Çalıştırma
Projeyi indirdikten sonra, terminal (komut satırı) üzerinden `Gemi-Nice-podo-frontend` klasörünün içine girin ve aşağıdaki komutları sırasıyla çalıştırın:

```bash
# Bağımlılıkları yükleyin
npm install

# Uygulamayı başlatın
npx expo start
```

Komut çalıştıktan sonra terminalinizde kocaman bir **QR Kod** belirecektir.
- **iPhone kullanıyorsanız:** Telefonunuzun kamerasını açıp bu QR kodu okutun.
- **Android kullanıyorsanız:** Expo Go uygulamasını açıp "Scan QR Code" seçeneği ile bu kodu okutun.

### 3. Ekstra Ayar Gerekiyor mu?
**Hayır.** 
Backend Render üzerinde (`https://podo-backend-kloo.onrender.com`) çalıştığı ve veritabanı bağlandığı için, hiçbir `.env` dosyası ayarına veya backend sunucusu ayağa kaldırmanıza gerek yoktur. Frontend kodunun içindeki API bağlantıları otomatik olarak canlı sunucumuza istek atacak şekilde ayarlanmıştır.

> **Not:** Jüri demosu için frontend kodunda `TEMP_TOKEN` (Geçici Token) veya direkt giriş sağlayacak kolaylaştırmalar yapılmıştır, bu sayede kayıt olma/giriş yapma süreçlerine takılmadan uygulamanın ana özelliklerini test edebilirsiniz.
