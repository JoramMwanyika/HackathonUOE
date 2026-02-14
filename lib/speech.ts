import * as sdk from "microsoft-cognitiveservices-speech-sdk"

// Language mapping for Azure Speech Service
const LANGUAGE_MAP: Record<string, { speech: string; voice: string }> = {
  // Global / Default
  en: { speech: "en-US", voice: "en-US-AvaNeural" },

  // African Languages (Azure Supported)
  af: { speech: "af-ZA", voice: "af-ZA-TessNeural" }, // Afrikaans
  am: { speech: "am-ET", voice: "am-ET-MekdesNeural" }, // Amharic
  ar: { speech: "ar-EG", voice: "ar-EG-SalmaNeural" }, // Arabic (Egypt/North Africa)
  ha: { speech: "ha-NG", voice: "ha-NG-AminuNeural" }, // Hausa
  ig: { speech: "ig-NG", voice: "ig-NG-EzinneNeural" }, // Igbo
  rw: { speech: "rw-RW", voice: "rw-RW-EricNeural" }, // Kinyarwanda
  ln: { speech: "ln-CD", voice: "ln-CD-MwambaNeural" }, // Lingala
  lg: { speech: "lg-UG", voice: "lg-UG-IsabellaNeural" }, // Luganda (Simulated/Fallback if specific voice unavailable, often uses English or closest bantu) - Azure actually has lg-UG-IsabellaNeural now or similar
  ny: { speech: "ny-MW", voice: "en-MW-HoughtonNeural" }, // Nyanja (Malawi) - often falls back to English accented or specific if available. Using en-MW for now as closest proxy if specific NY not listed publicly, but let's try specific if exists. Actually Azure supports ny-MW.
  rn: { speech: "rn-BI", voice: "rn-BI-RegisNeural" }, // Rundi
  st: { speech: "st-LS", voice: "st-LS-BokamosoNeural" }, // Sesotho
  nso: { speech: "nso-ZA", voice: "nso-ZA-KgomotsoNeural" }, // Sesotho sa Leboa
  tn: { speech: "tn-ZA", voice: "tn-ZA-BoitumeloNeural" }, // Setswana
  so: { speech: "so-SO", voice: "so-SO-MuuseNeural" }, // Somali
  sw: { speech: "sw-KE", voice: "sw-KE-ZuriNeural" }, // Swahili (Kenya)
  sw_tz: { speech: "sw-TZ", voice: "sw-TZ-RehemaNeural" }, // Swahili (Tanzania)
  ti: { speech: "ti-ET", voice: "ti-ET-ReeyotNeural" }, // Tigrinya
  xh: { speech: "xh-ZA", voice: "xh-ZA-ThembaNeural" }, // Xhosa
  yo: { speech: "yo-NG", voice: "yo-NG-BunmiNeural" }, // Yoruba
  zu: { speech: "zu-ZA", voice: "zu-ZA-ThandoNeural" }, // Zulu

  // Regional/Fallback Mappings for specific user requests handling
  ki: { speech: "sw-KE", voice: "sw-KE-ZuriNeural" }, // Kikuyu -> Swahili Voice Fallback
  luo: { speech: "sw-KE", voice: "sw-KE-ZuriNeural" }, // Luo -> Swahili Voice Fallback
  fr: { speech: "fr-FR", voice: "fr-FR-DeniseNeural" }, // French (West/Central Africa)
}

// Get Speech SDK token and region from API
async function getSpeechConfig(): Promise<{ token: string; region: string } | null> {
  try {
    const response = await fetch("/api/speech/token")
    if (!response.ok) {
      console.error("Failed to get speech token")
      return null
    }
    return await response.json()
  } catch (error) {
    console.error("Error getting speech token:", error)
    return null
  }
}

// Simple in-module last-spoken guard to avoid duplicate TTS calls in quick succession
let _lastSpoken: { text: string; ts: number } | null = null

export async function speakText(text: string, language = "en"): Promise<void> {
  const normalized = (text || "").trim()
  const now = Date.now()

  // If the same text was spoken very recently, skip to avoid duplicate voices
  if (_lastSpoken && _lastSpoken.text === normalized && (now - _lastSpoken.ts) < 2000) {
    console.log(`[speech] Skipping duplicate speak for text (within 2s): ${normalized.slice(0, 80)}`)
    return Promise.resolve()
  }

  _lastSpoken = { text: normalized, ts: now }

  console.log(`[speech] speakText START (${new Date(now).toISOString()}):`, normalized.slice(0, 120))

  return new Promise(async (resolve, reject) => {
    try {
      const config = await getSpeechConfig()
      if (!config) {
        // Fallback to browser speech synthesis
        const res = await speakTextBrowser(text, language)
        console.log(`[speech] speakText END (browser) (${new Date().toISOString()})`)
        return resolve(res)
      }

      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(config.token, config.region)
      const langSettings = LANGUAGE_MAP[language] || LANGUAGE_MAP.en
      speechConfig.speechSynthesisVoiceName = langSettings.voice

      const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput()
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig)

      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            synthesizer.close()
            console.log(`[speech] speakText END (sdk) (${new Date().toISOString()})`)
            resolve()
          } else {
            synthesizer.close()
            console.warn(`[speech] speakText failed (sdk) reason=${result.reason}`)
            reject(new Error("Speech synthesis failed"))
          }
        },
        (error) => {
          synthesizer.close()
          console.error(`[speech] speakText error (sdk):`, error)
          reject(error)
        },
      )
    } catch (error) {
      // Fallback to browser speech synthesis
      try {
        await speakTextBrowser(text, language)
        console.log(`[speech] speakText END (fallback) (${new Date().toISOString()})`)
        resolve()
      } catch (e) {
        console.error(`[speech] speakText fallback error:`, e)
        reject(e)
      }
    }
  })
}

