#!/bin/bash
# Grave Reaper launcher for macOS — the equivalent of serve.bat on Windows.
# Double-click this file in Finder to start the local server and open the game
# in your default browser. Close the Terminal window (or press Ctrl+C) to stop.

# Always run from this script's own folder, regardless of where it's launched.
cd "$(dirname "$0")" || exit 1

# Pick whichever Python is available (macOS ships python3; "python" may be absent).
if command -v python3 >/dev/null 2>&1; then
  PY=python3
elif command -v python >/dev/null 2>&1; then
  PY=python
else
  echo "Python is not installed. Install it from https://www.python.org/ and try again."
  read -r -p "Press Enter to close..."
  exit 1
fi

echo "Starting Grave Reaper server at http://localhost:8080"
echo "Press Ctrl+C (or close this window) to stop."

# Open the browser shortly after, once the server is accepting connections.
( sleep 1; open "http://localhost:8080" ) &

# Run the server in the foreground so this window stays the server console.
exec "$PY" serve.py
