from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
from dotenv import load_dotenv
from typing import List, Optional
 
load_dotenv()
 
app = FastAPI(title="Sentiment Aura Backend")
 
# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
class TextInput(BaseModel):
    text: str
    provider: str = "openai"  # "openai" or "anthropic"
 
class SentimentResponse(BaseModel):
    sentiment: float  # -1.0 to 1.0
    confidence: float  # 0.0 to 1.0
    keywords: List[str]
    emotion: str
    energy: float  # 0.0 to 1.0
    color_palette: List[str]
 
@app.post("/process_text", response_model=SentimentResponse)
async def process_text(input_data: TextInput):
    print(f"Received text: {input_data.text}")  # Debug line
    try:
        response = process_with_simple_analysis(input_data.text)
        print(f"Returning response: {response}")  # Debug line
        return response
    except Exception as e:
        print(f"Error: {e}")  # Debug line
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
 
def process_with_simple_analysis(text: str) -> SentimentResponse:
    """Simple sentiment analysis without external APIs"""
    print(f"Processing: {text}")
    
    # Clean and extract words
    words = [word.lower().strip('.,!?;:"()[]{}') for word in text.split() if len(word) > 2]
    
    # Extract keywords (filter out common words)
    common_words = {'the', 'and', 'but', 'for', 'are', 'with', 'was', 'were', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'this', 'that', 'they', 'them', 'their', 'there', 'where', 'when', 'what', 'who', 'how', 'why', 'not', 'can', 'did', 'like'}
    keywords = [word for word in words if word not in common_words][:5]
    
    # Simple sentiment analysis
    positive_words = {'good', 'great', 'amazing', 'wonderful', 'happy', 'love', 'beautiful', 'fantastic', 'awesome', 'excellent', 'perfect', 'brilliant', 'stunning', 'incredible', 'marvelous', 'superb', 'outstanding', 'magnificent', 'delightful', 'exciting', 'thrilled', 'ecstatic', 'overjoyed', 'pleased', 'satisfied', 'content', 'cheerful', 'optimistic', 'positive', 'upbeat'}
    
    negative_words = {'bad', 'terrible', 'awful', 'sad', 'hate', 'horrible', 'angry', 'frustrated', 'annoyed', 'upset', 'depressed', 'miserable', 'disappointed', 'worried', 'anxious', 'stressed', 'furious', 'disgusted', 'appalled', 'devastated', 'heartbroken', 'gloomy', 'pessimistic', 'negative', 'bitter'}
    
    positive_score = sum(1 for word in words if word in positive_words)
    negative_score = sum(1 for word in words if word in negative_words)
    
    # Calculate sentiment (-1 to 1)
    total_sentiment_words = positive_score + negative_score
    if total_sentiment_words > 0:
        sentiment = (positive_score - negative_score) / total_sentiment_words
    else:
        sentiment = 0.0
    
    # Determine emotion and colors
    if sentiment > 0.4:
        emotion = "joy"
        colors = ["#FFD700", "#FF69B4", "#00FF7F", "#FFA500", "#FF1493"]
    elif sentiment > 0.1:
        emotion = "surprise"
        colors = ["#87CEEB", "#98FB98", "#F0E68C", "#DDA0DD", "#FFB6C1"]
    elif sentiment < -0.4:
        emotion = "sadness"
        colors = ["#4169E1", "#483D8B", "#2F4F4F", "#191970", "#000080"]
    elif sentiment < -0.1:
        emotion = "anger"
        colors = ["#DC143C", "#B22222", "#8B0000", "#FF4500", "#FF6347"]
    else:
        emotion = "neutral"
        colors = ["#4A90E2", "#50C878", "#FFB347", "#9370DB", "#20B2AA"]
    
    # Calculate energy based on text length and exclamation marks
    energy = min(1.0, len(words) / 20.0)  # More words = more energy
    exclamations = text.count('!') + text.count('?') * 0.5
    energy = min(1.0, energy + exclamations * 0.2)
    
    # Add some randomness for more dynamic visualization
    import random
    energy = max(0.1, min(1.0, energy + random.uniform(-0.1, 0.1)))
    
    result = SentimentResponse(
        sentiment=round(sentiment, 2),
        confidence=0.8,
        keywords=keywords,
        emotion=emotion,
        energy=round(energy, 2),
        color_palette=colors
    )
    
    print(f"Analysis result: sentiment={sentiment}, emotion={emotion}, keywords={keywords}, energy={energy}")
    return result
 
@app.get("/")
async def root():
    return {"message": "Sentiment Aura Backend is running!"}
 
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)