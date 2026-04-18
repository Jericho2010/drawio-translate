#!/bin/bash
# ==========================================================
# FlowArchitect Local Server Launcher
# Bypasses Chromium `file:///` strict security policies
# ==========================================================

PORT=8080

echo "🚀 Starting FlowArchitect Web Server on port $PORT..."
# Spin up lightweight native Python web server
python3 -m http.server $PORT &
SERVER_PID=$!

# Give it a second to bind to the port
sleep 1

echo "🌐 Opening FlowArchitect v6 in your default browser..."
xdg-open "http://localhost:$PORT/FlowArchitect_v6.html"

echo "✅ Server active! The 'Download .drawio' button will now correctly name files."
echo "🛑 Press [Ctrl+C] to stop the server when you are done."

# Wait for process (allows Ctrl+C to gracefully kill the Python server)
wait $SERVER_PID
