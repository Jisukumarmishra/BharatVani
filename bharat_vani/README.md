# BharatVaani AI

AI-powered multilingual misinformation analysis platform for India.

## Tech Stack
- Frontend: React + Tailwind CSS (Vite)
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- AI: OpenAI API
- OCR: Tesseract.js
- Speech: Web Speech API (TTS)

## Project Structure
```
client/   # React + Tailwind UI
server/   # Express API + MongoDB + OpenAI
```

## Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key

## Setup
1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   Copy and edit:
   ```bash
   cp server/.env.example server/.env
   ```

3. **Start the app**
   ```bash
   npm start
   ```

The frontend runs on http://localhost:5173 and the backend on http://localhost:5000.

## Demo Usage
- Enter text or upload an image/audio file.
- Choose language (English/Hindi) and click **Analyze**.
- View risk level and explanation, and play the explanation with TTS.
- Open **Admin Panel** to view the last 20 analyses.

## Notes
- Audio transcription uses OpenAI Whisper (requires API key). If the key is missing, the server returns a fallback message.
- OCR supports English + Hindi via Tesseract.js.
