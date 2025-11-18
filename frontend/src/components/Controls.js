import React from 'react';

const Controls = ({ isRecording, isProcessing, onStart, onStop, onClear }) => {
  return (
    <div className="controls">
      <div className="main-controls">
        {!isRecording ? (
          <button 
            className="record-button start" 
            onClick={onStart}
            disabled={isProcessing}
          >
            <div className="button-icon">🎤</div>
            <div className="button-text">Start Recording</div>
          </button>
        ) : (
          <button 
            className="record-button stop" 
            onClick={onStop}
          >
            <div className="button-icon recording">⏹</div>
            <div className="button-text">Stop Recording</div>
          </button>
        )}
        
        <button 
          className="clear-button" 
          onClick={onClear}
          disabled={isRecording}
        >
          <div className="button-icon">🗑</div>
          <div className="button-text">Clear</div>
        </button>
      </div>
      
      <div className="status-indicators">
        {isRecording && (
          <div className="status-item recording">
            <div className="status-dot pulsing"></div>
            <span>Recording</span>
          </div>
        )}
        
        {isProcessing && (
          <div className="status-item processing">
            <div className="status-dot spinning"></div>
            <span>Processing</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Controls;