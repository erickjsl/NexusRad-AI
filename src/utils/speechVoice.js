// ==========================================================================
// NexusRad AI - Web Speech API & Web Audio Hospital Chime Manager
// Professional Audio Bell + Voice Synthesis for Patient Call Panel (TV)
// ==========================================================================

export function getAvailableVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices() || [];
  
  // Sort Portuguese voices first, then others
  return voices.sort((a, b) => {
    const aPt = a.lang.startsWith('pt');
    const bPt = b.lang.startsWith('pt');
    if (aPt && !bPt) return -1;
    if (!aPt && bPt) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Plays a realistic hospital call bell chime (Ding-Dong / Dong-Dong)
 * using Web Audio API AudioContext Synthesizer (0 external dependencies required).
 */
export function playHospitalChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;

    // Tone 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Tone 2: C5 (523.25 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(523.25, now + 0.25);
    gain2.gain.setValueAtTime(0.35, now + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.25);
    osc2.stop(now + 0.75);
  } catch (err) {
    console.warn("AudioContext error on chime:", err);
  }
}

export function speakText(text, selectedVoiceUri = null, rate = 0.95, pitch = 1.0) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn("Speech Synthesis API is not supported by this browser.");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.lang = 'pt-BR';

  const voices = getAvailableVoices();
  if (selectedVoiceUri) {
    const foundVoice = voices.find(v => v.voiceURI === selectedVoiceUri || v.name === selectedVoiceUri);
    if (foundVoice) utterance.voice = foundVoice;
  } else {
    const ptVoice = voices.find(v => v.lang.startsWith('pt'));
    if (ptVoice) utterance.voice = ptVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Combines Hospital Chime + Speech Call for Reception & Doctor Panels
 */
export function speakPatientCallWithChime(text, selectedVoiceUri = null, rate = 0.95, pitch = 1.0) {
  // 1. Play Chime
  playHospitalChime();

  // 2. Speak Call Phrase after short delay
  setTimeout(() => {
    speakText(text, selectedVoiceUri, rate, pitch);
  }, 500);
}
