"""
Grave Reaper Development Server.
Adds no-cache headers to prevent the browser from caching old JS/images.
Usage: python serve.py → http://localhost:8080
"""
import http.server
import socketserver
import os
import functools

PORT = 8080
# Set the script directory as the serving root (independent of startup CWD)
ROOT = os.path.dirname(os.path.abspath(__file__))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Force fresh fetch from server each time
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # Run silently


if __name__ == "__main__":
    handler = functools.partial(NoCacheHandler, directory=ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Grave Reaper dev server: http://localhost:{PORT}  (Press Ctrl+C to stop)")
        httpd.serve_forever()
