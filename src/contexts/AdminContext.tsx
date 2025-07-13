import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { AdminUser, RevenueRecord, AdminWallet, PlatformStats } from '../types/admin';
import toast from 'react-hot-toast';

interface AdminContextType {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  adminWallet: AdminWallet | null;
  revenueRecords: RevenueRecord[];
  platformStats: PlatformStats | null;
  collectRevenue: (amount: number, type: string, sourceTransactionId: string, sourceUserId: string, description: string) => Promise<void>;
  withdrawFromAdminWallet: (amount: number, secretCode: string) => Promise<void>;
  transferFromAdminWallet: (amount: number, recipient: string, secretCode: string) => Promise<void>;
  refreshAdminData: () => Promise<void>;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// Admin email addresses - in production, this would be in a secure database
const ADMIN_EMAILS = [
  'admin@phantompay.com',
  'superadmin@phantompay.com',
  'revenue@phantompay.com'
];

// Secret code for admin operations - in production, this would be more secure
const ADMIN_SECRET_CODE = 'PHANTOM2024';

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminWallet, setAdminWallet] = useState<AdminWallet | null>(null);
  const [revenueRecords, setRevenueRecords] = useState<RevenueRecord[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    if (!currentUser) {
      setIsAdmin(false);
      setAdminUser(null);
      setAdminWallet(null);
      setRevenueRecords([]);
      setPlatformStats(null);
      return;
    }

    const checkAdminStatus = async () => {
      try {
        // Check if user email is in admin list
        const userIsAdmin = ADMIN_EMAILS.includes(currentUser.email || '');
        setIsAdmin(userIsAdmin);

        if (userIsAdmin) {
          await initializeAdminUser();
          await initializeAdminWallet();
          await loadPlatformStats();
          await loadRevenueRecords();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  const initializeAdminUser = async () => {
    if (!currentUser) return;

    try {
      // Mock admin user data
      const newAdmin: AdminUser = {
        uid: currentUser.uid,
        email: currentUser.email || '',
        role: currentUser.email === 'superadmin@phantompay.com' ? 'super_admin' : 'admin',
        permissions: ['view_revenue', 'manage_users', 'view_analytics', 'withdraw_funds', 'transfer_funds'],
        createdAt: new Date()
      };

      setAdminUser(newAdmin);
    } catch (error) {
      console.error('Error initializing admin user:', error);
    }
  };

  const initializeAdminWallet = async () => {
    if (!currentUser) return;

    try {
      // Mock admin wallet data - in production this would come from database
      const savedWallet = localStorage.getItem('admin_wallet');
      let walletData: AdminWallet;

      if (savedWallet) {
        walletData = JSON.parse(savedWallet);
      } else {
        walletData = {
          uid: 'admin_wallet',
          balance: 0, // Fresh start - no balance
          totalRevenue: 0,
          totalExpenses: 0,
          monthlyExpenses: 0,
          dailyExpenses: 0,
          monthlyRevenue: 0,
          dailyRevenue: 0,
          lastUpdated: new Date()
        };
        localStorage.setItem('admin_wallet', JSON.stringify(walletData));
      }

      setAdminWallet(walletData);
    } catch (error) {
      console.error('Error initializing admin wallet:', error);
    }
  };

  const loadPlatformStats = async () => {
    try {
      // Mock platform stats
      const mockStats: PlatformStats = {
        totalUsers: 0,
        activeUsers: 0,
        premiumUsers: 0,
        totalTransactions: 0,
        totalVolume: 0,
        averageTransactionSize: 0,
        totalSavings: 0,
        totalLoansIssued: 0,
        totalLoanValue: 0,
        overdueLoans: 0,
        totalExpenses: 0,

        aiAssistantUsage: 0,
        conversionRate: 0
      };

      setPlatformStats(mockStats);
    } catch (error) {
      console.error('Error loading platform stats:', error);
    }
  };

  const loadRevenueRecords = async () => {
    try {

      // Load revenue records from localStorage
      const savedRecords = localStorage.getItem('admin_revenue_records');
      if (savedRecords) {
        const records = JSON.parse(savedRecords).map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp)
        }));
        setRevenueRecords(records);
      } else {
        setRevenueRecords([]);
      }
    } catch (error) {
      console.error('Error loading revenue records:', error);
    }
  };

  // This function now handles both revenue (positive amount) and expenses (negative amount)
  const collectRevenue = async ( // Renamed from collectRevenue to processAdminFinancialEvent for clarity
    type: string, 
    sourceTransactionId: string, 
    sourceUserId: string, 
    description: string,
    amount: number // Amount is now the last parameter
  ) => {
    if (!isAdmin || !adminWallet) return;

    try {
      // Add revenue record
      const newRecord: RevenueRecord = {
        id: `rev_${Date.now()}`,
        type: type as any, // Cast to any because type can be revenue or expense
        amount,
        sourceTransactionId,
        sourceUserId,
        timestamp: new Date(),
        description,
        status: 'collected', // Assuming all collected/deducted are 'collected'
        category: amount > 0 ? 'revenue' : 'expense' // Categorize based on amount
      };

      setRevenueRecords(prev => [newRecord, ...prev]);
      
      // Save to localStorage
      const updatedRecords = [newRecord, ...revenueRecords];
      localStorage.setItem('admin_revenue_records', JSON.stringify(updatedRecords));

      // Update admin wallet
      const updatedWallet = {
        ...adminWallet,
        balance: adminWallet.balance + amount,
        totalRevenue: amount > 0 ? adminWallet.totalRevenue + amount : adminWallet.totalRevenue,
        totalExpenses: amount < 0 ? adminWallet.totalExpenses + Math.abs(amount) : adminWallet.totalExpenses,
        monthlyRevenue: amount > 0 ? adminWallet.monthlyRevenue + amount : adminWallet.monthlyRevenue,
        monthlyExpenses: amount < 0 ? adminWallet.monthlyExpenses + Math.abs(amount) : adminWallet.monthlyExpenses,
        dailyRevenue: amount > 0 ? adminWallet.dailyRevenue + amount : adminWallet.dailyRevenue,
        dailyExpenses: amount < 0 ? adminWallet.dailyExpenses + Math.abs(amount) : adminWallet.dailyExpenses,
        lastUpdated: new Date()
      };

      setAdminWallet(updatedWallet);
      localStorage.setItem('admin_wallet', JSON.stringify(updatedWallet));

    } catch (error) {
      console.error('Error collecting revenue:', error);
      toast.error('Failed to collect revenue');
    }
  };

  const withdrawFromAdminWallet = async (amount: number, secretCode: string) => {
    if (!isAdmin || !adminWallet) {
      toast.error('Unauthorized withdrawal attempt');
      return;
    }

    // Validate secret code
    if (secretCode !== ADMIN_SECRET_CODE) {
      toast.error('Invalid admin secret code');
      return;
    }

    // Validate amount
    if (amount <= 0 || amount > adminWallet.balance) {
      toast.error('Invalid withdrawal amount');
      return;
    }

    try {
      setLoading(true);

      // Add withdrawal record
      // Use the collectRevenue function which now handles both revenue and expenses
      await collectRevenue(
        'admin_withdrawal', // New type for admin-initiated withdrawals
        `admin_withdrawal_${Date.now()}`,
        currentUser?.uid || 'admin',
        `Admin withdrawal of ${amount.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}`,
        -amount // Pass negative amount for expense
      );

      // The admin wallet balance is already updated by collectRevenue,
      // but we need to ensure totalExpenses are also updated.
      // The collectRevenue function now handles this categorization.

      // Old manual update (now handled by collectRevenue):
      // const updatedWallet = {
      //   ...adminWallet,
      //   balance: adminWallet.balance - amount,
      //   lastUpdated: new Date()
      // };
      // Save to localStorage
      const updatedRecords = [withdrawalRecord, ...revenueRecords];
      localStorage.setItem('admin_revenue_records', JSON.stringify(updatedRecords));

      // Update admin wallet
      const updatedWallet = {
        ...adminWallet,
        balance: adminWallet.balance - amount,
        lastUpdated: new Date()
      };

      setAdminWallet(updatedWallet);
      localStorage.setItem('admin_wallet', JSON.stringify(updatedWallet));

      toast.success(`Successfully withdrew ${amount.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })} 💰`);

    } catch (error) {
      console.error('Error withdrawing from admin wallet:', error);
      toast.error('Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const transferFromAdminWallet = async (amount: number, recipient: string, secretCode: string) => {
    if (!isAdmin || !adminWallet) {
      toast.error('Unauthorized transfer attempt');
      return;
    }

    // Validate secret code
    if (secretCode !== ADMIN_SECRET_CODE) {
      toast.error('Invalid admin secret code');
      return;
    }

    // Validate amount
    if (amount <= 0 || amount > adminWallet.balance) {
      toast.error('Invalid transfer amount');
      return;
    }

    if (!recipient.trim()) {
      toast.error('Recipient is required');
      return;
    }

    try {
      setLoading(true);

      // Add transfer record
      // Use the collectRevenue function which now handles both revenue and expenses
      await collectRevenue(
        'admin_transfer', // New type for admin-initiated transfers
        `admin_transfer_${Date.now()}`,
        currentUser?.uid || 'admin',
        `Admin transfer of ${amount.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })} to ${recipient}`,
        -amount // Pass negative amount for expense
      );

      // The admin wallet balance is already updated by collectRevenue,
      // but we need to ensure totalExpenses are also updated.
      // The collectRevenue function now handles this categorization.

      // Old manual update (now handled by collectRevenue):
      // const updatedWallet = {
      //   ...adminWallet,
      //   balance: adminWallet.balance - amount,
      //   lastUpdated: new Date()
      // };
      // Save to localStorage
      const updatedRecords = [transferRecord, ...revenueRecords];
      localStorage.setItem('admin_revenue_records', JSON.stringify(updatedRecords));

      // Update admin wallet
      const updatedWallet = {
        ...adminWallet,
        balance: adminWallet.balance - amount,
        lastUpdated: new Date()
      };

      setAdminWallet(updatedWallet);
      localStorage.setItem('admin_wallet', JSON.stringify(updatedWallet));

      toast.success(`Successfully transferred ${amount.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })} to ${recipient} 💸`);

    } catch (error) {
      console.error('Error transferring from admin wallet:', error);
      toast.error('Failed to process transfer');
    } finally {
      setLoading(false);
    }
  };

  const refreshAdminData = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      await Promise.all([
        initializeAdminWallet(),
        loadPlatformStats(),
        loadRevenueRecords()
      ]);
      toast.success('Admin data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing admin data:', error);
      toast.error('Failed to refresh admin data');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAdmin,
    adminUser,
    adminWallet,
    revenueRecords,
    platformStats,
    collectRevenue,
    withdrawFromAdminWallet,
    transferFromAdminWallet,
    refreshAdminData,
    loading
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};