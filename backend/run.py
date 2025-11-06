"""
Skrypt uruchamiający aplikację VolleyballStats
Otwiera przeglądarkę i startuje serwer FastAPI
"""
import uvicorn
import webbrowser
import time
import threading
from main import app
from pathlib import Path


def open_browser():
    """Otwiera przeglądarkę po 2 sekundach"""
    time.sleep(2)
    webbrowser.open('http://127.0.0.1:8000')


if __name__ == "__main__":
    # Uruchom przeglądarkę w osobnym wątku
    threading.Thread(target=open_browser, daemon=True).start()

    # Uruchom serwer
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")

