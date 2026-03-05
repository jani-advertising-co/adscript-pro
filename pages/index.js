Anteeksi! Tässä se on, kopioi tämä kokonaan:

import { useState, useRef } from "react";
const VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel — Nainen, ammattimainen" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi — Nainen, nuori" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella — Nainen, pehmeä" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni — Mies, lämmin" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold — Mies, vahva" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam — Mies, syvä" },
];
export default function App() {
  const [brand, setBrand] = useState("");
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [slogan, setSlogan] = useState("");
  const [duration, setDuration] = useState("30");
  const [tone, setTone] = useState("emotionaalinen ja lämmin");
  const [style, setStyle] = useState("tarina (narrative)");
  const [elevenKey, setElevenKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [voice, setVoice] = useState(VOICES[0].id);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [script, setScript] = useState("");
  const [vo, setVo] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState("");
  const [audioError, setAudioError] = useState("");
  const outRef = useRef(null);
  async function generate() {
    if (!anthropicKey) { setError("Syötä Anthropic API-avain!"); return; }
    if (!brand || !product) { setError("Täytä brändi ja tuote!"); return; }
    setError(""); setLoading(true); setScript(""); setVo(""); setAudioUrl(null); setStep(1);
    const scenes = duration === "15" ? "3-4" : duration === "30" ? "4-6" : "7-9";
    const prompt = `Olet Suomen paras TV-mainosten käsikirjoittaja. Kirjoita ammattimainen TV-mainos:\nBRÄNDI: ${brand}\nTUOTE: ${product}\n${audience ? "KOHDERYHMÄ: " + audience : ""}\n${slogan ? "SLOGAN: " + slogan : ""}\nKESTO: ${duration} sekuntia | TUNNELMA: ${tone} | TYYLI: ${style}\n\nKirjoita TÄSMÄLLEEN tässä formaatissa:\n\nKONSEPTI:\n[2-3 lausetta]\n\nTAGLINE:\n[Iskulause]\n\nVOICE OVER:\n[Koko puheteksti luonnollisena, sopii ${duration}s mainokseen]\n\n---\nKOHTAUS 1 | 0-Xs\nKUVA: [kuvaus]\nÄÄNI: [musiikki]\nVO: [teksti]\n\n[${scenes} kohtausta yhteensä]\n\nLOPPUKOHTAUS | viimeiset 4s\nKUVA: [logo+tuote]\nSUPER: [teksti ruutuun]\n\n---\nOHJAAJAN MUISTIINPANOT:\n[4-5 huomiota]\n\nKirjoita suomeksi, tee ikimuistoinen mainos.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": anthropicKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || "Virhe " + res.status); }
      const data = await res.json();
      const text = data.content.map(b => b.text || "").join("");
      setScript(text);
      const m = text.match(/VOICE OVER:\s*([\s\S]*?)(?=---|KOHTAUS)/i);
      setVo(m ? m[1].trim() : "");
      setStep(2);
      setTimeout(() => outRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    } catch (e) { setError("Virhe: " + e.message); setStep(0); }
    finally { setLoading(false); }
  }
  async function genAudio() {
    if (!elevenKey) { setAudioError("Syötä ElevenLabs API-avain!"); return; }
    if (!vo) { setAudioError("Voice over puuttuu!"); return; }
    setAudioError(""); setAudioLoading(true); setStep(3);
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "xi-api-key": elevenKey },
        body: JSON.stringify({ text: vo, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail?.message || "ElevenLabs virhe"); }
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
      setStep(4);
    } catch (e) { setAudioError("Virhe: " + e.message); setStep(2); }
    finally { setAudioLoading(false); }
  }
  const inp = { width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: 3, padding: "10px 14px", color: "#f0ebe0", fontFamily: "Georgia,serif", fontSize: 15, outline: "none" };
  const lbl = { fontFamily: "monospace", fontSize: 10, color: "#e8a020", letterSpacing: 2, marginBottom: 6, display: "block" };
  const steps = ["Brief", "Generoidaan", "Script valmis", "Äänitetään", "Valmis!"];
  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", color: "#f0ebe0", fontFamily: "Georgia,serif" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input::placeholder{color:#444}`}</style>
      <div style={{ background: "#111", borderBottom: "1px solid #222", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: "bold", letterSpacing: 4 }}>AD<span style={{ color: "#e8a020" }}>SCRIPT</span> PRO</div>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#555", letterSpacing: 2 }}>TV-MAINOSGENERAATTORI</div>
      </div>
      <div style={{ display: "flex", borderBottom: "1px solid #1a1a1a" }}>
        {steps.map((st, i) => (
          <div key={i} style={{ flex: 1, padding: "9px 4px", textAlign: "center", fontFamily: "monospace", fontSize: 10, background: step === i ? "#1a1a1a" : "#0d0d0d", color: step === i ? "#e8a020" : step > i ? "#4caf50" : "#444", borderRight: i < 4 ? "1px solid #1a1a1a" : "none" }}>
            <div style={{ fontSize: 12, marginBottom: 1 }}>{step > i ? "✓" : `0${i+1}`}</div>{st}
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 4, padding: "14px 20px", marginBottom: 18 }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: "#e8a020", letterSpacing: 2, marginBottom: 12 }}>API-AVAIMET</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>ANTHROPIC</label><input type="password" value={anthropicKey} onChange={e => setAnthropicKey(e.target.value)} placeholder="sk-ant-..." style={{ ...inp, fontSize: 12, fontFamily: "monospace" }} /></div>
            <div><label style={lbl}>ELEVENLABS</label><input type="password" value={elevenKey} onChange={e => setElevenKey(e.target.value)} placeholder="voice over..." style={{ ...inp, fontSize: 12, fontFamily: "monospace" }} /></div>
          </div>
        </div>
        <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 4, padding: "28px", marginBottom: 20, position: "relative" }}>
          <div style={{ position: "absolute", top: -11, left: 18, background: "#e8a020", color: "#0d0d0d", fontFamily: "monospace", fontSize: 11, fontWeight: "bold", letterSpacing: 2, padding: "2px 12px", borderRadius: 2 }}>BRIEF</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            {[["BRÄNDI *",brand,setBrand,"esim. Fazer"],["TUOTE *",product,setProduct,"esim. Sininen suklaa"],["KOHDERYHMÄ",audience,setAudience,"esim. perheelliset"],["SLOGAN",slogan,setSlogan,"esim. Laatu joka kestää"]].map(([l,v,fn,ph]) => (
              <div key={l}><label style={lbl}>{l}</label><input value={v} onChange={e => fn(e.target.value)} placeholder={ph} style={inp} /></div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 22 }}>
            <div><label style={lbl}>KESTO</label><select value={duration} onChange={e => setDuration(e.target.value)} style={{ ...inp, cursor: "pointer" }}><option value="15">15s</option><option value="30">30s</option><option value="60">60s</option></select></div>
            <div><label style={lbl}>TUNNELMA</label><select value={tone} onChange={e => setTone(e.target.value)} style={{ ...inp, cursor: "pointer" }}><option value="emotionaalinen ja lämmin">Emotionaalinen</option><option value="hauska ja kevyt">Hauska</option><option value="dramaattinen ja eeppinen">Dramaattinen</option><option value="inspiroiva ja energinen">Inspiroiva</option><option value="humoristinen">Humoristinen</option></select></div>
            <div><label style={lbl}>TYYLI</label><select value={style} onChange={e => setStyle(e.target.value)} style={{ ...inp, cursor: "pointer" }}><option value="tarina (narrative)">Tarina</option><option value="tuote-esittely">Tuote-esittely</option><option value="lifestyle">Lifestyle</option><option value="testimoniaalit">Testimoniaalit</option></select></div>
          </div>
          <button onClick={generate} disabled={loading} style={{ width: "100%", padding: "17px", border: "none", borderRadius: 3, background: loading ? "#1a1a1a" : "#e8a020", color: loading ? "#555" : "#0d0d0d", fontFamily: "monospace", fontSize: 14, fontWeight: "bold", letterSpacing: 4, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "GENEROIDAAN..." : "GENEROI TV-MAINOS"}
          </button>
          {error && <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(200,50,50,.1)", border: "1px solid #c03", borderRadius: 3, color: "#e87", fontFamily: "monospace", fontSize: 12 }}>{error}</div>}
        </div>
        {script && (
          <div ref={outRef}>
            <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 4, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ background: "#1a1a1a", padding: "11px 18px", borderBottom: "1px solid #2a2a2a", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: "bold" }}>KÄSIKIRJOITUS</span>
                <span style={{ fontFamily: "monospace", fontSize: 10, color: "#4caf50" }}>VALMIS</span>
              </div>
              <div style={{ padding: "20px", fontFamily: "monospace", fontSize: 12, lineHeight: 1.9, whiteSpace: "pre-wrap", color: "#c8c0b0", maxHeight: 460, overflowY: "auto" }}>{script}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ background: "#1a1a1a", padding: "11px 18px", borderBottom: "1px solid #2a2a2a" }}><span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: "bold" }}>VOICE OVER</span></div>
                <div style={{ padding: "18px", fontStyle: "italic", fontSize: 15, lineHeight: 1.7, color: "#d0c8b8" }}>{vo || "Kopioi käsikirjoituksesta."}</div>
              </div>
              <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ background: "#1a1a1a", padding: "11px 18px", borderBottom: "1px solid #2a2a2a" }}><span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: "bold" }}>ÄÄNITÄ</span></div>
                <div style={{ padding: "18px" }}>
                  <label style={lbl}>VALITSE ÄÄNI</label>
                  <select value={voice} onChange={e => setVoice(e.target.value)} style={{ ...inp, marginBottom: 12, cursor: "pointer" }}>
                    {VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                  <button onClick={genAudio} disabled={audioLoading} style={{ width: "100%", padding: "13px", border: "none", borderRadius: 3, background: audioLoading ? "#1a1a1a" : "#2d6a4f", color: audioLoading ? "#555" : "white", fontFamily: "monospace", fontSize: 13, fontWeight: "bold", cursor: audioLoading ? "not-allowed" : "pointer" }}>
                    {audioLoading ? "ÄÄNITETÄÄN..." : "GENEROI ÄÄNI"}
                  </button>
                  {audioError && <div style={{ marginTop: 10, padding: "10px", background: "rgba(200,50,50,.1)", border: "1px solid #c03", borderRadius: 3, color: "#e87", fontFamily: "monospace", fontSize: 12 }}>{audioError}</div>}
                  {audioUrl && <div style={{ marginTop: 12 }}><audio controls src={audioUrl} style={{ width: "100%" }} autoPlay /></div>}
                </div>
              </div>
            </div>
