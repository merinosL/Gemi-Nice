require('dotenv').config();
const geminiService = require('./src/services/geminiService');

async function test() {
  console.log("Testing Gemini API...");
  try {
    const result = await geminiService.analyzeDocument("Güneş sistemi merkezinde güneş bulunur. Dünya 3. gezegendir.");
    console.log("RESULT:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("TEST SCRIPT ERROR:", err);
  }
}

test();
