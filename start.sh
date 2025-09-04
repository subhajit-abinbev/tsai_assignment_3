#!/bin/bash

# Creative Story Generator - Quick Start Script
echo "🎭 Starting Creative Story & Poem Generator..."

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo "✅ Please edit .env file and add your GEMINI_API_KEY"
    echo "   You can get your API key from: https://makersuite.google.com/app/apikey"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "🐍 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Check if API key is set
if grep -q "your_gemini_api_key_here" .env; then
    echo "⚠️  Please update your GEMINI_API_KEY in .env file"
    echo "   Current .env contains placeholder value"
    exit 1
fi

# Start the application
echo "🚀 Starting the application..."
echo "📖 Open your browser and visit: http://localhost:8000"
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

python main.py
