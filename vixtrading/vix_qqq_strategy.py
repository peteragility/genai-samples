from ib_client import IBApi, create_contract, create_order
from config import VIX_SYMBOL, QQQ_SYMBOL, VIX_THRESHOLD, TRADE_QUANTITY, VIX_FUTURES_SYMBOL
import time
import pandas as pd
import numpy as np

class VIXQQQStrategy:
    def __init__(self, ib_client):
        self.ib = ib_client
        self.vix_contract = create_contract(VIX_SYMBOL)
        self.qqq_contract = create_contract(QQQ_SYMBOL)
        self.vix_futures_contract = create_contract(VIX_FUTURES_SYMBOL)
        self.last_vix = None

    def get_price(self, contract):
        req_id = self.ib.reqMktData(0, contract, '', False, False, [])
        self.ib.event.wait()
        self.ib.event.clear()
        return self.ib.data[req_id]

    def execute_trade(self, action):
        order = create_order(action, TRADE_QUANTITY)
        self.ib.place_order(self.qqq_contract, order)
        print(f"{action} {TRADE_QUANTITY} shares of QQQ")

    def trade_vix_futures(self, action):
        order = create_order(action, TRADE_QUANTITY)
        self.ib.place_order(self.vix_futures_contract, order)
        print(f"{action} {TRADE_QUANTITY} VIX futures contracts")

    def analyze_vix(self):
        vix_data = self.get_historical_data(self.vix_contract)
        vix_df = pd.DataFrame(vix_data, columns=['timestamp', 'price'])
        vix_df['sma_20'] = vix_df['price'].rolling(window=20).mean()
        vix_df['upper_band'] = vix_df['sma_20'] + (vix_df['price'].rolling(window=20).std() * 2)
        vix_df['lower_band'] = vix_df['sma_20'] - (vix_df['price'].rolling(window=20).std() * 2)
        
        current_vix = vix_df['price'].iloc[-1]
        upper_band = vix_df['upper_band'].iloc[-1]
        lower_band = vix_df['lower_band'].iloc[-1]
        
        if current_vix > upper_band:
            return 'high_volatility'
        elif current_vix < lower_band:
            return 'low_volatility'
        else:
            return 'normal_volatility'

    def get_historical_data(self, contract):
        # Implement method to fetch historical data from IB
        pass

    def hedge_portfolio(self):
        qqq_position = self.get_position(self.qqq_contract)
        vix_state = self.analyze_vix()
        
        if vix_state == 'high_volatility' and qqq_position > 0:
            hedge_quantity = min(qqq_position, TRADE_QUANTITY)
            self.trade_vix_futures('BUY', hedge_quantity)
            print(f"Hedged {hedge_quantity} QQQ shares with VIX futures")

    def get_position(self, contract):
        # Implement method to get current position for a given contract
        pass

    def run(self):
        while True:
            vix_state = self.analyze_vix()
            current_vix = self.get_price(self.vix_contract)
            
            if vix_state == 'low_volatility':
                self.execute_trade('BUY')  # Buy QQQ
                self.trade_vix_futures('SELL')  # Sell VIX futures
            elif vix_state == 'high_volatility':
                self.execute_trade('SELL')  # Sell QQQ
                self.trade_vix_futures('BUY')  # Buy VIX futures
            
            print(f"Current VIX: {current_vix}, State: {vix_state}")
            time.sleep(60)  # Wait for 1 minute before checking again