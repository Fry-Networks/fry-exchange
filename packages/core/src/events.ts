import EventEmitter from 'eventemitter3';
import { Order } from '@fry-exchange/common';
import { TradeExecution } from './matching/types';

export interface EngineEvents {
  orderOpen: (order: Order) => void;
  orderFilled: (order: Order) => void;
  orderPartiallyFilled: (order: Order) => void;
  orderCancelled: (order: Order) => void;
  orderRejected: (order: Order, reason: string) => void;
  trade: (trade: TradeExecution) => void;
  orderBookUpdate: (symbol: string, updateId: number) => void;
}

export class EngineEventEmitter extends EventEmitter<EngineEvents> {
  constructor() {
    super();
  }
}
