
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Tag,
  Settings,
  CheckCircle2,
  X,
  BarChart3,
  Download,
  TrendingUp,
  History,
  LayoutDashboard,
  Wallet,
  ArrowRight,
  Check,
  ChevronDown,
  PieChart,
  ArrowRightLeft,
  LayoutList,
  Users,
  AlertCircle,
  UserPlus,
  Landmark,
  UserCircle,
  ShieldCheck,
  Briefcase,
  Receipt,
  Clock,
  Sparkles,
  Calculator as CalcIcon,
  MessageSquare,
  PlusCircle,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { BackupRestore } from './components/BackupRestore';
import GeminiFileUpload from './components/GeminiFileUpload';
import { BankStatementAnalyzer } from './components/BankStatementAnalyzer';
import { Calculator } from './components/Calculator';
import { AIChatBot } from './components/AIChatBot';
import { 
  Profile, 
  Expense, 
  FormData, 
  TransferData, 
  Toast, 
  AccountData, 
  CategoryDetail, 
  MonthlyGroup,
  AIAnalysisResult,
  BankAccount
} from './types';
import { DEFAULT_CATEGORIES, CHART_COLORS } from './constants';

const generateId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (e) {}
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

// Custom Wedding Ring Icon Component
const RingIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
    <path d="M12 6V3" />
    <path d="M9 4.5l3-2.5 3 2.5" />
    <circle cx="12" cy="14" r="2.5" strokeWidth="1.5" opacity="0.3" />
  </svg>
);

