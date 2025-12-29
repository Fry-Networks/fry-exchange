import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth Store
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  kycVerified: boolean;
  twoFactorEnabled: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email: string, _password: string) => {
        set({ isLoading: true });
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const user: User = {
          id: '1',
          email,
          name: email.split('@')[0],
          kycVerified: false,
          twoFactorEnabled: false,
        };
        set({ user, isAuthenticated: true, isLoading: false });
      },
      register: async (name: string, email: string, _password: string) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const user: User = {
          id: '1',
          email,
          name,
          kycVerified: false,
          twoFactorEnabled: false,
        };
        set({ user, isAuthenticated: true, isLoading: false });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Wallet Store
interface WalletBalance {
  currency: string;
  available: string;
  locked: string;
  total: string;
  usdValue: string;
}

interface WalletState {
  balances: WalletBalance[];
  totalUsdValue: string;
  isLoading: boolean;
  fetchBalances: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
  balances: [],
  totalUsdValue: '0.00',
  isLoading: false,
  fetchBalances: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    const balances: WalletBalance[] = [
      { currency: 'BTC', available: '0.5234', locked: '0.0000', total: '0.5234', usdValue: '22640.74' },
      { currency: 'ETH', available: '5.2500', locked: '0.5000', total: '5.7500', usdValue: '13112.87' },
      { currency: 'USDT', available: '10000.00', locked: '2500.00', total: '12500.00', usdValue: '12500.00' },
      { currency: 'SOL', available: '125.00', locked: '0.0000', total: '125.00', usdValue: '12343.75' },
      { currency: 'FRY', available: '50000.00', locked: '10000.00', total: '60000.00', usdValue: '6000.00' },
      { currency: 'ALGO', available: '5000.00', locked: '0.0000', total: '5000.00', usdValue: '950.00' },
    ];
    const totalUsdValue = balances.reduce((sum, b) => sum + parseFloat(b.usdValue), 0).toFixed(2);
    set({ balances, totalUsdValue, isLoading: false });
  },
}));

// Market Store
interface Market {
  symbol: string;
  baseCurrency: string;
  quoteCurrency: string;
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
  high24h: string;
  low24h: string;
  volume24h: string;
  quoteVolume24h: string;
  isFavorite?: boolean;
}

