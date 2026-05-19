// TODO: Replace mock with real Gemini API call
// Use @google/generative-ai package, model: gemini-1.5-pro
//
// Real Gemini prompt (do not execute, for future integration):
// ---
// Sen bir eğitim asistanısın. Verilen belge metnini okuyup YALNIZCA aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:
// {"description":"2-3 cümle özet","difficulty":"easy|normal|hard","questions":[{"question":"...","answer":"..."}]}
// Zorluk kriteri: terim yoğunluğu ve soyutlama seviyesine göre. Tam olarak 10 soru üret.
// Belge: {{PDF_TEXT}}
// ---

async function analyzeDocument(pdfText) {
  return {
    description: "Mock: Bu belge temel veri yapıları konusunu işlemektedir.",
    difficulty: "normal",
    questions: Array.from({ length: 10 }, (_, i) => ({
      question: `Mock soru ${i + 1}: Bu konuyla ilgili örnek soru?`,
      answer: `Mock cevap ${i + 1}`,
    })),
  };
}

module.exports = { analyzeDocument };
