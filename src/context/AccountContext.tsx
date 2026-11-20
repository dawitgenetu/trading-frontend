import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { TradingAccount } from '../types';
import { api } from '../services/api';

interface AccountContextType {
  accounts: TradingAccount[];
  selectedAccount: TradingAccount | null;
  selectAccount: (account: TradingAccount | null) => void;
  loading: boolean;
  refreshAccounts: () => Promise<void>;
  formatCurrency: (amount: number, currencyOverride?: string) => string;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<TradingAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getAccounts();
      if (res.accounts) {
        setAccounts(res.accounts);
        if (res.accounts.length > 0) {
          // If no account selected or previously selected account was deleted
          setSelectedAccount((prev) => {
            if (!prev) return res.accounts[0];
            const stillExists = res.accounts.find((a) => a.id === prev.id);
            return stillExists || res.accounts[0];
          });
        } else {
          setSelectedAccount(null);
        }
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  const selectAccount = (account: TradingAccount | null) => {
    setSelectedAccount(account);
  };

  const formatCurrency = (amount: number, currencyOverride?: string) => {
    const cur = currencyOverride || selectedAccount?.currency || 'USD';
    const isNegative = amount < 0;
    const absVal = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${isNegative ? '-' : ''}${cur === 'USD' ? '$' : cur === 'EUR' ? '€' : cur === 'GBP' ? '£' : cur + ' '}${absVal}`;
  };

  return (
    <AccountContext.Provider
      value={{
        accounts,
        selectedAccount,
        selectAccount,
        refreshAccounts,
        loading,
        formatCurrency,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) throw new Error('useAccount must be used within an AccountProvider');
  return context;
};
