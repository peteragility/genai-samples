from ib_client import IBApi
from vix_qqq_strategy import VIXQQQStrategy
from config import IB_HOST, IB_PORT, IB_CLIENT_ID
import threading

def run_loop(ib_app):
    ib_app.run()

def main():
    ib_app = IBApi()
    ib_app.connect(IB_HOST, IB_PORT, IB_CLIENT_ID)

    # Start the socket in a separate thread
    api_thread = threading.Thread(target=run_loop, args=(ib_app,), daemon=True)
    api_thread.start()

    # Wait for nextValidId
    while True:
        if hasattr(ib_app, 'nextOrderId'):
            break
        time.sleep(1)

    # Create and run the strategy
    strategy = VIXQQQStrategy(ib_app)
    strategy.run()

if __name__ == "__main__":
    main()