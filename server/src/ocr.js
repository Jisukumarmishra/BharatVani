const Tesseract = require("tesseract.js");

async function extractTextFromImage(buffer) {
  const result = await Tesseract.recognize(buffer, "eng+hin", {
    logger: () => null
  });
  return result.data.text?.trim() || "";
}

module.exports = { extractTextFromImage };
