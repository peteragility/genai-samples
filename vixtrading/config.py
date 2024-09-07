# Interactive Brokers connection settings
IB_HOST = 'localhost'
IB_PORT = 7497  # Use 7497 for TWS paper trading, 4001 for IB Gateway paper trading
IB_CLIENT_ID = 1

# Trading parameters
VIX_SYMBOL = 'VIX'
QQQ_SYMBOL = 'QQQ'
VIX_THRESHOLD = 20  # Adjust this value based on your strategy
TRADE_QUANTITY = 100  # Number of QQQ shares to trade

# VIX futures trading
VIX_FUTURES_SYMBOL = 'VX'  # VIX futures symbol