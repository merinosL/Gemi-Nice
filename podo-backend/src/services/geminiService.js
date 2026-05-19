const { GoogleGenerativeAI } = require("@google/generative-ai");

async function analyzeDocument(pdfText) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
      throw new Error("Geçerli bir GEMINI_API_KEY bulunamadı!");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Metin çok uzunsa kırpıyoruz (token limiti için) - bunu prompt dışına aldık.
    const truncatedText = pdfText.substring(0, 15000);

    const prompt = `
Sen bir eğitim asistanısın. Verilen belge metnini okuyup YALNIZCA aşağıdaki JSON formatında yanıt ver, başka hiçbir şey (markdown vs) yazma:
{"description":"2-3 cümle özet","difficulty":"easy|normal|hard","questions":[{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"answer":"A"}]}

Zorluk kriteri: terim yoğunluğu ve soyutlama seviyesine göre (easy, normal veya hard).
Tam olarak 10 adet ÇOKTAN SEÇMELİ (4 şıklı) soru üret.
"answer" alanı SADECE doğru şıkkın harfini içermelidir (Örn: "A", "B", "C" veya "D").
Lütfen JSON bloğunun başına veya sonuna \`\`\`json veya \`\`\` ekleme, DOĞRUDAN geçerli ve saf bir JSON nesnesi döndür.

Belge:
${truncatedText}
`;

    const modelsToTry = ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-pro-latest"];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Gemini] Deneniyor: ${modelName}...`);
        
        // JSON hatasını engellemek için responseMimeType'ı sildim
        const model = genAI.getGenerativeModel({
          model: modelName
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Eğer markdown code block sarmalanmışsa temizle
        if (text.includes('\`\`\`')) {
          text = text.replace(/\`\`\`json\s*/gi, '').replace(/\`\`\`\s*/gi, '').trim();
        }
        
        // Net JSON objesini al
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            text = text.substring(firstBrace, lastBrace + 1);
        }

        const parsedData = JSON.parse(text);
        console.log(`[Gemini] Başarılı: ${modelName}`);
        return parsedData;
      } catch (err) {
        console.warn(`[Gemini][UYARI] ${modelName} başarısız: ${err.message || err.status || 'Bilinmeyen hata'}`);
        lastError = err;
      }
    }

    // Tüm modeller başarısız olduysa dış catch'e at
    throw lastError;

  } catch (error) {
    console.error("[Gemini] API Hatası:", error.message || error);
    // Fallback: uygulama çökmesin, sahte veri dön
    return {
      description: "Gemini API ile analiz edilemedi. Lütfen API anahtarını kontrol edin.",
      difficulty: "normal",
      questions: Array.from({ length: 10 }, (_, i) => ({
        question: `Soru ${i + 1}: Belge analiz edilemedi, lütfen tekrar deneyin.`,
        options: ["A) Hata", "B) Hata", "C) Hata", "D) Hata"],
        answer: `A`,
      })),
    };
  }
}

module.exports = { analyzeDocument };
