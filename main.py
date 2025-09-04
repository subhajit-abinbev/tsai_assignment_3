from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Creative Story Generator", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

class StoryRequest(BaseModel):
    topic: str
    style: str
    content_type: str  # "story" or "poem"

class StoryResponse(BaseModel):
    content: str
    topic: str
    style: str
    content_type: str

@app.get("/")
async def read_root():
    """Serve the main HTML page"""
    return FileResponse("static/index.html")

@app.post("/generate", response_model=StoryResponse)
async def generate_content(request: StoryRequest):
    """Generate a story or poem using Gemini API"""
    try:
        # Construct the prompt based on content type and style
        if request.content_type == "poem":
            prompt = f"""Write a {request.style} poem about {request.topic}. 
            Make it engaging, creative, and approximately 12-16 lines long. 
            Use vivid imagery and appropriate tone for the {request.style} style."""
        else:
            prompt = f"""Write a {request.style} short story about {request.topic}. 
            Make it engaging, creative, and approximately 150-200 words long. 
            Include interesting characters and a clear beginning, middle, and end. 
            Use appropriate tone for the {request.style} style."""
        
        # Generate content using Gemini
        response = model.generate_content(prompt)
        
        if not response.text:
            raise HTTPException(status_code=500, detail="Failed to generate content")
        
        return StoryResponse(
            content=response.text,
            topic=request.topic,
            style=request.style,
            content_type=request.content_type
        )
    
    except Exception as e:
        print(f"Error generating content: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating content: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Creative Story Generator is running!"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
