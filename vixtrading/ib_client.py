from ibapi.client import EClient
from ibapi.wrapper import EWrapper
from ibapi.contract import Contract
from ibapi.order import Order
import threading
import time

class IBApi(EWrapper, EClient):
    def __init__(self):
        EClient.__init__(self, self)
        self.data = {}
        self.event = threading.Event()

    def error(self, reqId, errorCode, errorString):
        print(f"Error {errorCode}: {errorString}")

    def tickPrice(self, reqId, tickType, price, attrib):
        if tickType == 4:  # Last price
            self.data[reqId] = price
            self.event.set()

    def place_order(self, contract, order):
        self.placeOrder(self.nextOrderId(), contract, order)

    def nextValidId(self, orderId):
        self.nextOrderId = orderId

def create_contract(symbol):
    contract = Contract()
    contract.symbol = symbol
    contract.secType = 'STK'
    contract.exchange = 'SMART'
    contract.currency = 'USD'
    return contract

def create_order(action, quantity, order_type='MKT'):
    order = Order()
    order.action = action
    order.totalQuantity = quantity
    order.orderType = order_type
    return order