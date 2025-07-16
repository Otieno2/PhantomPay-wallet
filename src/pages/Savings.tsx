import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PiggyBank, TrendingUp, Calendar, AlertTriangle, Plus, Coins, Crown, ToggleLeft, ToggleRight } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { MINIMUM_SAVINGS_DEPOSIT, calculateSavingsReturn, getSavingsRate } from '../utils/savingsCalculator';
import { format, differenceInDays, addDays } from 'date-fns';
import toast from 'react-hot-toast';

interface SavingsForm {
  amount: number;
  lockPeriod: number;
}

const Savings: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const { balance, savingsBalance, savingsAccounts, createSavingsAccount, withdrawFromSavings, loading, user } = useWallet();
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<SavingsForm>();

  const watchedAmount = watch('amount');
  const watchedLockPeriod = watch('lockPeriod');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const premiumTier = user?.premiumStatus ? (user as any).premiumPlan || 'plus' : 'basic';
  const savingsInterestRate = getSavingsRate(premiumTier);

  // Savings options with premium rates
  const SAVINGS_OPTIONS = [
    { months: 1, annualRate: savingsInterestRate, name: '1 Month' },
    { months: 3, annualRate: savingsInterestRate, name: '3 Months' },
    { months: 6, annualRate: savingsInterestRate, name: '6 Months' },
    { months: 12, annualRate: savingsInterestRate, name: '12 Months' }
  ];

  const getSelectedOption = () => {
    return SAVINGS_OPTIONS.find(option => option.months === Number(watchedLockPeriod));
  };

  const getProjectedReturns = () => {
    if (!watchedAmount || !watchedLockPeriod) return null;
    
    const selectedOption = getSelectedOption();
    if (!selectedOption) return null;

    return calculateSavingsReturn(watchedAmount, selectedOption.months, selectedOption.annualRate);
  };

  const onSubmit = async (data: SavingsForm) => {
    try {
      const selectedOption = SAVINGS_OPTIONS.find(option => option.months === Number(data.lockPeriod));
      if (!selectedOption) {
        toast.error('Invalid lock period selected');
        return;
      }

      await createSavingsAccount(data.amount, Number(data.lockPeriod), selectedOption.annualRate);
      toast.success('Savings account created successfully! 🎉');
      reset();
      setShowCreateForm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create savings account');
    }
  };

  const handleWithdraw = async (savingsId: string, isEarly: boolean) => {
    try {
      const confirmMessage = isEarly 
        ? 'Are you sure you want to withdraw early? You will incur a 5% penalty.'
        : 'Confirm withdrawal of matured savings?';
      
      if (window.confirm(confirmMessage)) {
        await withdrawFromSavings(savingsId, isEarly);
        toast.success('Withdrawal completed successfully! 💰');
      }
    } catch (error: any) {
      toast.error(error.message || 'Withdrawal failed');
    }
  };

  const projectedReturns = getProjectedReturns();
  const nextInterestDate = addDays(new Date(), 30 - new Date().getDate());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <PiggyBank className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">💹 Savings Panel</h1>
        <p className="text-gray-600">Grow your money with guaranteed returns</p>
      </div>

      {/* Savings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Interest Rate */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Interest Rate</h3>
            {user?.premiumStatus && (
              <div className="bg-purple-100 px-2 py-1 rounded-full flex items-center">
                <Crown className="h-3 w-3 text-purple-600 mr-1" />
                <span className="text-xs font-medium text-purple-800">{premiumTier.toUpperCase()}</span>
              </div>
            )}
          </div>
          <p className="text-4xl font-bold text-emerald-600 mb-2">{savingsInterestRate}%</p>
          <p className="text-sm text-gray-600">per annum</p>
          {user?.premiumStatus && (
            <p className="text-xs text-purple-600 mt-2">
              Premium bonus: +{savingsInterestRate - 6}% extra!
            </p>
          )}
        </div>

        {/* Total Saved */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Saved</h3>
            <div className="bg-green-100 p-2 rounded-lg">
              <PiggyBank className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{formatCurrency(savingsBalance)}</p>
          <p className="text-sm text-green-600">Earning interest</p>
        </div>

        {/* Upcoming Interest */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">💹 Next Interest</h3>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600 mb-2">
            {format(nextInterestDate, 'MMM dd')}
          </p>
          <p className="text-sm text-gray-600">
            Est. {formatCurrency(savingsBalance * (savingsInterestRate / 100) / 12)}
          </p>
        </div>
      </div>

      {/* Auto-save Toggle */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto-save Toggle</h3>
            <p className="text-gray-600">Automatically save 10% of all deposits to your savings account</p>
          </div>
          <button
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              autoSaveEnabled ? 'bg-emerald-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                autoSaveEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {autoSaveEnabled && (
          <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-sm text-emerald-800">
              ✅ Auto-save is enabled. 10% of your deposits will automatically go to savings.
            </p>
          </div>
        )}
      </div>

      {/* Savings Plans */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Savings Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAVINGS_OPTIONS.map((option) => (
            <div key={option.months} className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">{option.name}</h3>
                <div className="text-3xl font-bold text-emerald-600 mb-2">{option.annualRate}%</div>
                <p className="text-sm text-gray-600">Annual Interest</p>
                <div className="mt-4 text-xs text-gray-500">
                  <p>KES 10,000 → {formatCurrency(calculateSavingsReturn(10000, option.months, option.annualRate).total)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create New Savings */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Start Saving</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Savings
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Save
                </label>
                <input
                  {...register('amount', { 
                    required: 'Amount is required',
                    min: { value: MINIMUM_SAVINGS_DEPOSIT, message: `Minimum deposit is ${formatCurrency(MINIMUM_SAVINGS_DEPOSIT)}` },
                    max: { value: balance, message: 'Amount exceeds available balance' }
                  })}
                  type="number"
                  step="1"
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-colors"
                  placeholder={`Minimum ${formatCurrency(MINIMUM_SAVINGS_DEPOSIT)}`}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lock Period
                </label>
                <select
                  {...register('lockPeriod', { required: 'Please select a lock period' })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-colors"
                >
                  <option value="">Select lock period</option>
                  {SAVINGS_OPTIONS.map((option) => (
                    <option key={option.months} value={option.months}>
                      {option.name} - {option.annualRate}% Annual Interest
                    </option>
                  ))}
                </select>
                {errors.lockPeriod && (
                  <p className="mt-1 text-sm text-red-600">{errors.lockPeriod.message}</p>
                )}
              </div>

              {/* Projection */}
              {projectedReturns && (
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <h3 className="font-medium text-emerald-900 mb-2">Projected Returns</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-emerald-700">Initial Deposit</p>
                      <p className="font-semibold text-emerald-900">{formatCurrency(watchedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-emerald-700">Total at Maturity</p>
                      <p className="font-semibold text-emerald-900">{formatCurrency(projectedReturns.total)}</p>
                    </div>
                    <div>
                      <p className="text-emerald-700">Interest Earned</p>
                      <p className="font-semibold text-emerald-900">{formatCurrency(projectedReturns.interest)}</p>
                    </div>
                    <div>
                      <p className="text-emerald-700">Lock Period</p>
                      <p className="font-semibold text-emerald-900">{getSelectedOption()?.name}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-6 rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? 'Creating...' : 'Create Savings Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Active Savings Accounts */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Savings Accounts</h2>
        
        {savingsAccounts.length > 0 ? (
          <div className="space-y-4">
            {savingsAccounts.map((account) => {
              const daysToMaturity = differenceInDays(account.maturityDate, new Date());
              const isMatured = daysToMaturity <= 0;
              const currentValue = account.currentValue || account.principal;
              const earnedInterest = account.earnedInterest || 0;

              return (
                <div key={account.id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {account.lockPeriod} Month Savings
                      </h3>
                      <p className="text-sm text-gray-600">
                        {account.annualInterestRate}% Annual Interest
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isMatured ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isMatured ? 'Matured' : 'Active'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Principal</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(account.principal)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Current Value</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(currentValue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Interest Earned</p>
                      <p className="font-semibold text-emerald-600">{formatCurrency(earnedInterest)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {isMatured ? 'Matured On' : 'Matures On'}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {format(account.maturityDate, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  {!isMatured && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm text-blue-800">
                          {daysToMaturity} days remaining until maturity
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleWithdraw(account.id, false)}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-2 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isMatured ? 'Withdraw' : 'Withdraw at Maturity'}
                    </button>
                    {!isMatured && (
                      <button
                        onClick={() => handleWithdraw(account.id, true)}
                        disabled={loading}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Early Withdrawal
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Coins className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Savings Accounts</h3>
            <p className="text-gray-500 mb-4">Start saving today and watch your money grow!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2 rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200"
            >
              Create Your First Savings Account
            </button>
          </div>
        )}
      </div>

      {/* Important Notes */}
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-amber-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-900 mb-2">Important Information</h3>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Minimum deposit: {formatCurrency(MINIMUM_SAVINGS_DEPOSIT)}</li>
              <li>• Interest is compounded monthly</li>
              <li>• Early withdrawal incurs a 5% penalty on principal amount</li>
              <li>• Funds are locked for the selected period</li>
              <li>• Interest rates are guaranteed for the lock period</li>
              {user?.premiumStatus && (
                <li>• 🎉 Premium bonus: Earning {savingsInterestRate}% instead of 6%!</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Savings;