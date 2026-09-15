#!/usr/bin/env python3
"""Local HTML-to-GIF renderer for Diagrammaton.

POST /api/gif with {"html": "<!doctype html>..."} and receive image/gif.
The service deliberately binds to localhost: it renders user-provided HTML in a
local Chromium process and is not intended to be exposed on a public network.
"""

from __future__ import annotations

import argparse
import io
import json
import os
import shutil
import tempfile
import threading
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

FRAME_COUNT = 60
FRAME_DELAY_MS = 100
VIEWPORT = {"width": 1484, "height": 904}
MAX_HTML_BYTES = 5 * 1024 * 1024
RENDER_LOCK = threading.Lock()


def chromium_executable() -> str | None:
    """Prefer an installed Chromium so no Playwright browser download is needed."""
    configured = os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH")
    if configured:
        return configured
    return next((path for path in ("/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser") if Path(path).exists()), shutil.which("google-chrome") or shutil.which("chromium"))


def render_html_as_gif(html: str) -> bytes:
    with RENDER_LOCK, tempfile.TemporaryDirectory(prefix="diagrammaton-gif-") as directory:
        source = Path(directory) / "diagram.html"
        source.write_text(html, encoding="utf-8")
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True, executable_path=chromium_executable())
            try:
                page = browser.new_page(viewport=VIEWPORT, device_scale_factor=1)
                page.goto(source.as_uri(), wait_until="load")
                page.wait_for_timeout(500)
                frames: list[Image.Image] = []
                for _ in range(FRAME_COUNT):
                    png = page.screenshot(full_page=True)
                    with Image.open(io.BytesIO(png)) as image:
                        frames.append(image.convert("RGB"))
                    page.wait_for_timeout(FRAME_DELAY_MS)
            finally:
                browser.close()

        output = io.BytesIO()
        frames[0].save(
            output,
            format="GIF",
            save_all=True,
            append_images=frames[1:],
            duration=FRAME_DELAY_MS,
            loop=0,
            optimize=True,
            disposal=2,
        )
        return output.getvalue()


class GifRequestHandler(BaseHTTPRequestHandler):
    server_version = "DiagrammatonGifService/1.0"

    def do_GET(self) -> None:  # noqa: N802
        if self.path != "/health":
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        self.send_json(HTTPStatus.OK, {"status": "ok"})

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_cors_headers()
        self.end_headers()

    def do_POST(self) -> None:  # noqa: N802
        if self.path != "/api/gif":
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= MAX_HTML_BYTES:
                raise ValueError(f"The HTML payload must be between 1 byte and {MAX_HTML_BYTES // 1024 // 1024} MB.")
            payload = json.loads(self.rfile.read(length))
            html = payload.get("html") if isinstance(payload, dict) else None
            if not isinstance(html, str) or not html.lstrip().lower().startswith("<!doctype html"):
                raise ValueError("The request must contain a complete standalone HTML document.")
            gif = render_html_as_gif(html)
        except (ValueError, json.JSONDecodeError) as error:
            self.send_json(HTTPStatus.BAD_REQUEST, {"error": str(error)})
            return
        except Exception as error:  # The client needs a useful failure instead of a broken download.
            self.send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": f"GIF rendering failed: {error}"})
            return

        self.send_response(HTTPStatus.OK)
        self.send_cors_headers()
        self.send_header("Content-Type", "image/gif")
        self.send_header("Content-Length", str(len(gif)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(gif)

    def send_json(self, status: HTTPStatus, payload: dict[str, str]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def log_message(self, format: str, *args: object) -> None:
        print(f"[gif-service] {self.address_string()} - {format % args}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Render standalone Diagrammaton HTML as GIF.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), GifRequestHandler)
    print(f"Diagrammaton GIF service listening at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
