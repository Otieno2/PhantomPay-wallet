import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Send, 
  History, 
  Gift, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  Award,
  Minus,
  Crown,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Zap,
  PiggyBank,
  Brain,
  Target,
  Plus
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { format, addDays } from 'date-fns';

const Dashboard: React.FC = () => {
  const { balance, rewardPoints, transactions, user } = useWallet();
  const { currentUser } = useAuth();

  const recentTransactions = transactions.slice(0, 5);

  const quickActions = [
    { name: 'Deposit', href: '/deposit', icon: Plus, color: 'from-green-500 to-green-600', description: 'Add funds' },
    { name: 'Transfer', href: '/transfer', icon: Send, color: 'from-blue-500 to-blue-600', description: 'Send money' },
    { name: 'Withdraw', href: '/withdraw', icon: Minus, color: 'from-red-500 to-red-600', description: 'Cash out' },
    { name: 'Loans', href: '/loans', icon: Target, color: 'from-green-500 to-green-600', description: 'Get loans' },
    { name: 'Savings', href: '/savings', icon: PiggyBank, color: 'from-emerald-500 to-emerald-600', description: 'Save money' },
    { name: 'Rewards', href: '/rewards', icon: Gift, color: 'from-purple-500 to-purple-600', description: 'Earn points' },
    { name: 'AI Coach', href: '/ai-assistant', icon: Brain, color: 'from-indigo-500 to-purple-600', description: 'Get advice' },
  ];

  const getTransactionIcon = (type: string, direction: string) => {
    if (type === 'send') return <ArrowUpRight className="h-5 w-5 text-red-500" />;
    if (type === 'receive') return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
    if (type === 'withdrawal') return <ArrowUpRight className="h-5 w-5 text-red-500" />;
    if (type === 'reward' || type === 'referral_bonus') return <Award className="h-5 w-5 text-yellow-500" />;
    return <History className="h-5 w-5 text-gray-500" />;
  };

  const getTransactionLabel = (type: string, direction: string) => {
    if (type === 'send') return direction === '+' ? 'Received' : 'Sent';
    if (type === 'receive') return 'Received';
    if (type === 'withdrawal') return 'Withdrawal';
    if (type === 'subscription') return 'Premium Subscription';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const isInternalTransfer = (description: string) => {
    return description.toLowerCase().includes('phantompay') || description.toLowerCase().includes('internal');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const premiumTier = user?.premiumStatus ? (user as any).premiumPlan || 'plus' : 'basic';

  return (
    <div className="space-y-8">
      {/* Welcome Header with Premium Badge */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {currentUser?.email?.split('@')[0] || 'User'}! 👋
            </h1>
            <p className="text-purple-100">
              Manage your finances with confidence and ease.
            </p>
          </div>
          {user?.premiumStatus && (
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full flex items-center">
              <Crown className="h-5 w-5 mr-2" />
              <span className="font-medium">{premiumTier.toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet Balance */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">💰 Wallet Balance</h2>
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(balance)}
            </p>
            <p className="text-sm text-blue-600 flex items-center">
              <span className="mr-1">↗</span>
              Available for spending
            </p>
          </div>
        </div>

        {/* Reward Points */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">🎁 Reward Points</h2>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Gift className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">
              {(rewardPoints || 0).toLocaleString()}
            </p>
            <p className="text-sm text-purple-600">
              Worth {formatCurrency((rewardPoints || 0) * 0.1)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">💳 Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.href}
                className="group p-4 rounded-xl border border-gray-200 hover:border-transparent hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900 text-center">{action.name}</p>
                <p className="text-xs text-gray-500 text-center mt-1">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">📊 Transaction History</h2>
          <Link 
            to="/transactions"
            className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center"
          >
            View All
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="space-y-4">
          {recentTransactions.length > 0 ? recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getTransactionIcon(transaction.type, transaction.direction)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">
                      {getTransactionLabel(transaction.type, transaction.direction)}
                    </p>
                    {(transaction.type === 'send' || transaction.type === 'receive') && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isInternalTransfer(transaction.description)
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {isInternalTransfer(transaction.description) ? 'Internal' : 'External'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {format(transaction.timestamp, 'MMM dd, yyyy • HH:mm')}
                  </p>
                  <p className="text-xs text-gray-400">💬 {transaction.description}</p>
                  {transaction.fee && transaction.fee > 0 && (
                    <p className="text-xs text-amber-600">
                      Fee: {formatCurrency(transaction.fee)}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.direction === '+' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {transaction.direction === '+' ? '🔼' : '🔽'} {transaction.direction}{formatCurrency(transaction.amount)}
                </p>
                <p className={`text-xs capitalize ${
                  transaction.status === 'completed' ? 'text-green-500' :
                  transaction.status === 'pending' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {transaction.status}
                </p>
              </div>
            </div>
          )) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">Start using PhantomPay to see your activity here</p>
            </div>
          )}
        </div>
      </div>

      {/* Premium Upgrade Screen */}
      {!user?.premiumStatus && (
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">🚀 Upgrade to Premium</h3>
              <p className="text-orange-100 mb-4">
                Get lower fees, higher rewards, and exclusive benefits
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <h4 className="font-medium mb-2">Plus (KES 200/month)</h4>
                  <ul className="text-sm text-orange-100 space-y-1">
                    <li>• 25% off P2P fees</li>
                    <li>• 2% cashback</li>
                    <li>• 24/7 chat support</li>
                  </ul>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <h4 className="font-medium mb-2">VIP (KES 500/month) 👑</h4>
                  <ul className="text-sm text-orange-100 space-y-1">
                    <li>• 50% off P2P fees</li>
                    <li>• 5% high-tier cashback</li>
                    <li>• AI Financial Coach 🤖</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Crown className="h-16 w-16 text-white mx-auto mb-4" />
              <div className="space-y-2">
                <Link
                  to="/premium"
                  className="block bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors"
                >
                  Upgrade to Plus 🚀
                </Link>
                <Link
                  to="/premium"
                  className="block bg-yellow-400 text-yellow-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-300 transition-colors"
                >
                  Become VIP 👑
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Status Display */}
      {user?.premiumStatus && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Crown className="h-5 w-5 text-purple-600 mr-2" />
                {premiumTier.toUpperCase()} Member Benefits Active
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {premiumTier === 'vip' ? '50%' : '25%'}
                  </p>
                  <p className="text-sm text-gray-600">Fee Discount</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {premiumTier === 'vip' ? '5%' : '2%'}
                  </p>
                  <p className="text-sm text-gray-600">Cashback</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">24/7</p>
                  <p className="text-sm text-gray-600">Support</p>
                </div>
              </div>
            </div>
            <Link
              to="/premium"
              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              Manage Plan →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;