const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const fs = require("fs");
const path = require("path");
const os = require("os");

ffmpeg.setFfmpegPath(ffmpegPath);

async function extractAudioFromVideo(videoBuffer) {
  const tempId = Date.now();
  const inputPath = path.join(os.tmpdir(), `input-${tempId}.mp4`);
  const outputPath = path.join(os.tmpdir(), `output-${tempId}.mp3`);

  await fs.promises.writeFile(inputPath, videoBuffer);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat("mp3")
      .on("end", async () => {
        try {
          const audioBuffer = await fs.promises.readFile(outputPath);
          // Cleanup
          await fs.promises.unlink(inputPath);
          await fs.promises.unlink(outputPath);
          resolve(audioBuffer);
        } catch (err) {
          reject(err);
        }
      })
      .on("error", async (err) => {
        // Cleanup if possible
        try {
          await fs.promises.unlink(inputPath).catch(() => {});
          await fs.promises.unlink(outputPath).catch(() => {});
        } catch (e) {}
        reject(err);
      })
      .save(outputPath);
  });
}

module.exports = { extractAudioFromVideo };
