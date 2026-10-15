const mongoose = require("mongoose");

const AnalysisSchema = new mongoose.Schema(
  {
    inputType: { type: String, required: true },
    language: { type: String, required: true },
    inputPreview: { type: String },
    extractedText: { type: String },
    riskLevel: { type: String, required: true },
    riskPercentage: { type: Number },
    reasons: [{ type: String }],
    correctInformation: { type: String },
    explanation: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analysis", AnalysisSchema);
