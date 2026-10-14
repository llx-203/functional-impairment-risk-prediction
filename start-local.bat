@echo off
cd /d "%~dp0"
echo Open http://127.0.0.1:8000 in your browser.
echo Keep this window open. Press Ctrl+C to stop.
python -m http.server 8000 --bind 127.0.0.1
pause
