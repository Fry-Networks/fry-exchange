import { Router } from 'express';
import { publicMarketRoutes } from './public/market';
import { authRoutes } from './private/auth';
import { orderRoutes } from './private/orders';
import { walletRoutes } from './private/wallet';
import { ammRoutes } from './private/amm';
import { accountRoutes } from './private/account';
import { adminCoinRoutes } from './admin/coins';

// Public routes (no auth required)
export const publicRoutes = Router();
publicRoutes.use('/market', publicMarketRoutes);

// Private routes (auth required)
export const privateRoutes = Router();
privateRoutes.use('/auth', authRoutes);
privateRoutes.use('/orders', orderRoutes);
privateRoutes.use('/wallet', walletRoutes);
privateRoutes.use('/amm', ammRoutes);
privateRoutes.use('/account', accountRoutes);

// Admin routes
export const adminRoutes = Router();
adminRoutes.use('/coins', adminCoinRoutes);
