import { WebSocketServer as WSServer, WebSocket } from 'ws';
import { Server } from 'http';
import { verifyAccessToken } from '@fry-exchange/user';
import { WS_CHANNELS } from '@fry-exchange/common';

interface Client {
  ws: WebSocket;
  userId?: string;
  subscriptions: Set<string>;
}

interface WSMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping';
  channels?: string[];
}

/**
 * WebSocket server for real-time market data and user updates
 */
export class ExchangeWebSocketServer {
  private wss: WSServer;
  private clients: Map<WebSocket, Client> = new Map();
  private channelSubscribers: Map<string, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WSServer({ server, path: '/ws' });
    this.init();
  }

  private init(): void {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const client: Client = {
        ws,
        subscriptions: new Set(),
      };

      // Try to authenticate from query string
      const url = new URL(request.url || '', 'ws://localhost');
      const token = url.searchParams.get('token');
      if (token) {
        try {
          const payload = verifyAccessToken(token);
          client.userId = payload.userId;
        } catch {
          // Continue as unauthenticated
        }
      }

      this.clients.set(ws, client);

      ws.on('message', (data) => {
        try {
          const message: WSMessage = JSON.parse(data.toString());
          this.handleMessage(client, message);
        } catch {
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        // Remove from all channel subscriptions
        for (const channel of client.subscriptions) {
          this.channelSubscribers.get(channel)?.delete(ws);
        }
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: 'connected',
          authenticated: !!client.userId,
        })
      );
    });
  }

  private handleMessage(client: Client, message: WSMessage): void {
    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(client, message.channels || []);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(client, message.channels || []);
        break;
      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong' }));
        break;
    }
  }

  private handleSubscribe(client: Client, channels: string[]): void {
    for (const channel of channels) {
      // Validate channel
      if (!this.isValidChannel(channel)) {
        client.ws.send(
          JSON.stringify({ error: `Invalid channel: ${channel}` })
        );
        continue;
      }

      // Check if private channel requires auth
      if (this.isPrivateChannel(channel) && !client.userId) {
        client.ws.send(
          JSON.stringify({ error: `Authentication required for: ${channel}` })
        );
        continue;
      }

      // Add to subscription
      client.subscriptions.add(channel);
      if (!this.channelSubscribers.has(channel)) {
        this.channelSubscribers.set(channel, new Set());
      }
      this.channelSubscribers.get(channel)!.add(client.ws);

      client.ws.send(
        JSON.stringify({ type: 'subscribed', channel })
      );
    }
  }

  private handleUnsubscribe(client: Client, channels: string[]): void {
    for (const channel of channels) {
      client.subscriptions.delete(channel);
      this.channelSubscribers.get(channel)?.delete(client.ws);

      client.ws.send(
        JSON.stringify({ type: 'unsubscribed', channel })
      );
    }
  }

  private isValidChannel(channel: string): boolean {
    // Public channels: ticker@BTC_USDT, orderbook@BTC_USDT, trades@BTC_USDT, kline@BTC_USDT@1m
    // Private channels: orders, user_trades, balance
    const publicPatterns = [
      /^ticker@[A-Z]+_[A-Z]+$/,
      /^orderbook@[A-Z]+_[A-Z]+$/,
      /^trades@[A-Z]+_[A-Z]+$/,
      /^kline@[A-Z]+_[A-Z]+@\d+[mhd]$/,
    ];

    const privateChannels = [
      WS_CHANNELS.USER_ORDERS,
      WS_CHANNELS.USER_TRADES,
      WS_CHANNELS.USER_BALANCE,
    ];

    return (
      publicPatterns.some((p) => p.test(channel)) ||
      privateChannels.includes(channel as any)
    );
  }

  private isPrivateChannel(channel: string): boolean {
    return [
      WS_CHANNELS.USER_ORDERS,
      WS_CHANNELS.USER_TRADES,
      WS_CHANNELS.USER_BALANCE,
    ].includes(channel as any);
  }

  /**
   * Broadcast message to a channel
   */
  broadcast(channel: string, data: any): void {
    const subscribers = this.channelSubscribers.get(channel);
    if (!subscribers) return;

    const message = JSON.stringify({
      channel,
      data,
      timestamp: Date.now(),
    });

    for (const ws of subscribers) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  }

  /**
   * Send message to a specific user
   */
  sendToUser(userId: string, channel: string, data: any): void {
    const message = JSON.stringify({
      channel,
      data,
      timestamp: Date.now(),
    });

    for (const [ws, client] of this.clients) {
      if (
        client.userId === userId &&
        client.subscriptions.has(channel) &&
        ws.readyState === WebSocket.OPEN
      ) {
        ws.send(message);
      }
    }
  }

  /**
   * Broadcast ticker update
   */
  broadcastTicker(symbol: string, ticker: any): void {
    this.broadcast(`ticker@${symbol}`, ticker);
  }

  /**
   * Broadcast order book update
   */
  broadcastOrderBook(symbol: string, orderBook: any): void {
    this.broadcast(`orderbook@${symbol}`, orderBook);
  }

  /**
   * Broadcast trade
   */
  broadcastTrade(symbol: string, trade: any): void {
    this.broadcast(`trades@${symbol}`, trade);
  }

  /**
   * Broadcast kline update
   */
  broadcastKline(symbol: string, interval: string, kline: any): void {
    this.broadcast(`kline@${symbol}@${interval}`, kline);
  }

  /**
   * Send order update to user
   */
  sendOrderUpdate(userId: string, order: any): void {
    this.sendToUser(userId, WS_CHANNELS.USER_ORDERS, order);
  }

  /**
   * Send trade update to user
   */
  sendTradeUpdate(userId: string, trade: any): void {
    this.sendToUser(userId, WS_CHANNELS.USER_TRADES, trade);
  }

  /**
   * Send balance update to user
   */
  sendBalanceUpdate(userId: string, balance: any): void {
    this.sendToUser(userId, WS_CHANNELS.USER_BALANCE, balance);
  }
}
