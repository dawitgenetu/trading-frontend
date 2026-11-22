export type TradeDirection = 'BUY' | 'SELL';
export type TradeStatus = 'Planned' | 'Open' | 'Closed' | 'Cancelled';
export type MarketType = 'Forex' | 'Crypto' | 'Indices' | 'Commodities' | 'Stocks';
export type TradingSession = 'Asian' | 'London' | 'New York' | 'Sydney';
export type Timeframe = 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1' | 'W1';
export type AccountType = 'Demo' | 'Live';
export type GoalPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type GoalTargetType = 'PROFIT_AMOUNT' | 'PROFIT_PERCENTAGE' | 'WIN_RATE' | 'MAX_TRADES' | 'MAX_LOSS' | 'DISCIPLINE_SCORE';
export type GoalStatus = 'IN_PROGRESS' | 'ACHIEVED' | 'FAILED';

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  preferredCurrency: string;
  theme: 'dark' | 'light';
}

export interface TradingAccount {
  id: string;
  userId: string;
  name: string;
  brokerName?: string;
  accountType: AccountType;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  equity?: number;
  freeMargin?: number;
  usedMargin?: number;
  marginLevel?: number;
  leverage?: number;
  isExnessConnected?: boolean;
  exnessAccountNumber?: string;
  exnessServer?: string;
  lastSyncAt?: string;
  netProfit?: number;
  winRate?: number;
  totalTrades?: number;
}

export interface Strategy {
  id: string;
  userId: string;
  name: string;
  description?: string;
  entryRules?: string;
  exitRules?: string;
  confirmationConditions?: string;
  preferredTimeframes?: string[];
  preferredSymbols?: string[];
  isActive: boolean;
  createdAt?: string;
  totalTrades?: number;
  winningTrades?: number;
  losingTrades?: number;
  winRate?: number;
  profitFactor?: number;
  netProfit?: number;
  expectancy?: number;
  averageRr?: number;
}

export interface TradeScreenshot {
  id?: string;
  screenshotType: 'BEFORE_ENTRY' | 'ENTRY_SETUP' | 'DURING_TRADE' | 'EXIT_RESULT';
  imageUrl: string;
  caption?: string;
}

export interface Trade {
  id: string;
  userId: string;
  accountId: string;
  strategyId?: string | null;
  strategyName?: string;
  symbol: string;
  marketType: MarketType;
  direction: TradeDirection;
  session: TradingSession;
  timeframe: Timeframe;
  status: TradeStatus;
  tradeDate: string;
  entryTime: string;
  exitTime?: string | null;
  entryPrice: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  exitPrice?: number | null;
  positionSize: number;
  contractSize: number;
  pipOrTickValue: number;
  leverage?: number;
  marginRequired?: number;
  commission: number;
  swap: number;
  otherFees: number;
  priceDifference: number;
  grossPnl: number;
  netPnl: number;
  riskAmount: number;
  riskPercentage: number;
  plannedRr: number;
  actualRMultiple: number;
  balanceAfter?: number | null;
  marketDirection?: string;
  marketStructure?: string;
  trendConfirmation?: string;
  liquidityCondition?: string;
  supportResistance?: string;
  entryConfirmation?: string;
  confluenceChecklist?: string[];
  entryReason?: string;
  detailedNotes?: string;
  emotionBefore?: string;
  emotionDuring?: string;
  emotionAfter?: string;
  confidenceLevel: number;
  followedPlan: boolean;
  wasFomo: boolean;
  wasRevenge: boolean;
  didOvertrade: boolean;
  lessonsLearned?: string;
  screenshots?: TradeScreenshot[];
  externalId?: string;
  source?: 'MANUAL' | 'EXNESS';
  exnessTicket?: string;
  createdAt?: string;
}

export interface PerformanceStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  winRate: number;
  lossRate: number;
  grossProfit: number;
  grossLoss: number;
  netProfit: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  winLossRatio: number;
  expectancy: number;
  averageRr: number;
  maxDrawdownAmount: number;
  maxDrawdownPercentage: number;
  recoveryFactor: number;
  consecutiveWins: number;
  maxConsecutiveWins: number;
  consecutiveLosses: number;
  maxConsecutiveLosses: number;
  initialBalance: number;
  currentBalance: number;
  currentEquity: number;
}

export interface RiskSettings {
  userId: string;
  accountId?: string | null;
  maxDailyLoss: number;
  maxWeeklyLoss: number;
  maxAccountDrawdownPct: number;
  maxTradesPerDay: number;
  maxConsecutiveLosses: number;
  defaultRiskPercentage: number;
}

export interface TradingGoal {
  id: string;
  userId: string;
  accountId?: string | null;
  title: string;
  period: GoalPeriod;
  targetType: GoalTargetType;
  targetValue: number;
  currentValue: number;
  startDate: string;
  endDate: string;
  status: GoalStatus;
  notes?: string;
  progressPercentage?: number;
  isAchieved?: boolean;
}

export interface ExnessCredentials {
  id?: string;
  userId: string;
  accountId?: string;
  accountNumber: string;
  server: string;
  apiKey?: string;
  apiSecret?: string;
  apiEndpoint?: string;
  tradingPassword?: string;
  investorPassword?: string;
  autoTradingEnabled: boolean;
  maxSlippagePips?: number;
  defaultLotSize?: number;
  balance?: number;
  equity?: number;
  freeMargin?: number;
  usedMargin?: number;
  marginLevel?: number;
  leverage?: number;
  currency?: string;
  isConnected: boolean;
  lastConnectedAt?: string;
  lastSyncAt?: string;
  syncStatus?: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
  syncError?: string | null;
}

export interface ExnessAccountInfo {
  accountNumber: string;
  balance: number;
  equity: number;
  freeMargin: number;
  usedMargin: number;
  marginLevel: number;
  currency: string;
  leverage: number;
  credit?: number;
  isDemo: boolean;
  server: string;
  pingMs?: number;
}

export interface ExnessPosition {
  id: string;
  symbol: string;
  direction: TradeDirection;
  volume: number;
  openPrice: number;
  currentPrice: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  profit: number;
  swap: number;
  commission: number;
  openTime: string;
  comment?: string;
}

export interface ExnessOrderRequest {
  accountId?: string;
  symbol: string;
  direction: TradeDirection;
  volume: number;
  orderType?: 'MARKET' | 'LIMIT' | 'STOP';
  price?: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  comment?: string;
  deviation?: number;
}

export interface ExnessModifyPositionRequest {
  positionId: string;
  stopLoss?: number | null;
  takeProfit?: number | null;
}