export default function WeddingSyncApp() {
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reportView, setReportView] = useState('category');
  const [selectedSourceForReport, setSelectedSourceForReport] = useState<string | null>(null);

  const defaultProfile: Profile = { id: "default", name: "Main User" };
  const [profiles, setProfiles] = useState<Profile[]>([defaultProfile]);
  const [activeProfile, setActiveProfile] = useState<Profile>(defaultProfile);
  const [newProfileName, setNewProfileName] = useState("");

  const [accountBudgets, setAccountBudgets] = useState<Record<string, number>>({});
  const [accounts, setAccounts] = useState<string[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories] = useState(DEFAULT_CATEGORIES);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [newAccountName, setNewAccountName] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: "account" | "expense" | "profile" | null;
    id: string | null;
    name: string;
  }>({
    isOpen: false,
    type: null,
    id: null,
    name: "",
  });

  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "Venue",
    date: new Date().toISOString().split("T")[0],
    totalAmount: "",
    advancePaid: "",
    account: "",
    notes: "",
  });

  const [transferData, setTransferData] = useState<TransferData>({
    from: "",
    to: "",
    amount: "",
  });

  useEffect(() => {
    if (isAddModalOpen || deleteConfirmation.isOpen || isTransferModalOpen || isCalculatorOpen || isChatBotOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [isAddModalOpen, deleteConfirmation.isOpen, isTransferModalOpen, isCalculatorOpen, isChatBotOpen]);

  useEffect(() => {
    const loadGlobalData = () => {
      try {
        const savedProfilesStr = localStorage.getItem("weddingsync_profiles");
        let loadedProfiles = [defaultProfile];
        if (savedProfilesStr) {
          const parsed = JSON.parse(savedProfilesStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedProfiles = parsed;
          }
        }
        setProfiles(loadedProfiles);

        const savedActiveProfileStr = localStorage.getItem("weddingsync_active_profile");
        if (savedActiveProfileStr) {
          const parsedActive = JSON.parse(savedActiveProfileStr);
          if (parsedActive && loadedProfiles.some(p => p.id === parsedActive.id)) {
            setActiveProfile(parsedActive);
          } else {
            setActiveProfile(loadedProfiles[0]);
          }
        } else {
          setActiveProfile(loadedProfiles[0]);
        }
      } catch (error) {
        console.error("Critical error during data initialization:", error);
        setProfiles([defaultProfile]);
        setActiveProfile(defaultProfile);
      } finally {
        setLoading(false);
      }
    };
    loadGlobalData();
  }, []);

  useEffect(() => {
    if (loading || !activeProfile?.id) return;
    
    try {
      const expensesKey = activeProfile.id === "default" ? "weddingsync_expenses" : `weddingsync_expenses_${activeProfile.id}`;
      const settingsKey = activeProfile.id === "default" ? "weddingsync_settings" : `weddingsync_settings_${activeProfile.id}`;
      const bankAccountsKey = `weddingsync_bank_accounts_${activeProfile.id}`;

      const savedExpenses = localStorage.getItem(expensesKey);
      const parsedExpenses = savedExpenses ? JSON.parse(savedExpenses) : [];
      setExpenses(Array.isArray(parsedExpenses) ? parsedExpenses : []);

      const savedSettings = localStorage.getItem(settingsKey);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setAccountBudgets(settings.accountBudgets || {});
        setAccounts(Array.isArray(settings.accounts) ? settings.accounts : []);
      } else {
        setAccountBudgets({});
        setAccounts([]);
      }

      const savedBanks = localStorage.getItem(bankAccountsKey);
      setBankAccounts(savedBanks ? JSON.parse(savedBanks) : []);
      
      setIsInitialized(true);
    } catch (error) {
      console.error("Error loading profile-specific data:", error);
      setIsInitialized(true);
    }
  }, [activeProfile?.id, loading]);

  useEffect(() => {
    if (!isInitialized || loading) return;
    localStorage.setItem("weddingsync_profiles", JSON.stringify(profiles));
    localStorage.setItem("weddingsync_active_profile", JSON.stringify(activeProfile));
  }, [profiles, activeProfile, isInitialized, loading]);

  useEffect(() => {
    if (!isInitialized || loading || !activeProfile?.id) return;
    const expensesKey = activeProfile.id === "default" ? "weddingsync_expenses" : `weddingsync_expenses_${activeProfile.id}`;
    localStorage.setItem(expensesKey, JSON.stringify(expenses));
  }, [expenses, activeProfile?.id, isInitialized, loading]);

  useEffect(() => {
    if (!isInitialized || loading || !activeProfile?.id) return;
    const settingsKey = activeProfile.id === "default" ? "weddingsync_settings" : `weddingsync_settings_${activeProfile.id}`;
    localStorage.setItem(settingsKey, JSON.stringify({ accountBudgets, accounts }));
    const bankAccountsKey = `weddingsync_bank_accounts_${activeProfile.id}`;
    localStorage.setItem(bankAccountsKey, JSON.stringify(bankAccounts));
  }, [accountBudgets, accounts, bankAccounts, activeProfile?.id, isInitialized, loading]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const totals = useMemo(() => {
    const totalMasterBudget = Object.values(accountBudgets).reduce((sum: number, val) => sum + (Number(val) || 0), 0) as number;
    const totalAgreed = expenses.reduce((sum: number, exp) => sum + (Number(exp.totalAmount) || 0), 0);
    const totalPaid = expenses.reduce((sum: number, exp) => sum + (Number(exp.advancePaid) || 0), 0);
    const percentPaid = totalMasterBudget > 0 ? (totalPaid / totalMasterBudget) * 100 : 0;

    const accountReport: Record<string, AccountData> = (accounts || []).reduce((acc, name) => {
      const accountExpenses = (expenses || []).filter(e => e.account === name);
      const paid = accountExpenses.reduce((s: number, e) => s + (Number(e.advancePaid) || 0), 0);
      const limit = accountBudgets[name] || 0;
      const catBreakdown = categories
        .map(cat => {
          const catExps = accountExpenses.filter(e => e.category === cat);
          return { name: cat, spent: catExps.reduce((s: number, e) => s + (Number(e.advancePaid) || 0), 0), count: catExps.length };
        })
        .filter(c => c.spent > 0)
        .sort((a, b) => b.spent - a.spent);
      
      acc[name] = {
        paid,
        limit,
        balance: limit - paid,
        percent: limit > 0 ? (paid / limit) * 100 : 0,
        transactions: accountExpenses,
        categories: catBreakdown,
      };
      return acc;
    }, {} as Record<string, AccountData>);

    const categoryDetails: CategoryDetail[] = categories
      .map(cat => {
        const catExpenses = (expenses || []).filter(e => e.category === cat);
        if (catExpenses.length === 0) return null;
        const agreed = catExpenses.reduce((sum, e) => sum + (Number(e.totalAmount) || 0), 0);
        const paid = catExpenses.reduce((sum, e) => sum + (Number(e.advancePaid) || 0), 0);
        return {
          name: cat,
          agreed,
          paid,
          pending: agreed - paid,
          count: catExpenses.length,
          percent: agreed > 0 ? (paid / agreed) * 100 : 0,
          shareOfTotal: totalAgreed > 0 ? (agreed / totalAgreed) * 100 : 0,
        };
      })
      .filter((cat): cat is CategoryDetail => cat !== null)
      .sort((a, b) => b.agreed - a.agreed);

    const monthlyGroups = (expenses || []).reduce((acc: Record<string, any>, exp) => {
      const dateObj = new Date(exp.date);
      const sortKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
      const displayLabel = dateObj.toLocaleString("default", { month: "long", year: "numeric" });
      if (!acc[sortKey]) {
        acc[sortKey] = { label: displayLabel, totalSpent: 0, items: [] };
      }
      acc[sortKey].totalSpent += (Number(exp.advancePaid) || 0);
      acc[sortKey].items.push(exp);
      return acc;
    }, {});

    const monthlyReport: MonthlyGroup[] = Object.entries(monthlyGroups)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, data]: [string, any]) => {
        return {
          id: key,
          label: data.label,
          totalSpent: data.totalSpent,
          items: data.items.sort((a: Expense, b: Expense) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        };
      });

    return {
      totalMasterBudget,
      totalAgreed,
      totalPaid,
      percentPaid,
      accountReport,
      categoryDetails,
      monthlyReport,
      balanceAvailable: totalMasterBudget - totalPaid,
      totalPending: totalAgreed - totalPaid,
    };
  }, [expenses, accountBudgets, accounts, categories]);

  const filteredLedgerStats = useMemo(() => {
    const filtered = expenses.filter(e => filterCategory === "All" || e.category === filterCategory);
    const agreed = filtered.reduce((s, e) => s + (Number(e.totalAmount) || 0), 0);
    const paid = filtered.reduce((s, e) => s + (Number(e.advancePaid) || 0), 0);
    return {
      count: filtered.length,
      agreed,
      paid,
      pending: agreed - paid,
      percent: agreed > 0 ? (paid / agreed) * 100 : 0
    };
  }, [expenses, filterCategory]);

  const handleAddProfile = () => {
    if (!newProfileName.trim()) return;
    const newId = generateId();
    const newProfile = { id: newId, name: newProfileName.trim() };
    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    setActiveProfile(newProfile);
    setNewProfileName("");
    showToast(`Workspace "${newProfile.name}" created`, "success");
  };

  const executeDeleteProfile = () => {
    if (!deleteConfirmation.id) return;
    const updatedProfiles = profiles.filter(p => p.id !== deleteConfirmation.id);
    setProfiles(updatedProfiles);
    if (activeProfile?.id === deleteConfirmation.id) {
      setActiveProfile(updatedProfiles[0] || defaultProfile);
    }
    setDeleteConfirmation({ isOpen: false, type: null, id: null, name: "" });
    showToast("Profile Removed");
  };

  const handleSwitchProfile = (profile: Profile) => {
    setActiveProfile(profile);
    showToast(`Switched to ${profile.name}`);
  };

  const handleAddAccount = () => {
    if (!newAccountName.trim() || accounts.includes(newAccountName.trim())) return;
    setAccounts(prev => [...prev, newAccountName.trim()]);
    setNewAccountName("");
    showToast("Added Source");
  };

  const executeRemoveAccount = () => {
    const name = deleteConfirmation.id;
    if (!name) return;
    setAccounts(prev => prev.filter(a => a !== name));
    setAccountBudgets(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setDeleteConfirmation({ isOpen: false, type: null, id: null, name: "" });
    showToast("Source Removed");
  };

  const saveAccountBudget = (accountName: string, val: string) => {
    setAccountBudgets(prev => ({ ...prev, [accountName]: Number(val) }));
  };

  const executeTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const { from, to, amount } = transferData;
    const val = Number.parseFloat(amount);
    if (!from || !to || !amount || from === to || val <= 0) {
      showToast("Invalid transfer parameters", "error");
      return;
    }
    setAccountBudgets(prev => ({
      ...prev,
      [from]: (Number(prev[from]) || 0) - val,
      [to]: (Number(prev[to]) || 0) + val,
    }));
    setIsTransferModalOpen(false);
    setTransferData({ from: "", to: "", amount: "" });
    showToast("Transfer Complete");
  };

  const saveExpense = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (accounts.length === 0) {
      showToast("Setup funds first", "error");
      setActiveTab('settings');
      setIsAddModalOpen(false);
      return;
    }
    const id = editingExpense ? editingExpense.id : `exp_${Date.now()}`;
    const data: Expense = {
      id,
      name: formData.name,
      category: formData.category,
      date: formData.date,
      account: formData.account || accounts[0],
      totalAmount: Number.parseFloat(formData.totalAmount || "0"),
      advancePaid: Number.parseFloat(formData.advancePaid || "0"),
      notes: formData.notes,
      updatedAt: new Date().toISOString(),
    };

    if (editingExpense) {
      setExpenses(prev => prev.map(exp => exp.id === id ? data : exp));
    } else {
      setExpenses(prev => [data, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    setIsAddModalOpen(false);
    showToast(editingExpense ? "Updated" : "Synced");
  };

  const handleAISync = (aiData: AIAnalysisResult) => {
    setFormData({
      name: aiData.vendor || "",
      category: aiData.category || "Other",
      date: aiData.date || new Date().toISOString().split("T")[0],
      totalAmount: String(aiData.amount || ""),
      advancePaid: String(aiData.amount || ""),
      account: accounts[0] || "",
      notes: "Imported via Gemini AI Scan",
    });
    setEditingExpense(null);
    setIsAddModalOpen(true);
    showToast("AI Data Synced to Form");
  };

  const settleExpense = (exp: Expense) => {
    setExpenses(prev => prev.map(e => e.id === exp.id ? { ...e, advancePaid: e.totalAmount, updatedAt: new Date().toISOString() } : e));
    showToast("Balance Settled");
  };

  const executeDeleteExpense = () => {
    if (!deleteConfirmation.id) return;
    setExpenses(prev => prev.filter(exp => exp.id !== deleteConfirmation.id));
    setDeleteConfirmation({ isOpen: false, type: null, id: null, name: "" });
    showToast("Entry Deleted");
  };

  const openAddModal = (exp: Expense | null = null) => {
    if (exp) {
      setEditingExpense(exp);
      setFormData({
        name: exp.name,
        category: exp.category,
        date: exp.date,
        totalAmount: String(exp.totalAmount),
        advancePaid: String(exp.advancePaid),
        account: exp.account,
        notes: exp.notes || "",
      });
    } else {
      setEditingExpense(null);
      setFormData({
        name: "",
        category: "Venue",
        date: new Date().toISOString().split("T")[0],
        totalAmount: "",
        advancePaid: "",
        account: accounts[0] || "",
        notes: "",
      });
    }
    setIsAddModalOpen(true);
  };

  // AI Chat Callbacks - Targeted (Budget vs Bank)
  const handleAIModifyBudget = (accountName: string, delta: number, targetType: 'budget' | 'bank' = 'budget') => {
    if (targetType === 'bank') {
      const bankExists = bankAccounts.some(acc => acc.name.toLowerCase() === accountName.toLowerCase());
      if (!bankExists) return "Bank account not found in Bank Section.";
      setBankAccounts(prev => prev.map(acc => {
        if (acc.name.toLowerCase() === accountName.toLowerCase() && acc.lastAnalysis) {
          return {
            ...acc,
            lastAnalysis: {
              ...acc.lastAnalysis,
              closingBalance: acc.lastAnalysis.closingBalance + delta,
              totalCredits: delta > 0 ? acc.lastAnalysis.totalCredits + delta : acc.lastAnalysis.totalCredits,
              totalDebits: delta < 0 ? acc.lastAnalysis.totalDebits + Math.abs(delta) : acc.lastAnalysis.totalDebits,
            },
            updatedAt: new Date().toISOString()
          };
        }
        return acc;
      }));
      showToast(`Bank "${accountName}" adjusted.`, "success");
      return "Bank statement updated.";
    }
    if (!accounts.includes(accountName)) return "Budget Source not found in Settings.";
    setAccountBudgets(prev => ({ ...prev, [accountName]: (Number(prev[accountName]) || 0) + delta }));
    showToast(`Budget Source "${accountName}" adjusted.`, "success");
    return "Budget setting updated.";
  };

  const handleAIAddTransaction = (name: string, amount: number, accountName: string, targetType: 'budget' | 'bank' = 'budget') => {
    const lowerName = name.toLowerCase();
    const isIncome = lowerName.includes('receive') || lowerName.includes('income') || lowerName.includes('gift') || lowerName.includes('from');

    if (targetType === 'bank') {
      const bankExists = bankAccounts.some(acc => acc.name.toLowerCase() === accountName.toLowerCase());
      if (!bankExists) return "Bank account not found in Bank Section.";
      setBankAccounts(prev => prev.map(acc => {
        if (acc.name.toLowerCase() === accountName.toLowerCase() && acc.lastAnalysis) {
          const txType = isIncome ? 'credit' : 'debit';
          return {
            ...acc,
            lastAnalysis: {
              ...acc.lastAnalysis,
              closingBalance: isIncome ? acc.lastAnalysis.closingBalance + amount : acc.lastAnalysis.closingBalance - amount,
              totalCredits: isIncome ? acc.lastAnalysis.totalCredits + amount : acc.lastAnalysis.totalCredits,
              totalDebits: !isIncome ? acc.lastAnalysis.totalDebits + amount : acc.lastAnalysis.totalDebits,
              topTransactions: [
                { date: new Date().toISOString().split('T')[0], description: name, amount: amount, type: txType as 'debit' | 'credit' },
                ...acc.lastAnalysis.topTransactions.slice(0, 9)
              ]
            },
            updatedAt: new Date().toISOString()
          };
        }
        return acc;
      }));
      showToast(`Bank history updated for "${accountName}".`, "success");
      return `Recorded as ${isIncome ? 'Income' : 'Expense'} in Bank Section.`;
    }

    if (!accounts.includes(accountName)) return "No matching Budget Source found.";
    if (isIncome) {
      setAccountBudgets(prev => ({ ...prev, [accountName]: (Number(prev[accountName]) || 0) + amount }));
      const newExp: Expense = {
        id: `ai_income_${Date.now()}`,
        name: `(INCOME) ${name}`,
        category: "Other",
        date: new Date().toISOString().split("T")[0],
        account: accountName,
        totalAmount: 0,
        advancePaid: 0,
        notes: `Received $${amount}. Budget updated.`,
        updatedAt: new Date().toISOString()
      };
      setExpenses(prev => [newExp, ...prev]);
      showToast(`Master Budget for "${accountName}" increased by $${amount}.`, "success");
      return "Received money recorded.";
    } else {
      const newExp: Expense = {
        id: `ai_exp_${Date.now()}`,
        name,
        category: "Other",
        date: new Date().toISOString().split("T")[0],
        account: accountName,
        totalAmount: amount,
        advancePaid: amount,
        notes: "Quick entry via AI Chat",
        updatedAt: new Date().toISOString()
      };
      setExpenses(prev => [newExp, ...prev]);
      showToast(`Ledger entry added.`, "success");
      return "Expense recorded in Ledger.";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-pulse">
        <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center text-white mb-4 shadow-xl shadow-rose-200">
          <RingIcon size={24} />
        </div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Syncing...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 responsive-container relative">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-xl shadow-xl border animate-in slide-in-from-top-4 duration-300 flex items-center gap-2 ${toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      <header className="bg-white px-5 py-3 border-b border-slate-100 sticky top-0 z-40 flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white shadow-sm shadow-rose-200">
            <RingIcon size={18} />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-900 leading-none">WeddingSync</h1>
            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Budget Tracker</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-300 rounded-full flex items-center justify-center">
               <Users size={10} className="text-slate-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 max-w-[80px] truncate">{activeProfile?.name || 'User'}</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 max-w-xl mx-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden relative">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Spent</p>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black">
                  <TrendingUp size={10} /> {totals.percentPaid.toFixed(0)}%
                </div>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">${totals.totalPaid.toLocaleString()}</h2>
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400">Master Budget</span>
                  <span className="font-bold text-slate-800">${totals.totalMasterBudget.toLocaleString()}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 transition-all duration-700 ease-out rounded-full" style={{ width: `${Math.min(totals.percentPaid, 100)}%` }} />
                </div>
              </div>
            </section>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Agreed Cost</p>
                <p className="text-lg font-bold text-slate-800">${totals.totalAgreed.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                <p className="text-[9px] font-black text-emerald-600 uppercase mb-0.5">Available Balance</p>
                <p className="text-lg font-bold text-slate-800">${totals.balanceAvailable.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="space-y-4 animate-in fade-in duration-200 pb-10">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="font-black text-slate-900 text-lg flex items-center gap-2">Ledger <span className="bg-slate-100 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-black">{filteredLedgerStats.count}</span></h2>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tracking Itemized Costs</p>
              </div>
              <div className="relative">
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="text-[11px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none shadow-sm focus:border-rose-500 appearance-none pr-10">
                  <option value="All">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              </div>
            </div>

            <div className="bg-slate-900 rounded-[24px] p-4 shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full -mr-16 -mt-16 opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"></div>
               
               <div className="relative z-10">
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2 text-indigo-300">
                     <div className="p-1 bg-white/10 rounded-lg">
                        <Sparkles size={10} />
                     </div>
                     <span className="text-[8px] font-black uppercase tracking-widest">Analysis: {filterCategory}</span>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-2 mb-4">
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Committed</p>
                      <p className="text-sm font-black text-white tracking-tight">${filteredLedgerStats.agreed.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Settled</p>
                      <p className="text-sm font-black text-emerald-400 tracking-tight">${filteredLedgerStats.paid.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Due</p>
                      <p className="text-sm font-black text-indigo-300 tracking-tight">${filteredLedgerStats.pending.toLocaleString()}</p>
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                       <span className="text-slate-500">Settle Progress</span>
                       <span className="text-indigo-400">{filteredLedgerStats.percent.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(99,102,241,0.3)]" 
                          style={{ width: `${Math.min(filteredLedgerStats.percent, 100)}%` }} 
                        />
                    </div>
                 </div>
               </div>
            </div>

            {/* Ledger Box Container */}
            <div className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 mb-2 px-1">
                <LayoutList size={14} className="text-rose-500" />
                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Account Entries</h3>
              </div>
              
              {expenses.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-100 rounded-3xl">
                  <History size={24} className="mx-auto text-slate-200 mb-2" />
                  <h3 className="font-black text-[9px] text-slate-300 uppercase tracking-widest">No entries yet</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Start adding expenses to this box</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.filter(e => filterCategory === "All" || e.category === filterCategory).map(exp => {
                    const isFullyPaid = (Number(exp.totalAmount) || 0) - (Number(exp.advancePaid) || 0) <= 0;
                    const isIncome = exp.name.startsWith("(INCOME)");
                    return (
                      <div key={exp.id} className="bg-slate-50 px-4 py-3.5 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-sm transition-all flex items-center justify-between group active:scale-[0.99]">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isIncome ? "bg-amber-50 text-amber-500" : isFullyPaid ? "bg-emerald-50 text-emerald-500" : "bg-white text-slate-300"}`}>
                            {isIncome ? <PlusCircle size={16} /> : isFullyPaid ? <CheckCircle2 size={16} /> : <Receipt size={14} />}
                          </div>
                          <div>
                            <h4 className="font-black text-xs text-slate-900 leading-tight mb-0.5 truncate max-w-[140px]">{exp.name}</h4>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter bg-white px-1.5 py-0.5 rounded-md">{exp.category}</span>
                              <span className="text-[8px] font-black uppercase text-indigo-500 tracking-tighter bg-indigo-50/50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5"><Wallet size={8} /> {exp.account}</span>
                              <span className="text-[8px] font-bold text-slate-400 flex items-center gap-0.5"><Calendar size={8} /> {exp.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className={`font-black text-sm ${isIncome ? "text-amber-600" : isFullyPaid ? "text-emerald-600" : "text-slate-900"}`}>
                            {isIncome ? "Budget" : `$${(Number(exp.advancePaid) || 0).toLocaleString()}`}
                          </p>
                          <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!isFullyPaid && !isIncome && (
                              <button onClick={() => settleExpense(exp)} className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 hover:bg-emerald-100"><Check size={12} /></button>
                            )}
                            <button onClick={() => openAddModal(exp)} className="p-1.5 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100"><Edit2 size={12} /></button>
                            <button onClick={() => setDeleteConfirmation({ isOpen: true, type: "expense", id: exp.id, name: exp.name })} className="p-1.5 bg-rose-50 rounded-lg text-rose-500 hover:bg-rose-100"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6 animate-in fade-in duration-200 pb-10">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Global Financials</h2>
            <section className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                    <ShieldCheck size={14} />
                  </div>
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Master Budget</span>
                </div>
                <p className="text-lg font-black text-indigo-900">${totals.totalMasterBudget.toLocaleString()}</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                    <Briefcase size={14} />
                  </div>
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Agreed Cost</span>
                </div>
                <p className="text-lg font-black text-blue-900">${totals.totalAgreed.toLocaleString()}</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                    <Receipt size={14} />
                  </div>
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Total Paid</span>
                </div>
                <p className="text-lg font-black text-emerald-900">${totals.totalPaid.toLocaleString()}</p>
              </div>

              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
                    <Clock size={14} />
                  </div>
                  <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Outstanding</span>
                </div>
                <p className="text-lg font-black text-rose-900">${totals.totalPending.toLocaleString()}</p>
              </div>
            </section>

            <div className="flex justify-center mb-4">
              <div className="bg-white p-1 rounded-xl border border-slate-100 shadow-sm inline-flex gap-1 no-print">
                <button onClick={() => { setReportView('category'); setSelectedSourceForReport(null); }} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${reportView === 'category' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Category</button>
                <button onClick={() => { setReportView('date'); setSelectedSourceForReport(null); }} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${reportView === 'date' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Timeline</button>
                <button onClick={() => { setReportView('source'); }} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${reportView === 'source' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Sources</button>
              </div>
            </div>

            {reportView === 'category' && (
              <div className="space-y-4">
                <section className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><PieChart size={12} className="text-rose-500" /> Spending Distribution</h3>
                  {totals.categoryDetails.length > 0 ? (
                    <div>
                      <div className="flex h-4 w-full rounded-full overflow-hidden mb-4 bg-slate-100">
                        {totals.categoryDetails.map((cat, idx) => (
                          <div key={cat.name} className={`${CHART_COLORS[idx % CHART_COLORS.length]} h-full transition-all`} style={{ width: `${cat.shareOfTotal}%` }} />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        {totals.categoryDetails.map((cat, idx) => (
                          <div key={cat.name} className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${CHART_COLORS[idx % CHART_COLORS.length]}`} />
                            <div className="flex-1 flex justify-between">
                               <p className="text-[9px] font-black text-slate-700">{cat.name}</p>
                               <p className="text-[9px] font-bold text-slate-400">{cat.shareOfTotal.toFixed(0)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : <p className="text-center text-xs text-slate-400 py-4 italic">No data yet</p>}
                </section>

                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5 mt-6 mb-2">
                  <LayoutList size={12} /> Category Breakdown
                </h3>
                
                <div className="space-y-3">
                  {totals.categoryDetails.map((cat, idx) => (
                    <div key={cat.name} className="p-3.5 bg-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${CHART_COLORS[idx % CHART_COLORS.length]}`} />
                            <h4 className="text-xs font-black text-slate-900">{cat.name}</h4>
                            <span className="bg-slate-50 text-slate-400 text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase">{cat.count} items</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Agreed</p>
                              <p className="text-sm font-black text-slate-900 leading-none">${cat.agreed.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Paid</p>
                              <p className="text-sm font-black text-emerald-600 leading-none">${cat.paid.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xl font-black text-rose-500 leading-none tracking-tight">${cat.pending.toLocaleString()}</p>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Pending</p>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${CHART_COLORS[idx % CHART_COLORS.length]} rounded-full transition-all duration-700 ease-out`} 
                          style={{ width: `${Math.min(cat.percent, 100)}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reportView === 'date' && (
              <div className="space-y-4">
                 {totals.monthlyReport.length > 0 ? (
                   <div className="border-l-2 border-slate-100 ml-4 space-y-6 pb-2">
                     {totals.monthlyReport.map(month => (
                       <div key={month.id} className="relative pl-6">
                         <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-4 border-slate-50 shadow-sm" />
                         <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                            <h4 className="font-black text-sm text-slate-900 mb-1">{month.label}</h4>
                            <p className="text-xl font-black text-slate-800">${month.totalSpent.toLocaleString()}</p>
                            <div className="mt-3 space-y-1">
                              {month.items.map(item => (
                                <div key={item.id} className="flex justify-between text-[10px] text-slate-500"><span>{item.name}</span><span className="font-bold">${(Number(item.advancePaid) || 0).toLocaleString()}</span></div>
                              ))}
                            </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : <p className="text-center text-xs text-slate-400 py-4 italic">No monthly data</p>}
              </div>
            )}

            {reportView === 'source' && (
              <div className="space-y-2.5">
                 {accounts.map((acc, idx) => {
                   const report = totals.accountReport[acc];
                   const isExpanded = selectedSourceForReport === acc;
                   
                   return (
                     <div 
                        key={acc} 
                        onClick={() => setSelectedSourceForReport(isExpanded ? null : acc)}
                        className={`bg-white border border-slate-100 shadow-sm transition-all cursor-pointer group active:scale-[0.99] overflow-hidden ${isExpanded ? 'rounded-[2rem] border-indigo-200 ring-2 ring-indigo-50' : 'rounded-2xl hover:shadow-md hover:border-indigo-100'}`}
                     >
                        {/* Compact Header */}
                        <div className={`p-3.5 ${isExpanded ? 'bg-indigo-50/30 border-b border-indigo-100/50' : ''}`}>
                          <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 ${CHART_COLORS[idx % CHART_COLORS.length]} bg-opacity-10 text-slate-600 rounded-xl flex items-center justify-center shadow-sm`}>
                                   <Wallet size={14} />
                                </div>
                                <div>
                                  <h4 className="text-xs font-black text-slate-900 leading-tight">{acc}</h4>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">Budget</span>
                                    <span className="text-[9px] font-black text-slate-600 leading-none">${report.limit.toLocaleString()}</span>
                                  </div>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-sm font-black text-slate-900 leading-tight">${report.paid.toLocaleString()}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Total Paid</p>
                             </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-4">
                             <div className="flex-1 space-y-1.5">
                                <div className="flex justify-between items-center text-[8px] font-bold text-slate-400">
                                   <span>Budget utilization</span>
                                   <span>{report.percent.toFixed(0)}%</span>
                                </div>
                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                   <div className={`h-full ${CHART_COLORS[idx % CHART_COLORS.length]} transition-all duration-700`} style={{ width: `${Math.min(report.percent, 100)}%` }} />
                                </div>
                             </div>
                             <div className="text-right shrink-0">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Remaining</p>
                                <p className={`text-lg font-black tracking-tight ${report.balance < 0 ? "text-rose-500" : "text-emerald-500"}`}>
                                  ${report.balance.toLocaleString()}
                                </p>
                             </div>
                          </div>
                        </div>

                        {/* Expanded Details Section */}
                        {isExpanded && (
                          <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-2 gap-3 pb-4 border-b border-slate-50">
                               <div className="bg-slate-50 p-2.5 rounded-xl">
                                  <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Master Budget</p>
                                  <p className="text-sm font-black text-slate-700">${report.limit.toLocaleString()}</p>
                               </div>
                               <div className="bg-slate-50 p-2.5 rounded-xl">
                                  <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Category Count</p>
                                  <p className="text-sm font-black text-slate-700">{report.categories.length} used</p>
                               </div>
                            </div>

                            <div className="space-y-3">
                               <div className="flex items-center gap-2 mb-1">
                                  <LayoutList size={12} className="text-slate-400" />
                                  <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Recent Transactions</h4>
                               </div>
                               <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                                  {report.transactions.length > 0 ? (
                                    report.transactions.map((tx) => (
                                      <div key={tx.id} className="flex justify-between items-center py-2 px-1 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-lg transition-colors">
                                        <div className="min-w-0">
                                          <p className="text-[11px] font-black text-slate-800 truncate leading-tight">{tx.name}</p>
                                          <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{tx.category} • {tx.date}</p>
                                        </div>
                                        <p className="text-[11px] font-black text-slate-900 ml-3 shrink-0">${(Number(tx.advancePaid) || 0).toLocaleString()}</p>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center py-6 bg-slate-50 rounded-2xl">
                                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">No entries found</p>
                                    </div>
                                  )}
                               </div>
                            </div>

                            <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                               <ChevronRight size={14} className="rotate-90" /> Collapse Details
                            </button>
                          </div>
                        )}
                     </div>
                   );
                 })}
              </div>
            )}
            <button onClick={() => window.print()} className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 mt-4 no-print shadow-lg shadow-slate-200"><Download size={14} /> Export Report</button>
          </div>
        )}

        {activeTab === 'bank' && <div className="space-y-6 animate-in fade-in duration-200"><BankStatementAnalyzer activeProfileId={activeProfile.id} accounts={bankAccounts} setAccounts={setBankAccounts} /></div>}
        {activeTab === 'gemini' && <div className="space-y-6 animate-in fade-in duration-200"><section className="bg-blue-50 p-6 rounded-3xl border border-blue-100"><div className="flex items-center gap-2 mb-4"><div className="p-2 bg-blue-100 rounded-xl"><PieChart size={18} className="text-blue-600" /></div><div><h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">AI Bill Scanner</h3><p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Powered by Gemini AI</p></div></div><p className="text-xs text-blue-700/80 mb-6 leading-relaxed">Scan your wedding receipts or invoices. Gemini will automatically identify the vendor, date, and amount.</p><GeminiFileUpload onConfirm={handleAISync} /></section></div>}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in duration-200 pb-10">
            <section className="bg-rose-50 p-6 rounded-3xl border border-rose-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Combined Master Budget</p>
                  <h3 className="text-2xl font-black text-rose-900">${totals.totalMasterBudget.toLocaleString()}</h3>
                </div>
                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm shadow-rose-200">
                  <Wallet size={24} />
                </div>
              </div>
            </section>
            
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Funding Sources</h3>
              <div className="flex gap-2">
                <input type="text" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} placeholder="e.g. Savings, Parent Fund" className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-rose-500 shadow-sm" />
                <button onClick={handleAddAccount} disabled={!newAccountName.trim()} className="bg-slate-900 text-white p-2 rounded-lg shadow-md active:scale-95 transition-transform"><Plus size={16} /></button>
              </div>
              <div className="space-y-4">
                {accounts.map((acc, idx) => {
                  const report = totals.accountReport[acc];
                  return (
                    <div key={acc} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 ${CHART_COLORS[idx % CHART_COLORS.length]} bg-opacity-10 text-slate-600 rounded-xl flex items-center justify-center shadow-sm`}>
                            <Wallet size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{acc}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase">Funding Source</p>
                          </div>
                        </div>
                        <button onClick={() => setDeleteConfirmation({ isOpen: true, type: "account", id: acc, name: acc })} className="p-2 text-slate-200 hover:text-black transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Set Budget</p>
                          <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-lg px-2 py-1.5 shadow-sm">
                            <span className="text-xs font-bold text-slate-300">$</span>
                            <input 
                              type="number" 
                              value={accountBudgets[acc] || ""} 
                              onChange={(e) => saveAccountBudget(acc, e.target.value)} 
                              placeholder="0" 
                              className="w-full bg-transparent text-xs font-black outline-none placeholder:text-slate-200" 
                            />
                          </div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3">
                          <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 ml-1">Total Spent</p>
                          <p className="text-lg font-black text-emerald-900 tracking-tight leading-none pt-1">
                            ${(report?.paid || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Available Balance</p>
                          <p className={`text-[10px] font-black ${report?.balance < 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                            ${(report?.balance || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${CHART_COLORS[idx % CHART_COLORS.length]} transition-all duration-700 ease-out rounded-full`} 
                            style={{ width: `${Math.min(report?.percent || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {accounts.length > 1 && (<button onClick={() => setIsTransferModalOpen(true)} className="w-full py-3.5 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mt-2 hover:border-slate-300 transition-colors"><ArrowRightLeft size={14} /> Transfer Funds</button>)}
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">User Workspaces</h3>
              <div className="flex gap-2">
                <input type="text" value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} placeholder="New workspace name..." className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-rose-500 shadow-sm" onKeyPress={(e) => e.key === 'Enter' && handleAddProfile()} />
                <button onClick={handleAddProfile} disabled={!newProfileName.trim()} className="bg-slate-900 text-white p-2 rounded-lg shadow-md active:scale-95 transition-transform"><Plus size={16} /></button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {(profiles || []).map(p => (
                  <div key={p.id} 
                    onClick={() => handleSwitchProfile(p)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${activeProfile?.id === p.id ? 'bg-rose-50 border-rose-200 shadow-sm' : 'bg-white border-slate-100 hover:border-rose-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeProfile?.id === p.id ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                        <UserCircle size={20} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${activeProfile?.id === p.id ? 'text-rose-900' : 'text-slate-800'}`}>{p.name}</p>
                        {activeProfile?.id === p.id && <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Active Primary</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeProfile?.id === p.id && <div className="p-1 bg-rose-100 text-rose-600 rounded-full"><Check size={12} /></div>}
                      {p.id !== 'default' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmation({ isOpen: true, type: "profile", id: p.id, name: p.name });
                          }}
                          className="p-2 text-slate-300 hover:text-black transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Backup & Restore</h3>
              <BackupRestore showToast={showToast} />
            </section>
          </div>
        )}
      </main>

      <div className="fixed bottom-28 right-6 flex flex-col gap-4 z-50 no-print">
        <button 
          onClick={() => setIsChatBotOpen(true)} 
          className="w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform border-4 border-white"
          aria-label="Ask Assistant"
        >
          <MessageSquare size={22} strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => setIsCalculatorOpen(true)} 
          className="w-12 h-12 bg-white text-slate-600 rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform border border-slate-100"
          aria-label="Open Calculator"
        >
          <CalcIcon size={24} strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => openAddModal()} 
          className="w-14 h-14 bg-rose-500 text-white rounded-full shadow-2xl shadow-rose-900/30 flex items-center justify-center active:scale-90 transition-transform border-4 border-white"
          aria-label="Add New Entry"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <Calculator 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />

      <AIChatBot 
        isOpen={isChatBotOpen}
        onClose={() => setIsChatBotOpen(false)}
        dataContext={{
          expenses,
          totals,
          accounts,
          bankAccounts,
          accountReport: totals.accountReport
        }}
        onModifyBudget={handleAIModifyBudget}
        onAddTransaction={handleAIAddTransaction}
      />

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-[480px] bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] p-1.5 shadow-2xl z-50 flex items-center no-print border border-slate-800/50">
        <button onClick={() => { setActiveTab('dashboard'); setSelectedSourceForReport(null); }} className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-all rounded-2xl ${activeTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-slate-500'}`}><LayoutDashboard size={18} strokeWidth={activeTab === 'dashboard' ? 3 : 2} /><span className="text-[8px] font-black uppercase tracking-tighter">Home</span></button>
        <button onClick={() => { setActiveTab('ledger'); setSelectedSourceForReport(null); }} className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-all rounded-2xl ${activeTab === 'ledger' ? 'bg-white/10 text-white' : 'text-slate-500'}`}><LayoutList size={18} strokeWidth={activeTab === 'ledger' ? 3 : 2} /><span className="text-[8px] font-black uppercase tracking-tighter">Ledger</span></button>
        <button onClick={() => { setActiveTab('analysis'); setSelectedSourceForReport(null); }} className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-all rounded-2xl ${activeTab === 'analysis' ? 'bg-white/10 text-white' : 'text-slate-500'}`}><BarChart3 size={18} strokeWidth={activeTab === 'analysis' ? 3 : 2} /><span className="text-[8px] font-black uppercase tracking-tighter">Stats</span></button>
        <button onClick={() => { setActiveTab('bank'); setSelectedSourceForReport(null); }} className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-all rounded-2xl ${activeTab === 'bank' ? 'bg-white/10 text-white' : 'text-slate-500'}`}><Landmark size={18} strokeWidth={activeTab === 'bank' ? 3 : 2} /><span className="text-[8px] font-black uppercase tracking-tighter">Bank</span></button>
        <button onClick={() => { setActiveTab('settings'); setSelectedSourceForReport(null); }} className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-all rounded-2xl ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-slate-500'}`}><Settings size={18} strokeWidth={activeTab === 'settings' ? 3 : 2} /><span className="text-[8px] font-black uppercase tracking-tighter">More</span></button>
      </nav>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[92vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between shrink-0">
               <div><h2 className="text-lg font-black text-slate-900">{editingExpense ? 'Edit Entry' : 'New Entry'}</h2><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Wedding Ledger</p></div>
               <button onClick={() => setIsAddModalOpen(false)} className="p-2.5 bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-transform"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto pb-10">
               <form id="ledger-form" onSubmit={saveExpense} className="space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Vendor/Item Name</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-base font-bold outline-none focus:border-rose-500 transition-colors" placeholder="e.g. Grand Plaza Catering" /></div>
                    <div><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Category</label><select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-base font-bold outline-none focus:border-rose-500 appearance-none">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Date</label><input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-base font-bold outline-none focus:border-rose-500" /></div>
                    <div><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Agreed Amount</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</span><input type="number" required value={formData.totalAmount} onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-8 pr-4 py-3.5 text-base font-bold outline-none focus:border-rose-500" placeholder="0.00" /></div></div>
                    <div><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Advance Paid</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</span><input type="number" required value={formData.advancePaid} onChange={(e) => setFormData({...formData, advancePaid: e.target.value})} className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl pl-8 pr-4 py-3.5 text-base font-bold outline-none focus:border-emerald-500 text-emerald-700" placeholder="0.00" /></div></div>
                    <div className="col-span-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Paid From</label><select value={formData.account} onChange={(e) => setFormData({...formData, account: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-base font-bold outline-none focus:border-rose-500 appearance-none">{accounts.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
                 </div>
               </form>
               {!editingExpense && (<div className="mt-8 pt-6 border-t border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Or Use Intelligence</p><button type="button" onClick={() => { setIsAddModalOpen(false); setActiveTab('gemini'); }} className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-blue-100 active:scale-95 transition-all">Scan with Gemini AI</button></div>)}
            </div>
            <div className="px-6 py-6 bg-white border-t border-slate-50 shrink-0"><button form="ledger-form" type="submit" className="w-full py-3.5 bg-slate-900 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3">{editingExpense ? 'Update Entry' : 'Add to Ledger'} <ArrowRight size={18} /></button></div>
          </div>
        </div>
      )}

      {isTransferModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-200"><div className="p-8"><div className="flex items-center justify-between mb-8"><h2 className="text-lg font-black text-slate-900">Transfer Funds</h2><button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 active:scale-90"><X size={20} /></button></div><form onSubmit={executeTransfer} className="space-y-5"><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">From Source</label><select value={transferData.from} onChange={(e) => setTransferData({...transferData, from: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-base font-bold outline-none"><option value="">Select Source</option>{accounts.map(a => <option key={a} value={a}>{a}</option>)}</select></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">To Source</label><select value={transferData.to} onChange={(e) => setTransferData({...transferData, to: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-base font-bold outline-none"><option value="">Select Destination</option>{accounts.map(a => <option key={a} value={a}>{a}</option>)}</select></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Amount</label><input type="number" value={transferData.amount} onChange={(e) => setTransferData({...transferData, amount: e.target.value})} placeholder="0.00" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-base font-bold outline-none" /></div><button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all mt-4">Confirm Transfer</button></form></div></div>
        </div>
      )}

      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95"><div className={`w-14 h-14 ${deleteConfirmation.type === 'profile' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-black'} rounded-2xl flex items-center justify-center mx-auto mb-6`}><AlertCircle size={28} /></div><h3 className="font-bold text-slate-900 mb-2">{deleteConfirmation.type === 'profile' ? 'Delete Profile?' : 'Delete Entry?'}</h3><p className="text-xs text-slate-400 mb-8 leading-relaxed">{deleteConfirmation.type === 'profile' ? `Delete all data for "${deleteConfirmation.name}"? This will wipe their isolated ledger.` : `Are you sure you want to remove "${deleteConfirmation.name}"? This cannot be undone.`}</p><div className="grid grid-cols-2 gap-3"><button onClick={() => setDeleteConfirmation({ isOpen: false, type: null, id: null, name: "" })} className="py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancel</button><button onClick={deleteConfirmation.type === 'account' ? executeRemoveAccount : deleteConfirmation.type === 'profile' ? executeDeleteProfile : executeDeleteExpense} className="py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200">Delete</button></div></div>
        </div>
      )}
    </div>
  );
}
