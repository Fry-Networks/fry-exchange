'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Smartphone,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Camera,
  Edit2,
  ChevronRight,
  Activity,
  Globe,
  Lock,
} from 'lucide-react';

// Mock user data
const userData = {
  id: 'USR-12345',
  name: 'John Trader',
  email: 'john@example.com',
  phone: '+1 (555) 123-4567',
  avatar: null,
  createdAt: new Date('2024-01-15'),
  kycStatus: 'verified' as const,
  kycLevel: 2,
  twoFactorEnabled: true,
  lastLogin: new Date(Date.now() - 3600000),
  lastLoginIp: '192.168.1.1',
  tradingVolume30d: 125000,
  totalTrades: 342,
  accountTier: 'Gold',
};

const securityItems = [
  {
    id: 'password',
    icon: Key,
    title: 'Password',
    description: 'Last changed 30 days ago',
    status: 'active',
    action: 'Change',
  },
  {
    id: '2fa',
    icon: Smartphone,
    title: 'Two-Factor Authentication',
    description: 'Google Authenticator enabled',
    status: 'enabled',
    action: 'Manage',
  },
  {
    id: 'email',
    icon: Mail,
    title: 'Email Verification',
    description: 'john@example.com',
    status: 'verified',
    action: 'Change',
  },
  {
    id: 'phone',
    icon: Phone,
    title: 'Phone Verification',
    description: '+1 (555) ••• 4567',
    status: 'verified',
    action: 'Change',
  },
  {
    id: 'antiPhishing',
    icon: Shield,
    title: 'Anti-Phishing Code',
    description: 'Set a code to identify official emails',
    status: 'not_set',
    action: 'Set Up',
  },
];

const recentActivity = [
  { id: '1', action: 'Login', device: 'Chrome on Windows', ip: '192.168.1.1', timestamp: new Date(Date.now() - 3600000) },
  { id: '2', action: 'Withdrawal', device: 'Mobile App', ip: '192.168.1.2', timestamp: new Date(Date.now() - 86400000) },
  { id: '3', action: 'Password Changed', device: 'Chrome on Windows', ip: '192.168.1.1', timestamp: new Date(Date.now() - 604800000) },
  { id: '4', action: 'Login', device: 'Safari on Mac', ip: '192.168.1.3', timestamp: new Date(Date.now() - 172800000) },
];

export default function AccountPage() {
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
  });

  const handleSave = () => {
    // In a real app, this would call an API
    setIsEditing(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isAuthenticated username={userData.name} />

      <main className="flex-1 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Account</h1>
            <p className="text-muted-foreground">Manage your account settings and security</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Profile & Stats */}
            <div className="space-y-6">
              {/* Profile Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-fry-red-500 to-fry-red-600 text-3xl font-bold text-white">
                        {userData.name[0]}
                      </div>
                      <button className="absolute bottom-0 right-0 rounded-full bg-background p-2 shadow-lg border border-border hover:bg-muted">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <h2 className="mt-4 text-xl font-semibold">{userData.name}</h2>
                    <p className="text-sm text-muted-foreground">{userData.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-fry-red-500/10 px-3 py-1 text-sm font-medium text-fry-red-500">
                      {userData.accountTier} Member
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 border-t border-border pt-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">User ID</span>
                      <span className="font-mono">{userData.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Member Since</span>
                      <span>{userData.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Login</span>
                      <span>{userData.lastLogin.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trading Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">30d Volume</span>
                    <span className="font-medium">{formatPrice(userData.tradingVolume30d)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Trades</span>
                    <span className="font-medium">{userData.totalTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee Tier</span>
                    <span className="font-medium text-fry-red-500">Maker 0.08% / Taker 0.10%</span>
                  </div>
                </CardContent>
              </Card>

              {/* KYC Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileCheck className="h-5 w-5" />
                    Identity Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-buy" />
                        <span>Level 1 - Basic</span>
                      </div>
                      <span className="text-sm text-buy">Verified</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-buy" />
                        <span>Level 2 - Advanced</span>
                      </div>
                      <span className="text-sm text-buy">Verified</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className="text-muted-foreground">Level 3 - Institutional</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Upgrade
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Settings & Security */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  >
                    {isEditing ? 'Save' : <><Edit2 className="mr-2 h-4 w-4" /> Edit</>}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      prefix={<User className="h-4 w-4" />}
                    />
                    <Input
                      label="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      prefix={<Mail className="h-4 w-4" />}
                    />
                    <Input
                      label="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      prefix={<Phone className="h-4 w-4" />}
                    />
                    <Input
                      label="Country"
                      value="United States"
                      disabled
                      prefix={<Globe className="h-4 w-4" />}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  {securityItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <item.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.status === 'enabled' || item.status === 'verified' ? (
                          <span className="flex items-center gap-1 text-sm text-buy">
                            <CheckCircle2 className="h-4 w-4" />
                            {item.status === 'enabled' ? 'Enabled' : 'Verified'}
                          </span>
                        ) : item.status === 'not_set' ? (
                          <span className="flex items-center gap-1 text-sm text-yellow-500">
                            <AlertCircle className="h-4 w-4" />
                            Not Set
                          </span>
                        ) : null}
                        <Button variant="ghost" size="sm">
                          {item.action}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Your recent account activity</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-sm text-muted-foreground">{activity.device}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{activity.ip}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>Irreversible account actions</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="destructive">Delete Account</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
