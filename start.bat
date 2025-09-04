@echo off
echo 🎭 Starting Creative Story ^& Poem Generator...

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  .env file not found!
    echo 📝 Creating .env from template...
    copy .env.example .env
    echo ✅ Please edit .env file and add your GEMINI_API_KEY
    echo    You can get your API key from: https://makersuite.google.com/app/apikey
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo 🐍 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo 📦 Installing dependencies...
pip install -r requirements.txt

REM Check if API key is set
findstr /C:"your_gemini_api_key_here" .env >nul
if %errorlevel% == 0 (
    echo ⚠️  Please update your GEMINI_API_KEY in .env file
    echo    Current .env contains placeholder value
    pause
    exit /b 1
)

REM Start the application
echo 🚀 Starting the application...
echo 📖 Open your browser and visit: http://localhost:8000
echo ⏹️  Press Ctrl+C to stop the server
echo.

python main.py
