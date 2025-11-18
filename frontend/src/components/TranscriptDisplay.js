import React, { useRef, useEffect } from 'react';

const TranscriptDisplay = ({ transcript, currentText, sentiment, emotion }) => {
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, currentText]);

  const getSentimentColor = (sent) => {
    if (sent > 0.3) return '#4CAF50';
    if (sent < -0.3) return '#F44336';
    return '#FFC107';
  };

  const getEmotionIcon = (emotion) => {
    const icons = {
      joy: '😊',
      sadness: '😢',
      anger: '😠',
      fear: '😨',
      surprise: '😲',
      disgust: '😒',
      neutral: '😐'
    };
    return icons[emotion] || '😐';
  };

  return (
    <div className="transcript-display">
      <div className="transcript-header">
        <h3>Live Transcript</h3>
        <div className="emotion-indicator">
          <span className="emotion-icon">{getEmotionIcon(emotion)}</span>
          <span className="emotion-label">{emotion}</span>
        </div>
      </div>
      
      <div className="transcript-content" ref={scrollRef}>
        {transcript.map((text, index) => (
          <div 
            key={index} 
            className="transcript-line"
            style={{ borderLeft: `3px solid ${getSentimentColor(sentiment)}` }}
          >
            <span className="timestamp">
              {new Date().toLocaleTimeString()}
            </span>
            <span className="text">{text}</span>
          </div>
        ))}
        
        {currentText && (
          <div className="transcript-line current">
            <span className="timestamp">
              {new Date().toLocaleTimeString()}
            </span>
            <span className="text current-text">{currentText}</span>
            <span className="recording-indicator">●</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptDisplay;