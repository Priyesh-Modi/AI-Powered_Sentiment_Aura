import React, { useState, useEffect } from 'react';

const KeywordsDisplay = ({ keywords, emotion, energy }) => {
  const [displayedKeywords, setDisplayedKeywords] = useState([]);
  const [animatingKeywords, setAnimatingKeywords] = useState(new Set());

  useEffect(() => {
    // Animate new keywords in
    if (keywords && keywords.length > 0) {
      setDisplayedKeywords(prevDisplayed => {
        const newKeywords = keywords.filter(k => !prevDisplayed.includes(k));
        
        newKeywords.forEach((keyword, index) => {
          setTimeout(() => {
            setAnimatingKeywords(prev => new Set([...prev, keyword]));
            setDisplayedKeywords(prev => [...prev, keyword]);
            
            setTimeout(() => {
              setAnimatingKeywords(prev => {
                const updated = new Set(prev);
                updated.delete(keyword);
                return updated;
              });
            }, 600);
          }, index * 200);
        });

        // Remove old keywords after some time
        setTimeout(() => {
          setDisplayedKeywords(keywords.slice(-8)); // Keep last 8 keywords
        }, 5000);

        return prevDisplayed;
      });
    }
  }, [keywords]);

  const getKeywordColor = (index) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'];
    return colors[index % colors.length];
  };

  const getKeywordSize = (keyword) => {
    return Math.max(0.8, Math.min(1.4, keyword.length * 0.1 + energy));
  };

  return (
    <div className="keywords-display">
      <div className="keywords-header">
        <h3>Key Concepts</h3>
        <div className="keywords-count">{displayedKeywords.length}</div>
      </div>
      
      <div className="keywords-cloud">
        {displayedKeywords.map((keyword, index) => (
          <div
            key={`${keyword}-${index}`}
            className={`keyword-tag ${animatingKeywords.has(keyword) ? 'animating' : ''}`}
            style={{
              backgroundColor: getKeywordColor(index),
              transform: `scale(${getKeywordSize(keyword)})`,
              animationDelay: `${index * 0.1}s`
            }}
          >
            {keyword}
          </div>
        ))}
      </div>
      
      {displayedKeywords.length === 0 && (
        <div className="no-keywords">
          Speak to see key concepts appear...
        </div>
      )}
    </div>
  );
};

export default KeywordsDisplay;