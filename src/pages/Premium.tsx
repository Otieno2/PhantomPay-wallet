import React, { useState } from 'react';
import { Crown, Check, Star, Zap, Shield, Headphones, TrendingUp, Gift, Brain, Lock, Trophy, Users } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import toast from 'react-hot-toast';

interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  color: string;
  popular?: boolean;
  features: string[];
  benefits: {
    savingsInterest: string;
    withdrawalFee: string;
    financialCoach: boolean;
    loanAccess: string;
    support: string;
    cashback: string;
    analytics: string;
    security: string;
    gamification: boolean;
  };
}

const Premium: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('plus');
  const { user, balance, updateUserPremiumStatus, addTransaction, loading } = useWallet();
  const [subscribing, setSubscribing] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const plans: PremiumPlan[] = [
    {
      id: 'basic',
      name: 'PhantomPay Basic',
      price: 0,
      period: 'Forever',
      color: 'from-gray-500 to-gray-600',
      features: [
        'Basic wallet functionality',
        'Standard transaction fees',
        'Basic savings (6% interest)',
        'Email support only',
        'Basic spending analytics',
        'PIN security only'
      ],
      benefits: {
        savingsInterest: '6% per annum',
        withdrawalFee: 'Standard',
        financialCoach: false,
        loanAccess: 'None',
        support: 'Email only',
        cashback: 'None',
        analytics: 'Basic only',
        security: 'Basic PIN only',
        gamification: false
      }
    },
    {
      id: 'plus',
      name: 'PhantomPay Plus',
      price: 200,
      period: 'per month',
      color: 'from-purple-500 to-indigo-600',
      popular: true,
      features: [
        'Reduced transaction fees (25% off P2P)',
        'Higher savings interest (12% annual)',
        '24/7 chat support',
        '2% cashback on eligible merchants',
        'Advanced spending analytics',
        'Email + OTP security',
        'Badges & challenges',
        'Premium badge'
      ],
      benefits: {
        savingsInterest: '12% per annum',
        withdrawalFee: 'Reduced (-30%)',
        financialCoach: false,
        loanAccess: 'Limited',
        support: '24/7 Chat Support',
        cashback: '2% on eligible merchants',
        analytics: 'Advanced Charts',
        security: 'Email + OTP',
        gamification: true
      }
    },
    {
      id: 'vip',
      name: 'PhantomPay VIP',
      price: 500,
      period: 'per month',
      color: 'from-yellow-500 to-orange-600',
      features: [
        'Lowest transaction fees (50% off P2P)',
        'Highest savings interest (18% annual)',
        'AI Financial Coach 🤖',
        'VIP loan access',
        'VIP priority support 24/7',
        '5% high-tier cashback',
        'Advanced + predictive analytics',
        'Email + SMS + device locking',
        'Leaderboard + premium events',
        'Free scheduled payments',
        'Personal account manager'
      ],
      benefits: {
        savingsInterest: '18% per annum 💎',
        withdrawalFee: 'Super Low (-60%)',
        financialCoach: true,
        loanAccess: 'VIP Loans',
        support: 'VIP Priority 🎧',
        cashback: '5% High-Tier Cashback',
        analytics: 'Advanced + Predictive',
        security: 'Email + SMS + Device Locking',
        gamification: true
      }
    }
  ];

  const handleSubscribe = async (planId: string) => {
    setSubscribing(true);
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      if (plan.price > balance) {
        toast.error('Insufficient balance for subscription');
        return;
      }

      // Simulate subscription process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update premium status
      const premiumData = {
        premiumStatus: planId !== 'basic',
        premiumPlan: planId,
        premiumExpiry: planId !== 'basic' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined
      };

      await updateUserPremiumStatus(premiumData);
      
      // Deduct subscription fee from balance and add transaction
      if (plan.price > 0) {
        await addTransaction({
          uid: user?.uid || '',
          type: 'subscription',
          amount: plan.price,
          description: `${plan.name} subscription`,
          status: 'completed',
          direction: '-'
        });
      }
      
      toast.success(`Successfully subscribed to ${plan.name}! 🎉`);
    } catch (error: any) {
      toast.error(error.message || 'Subscription failed');
    } finally {
      setSubscribing(false);
    }
  };

  const currentPlan = user?.premiumStatus ? (user as any).premiumPlan || 'plus' : 'basic';

  // Fee comparison example
  const exampleAmount = 10000;
  const feeComparison = plans.map(plan => {
    let baseFee = 60; // Base fee for 10k transfer
    let discount = 0;
    
    if (plan.id === 'plus') discount = 0.25;
    if (plan.id === 'vip') discount = 0.50;
    
    const finalFee = Math.round(baseFee * (1 - discount));
    return { plan: plan.name, fee: finalFee };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Premium Plans</h1>
        <p className="text-gray-600 text-lg">Unlock exclusive benefits and maximize your financial potential</p>
      </div>

      {/* Current Status */}
      {user && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
              <p className="text-blue-600 font-medium flex items-center">
                {plans.find(p => p.id === currentPlan)?.name}
                {user.premiumStatus && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Crown className="h-3 w-3 mr-1" />
                    Active
                  </span>
                )}
              </p>
              {user.premiumStatus && (user as any).premiumExpiry && (
                <p className="text-sm text-gray-600 mt-1">
                  Expires: {new Date((user as any).premiumExpiry).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(balance)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Fee Savings Example */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Fee Savings Example: P2P Transfer of {formatCurrency(exampleAmount)}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feeComparison.map((item, index) => (
            <div key={index} className="bg-white rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">{item.plan}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(item.fee)}</p>
              {index > 0 && (
                <p className="text-sm text-green-600">
                  Save {formatCurrency(feeComparison[0].fee - item.fee)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 ${
              selectedPlan === plan.id 
                ? 'border-purple-500 shadow-xl scale-105' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular 🔥
                </div>
              </div>
            )}

            <div className="p-6">
              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {plan.id === 'basic' && <Shield className="h-8 w-8 text-white" />}
                  {plan.id === 'plus' && <Star className="h-8 w-8 text-white" />}
                  {plan.id === 'vip' && <Crown className="h-8 w-8 text-white" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600 ml-1">/{plan.period}</span>
                  )}
                </div>
              </div>

              {/* Key Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm font-medium">{plan.benefits.savingsInterest}</span>
                </div>
                <div className="flex items-center">
                  <Zap className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm">{plan.benefits.withdrawalFee} fees</span>
                </div>
                {plan.benefits.financialCoach && (
                  <div className="flex items-center">
                    <Brain className="h-4 w-4 text-purple-500 mr-2" />
                    <span className="text-sm">AI Financial Coach 🤖</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Headphones className="h-4 w-4 text-orange-500 mr-2" />
                  <span className="text-sm">{plan.benefits.support}</span>
                </div>
                {plan.benefits.cashback !== 'None' && (
                  <div className="flex items-center">
                    <Gift className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-sm">{plan.benefits.cashback}</span>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {plan.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-700">{feature}</span>
                  </div>
                ))}
                {plan.features.length > 4 && (
                  <p className="text-xs text-gray-500 ml-6">+{plan.features.length - 4} more features</p>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setSelectedPlan(plan.id);
                  if (plan.id !== 'basic' && plan.id !== currentPlan) {
                    handleSubscribe(plan.id);
                  }
                }}
                disabled={subscribing || loading || plan.id === currentPlan}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  plan.id === currentPlan
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : plan.id === 'basic'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg transform hover:scale-105`
                }`}
              >
                {(subscribing || loading) && selectedPlan === plan.id ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : plan.id === currentPlan ? (
                  'Current Plan ✅'
                ) : plan.id === 'basic' ? (
                  user?.premiumStatus ? 'Downgrade to Basic' : 'Current Plan'
                ) : plan.id === 'plus' ? (
                  'Upgrade to Plus 🚀'
                ) : (
                  'Become VIP 👑'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">📊 Complete Feature Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                {plans.map((plan) => (
                  <th key={plan.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  💰 Savings Interest
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {plan.benefits.savingsInterest}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  🔁 Withdrawal Fees
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {plan.benefits.withdrawalFee}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  🧠 Financial Coach
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {plan.benefits.financialCoach ? '✅ AI Assistant' : '❌'}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  🏦 Loan Access
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {plan.benefits.loanAccess}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  💬 Support
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {plan.benefits.support}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  💸 Cashback
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {plan.benefits.cashback}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  📊 Analytics
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {plan.benefits.analytics}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  🔐 Security
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {plan.benefits.security}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  🎮 Gamification
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {plan.benefits.gamification ? '✅ Badges + Challenges' : '❌'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Benefits Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Higher Returns 💎</h3>
          <p className="text-sm text-gray-600">Earn up to 18% annual interest on your savings with VIP plan</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Lower Fees 🔥</h3>
          <p className="text-sm text-gray-600">Save up to 60% on withdrawal fees with VIP plan</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">AI Coach 🤖</h3>
          <p className="text-sm text-gray-600">Get personalized financial advice from our AI assistant</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">VIP Status 👑</h3>
          <p className="text-sm text-gray-600">Access exclusive features and premium events</p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">😘 The TL;DR Vibe</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-80" />
              <h4 className="font-bold mb-2">Basic = Free, casual use</h4>
              <p className="text-sm opacity-90">Perfect for getting started</p>
            </div>
            <div>
              <Star className="h-12 w-12 mx-auto mb-2" />
              <h4 className="font-bold mb-2">Plus = Power user, better rates</h4>
              <p className="text-sm opacity-90">More insights and savings</p>
            </div>
            <div>
              <Crown className="h-12 w-12 mx-auto mb-2" />
              <h4 className="font-bold mb-2">VIP = God-tier baller status 👑</h4>
              <p className="text-sm opacity-90">AI coach, insane savings, top security 🔐</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;