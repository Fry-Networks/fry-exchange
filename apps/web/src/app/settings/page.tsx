'use client';

import * as React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Settings,
  Palette,
  Bell,
  Globe,
  DollarSign,
  BarChart3,
  Shield,
  Key,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  ChevronRight,
  Check,
} from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';
type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'BTC';
type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';

const currencies: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { value: 'BTC', label: 'Bitcoin', symbol: '₿' },
];

const languages: { value: Language; label: string; native: string }[] = [
  { value: 'en', label: 'English', native: 'English' },
  { value: 'es', label: 'Spanish', native: 'Español' },
  { value: 'fr', label: 'French', native: 'Français' },
  { value: 'de', label: 'German', native: 'Deutsch' },
  { value: 'ja', label: 'Japanese', native: '日本語' },
  { value: 'zh', label: 'Chinese', native: '中文' },
];

export default function SettingsPage() {
  const [theme, setTheme] = React.useState<Theme>('dark');
  const [currency, setCurrency] = React.useState<Currency>('USD');
  const [language, setLanguage] = React.useState<Language>('en');
  const [notifications, setNotifications] = React.useState({
    email: true,
    push: true,
    trades: true,
    priceAlerts: true,
    news: false,
    marketing: false,
  });
  const [trading, setTrading] = React.useState({
    confirmOrders: true,
    showPnL: true,
    soundEffects: true,
    defaultOrderType: 'limit' as 'limit' | 'market',
  });
  const [showCurrencyDropdown, setShowCurrencyDropdown] = React.useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = React.useState(false);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTrading = (key: keyof typeof trading) => {
    if (typeof trading[key] === 'boolean') {
      setTrading((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isAuthenticated username="Trader" />

      <main className="flex-1 py-6">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Customize your trading experience</p>
          </div>

          <div className="space-y-6">
            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Selection */}
                <div>
                  <label className="mb-3 block text-sm font-medium">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light' as Theme, icon: Sun, label: 'Light' },
                      { value: 'dark' as Theme, icon: Moon, label: 'Dark' },
                      { value: 'system' as Theme, icon: Monitor, label: 'System' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                          theme === option.value
                            ? 'border-fry-red-500 bg-fry-red-500/10'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        <option.icon className={`h-6 w-6 ${theme === option.value ? 'text-fry-red-500' : 'text-muted-foreground'}`} />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regional */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="h-5 w-5" />
                  Regional
                </CardTitle>
                <CardDescription>Language and currency preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Language */}
                <div className="relative">
                  <label className="mb-2 block text-sm font-medium">Language</label>
                  <button
                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                    className="flex w-full items-center justify-between rounded-lg border border-input bg-background px-4 py-3 text-left hover:bg-muted"
                  >
                    <span>{languages.find((l) => l.value === language)?.label}</span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${showLanguageDropdown ? 'rotate-90' : ''}`} />
                  </button>
                  {showLanguageDropdown && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
                      {languages.map((lang) => (
                        <button
                          key={lang.value}
                          onClick={() => {
                            setLanguage(lang.value);
                            setShowLanguageDropdown(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted first:rounded-t-lg last:rounded-b-lg"
                        >
                          <div>
                            <span className="font-medium">{lang.label}</span>
                            <span className="ml-2 text-muted-foreground">({lang.native})</span>
                          </div>
                          {language === lang.value && <Check className="h-4 w-4 text-fry-red-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Currency */}
                <div className="relative">
                  <label className="mb-2 block text-sm font-medium">Display Currency</label>
                  <button
                    onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                    className="flex w-full items-center justify-between rounded-lg border border-input bg-background px-4 py-3 text-left hover:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{currencies.find((c) => c.value === currency)?.symbol}</span>
                      <span>{currencies.find((c) => c.value === currency)?.label}</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${showCurrencyDropdown ? 'rotate-90' : ''}`} />
                  </button>
                  {showCurrencyDropdown && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
                      {currencies.map((curr) => (
                        <button
                          key={curr.value}
                          onClick={() => {
                            setCurrency(curr.value);
                            setShowCurrencyDropdown(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted first:rounded-t-lg last:rounded-b-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 text-center text-lg">{curr.symbol}</span>
                            <span>{curr.label}</span>
                          </div>
                          {currency === curr.value && <Check className="h-4 w-4 text-fry-red-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  { key: 'email' as const, label: 'Email Notifications', description: 'Receive updates via email' },
                  { key: 'push' as const, label: 'Push Notifications', description: 'Browser and mobile push notifications' },
                  { key: 'trades' as const, label: 'Trade Confirmations', description: 'Notifications when orders are filled' },
                  { key: 'priceAlerts' as const, label: 'Price Alerts', description: 'Get notified when prices hit your targets' },
                  { key: 'news' as const, label: 'News & Updates', description: 'Platform updates and crypto news' },
                  { key: 'marketing' as const, label: 'Marketing', description: 'Promotional offers and campaigns' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <button
                      onClick={() => toggleNotification(item.key)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        notifications[item.key] ? 'bg-fry-red-500' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Trading Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5" />
                  Trading Preferences
                </CardTitle>
                <CardDescription>Customize your trading experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50">
                  <div>
                    <p className="font-medium">Confirm Orders</p>
                    <p className="text-sm text-muted-foreground">Show confirmation dialog before placing orders</p>
                  </div>
                  <button
                    onClick={() => toggleTrading('confirmOrders')}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      trading.confirmOrders ? 'bg-fry-red-500' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        trading.confirmOrders ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50">
                  <div>
                    <p className="font-medium">Show PnL</p>
                    <p className="text-sm text-muted-foreground">Display profit/loss on positions</p>
                  </div>
                  <button
                    onClick={() => toggleTrading('showPnL')}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      trading.showPnL ? 'bg-fry-red-500' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        trading.showPnL ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    {trading.soundEffects ? (
                      <Volume2 className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <VolumeX className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">Sound Effects</p>
                      <p className="text-sm text-muted-foreground">Play sounds for trades and alerts</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleTrading('soundEffects')}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      trading.soundEffects ? 'bg-fry-red-500' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        trading.soundEffects ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="rounded-lg p-3">
                  <p className="mb-3 font-medium">Default Order Type</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setTrading((prev) => ({ ...prev, defaultOrderType: 'limit' }))}
                      className={`rounded-lg border p-3 text-center transition-colors ${
                        trading.defaultOrderType === 'limit'
                          ? 'border-fry-red-500 bg-fry-red-500/10'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <p className="font-medium">Limit</p>
                      <p className="text-sm text-muted-foreground">Set your price</p>
                    </button>
                    <button
                      onClick={() => setTrading((prev) => ({ ...prev, defaultOrderType: 'market' }))}
                      className={`rounded-lg border p-3 text-center transition-colors ${
                        trading.defaultOrderType === 'market'
                          ? 'border-fry-red-500 bg-fry-red-500/10'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <p className="font-medium">Market</p>
                      <p className="text-sm text-muted-foreground">Instant execution</p>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Shortcuts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>Quick access to security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <button className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <span>Change Password</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
                <button className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <span>Two-Factor Authentication</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button variant="outline">Reset to Defaults</Button>
              <Button variant="fry">Save Changes</Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
