@echo off
echo Starting Grave Reaper server at http://localhost:8080
echo Press Ctrl+C to stop.
REM Open the game in the default browser shortly after the server starts.
start "" http://localhost:8080
python serve.py
pause
