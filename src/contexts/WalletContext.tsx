import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { User, Transaction, SavingsAccount } from '../types';
import toast from 'react-hot-toast';

interface WalletContextType {
  user: User | null;
  balance: number;
  transactions: Transaction[];
  savingsAccounts: SavingsAccount[];
  loading: boolean;
  updateUserBalance: (newBalance: number) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => Promise<void>;
  createSavingsAccount: (account: Omit<SavingsAccount, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateSavingsAccount: (id: string, updates: Partial<SavingsAccount>) => Promise<void>;
  refreshWalletData: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [loading, setLoading] = useState(false);

  // Load user data when auth state changes
  useEffect(() => {
    if (!currentUser) {
      setUser(null);
      setBalance(0);
      setTransactions([]);
      setSavingsAccounts([]);
      return;
    }

    loadUserData();
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Load user profile
      const savedUser = localStorage.getItem(`user_${currentUser.uid}`);
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setBalance(userData.balance || 0);
      } else {
        // Create new user profile
        const newUser: User = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || '',
          phoneNumber: '',
          balance: 1000, // Starting balance
          createdAt: new Date(),
          premiumStatus: false,
          kycVerified: false,
          profilePicture: currentUser.photoURL || ''
        };
        
        setUser(newUser);
        setBalance(newUser.balance);
        localStorage.setItem(`user_${currentUser.uid}`, JSON.stringify(newUser));
      }

      // Load transactions
      const savedTransactions = localStorage.getItem(`transactions_${currentUser.uid}`);
      if (savedTransactions) {
        const transactionData = JSON.parse(savedTransactions).map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp)
        }));
        setTransactions(transactionData);
      }

      // Load savings accounts
      const savedSavings = localStorage.getItem(`savings_${currentUser.uid}`);
      if (savedSavings) {
        const savingsData = JSON.parse(savedSavings).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          maturityDate: new Date(s.maturityDate)
        }));
        setSavingsAccounts(savingsData);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const updateUserBalance = async (newBalance: number) => {
    if (!currentUser || !user) return;

    try {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      setBalance(newBalance);
      localStorage.setItem(`user_${currentUser.uid}`, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Failed to update balance');
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    if (!currentUser) return;

    try {
      const newTransaction: Transaction = {
        ...transaction,
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };

      const updatedTransactions = [newTransaction, ...transactions];
      setTransactions(updatedTransactions);
      localStorage.setItem(`transactions_${currentUser.uid}`, JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to record transaction');
    }
  };

  const createSavingsAccount = async (account: Omit<SavingsAccount, 'id' | 'createdAt' | 'status'>) => {
    if (!currentUser) return;

    try {
      const newAccount: SavingsAccount = {
        ...account,
        id: `sav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        status: 'active'
      };

      const updatedSavings = [...savingsAccounts, newAccount];
      setSavingsAccounts(updatedSavings);
      localStorage.setItem(`savings_${currentUser.uid}`, JSON.stringify(updatedSavings));
    } catch (error) {
      console.error('Error creating savings account:', error);
      toast.error('Failed to create savings account');
    }
  };

  const updateSavingsAccount = async (id: string, updates: Partial<SavingsAccount>) => {
    if (!currentUser) return;

    try {
      const updatedSavings = savingsAccounts.map(account =>
        account.id === id ? { ...account, ...updates } : account
      );
      setSavingsAccounts(updatedSavings);
      localStorage.setItem(`savings_${currentUser.uid}`, JSON.stringify(updatedSavings));
    } catch (error) {
      console.error('Error updating savings account:', error);
      toast.error('Failed to update savings account');
    }
  };

  const refreshWalletData = async () => {
    await loadUserData();
  };

  const value = {
    user,
    balance,
    transactions,
    savingsAccounts,
    loading,
    updateUserBalance,
    addTransaction,
    createSavingsAccount,
    updateSavingsAccount,
    refreshWalletData
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};