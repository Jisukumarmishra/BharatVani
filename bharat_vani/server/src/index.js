const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const multer = require("multer");
const Analysis = require("./models/Analysis");
const { extractTextFromImage } = require("./ocr");
const { analyzeMisinformation, transcribeAudio } = require("./ai");
const { extractAudioFromVideo } = require("./video");

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: "10mb" }));

let mongoReady = false;

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    mongoReady = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.warn("MongoDB connection failed. Using in-memory storage.");
  }
}

const inMemoryStore = [];

function storeAnalysis(doc) {
  if (mongoReady) {
    return Analysis.create(doc);
  }
  inMemoryStore.unshift({ ...doc, _id: `${Date.now()}` });
  inMemoryStore.splice(20);
  return Promise.resolve(doc);
}

function getRecentAnalyses() {
  if (mongoReady) {
    return Analysis.find().sort({ createdAt: -1 }).limit(20).lean();
  }
  return Promise.resolve(inMemoryStore.slice(0, 20));
}

app.post(
  "/api/analyze",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const language = req.body.language || "English";
      const text = req.body.text?.trim() || "";
      const imageFile = req.files?.image?.[0];
      const audioFile = req.files?.audio?.[0];
      const videoFile = req.files?.video?.[0];

      let inputType = "text";
      let extractedText = text;

      if (!text && imageFile) {
        inputType = "image";
        extractedText = await extractTextFromImage(imageFile.buffer);
      } else if (!text && audioFile) {
        inputType = "audio";
        extractedText = await transcribeAudio(audioFile.buffer, audioFile.originalname);
      } else if (!text && videoFile) {
        inputType = "video";
        const audioBuffer = await extractAudioFromVideo(videoFile.buffer);
        extractedText = await transcribeAudio(audioBuffer, "video_audio.mp3");
      } else if (!text && !imageFile && !audioFile && !videoFile) {
        return res.status(400).json({ error: "Provide text, image, audio, or video." });
      }

      if (!extractedText) {
        return res.status(400).json({ error: "Unable to extract text from input." });
      }

      const analysis = await analyzeMisinformation(extractedText, language);
      const doc = {
        inputType,
        language,
        inputPreview: extractedText.slice(0, 240),
        extractedText,
        riskLevel: analysis.riskLevel,
        riskPercentage: analysis.riskPercentage,
        reasons: analysis.reasons,
        correctInformation: analysis.correctInformation,
        explanation: analysis.explanation
      };

      await storeAnalysis(doc);

      res.json({
        ...analysis,
        extractedText
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

app.get("/api/admin/recent", async (req, res) => {
  const items = await getRecentAnalyses();
  res.json({ items });
});

const PORT = process.env.PORT || 5000;

connectMongo().finally(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
