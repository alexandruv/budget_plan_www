// Shared state for Budget Plan mobile app prototype
const { useState, useEffect, useMemo, createContext, useContext } = React;

const AppStateContext = createContext(null);
const PlatformContext = createContext('ios');

const DEFAULT_CATEGORIES = [
  { id: 'rent',     name: 'Rent',         emoji: '', allocated: 1600, spent: 1600 },
  { id: 'grocery',  name: 'Groceries',    emoji: '', allocated: 600,  spent: 126 },
  { id: 'transit',  name: 'Transit',      emoji: '', allocated: 180,  spent: 94 },
  { id: 'dining',   name: 'Dining Out',   emoji: '', allocated: 150,  spent: 117 },
  { id: 'gas',      name: 'Gas',          emoji: '', allocated: 180,  spent: 212 },
  { id: 'subs',     name: 'Subscriptions',emoji: '', allocated: 120,  spent: 42 },
  { id: 'savings',  name: 'Savings',      emoji: '', allocated: 1450, spent: 0 },
];

const SEEDED_INCOME = '4280';

const DEFAULT_SAVINGS_GOALS = [
  { id: 'emergency', name: 'Emergency fund',  target: 10000, saved: 6420, monthly: 400 },
  { id: 'vacation',  name: 'Lisbon trip',     target: 3500,  saved: 1280, monthly: 200 },
  { id: 'laptop',    name: 'New laptop',      target: 2400,  saved: 900,  monthly: 150 },
];

const DEFAULT_LOANS = [
  { id: 'l1', kind: 'owe',  party: 'Dad',       amount: 1200, note: 'Car repair help',   due: 'Jun 1' },
  { id: 'l2', kind: 'owed', party: 'Maya',      amount: 84,   note: 'Concert tickets',   due: 'May 12' },
  { id: 'l3', kind: 'self', party: 'From Gas',  amount: 32,   note: 'Overage Apr 22',    due: 'May 1' },
  { id: 'l4', kind: 'owed', party: 'Jordan',    amount: 45,   note: 'Dinner split',      due: null },
];

function AppStateProvider({ children }) {
  const [screen, _setScreen] = useState('welcome');
  const [income, setIncome] = useState('');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [savingsGoals, setSavingsGoals] = useState(DEFAULT_SAVINGS_GOALS);
  const [loans, setLoans] = useState(DEFAULT_LOANS);

  // When jumping into a post-onboarding screen without data, seed demo values
  const setScreen = (next) => {
    const postOnboarding = ['dashboard', 'category', 'add-tx', 'settings', 'savings', 'loans', 'reset', 'allocate'];
    if (postOnboarding.includes(next) && !income) {
      setIncome(SEEDED_INCOME);
    }
    _setScreen(next);
  };
  const [activeCategory, setActiveCategory] = useState(null);
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('grocery');
  const [completedOnboarding, setCompletedOnboarding] = useState(false);
  const [toast, setToast] = useState(null);

  const totalAllocated = categories.reduce((s, c) => s + (Number(c.allocated) || 0), 0);
  const totalSpent = categories.reduce((s, c) => s + (Number(c.spent) || 0), 0);
  const incomeNum = Number(income) || 0;
  const unassigned = incomeNum - totalAllocated;

  const addTransaction = (catId, amount) => {
    setCategories(cs => cs.map(c =>
      c.id === catId ? { ...c, spent: c.spent + amount } : c
    ));
    const cat = categories.find(c => c.id === catId);
    setToast(`+ $${amount.toFixed(2)} · ${cat?.name}`);
    setTimeout(() => setToast(null), 1800);
  };

  const updateAllocation = (catId, amount) => {
    setCategories(cs => cs.map(c =>
      c.id === catId ? { ...c, allocated: amount } : c
    ));
  };

  const removeCategory = (catId) => {
    setCategories(cs => cs.filter(c => c.id !== catId));
  };

  const addCategory = (name, allocated) => {
    const id = 'c_' + Math.random().toString(36).slice(2, 8);
    setCategories(cs => [...cs, { id, name, emoji: '', allocated, spent: 0 }]);
  };

  const resetPrototype = () => {
    setScreen('welcome');
    setIncome('');
    setCategories(DEFAULT_CATEGORIES);
    setCompletedOnboarding(false);
  };

  const value = {
    screen, setScreen,
    income, setIncome, incomeNum,
    categories, setCategories, updateAllocation, removeCategory, addCategory,
    activeCategory, setActiveCategory,
    txAmount, setTxAmount, txCategory, setTxCategory,
    addTransaction,
    completedOnboarding, setCompletedOnboarding,
    totalAllocated, totalSpent, unassigned,
    savingsGoals, setSavingsGoals,
    loans, setLoans,
    toast,
    resetPrototype,
  };
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

const useAppState = () => useContext(AppStateContext);
const usePlatform = () => useContext(PlatformContext);

// Status color helper
const statusFor = (spent, allocated) => {
  if (allocated === 0) return 'neutral';
  const pct = spent / allocated;
  if (pct > 1) return 'red';
  if (pct >= 0.7) return 'yellow';
  return 'green';
};

const STATUS = {
  green:   { color: '#3fb950', bg: 'rgba(63,185,80,0.14)',  label: 'ON TRACK' },
  yellow:  { color: '#d29922', bg: 'rgba(210,153,34,0.14)', label: 'CAUTION' },
  red:     { color: '#f85149', bg: 'rgba(248,81,73,0.14)',  label: 'OVER' },
  neutral: { color: '#8b949e', bg: 'rgba(139,148,158,0.1)', label: '' },
};

const fmt = (n, opts = {}) => {
  const v = Number(n) || 0;
  return v.toLocaleString('en-US', { minimumFractionDigits: opts.dec === 0 ? 0 : 2, maximumFractionDigits: 2, ...opts });
};

Object.assign(window, {
  AppStateProvider, useAppState, statusFor, STATUS, fmt,
  PlatformContext, usePlatform,
});
