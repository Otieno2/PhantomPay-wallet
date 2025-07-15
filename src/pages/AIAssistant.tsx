import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Brain, Send, User, Bot, TrendingUp, DollarSign, Target, PiggyBank, Crown, Zap } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const AIAssistant: React.FC = () => {
  const { user, balance, savingsBalance, rewardPoints, transactions } = useWallet();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      type: 'ai',
      content: `Hello ${currentUser?.email?.split('@')[0] || 'there'}! 👋 I'm your AI Financial Coach. I can help you with budgeting, savings goals, investment advice, and analyzing your spending patterns. What would you like to know about your finances today?`,
      timestamp: new Date(),
      suggestions: [
        'Analyze my spending patterns',
        'Help me create a savings plan',
        'What are my investment options?',
        'How can I improve my financial health?'
      ]
    };
    setMessages([welcomeMessage]);
  }, [currentUser]);

  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    let suggestions: string[] = [];

    // Analyze user's financial data
    const totalSpent = transactions
      .filter(t => t.direction === '-' && t.type !== 'savings_deposit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlySpending = totalSpent; // Simplified for demo
    const savingsRate = savingsBalance > 0 ? (savingsBalance / (balance + savingsBalance)) * 100 : 0;
    const premiumTier = user?.premiumStatus ? (user as any).premiumPlan || 'plus' : 'basic';

    if (lowerMessage.includes('spending') || lowerMessage.includes('analyze')) {
      response = `📊 **Spending Analysis**

Based on your transaction history:
• Total spent: ${formatCurrency(totalSpent)}
• Average transaction: ${formatCurrency(totalSpent / Math.max(transactions.length, 1))}
• Most frequent: ${transactions.length > 0 ? 'Transfers' : 'No transactions yet'}

💡 **Recommendations:**
• Your spending looks ${monthlySpending < 10000 ? 'conservative' : monthlySpending < 50000 ? 'moderate' : 'high'}
• Consider setting up automatic savings to build wealth
• Track your expenses by category for better insights`;

      suggestions = ['Set up a budget plan', 'Create savings goals', 'Investment recommendations'];

    } else if (lowerMessage.includes('savings') || lowerMessage.includes('save')) {
      response = `🏦 **Savings Strategy**

Current Status:
• Savings Balance: ${formatCurrency(savingsBalance)}
• Savings Rate: ${savingsRate.toFixed(1)}%
• Premium Tier: ${premiumTier.toUpperCase()} (${premiumTier === 'vip' ? '18%' : premiumTier === 'plus' ? '12%' : '6%'} interest)

💡 **Personalized Advice:**
${savingsRate < 10 ? '• Start with the 50/30/20 rule: 50% needs, 30% wants, 20% savings' : '• Great savings rate! Consider diversifying into different savings periods'}
• ${premiumTier === 'basic' ? 'Upgrade to Premium for higher interest rates (up to 18%)' : 'Your premium status gives you excellent interest rates!'}
• Set up automatic transfers to make saving effortless`;

      suggestions = ['Calculate savings goals', 'Compare savings options', 'Premium upgrade benefits'];

    } else if (lowerMessage.includes('investment') || lowerMessage.includes('invest')) {
      response = `📈 **Investment Guidance**

Based on your profile:
• Available for investment: ${formatCurrency(balance)}
• Risk tolerance: ${balance > 50000 ? 'Moderate to High' : 'Conservative'}
• Time horizon: Consider your age and goals

💡 **Recommended Strategy:**
• Start with PhantomPay savings (guaranteed ${premiumTier === 'vip' ? '18%' : premiumTier === 'plus' ? '12%' : '6%'} returns)
• Emergency fund: 3-6 months of expenses
• Consider diversified portfolios after building your base

⚠️ **Important:** This is educational guidance. Always do your own research and consider consulting a licensed financial advisor for major investment decisions.`;

      suggestions = ['Emergency fund calculator', 'Risk assessment', 'Savings vs investment'];

    } else if (lowerMessage.includes('budget') || lowerMessage.includes('plan')) {
      response = `📋 **Budget Planning**

Recommended Budget Allocation:
• **Needs (50%):** ${formatCurrency(balance * 0.5)} - Rent, food, utilities
• **Wants (30%):** ${formatCurrency(balance * 0.3)} - Entertainment, dining out
• **Savings (20%):** ${formatCurrency(balance * 0.2)} - Future goals, emergency fund

💡 **Smart Tips:**
• Use PhantomPay's automatic savings feature
• Track spending with our transaction history
• Set up alerts for budget limits
• Review and adjust monthly`;

      suggestions = ['Set spending limits', 'Automatic savings setup', 'Track expenses'];

    } else if (lowerMessage.includes('loan') || lowerMessage.includes('borrow')) {
      response = `🎯 **Loan Guidance**

PhantomPay Loan Features:
• Borrow up to 80% of your savings value
• Interest rates: Basic 15%, Plus 12%, VIP 8%
• No credit checks needed - savings-backed
• Automatic repayment from savings if needed

💡 **Before Taking a Loan:**
• Ensure you have a repayment plan
• Consider if the expense is necessary
• Compare with other funding options
• Remember: loans should build wealth, not drain it`;

      suggestions = ['Loan calculator', 'Repayment strategies', 'Alternatives to borrowing'];

    } else if (lowerMessage.includes('premium') || lowerMessage.includes('upgrade')) {
      response = `👑 **Premium Benefits Analysis**

Current: ${premiumTier.toUpperCase()} tier

**Upgrade Benefits:**
${premiumTier === 'basic' ? `
• **Plus (KES 200/month):** 12% savings interest, 25% fee discount, 2% cashback
• **VIP (KES 500/month):** 18% savings interest, 50% fee discount, 5% cashback, AI coach
` : premiumTier === 'plus' ? `
• **VIP (KES 500/month):** 18% savings interest, 50% fee discount, 5% cashback, AI coach
• You're already enjoying Plus benefits!
` : '• You have the highest tier with maximum benefits!'}

💡 **ROI Analysis:**
${premiumTier === 'basic' && savingsBalance > 10000 ? `With ${formatCurrency(savingsBalance)} in savings, Plus tier would earn you an extra ${formatCurrency(savingsBalance * 0.06 / 12)} monthly!` : 'Your current tier is optimized for your usage pattern.'}`;

      suggestions = ['Calculate upgrade ROI', 'Compare all tiers', 'Premium features guide'];

    } else if (lowerMessage.includes('goal') || lowerMessage.includes('target')) {
      response = `🎯 **Financial Goals Setting**

SMART Goals Framework:
• **Specific:** Clear target amount and purpose
• **Measurable:** Track progress regularly
• **Achievable:** Realistic based on income
• **Relevant:** Aligned with your priorities
• **Time-bound:** Set deadlines

💡 **Popular Goals:**
• Emergency fund: 6 months expenses
• House down payment: 20% of property value
• Vacation fund: Set amount by specific date
• Retirement: Start early for compound growth

**Action Steps:**
1. Choose your top 3 financial goals
2. Calculate required monthly savings
3. Set up automatic transfers
4. Review progress monthly`;

      suggestions = ['Emergency fund calculator', 'House savings plan', 'Retirement planning'];

    } else {
      response = `🤖 I'm here to help with your financial questions! I can assist with:

💰 **Budgeting & Spending**
• Analyze your transaction patterns
• Create personalized budgets
• Track expenses and set limits

🏦 **Savings & Investments**
• Savings strategies and goals
• Interest rate optimization
• Investment guidance

🎯 **Loans & Credit**
• Loan calculations and advice
• Repayment strategies
• Credit building tips

👑 **Premium Features**
• Tier comparison and ROI analysis
• Feature recommendations
• Upgrade benefits

What specific area would you like help with?`;

      suggestions = [
        'Analyze my spending patterns',
        'Help me create a savings plan',
        'What are my investment options?',
        'Should I upgrade to premium?'
      ];
    }

    return {
      id: Date.now().toString(),
      type: 'ai',
      content: response,
      timestamp: new Date(),
      suggestions
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🤖 AI Financial Coach</h1>
        <p className="text-gray-600">Get personalized financial advice powered by AI</p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Balance</p>
              <p className="text-xl font-bold">{formatCurrency(balance)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Savings</p>
              <p className="text-xl font-bold">{formatCurrency(savingsBalance)}</p>
            </div>
            <PiggyBank className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Rewards</p>
              <p className="text-xl font-bold">{(rewardPoints || 0).toLocaleString()}</p>
            </div>
            <Zap className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Tier</p>
              <p className="text-xl font-bold">{user?.premiumStatus ? (user as any).premiumPlan?.toUpperCase() || 'PLUS' : 'BASIC'}</p>
            </div>
            <Crown className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-[600px] flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center mr-3">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Financial Coach</h3>
              <p className="text-sm text-gray-600">Online • Ready to help</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="h-5 w-5 text-white" />
                    ) : (
                      <Bot className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {format(message.timestamp, 'HH:mm')}
                    </div>
                  </div>
                </div>
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left px-3 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about budgeting, savings, investments, or any financial question..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-colors"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Disclaimer:</strong> This AI assistant provides educational financial guidance based on your PhantomPay data. 
          It's not a substitute for professional financial advice. Always consult with qualified financial advisors for major financial decisions.
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;