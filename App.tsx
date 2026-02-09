import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
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

/**
 * WeddingIcon based on the user-provided design:
 * Gold silhouette couple + Green Rupee Seal (₹)
 */
const WeddingIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="100" height="100" rx="22" fill="white" />
    
    {/* Couple Silhouette - Gold */}
    <g fill="#D4AF37">
      {/* Woman */}
      <circle cx="43" cy="33" r="4" />
      <path d="M43 38c-3 0-5 2-5 5l-8 25h16l-3-25c0-3-2-5-5-5z" />
      {/* Man */}
      <circle cx="58" cy="31" r="4.5" />
      <path d="M58 36c-3.5 0-6 2.5-6 6v14c0 10 1.5 25 1.5 25h9s-1.5-15-1.5-25V42c0-3.5-2.5-6-6-6z" />
      {/* Hands connection */}
      <path d="M46 52h8" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* Green Serrated Seal */}
    <path 
      d="M95 20l-1.5-3.5-3.5-1.5 1.5-3.5-1.5-3.5-3.5-1.5 1.5-3.5-1.5-3.5-3.5-1.5 1.5-3.5-1.5-3.5-3.5-1.5 1.5-3.5L78 1l-3.5 1.5L71 1l-3.5 1.5L64 1l-3.5 1.5L64 1l-3.5 1.5L59 1l-3.5 1.5L54 1l-3.5 1.5L49 1l-3.5 1.5L44 1l-3.5 1.5L39 1l-3.5 1.5L34 1l-3.5 1.5L29 1l-3.5 1.5L24 1l-3.5 1.5L19 1l-3.5 1.5L14 1l-3.5 1.5L9 1 7.5 4.5 4 6l1.5 3.5-1.5 3.5 3.5 1.5-1.5 3.5 3.5 1.5-1.5 3.5 3.5 1.5-1.5 3.5 3.5 1.5-1.5 3.5 3.5 1.5-1.5 3.5 3.5 1.5 1.5 3.5L13 36l3.5 1.5L18 41l3.5 1.5L23 46l3.5 1.5L28 51l3.5 1.5L33 56l3.5 1.5L38 61l3.5 1.5L43 66l3.5 1.5L48 71l3.5 1.5L53 76l3.5 1.5L58 81l3.5 1.5L63 86l3.5 1.5L68 91l3.5 1.5L73 96l3.5-1.5 3.5 1.5 1.5-3.5 3.5-1.5-1.5-3.5 3.5-1.5-1.5-3.5 3.5-1.5-1.5-3.5 3.5-1.5-1.5-3.5 3.5-1.5-1.5-3.5 3.5-1.5-1.5-3.5-3.5-1.5L95 76l1.5-3.5L100 71l-1.5-3.5 1.5-3.5-3.5-1.5 1.5-3.5-3.5-1.5 1.5-3.5-3.5-1.5 1.5-3.5-3.5-1.5 1.5-3.5-3.5-1.5 1.5-3.5-3.5-1.5z" 
      fill="#00E600" 
      transform="scale(0.35) translate(180, 5)"
    />
    
    {/* White Rupee Symbol ₹ */}
    <text x="81" y="22" fill="white" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">₹</text>
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
        setTimeout(() => setLoading(false), 1200);
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

  // AI Chat Callbacks
  const handleAIModifyBudget = (accountName: string, delta: number, targetType: 'budget' | 'bank' = 'budget') => {
    if (targetType === 'bank') {
      const bankExists = bankAccounts.some(acc => acc.name.toLowerCase() === accountName.toLowerCase());
      if (!bankExists) return "Bank account not found.";
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
    if (!accounts.includes(accountName)) return "Budget Source not found.";
    setAccountBudgets(prev => ({ ...prev, [accountName]: (Number(prev[accountName]) || 0) + delta }));
    showToast(`Budget Source "${accountName}" adjusted.`, "success");
    return "Budget setting updated.";
  };

  const handleAIAddTransaction = (name: string, amount: number, accountName: string, targetType: 'budget' | 'bank' = 'budget') => {
    const lowerName = name.toLowerCase();
    const isIncome = lowerName.includes('receive') || lowerName.includes('income') || lowerName.includes('gift');

    if (targetType === 'bank') {
      const bankExists = bankAccounts.some(acc => acc.name.toLowerCase() === accountName.toLowerCase());
      if (!bankExists) return "Bank account not found.";
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
      return "Bank history updated.";
    }

    if (!accounts.includes(accountName)) return "No matching Budget Source found.";
    const newExp: Expense = {
      id: `ai_${Date.now()}`,
      name,
      category: "Other",
      date: new Date().toISOString().split("T")[0],
      account: accountName,
      totalAmount: isIncome ? 0 : amount,
      advancePaid: amount,
      notes: "Quick entry via AI Chat",
      updatedAt: new Date().toISOString()
    };
    if (isIncome) {
      setAccountBudgets(prev => ({ ...prev, [accountName]: (Number(prev[accountName]) || 0) + amount }));
      showToast(`Budget for "${accountName}" increased.`, "success");
    } else {
      setExpenses(prev => [newExp, ...prev]);
      showToast(`Expense recorded.`, "success");
    }
    return "Transaction recorded.";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <WeddingIcon size={80} className="mb-6 animate-pulse drop-shadow-xl" />
        <h2 className="text-xl font-black text-slate-900 tracking-tighter">Syncing Wedding Vault...</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 animate-pulse">Initializing Profiles</p>
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

      <header className="bg-white px-5 py-3 border-b border-slate-100 sticky top-0 z-40 flex items-center justify-between no-print shadow-sm">
        <div className="flex items-center gap-2">
          <WeddingIcon size={32} />
          <div>
            <h1 className="font-bold text-base text-slate-900 leading-none">WeddingSync</h1>
            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Audit Control</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 flex items-center gap-2">
            <UserCircle size={14} className="text-slate-600" />
            <span className="text-[10px] font-bold text-slate-700 max-w-[80px] truncate">{activeProfile?.name}</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 max-w-xl mx-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden relative">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Spent</p>
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
              </div>
              <div className="relative">
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="text-[11px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none shadow-sm focus:border-rose-500 appearance-none pr-10">
                  <option value="All">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm space-y-3">
              {expenses.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-100 rounded-3xl">
                  <History size={24} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400">Empty Ledger. Add items or scan receipts.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.filter(e => filterCategory === "All" || e.category === filterCategory).map(exp => {
                    const isFullyPaid = (Number(exp.totalAmount) || 0) - (Number(exp.advancePaid) || 0) <= 0;
                    const isIncome = exp.name.startsWith("(INCOME)");
                    
                    return (
                      <div key={exp.id} className="bg-slate-50 px-4 py-3.5 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                            isIncome ? "bg-amber-50 text-amber-500" : 
                            isFullyPaid ? "bg-emerald-50 text-emerald-500" : 
                            "bg-amber-100/50 text-amber-600"
                          }`}>
                            {isIncome ? <PlusCircle size={16} /> : isFullyPaid ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                          </div>
                          <div>
                            <h4 className="font-black text-xs text-slate-900 leading-tight truncate max-w-[140px]">{exp.name}</h4>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter bg-white px-1.5 py-0.5 rounded-md">{exp.category}</span>
                              <span className="text-[8px] font-black uppercase text-indigo-500 tracking-tighter bg-indigo-50/50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5"><Wallet size={8} /> {exp.account}</span>
                              {!isFullyPaid && !isIncome && (
                                <span className="text-[7px] font-black text-rose-500 uppercase bg-rose-50 px-1.5 py-0.5 rounded-md">Pending</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm text-slate-900">${(Number(exp.advancePaid) || 0).toLocaleString()}</p>
                          <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!isFullyPaid && !isIncome && (
                              <button onClick={() => settleExpense(exp)} className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 hover:bg-emerald-100 flex items-center gap-1">
                                <Check size={12} /> <span className="text-[8px] font-black uppercase">Settle</span>
                              </button>
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
            <section className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={14} className="text-indigo-600" />
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Master Budget</span>
                </div>
                <p className="text-lg font-black text-indigo-900">${totals.totalMasterBudget.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt size={14} className="text-emerald-600" />
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Total Paid</span>
                </div>
                <p className="text-lg font-black text-emerald-900">${totals.totalPaid.toLocaleString()}</p>
              </div>
            </section>

            <div className="flex justify-center mb-4">
              <div className="bg-white p-1 rounded-xl border border-slate-100 shadow-sm inline-flex gap-1">
                <button onClick={() => setReportView('category')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${reportView === 'category' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Category</button>
                <button onClick={() => setReportView('source')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${reportView === 'source' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Sources</button>
              </div>
            </div>

            {reportView === 'category' && (
              <div className="space-y-3">
                {totals.categoryDetails.map((cat, idx) => (
                  <div key={cat.name} className="p-3.5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-black text-slate-900">{cat.name}</h4>
                      <p className="text-sm font-black text-rose-500">${cat.pending.toLocaleString()} Due</p>
                    </div>
                    <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                      <div className={`h-full ${CHART_COLORS[idx % CHART_COLORS.length]} rounded-full`} style={{ width: `${Math.min(cat.percent, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {reportView === 'source' && (
              <div className="space-y-3">
                {accounts.map((acc, idx) => {
                  const report = totals.accountReport[acc];
                  return (
                    <div key={acc} className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Wallet size={14} className="text-indigo-500" />
                          <h4 className="text-xs font-black text-slate-900">{acc}</h4>
                        </div>
                        <p className="text-sm font-black text-emerald-600">${report.paid.toLocaleString()}</p>
                      </div>
                      <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
                        <div className={`h-full ${CHART_COLORS[idx % CHART_COLORS.length]} rounded-full`} style={{ width: `${Math.min(report.percent, 100)}%` }} />
                      </div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">Available: ${report.balance.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bank' && <BankStatementAnalyzer activeProfileId={activeProfile.id} accounts={bankAccounts} setAccounts={setBankAccounts} />}
        {activeTab === 'gemini' && <div className="space-y-6"><GeminiFileUpload onConfirm={handleAISync} /></div>}
        
        {activeTab === 'settings' && (
          <div className="space-y-8 pb-10">
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Funding Sources</h3>
              <div className="flex gap-2 max-w-[320px]">
                <input type="text" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} placeholder="Savings, Credit, etc." className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-rose-500" />
                <button onClick={handleAddAccount} disabled={!newAccountName.trim()} className="bg-slate-900 text-white p-2 rounded-xl shadow-md active:scale-95 transition-transform"><Plus size={16} /></button>
              </div>
              <div className="space-y-3">
                {accounts.map((acc, idx) => (
                  <div key={acc} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${CHART_COLORS[idx % CHART_COLORS.length]} bg-opacity-10 text-slate-600 rounded-xl flex items-center justify-center`}><Wallet size={14} /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{acc}</p>
                        <div className="flex items-center gap-1 bg-slate-50 rounded-lg px-2 py-0.5 mt-1">
                          <span className="text-[9px] font-bold text-slate-400">$</span>
                          <input type="number" value={accountBudgets[acc] || ""} onChange={(e) => saveAccountBudget(acc, e.target.value)} placeholder="0" className="w-16 bg-transparent text-[10px] font-black outline-none" />
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setDeleteConfirmation({ isOpen: true, type: "account", id: acc, name: acc })} className="p-2 text-slate-200 hover:text-rose-500"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">User Workspaces</h3>
              <div className="flex gap-2 max-w-[320px]">
                <input type="text" value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} placeholder="Workspace Name..." className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-rose-500" />
                <button onClick={handleAddProfile} disabled={!newProfileName.trim()} className="bg-slate-900 text-white p-2 rounded-xl shadow-md active:scale-95 transition-transform"><Plus size={16} /></button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {profiles.map(p => (
                  <div key={p.id} onClick={() => handleSwitchProfile(p)} className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${activeProfile?.id === p.id ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-100 hover:border-rose-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeProfile?.id === p.id ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-400'}`}><UserCircle size={20} /></div>
                      <p className={`text-sm font-bold ${activeProfile?.id === p.id ? 'text-rose-900' : 'text-slate-800'}`}>{p.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeProfile?.id === p.id && <Check size={16} className="text-rose-600" />}
                      {p.id !== 'default' && (
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmation({ isOpen: true, type: "profile", id: p.id, name: p.name }); }} className="p-2 text-slate-300 hover:text-black"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Backup & Vault</h3>
              <BackupRestore showToast={showToast} />
            </section>
          </div>
        )}
      </main>

      {/* Action Buttons */}
      <div className="fixed bottom-28 right-6 flex flex-col gap-4 z-50 no-print">
        <button onClick={() => setIsChatBotOpen(true)} className="w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 border-4 border-white"><MessageSquare size={22} /></button>
        <button onClick={() => setIsCalculatorOpen(true)} className="w-12 h-12 bg-white text-slate-600 rounded-full shadow-lg flex items-center justify-center active:scale-90 border border-slate-100"><CalcIcon size={22} /></button>
        <button onClick={() => openAddModal()} className="w-14 h-14 bg-rose-500 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 border-4 border-white"><Plus size={24} strokeWidth={3} /></button>
      </div>

      <Calculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
      <AIChatBot isOpen={isChatBotOpen} onClose={() => setIsChatBotOpen(false)} dataContext={{ expenses, totals, accounts, bankAccounts, accountReport: totals.accountReport }} onModifyBudget={handleAIModifyBudget} onAddTransaction={handleAIAddTransaction} />

      {/* Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[480px] bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] p-1.5 shadow-2xl z-50 flex items-center no-print border border-slate-800">
        <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-all rounded-2xl ${activeTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-slate-500'}`}><LayoutDashboard size={18} /><span className="text-[8px] font-black uppercase tracking-tighter">Home</span></button>
        <button onClick={() => setActiveTab('ledger')} className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-all rounded-2xl ${activeTab === 'ledger' ? 'bg-white/10 text-white' : 'text-slate-500'}`}><LayoutList size={18} /><span className="text-[8px] font-black uppercase tracking-tighter">Ledger</span></button>
        <button onClick={() => setActiveTab('analysis')} className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-all rounded-2xl ${activeTab === 'analysis' ? 'bg-white/10 text-white' : 'text-slate-500'}`}><BarChart3 size={18} /><span className="text-[8px] font-black uppercase tracking-tighter">Stats</span></button>
        <button onClick={() => setActiveTab('bank')} className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-all rounded-2xl ${activeTab === 'bank' ? 'bg-white/10 text-white' : 'text-slate-500'}`}><Landmark size={18} /><span className="text-[8px] font-black uppercase tracking-tighter">Bank</span></button>
        <button onClick={() => setActiveTab('settings')} className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-all rounded-2xl ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-slate-500'}`}><Settings size={18} /><span className="text-[8px] font-black uppercase tracking-tighter">More</span></button>
      </nav>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[92vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between shrink-0">
               <div><h2 className="text-lg font-black text-slate-900">{editingExpense ? 'Edit Entry' : 'New Entry'}</h2></div>
               <button onClick={() => setIsAddModalOpen(false)} className="p-2.5 bg-slate-50 rounded-2xl text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto pb-10">
               <form id="ledger-form" onSubmit={saveExpense} className="space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2"><label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Item Name</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-base font-bold outline-none focus:border-rose-500" /></div>
                    <div><label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Category</label><select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-base font-bold outline-none">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Date</label><input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-base font-bold outline-none" /></div>
                    <div><label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Agreed Amount</label><input type="number" required value={formData.totalAmount} onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-base font-bold outline-none" /></div>
                    <div><label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Paid Amount</label><input type="number" required value={formData.advancePaid} onChange={(e) => setFormData({...formData, advancePaid: e.target.value})} className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 text-base font-bold outline-none" /></div>
                    <div className="col-span-2"><label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Paid From</label><select value={formData.account} onChange={(e) => setFormData({...formData, account: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-base font-bold outline-none">{accounts.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
                 </div>
               </form>
            </div>
            <div className="px-6 py-6 bg-white border-t border-slate-50"><button form="ledger-form" type="submit" className="w-full py-4 bg-slate-900 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-200">
              {editingExpense ? 'Update Ledger' : 'Add Ledger'}
            </button></div>
          </div>
        </div>
      )}

      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95">
            <AlertCircle size={32} className="mx-auto text-rose-500 mb-4" />
            <h3 className="font-bold text-slate-900 mb-2">Confirm Delete</h3>
            <p className="text-xs text-slate-400 mb-8">Delete "{deleteConfirmation.name}"?</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setDeleteConfirmation({ isOpen: false, type: null, id: null, name: "" })} className="py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase">Cancel</button>
              <button onClick={deleteConfirmation.type === 'account' ? executeRemoveAccount : deleteConfirmation.type === 'profile' ? executeDeleteProfile : executeDeleteExpense} className="py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
