const fs = require("fs");
const os = require("os");
const path = require("path");
const OpenAI = require("openai");

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

function fallbackAnalysis(text) {
  const lowered = text.toLowerCase();
  const riskySignals = ["cure", "miracle", "breaking", "guaranteed", "shocking", "secret", "ban", "hoax"];
  const hitCount = riskySignals.filter((word) => lowered.includes(word)).length;
  const riskLevel = hitCount > 2 ? "High" : hitCount > 0 ? "Medium" : "Low";
  const explanation =
    "This is a heuristic-only assessment. Please verify the claim with trusted sources before sharing.";
  return { riskLevel, explanation };
}

async function analyzeMisinformation(text, language) {
  if (!client) return fallbackAnalysis(text);

  const system = `You are BharatVaani AI, an Indian misinformation analysis assistant.
Task: Analyze the given content and determine whether it contains misinformation.
Output Format: Return ONLY strict JSON with these keys:
- "riskLevel": string (Low / Medium / Very High)
- "riskPercentage": number (0-100)
- "reasons": array of 2-3 simple bullet points (strings)
- "correctInformation": string (factually correct, simple language, neutral)
- "explanation": string (A combined concise summary of everything above for TTS)

Rules:
- Mark "Very High" if it causes public harm, panic, or health risks.
- Mark "Medium" if misleading but not severely harmful.
- Mark "Low" if mostly correct or harmless.
- Do not shame or scold.
- Do not mention "according to AI" or "I think".
- Language of explanation and reasons should be ${language}.`;

  const userPrompt = `Content to analyze: ${text}`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userPrompt }
    ]
  });

  const raw = completion.choices?.[0]?.message?.content || "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return fallbackAnalysis(text);

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      riskLevel: parsed.riskLevel || "Low",
      riskPercentage: parsed.riskPercentage || 0,
      reasons: parsed.reasons || [],
      correctInformation: parsed.correctInformation || "",
      explanation: parsed.explanation || ""
    };
  } catch (error) {
    return fallbackAnalysis(text);
  }
}

async function transcribeAudio(buffer, filename = "audio.wav") {
  if (!client) return "";
  const tmpPath = path.join(os.tmpdir(), `${Date.now()}-${filename}`);
  await fs.promises.writeFile(tmpPath, buffer);

  const fileStream = fs.createReadStream(tmpPath);
  try {
    const transcription = await client.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
      language: "en"
    });
    return transcription.text || "";
  } finally {
    fileStream.destroy();
    fs.promises.unlink(tmpPath).catch(() => null);
  }
}

module.exports = { analyzeMisinformation, transcribeAudio };
