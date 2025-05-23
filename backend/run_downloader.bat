@echo off
echo ORION's YouTube Downloader
echo ===========================

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed! Please install Python 3.8 or higher.
    echo Visit https://www.python.org/downloads/
    pause
    exit /b
)

:: Check if virtual environment exists, create if not
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate virtual environment and install dependencies
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

:: Create downloads directory if it doesn't exist
if not exist downloads (
    mkdir downloads
    echo Created downloads directory.
)

:: Run the application
echo Starting the server...
echo.
echo Access the downloader at: http://localhost:5000
echo.
echo FEATURES:
echo - Fixed HTTP 400 Bad Request error
echo - Added quality selection for both video and audio
echo - Choose from multiple resolution and bitrate options
echo.
echo Press Ctrl+C to stop the server
echo.
python app.py

:: Deactivate virtual environment when done
call venv\Scripts\deactivate.bat

pause