// ==========================================================================
// NexusRad AI - Web Speech API Text-to-Speech (TTS) Voice Manager
// Supports Voice Selection for Reception TV Patient Call
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
    // Default to first Portuguese voice if available
    const ptVoice = voices.find(v => v.lang.startsWith('pt'));
    if (ptVoice) utterance.voice = ptVoice;
  }

  window.speechSynthesis.speak(utterance);
}
