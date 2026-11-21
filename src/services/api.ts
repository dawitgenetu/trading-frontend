import type {
  Profile,
  TradingAccount,
  Strategy,
  Trade,
  RiskSettings,
  TradingGoal,
  PerformanceStats,
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

class ApiService {
  private token: string | null = null;
  private userId: string | null = null;

  constructor() {
    this.token = localStorage.getItem('etj_token');
    this.userId = localStorage.getItem('etj_user_id');
  }

  setAuth(token: string | null, userId: string | null) {
    this.token = token;
    this.userId = userId;
    if (token) localStorage.setItem('etj_token', token);
    else localStorage.removeItem('etj_token');

    if (userId) localStorage.setItem('etj_user_id', userId);
    else localStorage.removeItem('etj_user_id');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (this.userId) {
      headers['x-user-id'] = this.userId;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMsg = `API Request failed with status ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData.error) errorMsg = errorData.error;
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    return res.json();
  }

  // Auth
  async getProfile(): Promise<{ profile: Profile }> {
    return this.request('/auth/profile');
  }

  async updateProfile(updates: Partial<Profile>): Promise<{ profile: Profile }> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async login(email: string, password?: string): Promise<any> {
    const res: any = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: password || 'password123' }),
    });
    const token = res.session?.access_token || res.token;
    const userId = res.user?.id;
    if (token && userId) {
      this.setAuth(token, userId);
    }
    return res;
  }

  async register(email: string, fullName: string, password?: string): Promise<any> {
    const res: any = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, fullName, password: password || 'password123' }),
    });
    const token = res.session?.access_token || res.token;
    const userId = res.user?.id;
    if (token && userId) {
      this.setAuth(token, userId);
    }
    return res;
  }

  // Accounts
  async getAccounts(): Promise<{ accounts: TradingAccount[] }> {
    return this.request('/accounts');
  }

  async getAccount(id: string): Promise<{ account: TradingAccount & { stats: PerformanceStats } }> {
    return this.request(`/accounts/${id}`);
  }

  async createAccount(data: Partial<TradingAccount>): Promise<{ account: TradingAccount }> {
    return this.request('/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAccount(id: string, data: Partial<TradingAccount>): Promise<{ account: TradingAccount }> {
    return this.request(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(id: string): Promise<{ success: boolean }> {
    return this.request(`/accounts/${id}`, {
      method: 'DELETE',
    });
  }

  // Trades
  async getTrades(params: Record<string, string | number | undefined> = {}): Promise<{
    trades: Trade[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return this.request(`/trades?${query.toString()}`);
  }

  async getTrade(id: string): Promise<{ trade: Trade }> {
    return this.request(`/trades/${id}`);
  }

  async createTrade(data: Partial<Trade>): Promise<{ trade: Trade }> {
    return this.request('/trades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTrade(id: string, data: Partial<Trade>): Promise<{ trade: Trade }> {
    return this.request(`/trades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async duplicateTrade(id: string): Promise<{ trade: Trade }> {
    return this.request(`/trades/${id}/duplicate`, {
      method: 'POST',
    });
  }

  async deleteTrade(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/trades/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadScreenshot(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    if (this.userId) headers['x-user-id'] = this.userId;

    const res = await fetch(`${API_BASE}/trades/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) throw new Error('Failed to upload image');
    return res.json();
  }

  // Strategies
  async getStrategies(): Promise<{ strategies: Strategy[]; summary: any }> {
    return this.request('/strategies');
  }

  async createStrategy(data: Partial<Strategy>): Promise<{ strategy: Strategy }> {
    return this.request('/strategies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStrategy(id: string, data: Partial<Strategy>): Promise<{ strategy: Strategy }> {
    return this.request(`/strategies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStrategy(id: string): Promise<{ success: boolean }> {
    return this.request(`/strategies/${id}`, {
      method: 'DELETE',
    });
  }

  // Risk
  async calculateRisk(data: any): Promise<{ result: any }> {
    return this.request('/risk/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRiskSettings(accountId?: string): Promise<{ settings: RiskSettings }> {
    return this.request(`/risk/settings${accountId ? `?accountId=${accountId}` : ''}`);
  }

  async updateRiskSettings(settings: Partial<RiskSettings>): Promise<{ settings: RiskSettings }> {
    return this.request('/risk/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getRiskStatus(accountId?: string): Promise<{ status: any }> {
    return this.request(`/risk/status${accountId ? `?accountId=${accountId}` : ''}`);
  }

  // Goals
  async getGoals(accountId?: string): Promise<{ goals: TradingGoal[] }> {
    return this.request(`/goals${accountId ? `?accountId=${accountId}` : ''}`);
  }

  async createGoal(data: Partial<TradingGoal>): Promise<{ goal: TradingGoal }> {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGoal(id: string, data: Partial<TradingGoal>): Promise<{ goal: TradingGoal }> {
    return this.request(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGoal(id: string): Promise<{ success: boolean }> {
    return this.request(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getDashboard(params: Record<string, string | undefined> = {}): Promise<any> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) query.append(k, v);
    });
    return this.request(`/analytics/dashboard?${query.toString()}`);
  }

  async getAdvancedAnalytics(params: Record<string, string | undefined> = {}): Promise<any> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) query.append(k, v);
    });
    return this.request(`/analytics/advanced?${query.toString()}`);
  }

  // Coach
  async getCoachInsights(accountId?: string): Promise<any> {
    return this.request(`/coach/insights${accountId ? `?accountId=${accountId}` : ''}`);
  }

  async chatWithCoach(message: string, history: Array<{ role: 'user' | 'assistant'; content: string }> = [], accountId?: string): Promise<{ reply: string }> {
    return this.request('/coach/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history, accountId }),
    });
  }

  // Reports
  async getReportSummary(accountId?: string): Promise<any> {
    return this.request(`/reports/summary${accountId ? `?accountId=${accountId}` : ''}`);
  }
}

export const api = new ApiService();