interface MarketState {
  markets: Market[];
  selectedMarket: Market | null;
  favorites: string[];
  isLoading: boolean;
  fetchMarkets: () => Promise<void>;
  setSelectedMarket: (symbol: string) => void;
  toggleFavorite: (symbol: string) => void;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set, get) => ({
      markets: [],
      selectedMarket: null,
      favorites: ['BTC_USDT', 'ETH_USDT'],
      isLoading: false,
      fetchMarkets: async () => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 300));
        const markets: Market[] = [
          { symbol: 'BTC_USDT', baseCurrency: 'BTC', quoteCurrency: 'USDT', lastPrice: '43250.00', priceChange: '1045.00', priceChangePercent: '2.45', high24h: '43800.00', low24h: '42100.00', volume24h: '12345.67', quoteVolume24h: '533987654.00' },
          { symbol: 'ETH_USDT', baseCurrency: 'ETH', quoteCurrency: 'USDT', lastPrice: '2280.50', priceChange: '-28.50', priceChangePercent: '-1.23', high24h: '2350.00', low24h: '2250.00', volume24h: '45678.90', quoteVolume24h: '104123456.00' },
          { symbol: 'SOL_USDT', baseCurrency: 'SOL', quoteCurrency: 'USDT', lastPrice: '98.75', priceChange: '5.25', priceChangePercent: '5.62', high24h: '102.00', low24h: '92.50', volume24h: '234567.00', quoteVolume24h: '23156432.00' },
          { symbol: 'FRY_USDT', baseCurrency: 'FRY', quoteCurrency: 'USDT', lastPrice: '0.10', priceChange: '0.015', priceChangePercent: '17.65', high24h: '0.12', low24h: '0.085', volume24h: '15000000.00', quoteVolume24h: '1500000.00' },
          { symbol: 'ALGO_USDT', baseCurrency: 'ALGO', quoteCurrency: 'USDT', lastPrice: '0.19', priceChange: '-0.005', priceChangePercent: '-2.56', high24h: '0.20', low24h: '0.18', volume24h: '5000000.00', quoteVolume24h: '950000.00' },
          { symbol: 'XRP_USDT', baseCurrency: 'XRP', quoteCurrency: 'USDT', lastPrice: '0.62', priceChange: '0.02', priceChangePercent: '3.33', high24h: '0.65', low24h: '0.59', volume24h: '8000000.00', quoteVolume24h: '4960000.00' },
          { symbol: 'ADA_USDT', baseCurrency: 'ADA', quoteCurrency: 'USDT', lastPrice: '0.58', priceChange: '-0.01', priceChangePercent: '-1.69', high24h: '0.60', low24h: '0.56', volume24h: '12000000.00', quoteVolume24h: '6960000.00' },
          { symbol: 'DOGE_USDT', baseCurrency: 'DOGE', quoteCurrency: 'USDT', lastPrice: '0.082', priceChange: '0.003', priceChangePercent: '3.80', high24h: '0.085', low24h: '0.078', volume24h: '50000000.00', quoteVolume24h: '4100000.00' },
          { symbol: 'AVAX_USDT', baseCurrency: 'AVAX', quoteCurrency: 'USDT', lastPrice: '35.20', priceChange: '1.80', priceChangePercent: '5.39', high24h: '36.50', low24h: '33.00', volume24h: '456789.00', quoteVolume24h: '16079012.80' },
          { symbol: 'DOT_USDT', baseCurrency: 'DOT', quoteCurrency: 'USDT', lastPrice: '7.25', priceChange: '-0.15', priceChangePercent: '-2.03', high24h: '7.50', low24h: '7.10', volume24h: '2345678.00', quoteVolume24h: '17006165.50' },
        ];
        set({ markets, isLoading: false });
        if (!get().selectedMarket) {
          set({ selectedMarket: markets[0] });
        }
      },
      setSelectedMarket: (symbol) => {
        const market = get().markets.find((m) => m.symbol === symbol);
        if (market) {
          set({ selectedMarket: market });
        }
      },
      toggleFavorite: (symbol) => {
        const favorites = get().favorites;
        if (favorites.includes(symbol)) {
          set({ favorites: favorites.filter((f) => f !== symbol) });
        } else {
          set({ favorites: [...favorites, symbol] });
        }
      },
    }),
    {
      name: 'market-storage',
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);

// Toast Store
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };
    set({ toasts: [...get().toasts, newToast] });

    // Auto remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },
  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));

// Settings Store
interface Settings {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    trades: boolean;
    priceAlerts: boolean;
  };
  trading: {
    confirmOrders: boolean;
    showPnL: boolean;
    defaultOrderType: 'limit' | 'market';
  };
}

interface SettingsState {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  updateNotifications: (updates: Partial<Settings['notifications']>) => void;
  updateTrading: (updates: Partial<Settings['trading']>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: {
        theme: 'dark',
        currency: 'USD',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          trades: true,
          priceAlerts: true,
        },
        trading: {
          confirmOrders: true,
          showPnL: true,
          defaultOrderType: 'limit',
        },
      },
      updateSettings: (updates) => {
        set({ settings: { ...get().settings, ...updates } });
      },
      updateNotifications: (updates) => {
        set({
          settings: {
            ...get().settings,
            notifications: { ...get().settings.notifications, ...updates },
          },
        });
      },
      updateTrading: (updates) => {
        set({
          settings: {
            ...get().settings,
            trading: { ...get().settings.trading, ...updates },
          },
        });
      },
    }),
    {
      name: 'settings-storage',
    }
  )
);
