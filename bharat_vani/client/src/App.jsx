import { useMemo, useState } from "react";

const riskColors = {
  Low: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  Medium: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  High: "bg-rose-500/20 text-rose-200 border-rose-500/40",
  "Very High": "bg-rose-600/30 text-rose-100 border-rose-500/60 shadow-[0_0_15px_rgba(225,29,72,0.2)]"
};

const defaultExplanation = "Provide content to analyze for possible misinformation.";

function speak(text, lang) {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === "Hindi" ? "hi-IN" : "en-IN";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export default function App() {
  const [language, setLanguage] = useState("English");
  const [textInput, setTextInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");

  const preview = useMemo(() => {
    if (imageFile) return imageFile.name;
    if (audioFile) return audioFile.name;
    if (videoFile) return videoFile.name;
    return textInput.slice(0, 140);
  }, [imageFile, audioFile, videoFile, textInput]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError("");
    setResult(null);
    try {
      const form = new FormData();
      form.append("language", language);
      if (textInput.trim()) form.append("text", textInput);
      if (imageFile) form.append("image", imageFile);
      if (audioFile) form.append("audio", audioFile);
      if (videoFile) form.append("video", videoFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: form
      });

      if (!response.ok) {
        const message = await response.json();
        throw new Error(message.error || "Analysis failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecent = async () => {
    const response = await fetch("/api/admin/recent");
    const data = await response.json();
    setRecent(data.items || []);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="floating-orb left-[-120px] top-24" />
      <div className="floating-orb secondary right-[-80px] top-64" />

      <header className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">BharatVaani AI</p>
            <h1 className="text-3xl font-semibold">Multilingual Misinformation Analysis</h1>
            <p className="mt-2 text-sm text-slate-400">
              Detect misinformation across text, images, and audio in English or Hindi.
            </p>
          </div>
          <button
            onClick={() => {
              setAdminOpen((prev) => !prev);
              if (!adminOpen) loadRecent();
            }}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:border-white/40 hover:bg-white/10"
          >
            {adminOpen ? "Close Admin" : "Admin Panel"}
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="glass rounded-3xl border border-white/10 p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Analyze content</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Upload text, image, audio, or video. Choose a language and run the AI check.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Live analysis ready
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <textarea
                value={textInput}
                onChange={(event) => setTextInput(event.target.value)}
                rows={5}
                placeholder="Paste text to analyze..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm focus:border-ashoka focus:outline-none transition"
              />

              <div className="grid gap-4 md:grid-cols-3">
                <label className="rounded-2xl border border-dashed border-white/15 bg-slate-900/40 p-4 text-sm transition hover:border-white/40 hover:bg-slate-900/60">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <span className="block text-slate-300">Upload image</span>
                  <span className="mt-2 block text-xs text-slate-500">
                    {imageFile ? imageFile.name : "PNG, JPG, JPEG"}
                  </span>
                </label>
                <label className="rounded-2xl border border-dashed border-white/15 bg-slate-900/40 p-4 text-sm transition hover:border-white/40 hover:bg-slate-900/60">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(event) => setAudioFile(event.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <span className="block text-slate-300">Upload audio</span>
                  <span className="mt-2 block text-xs text-slate-500">
                    {audioFile ? audioFile.name : "MP3, WAV, M4A"}
                  </span>
                </label>
                <label className="rounded-2xl border border-dashed border-white/15 bg-slate-900/40 p-4 text-sm transition hover:border-white/40 hover:bg-slate-900/60">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <span className="block text-slate-300">Upload video</span>
                  <span className="mt-2 block text-xs text-slate-500">
                    {videoFile ? videoFile.name : "MP4, MOV, AVI"}
                  </span>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {"English" === language ? (
                  <span className="rounded-full bg-saffron/20 px-3 py-1 text-xs">English</span>
                ) : (
                  <span className="rounded-full bg-indiaGreen/20 px-3 py-1 text-xs">Hindi</span>
                )}
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-2 text-sm"
                >
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="rounded-full bg-gradient-to-r from-ashoka via-saffron to-indiaGreen px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? "Analyzing..." : "Analyze"}
              </button>
              {error && <p className="text-sm text-rose-300">{error}</p>}
            </div>
          </div>

          <div className="glass rounded-3xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold">Result</h3>
            <p className="text-sm text-slate-400">
              {preview || defaultExplanation}
            </p>

            {result ? (
              <div className="mt-6 space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium ${riskColors[result.riskLevel] || riskColors.Low}`}>
                    <span>Risk Level:</span>
                    <strong className="uppercase tracking-wider">{result.riskLevel}</strong>
                  </div>
                  {result.riskPercentage !== undefined && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
                      <span>Certainty:</span>
                      <strong className="text-white">{result.riskPercentage}%</strong>
                    </div>
                  )}
                </div>

                {result.reasons && result.reasons.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Why?</h4>
                    <ul className="mt-2 space-y-2">
                      {result.reasons.map((reason, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-slate-300">
                          <span className="text-ashoka">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.correctInformation && (
                  <div className="rounded-2xl bg-indiaGreen/10 border border-indiaGreen/20 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-indiaGreen/80">Correct Information</h4>
                    <p className="mt-2 text-sm leading-relaxed text-slate-200">
                      {result.correctInformation}
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => speak(result.explanation || result.correctInformation, language)}
                    className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium transition hover:border-white/40 hover:bg-white/10"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    Listen to Analysis
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500 italic">Awaiting analysis result...</p>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass rounded-3xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold">How it works</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>• OCR extracts text from images.</li>
              <li>• Audio & Video are transcribed for deep analysis.</li>
              <li>• AI evaluates misinformation risk & provides fatcs.</li>
            </ul>
          </div>

          {adminOpen && (
            <div className="glass rounded-3xl border border-white/10 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Admin Panel</h3>
                <button
                  onClick={loadRecent}
                  className="text-xs text-slate-300 hover:text-white"
                >
                  Refresh
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {recent.length === 0 ? (
                  <p>No analyses yet.</p>
                ) : (
                  recent.map((item) => (
                    <div key={item._id} className="rounded-2xl border border-white/10 bg-slate-900/40 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase text-slate-400">{item.inputType}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] ${riskColors[item.riskLevel] || riskColors.Low}`}>
                          {item.riskLevel}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-3 text-xs text-slate-300">{item.inputPreview}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
