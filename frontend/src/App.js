import React, { useState, useRef, useCallback } from 'react';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import axios from 'axios';
import AuraVisualization from './components/AuraVisualization';
import TranscriptDisplay from './components/TranscriptDisplay';
import KeywordsDisplay from './components/KeywordsDisplay';
import Controls from './components/Controls';
import './styles/App.css';
 
const DEEPGRAM_API_KEY = process.env.REACT_APP_DEEPGRAM_API_KEY;
console.log('Deepgram API Key:', DEEPGRAM_API_KEY); // Debug line
const BACKEND_URL = 'http://localhost:8000';
 
function App() {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [sentiment, setSentiment] = useState(0);
  const [keywords, setKeywords] = useState([]);
  const [emotion, setEmotion] = useState('neutral');
  const [energy, setEnergy] = useState(0.5);
  const [colorPalette, setColorPalette] = useState(['#4A90E2', '#50C878', '#FFB347']);
  const [isProcessing, setIsProcessing] = useState(false);
 
  // Refs for media handling
  const mediaRecorderRef = useRef(null);
  const deepgramRef = useRef(null);
  const streamRef = useRef(null);
  const speechRecognitionRef = useRef(null); // Add ref for speech recognition
 
  // Process text with backend AI
  const processText = useCallback(async (text) => {
    if (!text.trim() || isProcessing) return;
    
    console.log('Processing text with backend:', text); // Debug line
    setIsProcessing(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/process_text`, {
        text: text,
        provider: 'openai' // or 'anthropic'
      });
 
      const data = response.data;
      console.log('Backend response:', data); // Debug line
      setSentiment(data.sentiment);
      setKeywords(data.keywords);
      setEmotion(data.emotion);
      setEnergy(data.energy);
      setColorPalette(data.color_palette);
    } catch (error) {
      console.error('Error processing text:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);
 
  // Start recording and transcription
  const startRecording = useCallback(async () => {
    console.log('Starting recording...'); // Debug line
    
    // Try browser's built-in Speech Recognition as fallback
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      console.log('🎤 Using browser Speech Recognition API');
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('🎬 Speech recognition started');
        setIsRecording(true);
      };
      
      recognition.onresult = (event) => {
        console.log('🎯 Speech recognition result:', event);
        
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            console.log('✅ Final transcript:', transcript);
            setTranscript(prev => [...prev, transcript]);
            processText(transcript);
          } else {
            interimTranscript += transcript;
            console.log('📝 Interim transcript:', transcript);
            setCurrentText(interimTranscript);
          }
        }
      };
      
      recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
      };
      
      recognition.onend = () => {
        console.log('🔌 Speech recognition ended');
        setIsRecording(false);
        setCurrentText('');
      };
      
      recognition.start();
      speechRecognitionRef.current = recognition; // Store reference
      return;
    }
    
    // Fallback to Deepgram if browser doesn't support Speech Recognition
    try {
      // Get microphone access with different settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,      // Try higher sample rate
          channelCount: 1,
          echoCancellation: false, // Turn off processing that might interfere
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      console.log('Got microphone access:', stream); // Debug line
      console.log('Audio tracks:', stream.getAudioTracks()); // Check audio tracks
      stream.getAudioTracks().forEach(track => {
        console.log('Track settings:', track.getSettings());
        console.log('Track constraints:', track.getConstraints());
      });
      streamRef.current = stream;
 
      // Initialize Deepgram client
      const deepgram = createClient(DEEPGRAM_API_KEY);
      
      // Try different Deepgram settings
      const dgConnection = deepgram.listen.live({
        model: 'nova-2-general',
        language: 'en-US',
        interim_results: true,     
        smart_format: true,
        punctuate: true,
        endpointing: 300,         // Longer endpointing - let you finish speaking
        vad_events: true,         
        sample_rate: 48000,       
        encoding: 'linear16',
        multichannel: false,      // Ensure single channel
        alternatives: 1,          // Just one alternative
        profanity_filter: false,  // No filtering
        redact: false,           // No redaction
        diarize: false,          // No speaker separation
        filler_words: false,     // No filler word removal
        utterance_end_ms: 1000   // Wait 1 second before finalizing
      });
      console.log('Created Deepgram connection with new settings'); // Debug line
 
      deepgramRef.current = dgConnection;
 
      // Set up Deepgram event listeners with more comprehensive logging
      dgConnection.on(LiveTranscriptionEvents.Open, () => {
        console.log('✅ Deepgram connection opened successfully');
        console.log('Connection ready state:', dgConnection.getReadyState());
      });
 
      dgConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
        console.log('🎯 RAW transcript event received:', JSON.stringify(data, null, 2));
        
        // More robust data parsing
        try {
          if (data && data.channel && data.channel.alternatives) {
            const alternatives = data.channel.alternatives;
            console.log('Number of alternatives:', alternatives.length);
            
            if (alternatives.length > 0 && alternatives[0].transcript) {
              const transcript = alternatives[0].transcript;
              const confidence = alternatives[0].confidence || 0;
              
              console.log('📝 Transcript text:', transcript);
              console.log('🎯 Confidence:', confidence);
              console.log('✅ Is final:', data.is_final);
              console.log('⏱️ Duration:', data.duration);
              
              if (transcript && transcript.trim() !== '') {
                console.log('✅ Valid transcript found, updating UI');
                setCurrentText(transcript);
                
                // If this is a final transcript, add to history and process
                if (data.is_final) {
                  console.log('🎉 Final transcript, processing:', transcript);
                  setTranscript(prev => [...prev, transcript]);
                  processText(transcript);
                  setCurrentText('');
                }
              } else {
                console.log('⚠️ Transcript is empty or whitespace');
              }
            } else {
              console.log('⚠️ No alternatives or transcript in response');
            }
          } else {
            console.log('❌ Invalid data structure:', data);
          }
        } catch (parseError) {
          console.error('❌ Error parsing transcript data:', parseError);
        }
      });
 
      dgConnection.on(LiveTranscriptionEvents.Error, (error) => {
        console.error('❌ Deepgram error event:', error);
      });
 
      dgConnection.on(LiveTranscriptionEvents.Warning, (warning) => {
        console.warn('⚠️ Deepgram warning:', warning);
      });
 
      dgConnection.on(LiveTranscriptionEvents.Metadata, (metadata) => {
        console.log('ℹ️ Deepgram metadata:', metadata);
      });
 
      dgConnection.on(LiveTranscriptionEvents.SpeechStarted, () => {
        console.log('🗣️ Speech started detected');
      });
 
      dgConnection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
        console.log('🔚 Utterance ended');
      });
 
      dgConnection.on(LiveTranscriptionEvents.Close, () => {
        console.log('🔌 Deepgram connection closed');
      });
 
      // Set up MediaRecorder with different settings
      let mediaRecorder;
      try {
        // Try different MIME types in order of preference
        const mimeTypes = [
          'audio/webm;codecs=opus',
          'audio/webm;codecs=pcm',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/wav'
        ];
        
        let selectedMimeType = null;
        for (const mimeType of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            selectedMimeType = mimeType;
            console.log('✅ Using MIME type:', mimeType);
            break;
          }
        }
        
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: selectedMimeType,
          audioBitsPerSecond: 128000
        });
      } catch (error) {
        console.log('⚠️ Falling back to default MediaRecorder settings');
        mediaRecorder = new MediaRecorder(stream);
      }
      
      console.log('🎙️ Created MediaRecorder:', mediaRecorder);
      console.log('📊 MediaRecorder MIME type:', mediaRecorder.mimeType);
      
      mediaRecorderRef.current = mediaRecorder;
 
      mediaRecorder.ondataavailable = (event) => {
        const size = event.data.size;
        const readyState = dgConnection.getReadyState();
        console.log(`📊 Audio data: ${size} bytes, connection state: ${readyState}`);
        
        if (size > 0 && readyState === 1) {
          console.log('📤 Sending audio data to Deepgram');
          dgConnection.send(event.data);
        } else if (size === 0) {
          console.log('⚠️ Received empty audio data');
        } else if (readyState !== 1) {
          console.log('⚠️ Deepgram not ready, buffering data');
        }
      };
 
      mediaRecorder.onerror = (error) => {
        console.error('❌ MediaRecorder error:', error);
      };
 
      mediaRecorder.onstart = () => {
        console.log('🎬 MediaRecorder started');
      };
 
      mediaRecorder.onstop = () => {
        console.log('🛑 MediaRecorder stopped');
      };
 
      // Start recording with shorter intervals for more responsive streaming
      mediaRecorder.start(50); // Send data every 50ms instead of 100ms
      console.log('🎙️ MediaRecorder started with 50ms intervals');
      setIsRecording(true);
      
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  }, [processText]);
 
  // Stop recording and cleanup
  const stopRecording = useCallback(() => {
    console.log('🛑 Stopping recording...');
    
    // Stop browser Speech Recognition if it's running
    if (speechRecognitionRef.current) {
      console.log('🔇 Stopping Speech Recognition');
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    
    // Stop Deepgram recording if it's running
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (deepgramRef.current) {
      deepgramRef.current.finish();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🔇 Stopped audio track');
      });
    }
 
    setIsRecording(false);
    setCurrentText('');
  }, []);
 
  // Clear all data
  const clearData = useCallback(() => {
    console.log('🧹 Clearing all data');
    setTranscript([]);
    setCurrentText('');
    setSentiment(0);
    setKeywords([]);
    setEmotion('neutral');
    setEnergy(0.5);
    setColorPalette(['#4A90E2', '#50C878', '#FFB347']);
  }, []);
 
  return (
    <div className="app">
      {/* Background Aura Visualization */}
      <AuraVisualization
        sentiment={sentiment}
        energy={energy}
        emotion={emotion}
        colorPalette={colorPalette}
        keywords={keywords}
      />
      
      {/* UI Overlay */}
      <div className="ui-overlay">
        {/* Controls */}
        <Controls
          isRecording={isRecording}
          isProcessing={isProcessing}
          onStart={startRecording}
          onStop={stopRecording}
          onClear={clearData}
        />
        
        {/* Transcript Display */}
        <TranscriptDisplay
          transcript={transcript}
          currentText={currentText}
          sentiment={sentiment}
          emotion={emotion}
        />
        
        {/* Keywords Display */}
        <KeywordsDisplay
          keywords={keywords}
          emotion={emotion}
          energy={energy}
        />
        
        {/* Status Info */}
        <div className="status-info">
          <div className="sentiment-meter">
            <div className="meter-label">Sentiment</div>
            <div className="meter-bar">
              <div
                className="meter-fill"
                style={{
                  width: `${((sentiment + 1) / 2) * 100}%`,
                  backgroundColor: sentiment > 0 ? '#4CAF50' : sentiment < 0 ? '#F44336' : '#FFC107'
                }}
              />
            </div>
            <div className="meter-value">{(sentiment * 100).toFixed(0)}%</div>
          </div>
          
          <div className="energy-meter">
            <div className="meter-label">Energy</div>
            <div className="meter-bar">
              <div
                className="meter-fill"
                style={{
                  width: `${energy * 100}%`,
                  backgroundColor: `hsl(${energy * 120}, 70%, 50%)`
                }}
              />
            </div>
            <div className="meter-value">{(energy * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default App;