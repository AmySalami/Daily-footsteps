import { useEffect, useRef, useState } from 'react';

// Minimal typings for the Web Speech API (not in the DOM lib by default).
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

interface UseSpeechOptions {
  lang: string;
  /** Text present in the field when recording starts (dictation is appended to it). */
  getBase: () => string;
  /** Called with the combined (base + transcript) text as speech comes in. */
  onUpdate: (text: string) => void;
  onError?: () => void;
}

/** Web Speech API dictation as a small toggleable hook. */
export function useSpeech({ lang, getBase, onUpdate, onError }: UseSpeechOptions) {
  const [supported] = useState(() => Boolean(getCtor()));
  const [recording, setRecording] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  // Stop cleanly if the component unmounts mid-recording.
  useEffect(() => () => recRef.current?.stop(), []);

  const stop = () => recRef.current?.stop();

  const start = () => {
    const Ctor = getCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = true;
    let base = getBase();
    if (base) base += ' ';
    rec.onstart = () => setRecording(true);
    rec.onerror = () => onError?.();
    rec.onend = () => {
      setRecording(false);
      recRef.current = null;
    };
    rec.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (final) base += final + ' ';
      onUpdate((base + interim).replace(/\s+/g, ' '));
    };
    rec.start();
  };

  const toggle = () => (recording ? stop() : start());

  return { supported, recording, toggle, stop };
}