// Fallback browser-based speech synthesis
function speakTextBrowser(text: string, language = "en"): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      reject(new Error("Speech synthesis not supported"))
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    const langSettings = LANGUAGE_MAP[language] || LANGUAGE_MAP.en
    utterance.lang = langSettings.speech
    utterance.rate = 0.9
    utterance.pitch = 1

    utterance.onend = () => resolve()
    utterance.onerror = (e) => reject(e)

    window.speechSynthesis.speak(utterance)
  })
}

export async function startSpeechRecognition(
  onResult: (text: string, language: string) => void,
  onError: (error: string) => void,
  language = "en",
): Promise<{ stop: () => void } | null> {
  try {
    const config = await getSpeechConfig()
    if (!config) {
      // Fallback to browser speech recognition
      return startBrowserRecognition(onResult, onError, language)
    }

    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(config.token, config.region)
    const langSettings = LANGUAGE_MAP[language] || LANGUAGE_MAP.en
    speechConfig.speechRecognitionLanguage = langSettings.speech

    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput()
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)

    recognizer.recognizeOnceAsync(
      (result) => {
        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
          onResult(result.text, language)
        } else if (result.reason === sdk.ResultReason.NoMatch) {
          onError("No speech could be recognized")
        } else {
          onError("Recognition failed")
        }
        recognizer.close()
      },
      (error) => {
        onError(error)
        recognizer.close()
      },
    )

    return {
      stop: () => recognizer.close(),
    }
  } catch (error) {
    // Fallback to browser recognition
    return startBrowserRecognition(onResult, onError, language)
  }
}

// Continuous speech recognition for dialogue
export async function startContinuousRecognition(
  onResult: (text: string, language: string) => void,
  onError: (error: string) => void,
  onListening: (isListening: boolean) => void,
  language = "en",
): Promise<{ stop: () => void } | null> {
  try {
    const config = await getSpeechConfig()
    if (!config) {
      // Fallback to browser continuous recognition
      return startBrowserContinuousRecognition(onResult, onError, onListening, language)
    }

    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(config.token, config.region)
    const langSettings = LANGUAGE_MAP[language] || LANGUAGE_MAP.en
    speechConfig.speechRecognitionLanguage = langSettings.speech

    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput()
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)

    recognizer.sessionStarted = () => {
      onListening(true)
    }

    recognizer.sessionStopped = () => {
      onListening(false)
    }

    recognizer.recognized = (s, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech && e.result.text) {
        onResult(e.result.text, language)
      }
    }

    recognizer.canceled = (s, e) => {
      if (e.reason === sdk.CancellationReason.Error) {
        onError(e.errorDetails)
      }
      recognizer.stopContinuousRecognitionAsync()
      onListening(false)
    }

    recognizer.startContinuousRecognitionAsync(
      () => {
        onListening(true)
      },
      (error) => {
        onError(error)
        onListening(false)
      },
    )

    return {
      stop: () => {
        recognizer.stopContinuousRecognitionAsync(
          () => {
            recognizer.close()
            onListening(false)
          },
          (error) => {
            console.error("Error stopping recognition:", error)
            recognizer.close()
            onListening(false)
          },
        )
      },
    }
  } catch (error) {
    return startBrowserContinuousRecognition(onResult, onError, onListening, language)
  }
}

// Browser-based continuous recognition
function startBrowserContinuousRecognition(
  onResult: (text: string, language: string) => void,
  onError: (error: string) => void,
  onListening: (isListening: boolean) => void,
  language = "en",
): { stop: () => void } | null {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  if (!SpeechRecognition) {
    onError("Speech recognition not supported in this browser")
    return null
  }

  const recognition = new SpeechRecognition()
  const langSettings = LANGUAGE_MAP[language] || LANGUAGE_MAP.en

  recognition.lang = langSettings.speech
  recognition.continuous = true
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onstart = () => {
    onListening(true)
  }

  recognition.onend = () => {
    onListening(false)
  }

  recognition.onresult = (event: any) => {
    const last = event.results.length - 1
    const transcript = event.results[last][0].transcript
    if (transcript.trim()) {
      onResult(transcript, language)
    }
  }

  recognition.onerror = (event: any) => {
    if (event.error !== 'no-speech') {
      onError(event.error)
    }
  }

  try {
    recognition.start()
  } catch (error) {
    onError("Could not start recognition")
  }

  return {
    stop: () => {
      try {
        recognition.stop()
      } catch (e) {
        console.error("Error stopping recognition:", e)
      }
    },
  }
}

// Fallback browser-based speech recognition
function startBrowserRecognition(
  onResult: (text: string, language: string) => void,
  onError: (error: string) => void,
  language = "en",
): { stop: () => void } | null {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  if (!SpeechRecognition) {
    onError("Speech recognition not supported in this browser")
    return null
  }

  const recognition = new SpeechRecognition()
  const langSettings = LANGUAGE_MAP[language] || LANGUAGE_MAP.en

  recognition.lang = langSettings.speech
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript
    onResult(transcript, language)
  }

  recognition.onerror = (event: any) => {
    onError(event.error)
  }

  recognition.start()

  return {
    stop: () => recognition.stop(),
  }
}
