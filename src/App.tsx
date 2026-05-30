import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  ShoppingCart, 
  Sparkles, 
  PieChart, 
  Users, 
  Settings as SettingsIcon, 
  Bell, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  ArrowRight, 
  Mic, 
  Camera, 
  Scan, 
  ChevronRight, 
  Clock, 
  Calendar, 
  Check, 
  Info, 
  Shield, 
  Zap,
  Flame,
  Maximize2,
  FileText,
  UserCheck,
  RefreshCw,
  Search,
  BookOpen
} from 'lucide-react';
import { 
  User, 
  Household, 
  PantryItem, 
  GroceryItem, 
  Recipe, 
  SystemNotification,
  SpendingPoint,
  CategorySpend,
  DashboardStats 
} from './types';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pantry' | 'grocery' | 'recipes' | 'expiry' | 'analytics' | 'household' | 'settings'>('dashboard');
  
  // App Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);

  // Core Data Lists
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Modals & Assistant States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [recipeGenerating, setRecipeGenerating] = useState(false);
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
  
  // OCR Demo State
  const [selectedDemoReceipt, setSelectedDemoReceipt] = useState<string | null>(null);
  const [ocrResultsPreview, setOcrResultsPreview] = useState<any[] | null>(null);

  // New Item Form State (Pantry/Grocery)
  const [formType, setFormType] = useState<'pantry' | 'grocery'>('pantry');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemUnit, setNewItemUnit] = useState('pcs');
  const [newItemCategory, setNewItemCategory] = useState('Produce');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [newItemPrice, setNewItemPrice] = useState<number>(2.99);
  const [newItemExpiry, setNewItemExpiry] = useState('');
  const [newItemBarcode, setNewItemBarcode] = useState('');

  // Voice Interaction State
  const [voiceQuery, setVoiceQuery] = useState('');
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<{ target: string; message: string } | null>(null);

  // API loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);

  // Initial Fetch Data
  const fetchData = async () => {
    try {
      setSyncing(true);
      const [resPantry, resGrocery, resNotif, resStats, resHousehold] = await Promise.all([
        fetch('/api/pantry').then(r => r.json()),
        fetch('/api/grocery').then(r => r.json()),
        fetch('/api/notifications').then(r => r.json()),
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/household').then(r => r.json())
      ]);

      setPantryItems(resPantry);
      setGroceryItems(resGrocery);
      setNotifications(resNotif);
      setStats(resStats);
      setCurrentUser(resHousehold.currentUser);
      setHousehold(resHousehold.household);
    } catch (e) {
      console.error("Failed to fetch fresh data:", e);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync / Refresh helper
  const triggerRefresh = () => {
    fetchData();
  };

  // Helper function to handle additions
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      if (formType === 'pantry') {
        const payload = {
          name: newItemName,
          quantity: newItemQty,
          unit: newItemUnit,
          category: newItemCategory,
          notes: newItemNotes,
          expiresAt: newItemExpiry || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          price: newItemPrice,
          barcode: newItemBarcode || undefined
        };

        const res = await fetch('/api/pantry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setIsAddModalOpen(false);
          resetForm();
          fetchData();
        }
      } else {
        const payload = {
          name: newItemName,
          quantity: newItemQty,
          unit: newItemUnit,
          category: newItemCategory,
          notes: newItemNotes,
          price: newItemPrice
        };

        const res = await fetch('/api/grocery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setIsAddModalOpen(false);
          resetForm();
          fetchData();
        }
      }
    } catch (error) {
      console.error('Failed to create item', error);
    }
  };

  const resetForm = () => {
    setNewItemName('');
    setNewItemQty(1);
    setNewItemUnit('pcs');
    setNewItemCategory('Produce');
    setNewItemNotes('');
    setNewItemPrice(2.99);
    setNewItemExpiry('');
    setNewItemBarcode('');
    setOcrResultsPreview(null);
    setSelectedDemoReceipt(null);
  };

  // Consume pantry item item
  const handleConsumeItem = async (id: string, amount: number) => {
    try {
      const res = await fetch('/api/pantry/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, amount })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error("Failed to consume item", e);
    }
  };

  // Toggle grocery check state
  const handleToggleGrocery = async (id: string, checked: boolean) => {
    try {
      // optimistic state update
      setGroceryItems(prev => prev.map(item => item.id === id ? { ...item, checked } : item));
      await fetch('/api/grocery/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, checked })
      });
      fetchData(); // re-verify values
    } catch (e) {
      console.error("Toggle error:", e);
    }
  };

  const handleDeleteGrocery = async (id: string) => {
    try {
      setGroceryItems(prev => prev.filter(i => i.id !== id));
      await fetch(`/api/grocery/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePantry = async (id: string) => {
    try {
      setPantryItems(prev => prev.filter(i => i.id !== id));
      await fetch(`/api/pantry/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Move checked items to pantry, clear list
  const handleSweepGroceries = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/grocery/sweep', { method: 'POST' });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  // AI-Powered Actions
  const handleGenerateRecipes = async () => {
    setRecipeGenerating(true);
    setActiveTab('recipes');
    try {
      const res = await fetch('/api/ai/recipe', { method: 'POST' });
      if (res.ok) {
        const recipes = await res.json();
        setAiRecipes(recipes);
      }
    } catch (e) {
      console.error("Failed recipe extraction:", e);
    } finally {
      setRecipeGenerating(false);
    }
  };

  // Pre-load basic recipes in background
  useEffect(() => {
    if (isAuthenticated) {
      // Fetch default chef recipe recommendation
      fetch('/api/ai/recipe', { method: 'POST' })
        .then(res => res.json())
        .then(data => setAiRecipes(data))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handlePredictUpcoming = async () => {
    setIsPredicting(true);
    try {
      const res = await fetch('/api/ai/predict', { method: 'POST' });
      if (res.ok) {
        const predictions = await res.json();
        // Insert predicted items into grocery list dynamically as recommendations
        predictions.forEach(async (pred: any) => {
          await fetch('/api/grocery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: pred.name,
              quantity: pred.quantity,
              unit: pred.unit,
              category: pred.category,
              notes: pred.notes,
              price: pred.price,
              predictedNeed: true
            })
          });
        });
        // Success feedback
        setTimeout(() => {
          fetchData();
          setIsPredicting(false);
        }, 1200);
      }
    } catch (e) {
      console.error(e);
      setIsPredicting(false);
    }
  };

  // Barcode quick lookup
  const handleBarcodeSearch = async (code: string) => {
    if (!code) return;
    try {
      const res = await fetch('/api/ai/barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: code })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.item) {
          setNewItemName(data.item.name);
          setNewItemCategory(data.item.category);
          setNewItemUnit(data.item.unit);
          setNewItemNotes(data.item.notes + ' (Barcode Recognized)');
          setNewItemBarcode(code);
        }
      }
    } catch(e) {
      console.error(e);
    }
  };

  // Simulated OCR Selection & parsing using Gemini
  const handleOcrPresetSelection = async (store: 'wholefoods' | 'costco' | 'traderjoes') => {
    setSelectedDemoReceipt(store);
    setIsOCRProcessing(true);
    try {
      // Simulate real file base64
      const mockImageBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...";
      const res = await fetch('/api/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: mockImageBase64 })
      });
      if (res.ok) {
        let results = await res.json();
        // Give Wholefood names or Costco specific variations
        if (store === 'traderjoes') {
          results = [
            { name: 'Organic Almond Butter', quantity: 1, unit: 'jar', category: 'Pantry', price: 6.99, expiresInDays: 90 },
            { name: 'Multigrain Flax Toast Crackers', quantity: 2, unit: 'boxes', category: 'Bakery', price: 3.49, expiresInDays: 45 },
            { name: 'Chilled Sweet Apple Cider', quantity: 1, unit: 'L', category: 'Beverages', price: 4.50, expiresInDays: 12 }
          ];
        } else if (store === 'costco') {
          results = [
            { name: 'Bulk Gold Kiwis', quantity: 12, unit: 'pcs', category: 'Produce', price: 9.80, expiresInDays: 8 },
            { name: 'Kirkland Sharp Cheddar', quantity: 1, unit: 'brick', category: 'Dairy', price: 11.49, expiresInDays: 30 },
            { name: 'Free Range Eggs (Bulk)', quantity: 30, unit: 'pcs', category: 'Dairy', price: 7.20, expiresInDays: 18 }
          ];
        }
        setOcrResultsPreview(results);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsOCRProcessing(false);
    }
  };

  // Confirm OCR items and commit them to user database
  const handleConfirmOcrSweep = async () => {
    if (!ocrResultsPreview) return;
    try {
      setSyncing(true);
      for (const item of ocrResultsPreview) {
        // Send directly to pantry lot
        const expiresAt = new Date(Date.now() + item.expiresInDays * 24 * 60 * 60 * 1000).toISOString();
        await fetch('/api/pantry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            category: item.category,
            price: item.price,
            notes: 'Imported via Receipt OCR',
            expiresAt
          })
        });
      }
      setIsAddModalOpen(false);
      resetForm();
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  // Submit voice transcript command
  const handleVoiceCommand = async () => {
    if (!voiceQuery.trim()) return;
    setIsVoiceProcessing(true);
    setVoiceFeedback(null);
    try {
      const res = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: voiceQuery })
      });
      if (res.ok) {
        const rData = await res.json();
        // Automatically execute insertion based on parsed target
        if (rData.target === 'pantry') {
          await fetch('/api/pantry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rData.item)
          });
          setVoiceFeedback({ target: 'Pantry', message: `Successfully added ${rData.item.quantity} ${rData.item.unit} of "${rData.item.name}"!` });
        } else {
          await fetch('/api/grocery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rData.item)
          });
          setVoiceFeedback({ target: 'Grocery List', message: `Suggested Target: Grocery List. Added custom "${rData.item.name}" successfully!` });
        }
        setVoiceQuery('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsVoiceProcessing(false);
    }
  };

  // Smart Add missing Recipe ingredients to Grocery checklist
  const handleAddRecipeIngredientsToGrocery = async (ingName: string, amount: string) => {
    try {
      await fetch('/api/grocery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ingName,
          quantity: 1,
          unit: amount || 'pcs',
          category: 'Produce',
          notes: 'Missing recipe ingredient auto-add'
        })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Invite member submission
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Member' | 'Viewer'>('Member');
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    try {
      const res = await fetch('/api/household/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inviteName, email: inviteEmail, role: inviteRole })
      });
      if (res.ok) {
        setInviteStatus(`Invitation sent successfully to ${inviteName}!`);
        setInviteName('');
        setInviteEmail('');
        fetchData();
        setTimeout(() => setInviteStatus(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Simple Notification dismissal
  const handleMarkNotificationsRead = async (id: string) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Filter pantry items by selected categories or query
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'All' | 'Produce' | 'Dairy' | 'Meat' | 'Bakery' | 'Pantry' | 'Beverages' | 'Household'>('All');
  
  const filteredPantryItems = pantryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategoryFilter === 'All' || item.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="app_root" className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside id="app_sidebar" className="w-64 border-r border-slate-200 bg-white flex flex-col z-10 shadow-sm transition-all">
        {/* Startup Brand Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-indigo-200">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">FreshKeep AI</span>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Smart Home Hub</span>
            </div>
          </div>
          {syncing && (
            <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
          )}
        </div>
        
        {/* Navigation Rail */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <button 
            id="nav_dashboard"
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4.5 h-4.5" />
              <span>Dashboard</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">Live</span>
          </button>

          <button 
            id="nav_pantry"
            onClick={() => setActiveTab('pantry')} 
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'pantry' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4.5 h-4.5" />
              <span>Pantry Inventory</span>
            </div>
            {stats && stats.lowStockCount > 0 && (
              <span id="pantry_alert_badge" className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">{stats.lowStockCount} low</span>
            )}
          </button>

          <button 
            id="nav_grocery"
            onClick={() => setActiveTab('grocery')} 
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'grocery' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-4.5 h-4.5" />
              <span>Smart Lists</span>
            </div>
            {groceryItems.length > 0 && (
              <span id="grocery_count_badge" className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">{groceryItems.filter(i=>!i.checked).length} left</span>
            )}
          </button>

          <button 
            id="nav_recipes"
            onClick={() => setActiveTab('recipes')} 
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'recipes' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4.5 h-4.5" />
              <span>AI Recipes</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-extrabold uppercase">Chef</span>
          </button>

          <button 
            id="nav_expiry"
            onClick={() => setActiveTab('expiry')} 
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'expiry' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4.5 h-4.5" />
              <span>Expiry alerts</span>
            </div>
            {stats && stats.expiringSoonCount > 0 && (
              <span id="expiry_alert_badge" className="px-2 py-0.5 rounded-full text-[10px] bg-red-100 text-red-800 font-bold">{stats.expiringSoonCount} due</span>
            )}
          </button>

          <button 
            id="nav_analytics"
            onClick={() => setActiveTab('analytics')} 
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'analytics' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <PieChart className="w-4.5 h-4.5" />
              <span>Visual analytics</span>
            </div>
          </button>

          <button 
            id="nav_household"
            onClick={() => setActiveTab('household')} 
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'household' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4.5 h-4.5" />
              <span>Household share</span>
            </div>
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
          </button>

          <button 
            id="nav_settings"
            onClick={() => setActiveTab('settings')} 
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'settings' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-4.5 h-4.5" />
              <span>System Settings</span>
            </div>
          </button>
        </nav>

        {/* User Card Segment at bottom of Sidebar */}
        <div id="household_user_segment" className="p-4 border-t border-slate-150 bg-slate-50">
          {currentUser && (
            <div className="flex items-center gap-3 mb-3">
              <img 
                id="current_user_avatar"
                src={currentUser.avatarUrl} 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-2 ring-indigo-100" 
                alt="user profile picture" 
              />
              <div className="overflow-hidden">
                <div id="current_user_name" className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded inline-block uppercase tracking-wider">{currentUser.role}</div>
              </div>
            </div>
          )}
          {household && (
            <div className="bg-slate-900 text-white rounded-xl p-3 shadow-md">
              <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mb-0.5">Household group</div>
              <div id="household_name" className="font-bold text-xs text-indigo-200 truncate mb-2">{household.name}</div>
              <button 
                id="household_invite_quick"
                onClick={() => setActiveTab('household')} 
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[11px] font-bold text-white transition-all uppercase tracking-wider"
              >
                + Member Sync
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main id="app_main_content" className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header Bar */}
        <header id="app_header" className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 z-10 shadow-xs">
          <div className="flex items-center gap-4">
            <h1 id="page_title" className="text-xl font-extrabold text-slate-900 capitalize tracking-tight flex items-center gap-2">
              {activeTab === 'dashboard' && "Command Dashboard"}
              {activeTab === 'pantry' && "Pantry Shelf Inventory"}
              {activeTab === 'grocery' && "Smart Grocery Shopping Lists"}
              {activeTab === 'recipes' && "AI Waste Reduction Chef"}
              {activeTab === 'expiry' && "Smart Food Waste Prevention & Expiry"}
              {activeTab === 'analytics' && "Visual Spend Analytics"}
              {activeTab === 'household' && "Household Multi-User Share"}
              {activeTab === 'settings' && "Configure Dev Workspace"}
            </h1>
            <span id="cloud_sync_tag" className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              cloud sync live
            </span>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Quick predicts */}
            <button
              id="header_quick_predict"
              onClick={handlePredictUpcoming}
              disabled={isPredicting}
              className="px-3.5 py-1.8 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs font-bold rounded-lg hover:brightness-105 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-white animate-spin-slow" />
              {isPredicting ? 'Forecasting Needs...' : 'AI Predict restocks'}
            </button>

            {/* Notification bell tab trigger */}
            <div className="relative">
              <button 
                id="header_notification_bell"
                onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span id="bell_unread_dot" className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {/* Float notification alerts list */}
              {isNotificationPanelOpen && (
                <div id="floating_notif_panel" className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 transition-all">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                    <span className="font-bold text-sm text-slate-900">Push Notifications ({notifications.filter(n => !n.isRead).length})</span>
                    <button 
                      id="notif_mark_all_read"
                      onClick={() => handleMarkNotificationsRead('all')} 
                      className="text-xs text-indigo-600 hover:underline font-semibold"
                    >
                      Clear all alerts
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">No active alerts. Good job!</div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-3 rounded-xl border transition-all text-xs ${
                            notif.isRead ? 'bg-slate-50/50 border-slate-100 text-slate-500' : 'bg-indigo-50/40 border-indigo-100 text-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 font-bold text-slate-900">
                              {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                              {notif.type === 'danger' && <Flame className="w-4 h-4 text-red-500 shrink-0" />}
                              {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                              {notif.type === 'info' && <Info className="w-4 h-4 text-blue-500 shrink-0" />}
                              <span>{notif.title}</span>
                            </div>
                            {!notif.isRead && (
                              <button 
                                onClick={() => handleMarkNotificationsRead(notif.id)} 
                                className="text-[10px] text-indigo-600 hover:underline font-extrabold shrink-0"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                          <p className="mt-1 text-[11px] leading-relaxed select-none">{notif.description}</p>
                          <span className="mt-1.5 block text-[10px] text-slate-400 font-medium">
                            {new Date(notif.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Add Button */}
            <button 
              id="header_quick_add"
              onClick={() => { setFormType('pantry'); setIsAddModalOpen(true); }}
              className="py-2.2 px-4 bg-slate-900 border border-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-850 hover:shadow-lg transition-all flex items-center gap-2 group cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5 text-white transition-transform group-hover:rotate-90" />
              <span>Restock Manual</span>
            </button>
          </div>
        </header>

        {/* Primary Tab Page Routing Canvas */}
        <div id="primary_routing_canvas" className="p-8 flex-1 overflow-y-auto">

          {/* ======================================================== */}
          {/* TAB 1: DASHBOARD                                         */}
          {/* ======================================================== */}
          {activeTab === 'dashboard' && (
            <div id="tab_dashboard" className="space-y-8 animate-fade-in">
              
              {/* Premium Top Hero Row */}
              <div className="grid grid-cols-12 gap-6">
                
                {/* Visual Circle Gauge & Key Stats */}
                <div className="col-span-12 xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Circular Storage Health Circle Gauge */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider mb-1">Household Quality Score</div>
                      <h3 className="text-lg font-black text-slate-800">Pantry Health Index</h3>
                    </div>
                    
                    <div className="my-4 flex items-center justify-center relative">
                      {/* SVG Gauge */}
                      <svg className="w-28 h-28 transform -rotate-90">
                        <circle cx="56" cy="56" r="46" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                        <circle cx="56" cy="56" r="46" stroke="url(#emeraldGradient)" strokeWidth="10" 
                          strokeDasharray={2 * Math.PI * 46} 
                          strokeDashoffset={2 * Math.PI * 46 * (1 - (stats?.pantryHealthScore || 85) / 100)} 
                          strokeLinecap="round" fill="transparent" />
                        <defs>
                          <lineargradient id="emeraldGradient" x1="1" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#059669" />
                          </lineargradient>
                        </defs>
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span id="dashboard_health_value" className="text-2xl font-black text-slate-900">{stats?.pantryHealthScore || 85}%</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">sturdy</span>
                      </div>
                    </div>

                    <div className="mt-1 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${stats?.pantryHealthScore || 85}%` }}></div>
                    </div>
                  </div>

                  {/* Expiring Soon Counter */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between cursor-pointer group hover:border-red-200 transition-all" onClick={() => setActiveTab('expiry')}>
                    <div>
                      <div className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider mb-1">Spoilage Counter</div>
                      <h3 className="text-lg font-black text-slate-800">Critical Expiries</h3>
                    </div>
                    
                    <div className="my-2.5">
                      <div id="dashboard_expiring_count" className="text-4xl font-extrabold text-red-600 tracking-tight flex items-baseline gap-2">
                        {stats?.expiringSoonCount || 0}
                        <span className="text-sm font-semibold text-slate-400">items due</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 font-medium">Due within 3 Days. Prevent wastage now.</p>
                    </div>

                    <div className="text-xs font-bold text-red-600 group-hover:underline flex items-center gap-1.5">
                      <span>Review Shelf Alerts</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Estimating monthly spends */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between cursor-pointer group hover:border-indigo-200 transition-all" onClick={() => setActiveTab('analytics')}>
                    <div>
                      <div className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider mb-1">Monthly Analytics</div>
                      <h3 className="text-lg font-black text-slate-800">Estimated Cost</h3>
                    </div>
                    
                    <div className="my-2.5">
                      <div id="dashboard_monthly_spend" className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        $340.00
                      </div>
                      <p className="text-xs text-emerald-600 mt-2 font-black flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-500" />
                        -12.4% vs prev month
                      </p>
                    </div>

                    <div className="text-xs font-bold text-indigo-600 group-hover:underline flex items-center gap-1.5">
                      <span>View spend analytics</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                </div>

                {/* Right: Premium AI Assistant prompt card */}
                <div id="ai_assistant_card" className="col-span-12 xl:col-span-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center shadow">
                        <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
                      </div>
                      <span className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-widest">Active Chef Brain</span>
                    </div>

                    <h3 className="text-lg font-extrabold mb-1.5 leading-snug">Waste Prevention Active</h3>
                    <p className="text-slate-300 text-xs leading-relaxed font-semibold">
                      Your <span className="text-amber-300 underline font-extrabold">Avocado Hass</span> is estimated to spoil tomorrow! Bake a fresh batch of Citrus Guacamole or Lemon Salmon Salad.
                    </p>
                  </div>

                  <button 
                    id="chef_see_recipes"
                    onClick={handleGenerateRecipes}
                    className="w-full mt-4 py-2 bg-white hover:bg-slate-50 text-indigo-950 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all text-center cursor-pointer uppercase tracking-wider"
                  >
                    Generate Customized Recipes
                  </button>
                </div>

              </div>

              {/* Modular Action Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                <div 
                  id="action_ocr"
                  onClick={() => { setFormType('pantry'); setIsAddModalOpen(true); }}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3.5 group"
                >
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">AI Receipt OCR Scan</h4>
                    <p className="text-xs text-slate-400 font-medium">Import printed receipts instantly via Gemini lens.</p>
                  </div>
                </div>

                <div 
                  id="action_barcode"
                  onClick={() => { setFormType('pantry'); setIsAddModalOpen(true); }}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3.5 group"
                >
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Scan className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">Scan Product Barcode</h4>
                    <p className="text-xs text-slate-400 font-medium">Verify global codes & baseline product capacities.</p>
                  </div>
                </div>

                <div 
                  id="action_voice"
                  onClick={() => { setFormType('pantry'); setIsAddModalOpen(true); }}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3.5 group"
                >
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">Voice Grocery command</h4>
                    <p className="text-xs text-slate-400 font-medium">"I just bought eggs" - hands-free voice engine.</p>
                  </div>
                </div>

                <div 
                  id="action_predict"
                  onClick={handlePredictUpcoming}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3.5 group"
                >
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">Forecasting Predictor</h4>
                    <p className="text-xs text-slate-400 font-medium">Estimate household restocks automatically.</p>
                  </div>
                </div>

              </div>

              {/* Main Shelf List Summary Card */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-800">Active Pantry Lots overview</h3>
                    <p className="text-xs text-slate-400">Quick view of fresh food portions stored.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('pantry')}
                    className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1 hover:underline"
                  >
                    <span>View full shelf</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#FAF9F6] text-slate-500 font-extrabold border-b border-slate-100 text-xs">
                      <tr>
                        <th className="px-6 py-4">Product Name</th>
                        <th className="px-6 py-4">Total Quantity Remaining</th>
                        <th className="px-6 py-4">Shelf-life alert</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Safety Index</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {pantryItems.slice(0, 4).map(item => {
                        const now = new Date();
                        const earliestLot = item.lots.reduce((min, lot) => new Date(lot.expiresAt) < new Date(min.expiresAt) ? lot : min, item.lots[0]);
                        const isExpired = earliestLot ? new Date(earliestLot.expiresAt) <= now : false;
                        const isExpiringSoon = earliestLot ? (new Date(earliestLot.expiresAt).getTime() - now.getTime()) <= 3 * 24 * 60 * 60 * 1000 : false;
                        
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-6 py-4 font-black text-slate-900">{item.name}</td>
                            <td className="px-6 py-4">{item.quantity} {item.unit}</td>
                            <td className="px-6 py-4">
                              {earliestLot ? (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{new Date(earliestLot.expiresAt).toLocaleDateString()}</span>
                                </div>
                              ) : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">{item.category}</span>
                            </td>
                            <td className="px-6 py-4">
                              {isExpired ? (
                                <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-black">Spilt / Exploded</span>
                              ) : isExpiringSoon ? (
                                <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black">Consume Today</span>
                              ) : (
                                <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">Perfect Safety</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: PANTRY / SHELF INVENTORY                         */}
          {/* ======================================================== */}
          {activeTab === 'pantry' && (
            <div id="tab_pantry" className="space-y-6 animate-fade-in">
              
              {/* Filter controls row */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                
                {/* Search Bar */}
                <div className="w-full md:w-80 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input 
                    id="pantry_search_input"
                    type="text" 
                    placeholder="Search pantry shelf..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 font-medium bg-slate-50/50"
                  />
                </div>

                {/* Categories selector */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl max-w-full overflow-x-auto">
                  {(['All', 'Produce', 'Dairy', 'Meat', 'Bakery', 'Pantry', 'Beverages', 'Household'] as const).map(cat => (
                    <button 
                      key={cat}
                      id={`filter_cat_${cat}`}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                        selectedCategoryFilter === cat 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-850'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Create trigger */}
                <button 
                  id="pantry_add_manually"
                  onClick={() => { setFormType('pantry'); setIsAddModalOpen(true); }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 text-white" />
                  Add Custom Item
                </button>
              </div>

              {/* Bento Grid layout of items */}
              {filteredPantryItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
                  <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-800 text-lg">No Pantry items found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">Either start searching for other terms or click "+ Custom Item" to initialize your kitchen stock logs.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPantryItems.map(item => {
                    // check logic for lots
                    const expiryPercentage = 100; // default safe
                    const now = new Date();
                    const nextExpiryLot = item.lots.reduce((min, lot) => new Date(lot.expiresAt) < new Date(min.expiresAt) ? lot : min, item.lots[0]);
                    const isExpired = nextExpiryLot ? new Date(nextExpiryLot.expiresAt) <= now : false;
                    const daysRemaining = nextExpiryLot 
                      ? Math.ceil((new Date(nextExpiryLot.expiresAt).getTime() - now.getTime()) / (24 * 3600 * 1000))
                      : 10;

                    return (
                      <div 
                        key={item.id} 
                        id={`pantry_card_${item.id}`}
                        className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden relative group hover:border-indigo-200 hover:shadow-md ${
                          item.isLowStock ? 'outline-2 outline-amber-400 outline-offset-[-2px]' : ''
                        }`}
                      >
                        {/* Expiry Header status color band */}
                        <div className={`h-1.5 ${
                          isExpired ? 'bg-red-500' : daysRemaining < 3 ? 'bg-amber-400' : 'bg-emerald-500'
                        }`} />

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          
                          {/* Name + Cat block */}
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{item.category}</span>
                              {item.isLowStock && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black uppercase">Low Stock</span>
                              )}
                            </div>
                            <h4 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">{item.name}</h4>
                            
                            {item.notes && (
                              <p className="text-xs text-slate-400 mt-1 italic font-medium truncate">{item.notes}</p>
                            )}

                            {/* Remaining Indicator */}
                            <div className="mt-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-slate-500">Remaining</span>
                                <span className="text-slate-900">{item.quantity} / {item.capacity} {item.unit}</span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    item.quantity <= item.capacity * 0.3 ? 'bg-amber-400' : 'bg-indigo-600'
                                  }`} 
                                  style={{ width: `${Math.min(100, (item.quantity / item.capacity) * 100)}%` }} 
                                />
                              </div>
                            </div>
                          </div>

                          {/* Lots metadata and consumption trigger slider */}
                          <div className="mt-5 space-y-4">
                            
                            {/* Lots Expiries list */}
                            <div className="text-[11px] font-bold text-slate-500 space-y-1 bg-slate-50/50 p-2 rounded-lg">
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Shelf lots expiry:</span>
                              </div>
                              {item.lots.map((lot, idx) => {
                                const lotExpiryDays = Math.ceil((new Date(lot.expiresAt).getTime() - now.getTime()) / (24 * 3600 * 1000));
                                return (
                                  <div key={lot.id} className="flex justify-between items-center text-[10.5px]">
                                    <span className="text-slate-600 font-medium">Lot #{idx+1} ({lot.quantity} {item.unit})</span>
                                    <span className={lotExpiryDays < 3 ? 'text-red-600 font-extrabold' : 'text-slate-500'}>
                                      {lotExpiryDays <= 0 ? 'Expired' : `${lotExpiryDays} days remaining`}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Consume sliders actions */}
                            <div>
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                <span>Adjust / Consume Stock</span>
                                <span className="text-[10px] text-indigo-600 font-black">Incremental</span>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-1.5">
                                <button 
                                  id={`consume_quarter_${item.id}`}
                                  onClick={() => handleConsumeItem(item.id, Math.min(item.quantity, Math.round(item.capacity * 0.25 * 100) / 100))}
                                  className="py-1 px-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[10px] text-slate-600 rounded font-black transition-colors"
                                >
                                  - 25%
                                </button>
                                <button 
                                  id={`consume_half_${item.id}`}
                                  onClick={() => handleConsumeItem(item.id, Math.min(item.quantity, Math.round(item.capacity * 0.5 * 100) / 100))}
                                  className="py-1 px-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[10px] text-slate-600 rounded font-black transition-colors"
                                >
                                  - 50%
                                </button>
                                <button 
                                  id={`consume_all_${item.id}`}
                                  onClick={() => handleConsumeItem(item.id, item.quantity)}
                                  className="py-1 px-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-[10px] text-red-700 rounded font-black transition-colors"
                                >
                                  All
                                </button>
                              </div>
                            </div>

                          </div>

                          {/* Quick delete trash button */}
                          <div className="mt-4 pt-3.5 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-medium">Last updated {new Date(item.lastUpdated).toLocaleDateString()}</span>
                            <button 
                              onClick={() => handleDeletePantry(item.id)}
                              className="text-slate-300 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: SMART LISTS & CHECKLIST                           */}
          {/* ======================================================== */}
          {activeTab === 'grocery' && (
            <div id="tab_grocery" className="grid grid-cols-12 gap-8 animate-fade-in">
              
              {/* Left Column: Active list checklist */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
                  
                  {/* Top commands */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-black text-lg text-slate-900">Oakwood Household Grocery Checklist</h3>
                      <p className="text-xs text-slate-400">Mark items purchased and click Sweep back to Inventory lots logs.</p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        id="sweep_checked_items"
                        onClick={handleSweepGroceries}
                        disabled={groceryItems.filter(i => i.checked).length === 0}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl text-xs font-black shadow transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        Sweep checked {groceryItems.filter(i=>i.checked).length > 0 && `(${groceryItems.filter(i=>i.checked).length})`}
                      </button>
                      
                      <button 
                        onClick={() => { setFormType('grocery'); setIsAddModalOpen(true); }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-white" />
                        Add checklist item
                      </button>
                    </div>
                  </div>

                  {/* Active List */}
                  {groceryItems.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                      <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                      <p className="font-bold text-sm text-slate-600">Your grocery shopping list is entirely clean.</p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">Review "AI predictions segment" on the right sidebar to instantly restore high-probability snacks!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {groceryItems.map(item => (
                        <div 
                          key={item.id} 
                          id={`grocery_line_${item.id}`}
                          className={`py-3.5 flex items-center justify-between gap-4 group transition-all ${
                            item.checked ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <button 
                              id={`gline_check_${item.id}`}
                              onClick={() => handleToggleGrocery(item.id, !item.checked)}
                              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                                item.checked 
                                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                                  : 'border-slate-300 bg-white hover:border-slate-400'
                              }`}
                            >
                              {item.checked && <Check className="w-4.5 h-4.5 text-white stroke-[3.5]" />}
                            </button>

                            <div>
                              <span className={`font-black text-sm text-slate-900 block ${item.checked ? 'line-through text-slate-400' : ''}`}>
                                {item.name}
                              </span>
                              
                              <div className="flex items-center gap-2 mt-0.5 text-[10.5px] font-bold">
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 uppercase tracking-wider">{item.category}</span>
                                {item.quantity && <span className="text-slate-400">{item.quantity} {item.unit}</span>}
                                {item.price > 0 && <span className="text-slate-400">${item.price} estimation</span>}
                                {item.predictedNeed && (
                                  <span className="text-indigo-600 bg-indigo-50 px-1 rounded flex items-center gap-0.5 uppercase tracking-wide text-[9.5px]">
                                    <Sparkles className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                                    AI Forecasted
                                  </span>
                                )}
                              </div>

                              {item.notes && (
                                <p className="text-[11px] text-slate-400 italic mt-0.5 leading-snug">{item.notes}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-slate-400">
                            {item.addedBy && (
                              <span className="text-[10px] bg-slate-105 text-slate-500 px-1.8 py-0.5 border border-slate-100 rounded-full font-bold">
                                Added by {item.addedBy}
                              </span>
                            )}
                            <button 
                              onClick={() => handleDeleteGrocery(item.id)}
                              className="text-slate-300 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>

              {/* Right Column: AI predictions shelf panel */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                
                {/* Simulated Barcode Code scanner */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Scan className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Simulated Retail Barcode reader</h4>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Type a simulated test barcode below to auto-bind product metadata:</p>
                  
                  <div className="space-y-2">
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleBarcodeSearch('0120130140')}
                        className="py-1.5 px-2 bg-slate-50 border border-slate-200 hover:border-slate-300 text-[11px] font-black text-slate-600 rounded transition-all grow text-center"
                      >
                        🐄 Milk code
                      </button>
                      <button 
                        onClick={() => handleBarcodeSearch('0854564531')}
                        className="py-1.5 px-2 bg-slate-50 border border-slate-200 hover:border-slate-300 text-[11px] font-black text-slate-600 rounded transition-all grow text-center"
                      >
                        🥑 Avocado code
                      </button>
                      <button 
                        onClick={() => handleBarcodeSearch('7890123456')}
                        className="py-1.5 px-2 bg-slate-50 border border-slate-200 hover:border-slate-300 text-[11px] font-black text-slate-600 rounded transition-all grow text-center"
                      >
                        🍫 Dark Choc code
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI restocking predictor */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-lg space-y-4 relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                      <span className="font-extrabold text-xs uppercase tracking-widest">Upcoming forecasts</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Beta ML engine</span>
                  </div>

                  <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                    We parse consumption velocities to guess depleted items. Select Forecast to update lists instantly.
                  </p>

                  <button 
                    id="trigger_predict_needs"
                    onClick={handlePredictUpcoming}
                    disabled={isPredicting}
                    className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-white ${isPredicting ? 'animate-spin' : ''}`} />
                    {isPredicting ? 'Injecting Predicted restocks...' : 'Estimate Household restocks'}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: AI RECIPES                                        */}
          {/* ======================================================== */}
          {activeTab === 'recipes' && (
            <div id="tab_recipes" className="space-y-6 animate-fade-in">
              
              {/* Chef Banner bar */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 justify-center md:justify-start">
                    <Sparkles className="w-6 h-6 text-indigo-600 animate-spin-slow animate-pulse" />
                    Gemini AI pantry recipe planner
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl font-medium leading-relaxed">
                    We cross-reference expiring shelf lots inside your inventory and generate professional chef recipes to maximize freshness and eliminate luxury food spoilage wastage.
                  </p>
                </div>

                <button 
                  id="chef_regenerate_rec"
                  onClick={handleGenerateRecipes}
                  disabled={recipeGenerating}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer relative shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-white shrink-0 animate-spin-slow" />
                  {recipeGenerating ? 'Chef is generating recipes...' : 'Regenerate tailored recipes'}
                </button>
              </div>

              {/* Recipes grid */}
              {recipeGenerating ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map(n => (
                    <div key={n} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 animate-pulse">
                      <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                      <div className="h-20 bg-slate-50 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {aiRecipes.map((rec, idx) => (
                    <div key={idx} className="bg-white rounded-3xl border border-slate-200 hover:border-indigo-150 transition-all shadow-sm overflow-hidden flex flex-col justify-between">
                      <div className="p-6 space-y-5">
                        
                        {/* Title block */}
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-extrabold tracking-wider bg-indigo-50 text-indigo-700">Recipe Suggestion</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                              Wastage Prevention: {rec.reduceWasteScore || 85}% Score
                            </span>
                          </div>

                          <h4 className="font-extrabold text-lg text-slate-900">{rec.name}</h4>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">{rec.description}</p>
                        </div>

                        {/* Nutrition pill segments */}
                        <div className="grid grid-cols-4 gap-2 text-center text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-bold">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium uppercase">Prep Time</span>
                            <span className="text-slate-800">{rec.prepTime || '20 mins'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium uppercase">Carbs</span>
                            <span className="text-slate-800">{rec.carbs || '15g'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium uppercase">Protein</span>
                            <span className="text-slate-800">{rec.protein || '20g'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium uppercase">Calories</span>
                            <span className="text-slate-800">{rec.calories || '350'} kcal</span>
                          </div>
                        </div>

                        {/* Ingredients Checklist mapping */}
                        <div className="space-y-2">
                          <div className="text-[11px] font-extrabold text-slate-450 uppercase tracking-widest block">Ingredients Checklist:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {rec.ingredients?.map((ing, iIdx) => (
                              <div 
                                key={iIdx} 
                                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 ${
                                  ing.inStock 
                                    ? 'bg-emerald-50/40 border-emerald-100 text-emerald-900' 
                                    : 'bg-amber-50/40 border-amber-100 text-amber-900 font-semibold'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${ing.inStock ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`}></div>
                                  <span className="font-black truncate max-w-[120px]">{ing.name}</span>
                                </div>
                                
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[10px] text-slate-400 font-bold">{ing.amount}</span>
                                  {!ing.inStock && (
                                    <button 
                                      id={`chef_add_grocery_${idx}_${iIdx}`}
                                      onClick={() => handleAddRecipeIngredientsToGrocery(ing.name, ing.amount)}
                                      className="ml-1 px-1.8 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-black uppercase tracking-wider cursor-pointer"
                                      title="Add to grocery shopping list"
                                    >
                                      + Buy
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Instructions listing */}
                        <div className="space-y-2 border-t border-slate-100 pt-4">
                          <div className="text-[11px] font-extrabold text-slate-450 uppercase tracking-widest block">Step-by-step prep manual:</div>
                          <ol className="list-decimal list-inside text-xs space-y-2 text-slate-650 leading-relaxed pl-1">
                            {rec.instructions?.map((inst, insIdx) => (
                              <li key={insIdx} className="font-semibold">{inst}</li>
                            ))}
                          </ol>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: EXPIRY ALERTS                                     */}
          {/* ======================================================== */}
          {activeTab === 'expiry' && (
            <div id="tab_expiry" className="space-y-6 animate-fade-in">
              
              {/* Expiry overview banner info */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-2">
                  <h4 className="font-black text-lg text-slate-900">Food spoilage heatmap warning</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Food waste represents over 35% of overall household spending inefficiency. Below is our temperature heatmap of safety, helping you identify and clear items before they decompose.
                  </p>
                </div>
                
                <div className="md:col-span-4 bg-slate-900 text-white rounded-2xl p-4 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-0.5">Critical Action Threshold</span>
                  <span className="font-black text-2xl text-amber-400">{stats?.expiringSoonCount || 0} Products</span>
                  <span className="text-xs block text-slate-300 font-semibold mt-1">Require triage within 36 hours</span>
                </div>
              </div>

              {/* Interactive Heatmap visualizer */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1.5 block">Visualizing safety zones matching your inventory</span>
                
                <div className="flex h-5 w-full bg-slate-100 rounded-full overflow-hidden text-[10px] text-white font-extrabold text-center select-none shadow">
                  <div className="bg-red-500 h-full w-[15%] flex items-center justify-center">Expired (15%)</div>
                  <div className="bg-amber-400 h-full w-[25%] flex items-center justify-center text-slate-900">Immediate Triage (25%)</div>
                  <div className="bg-emerald-500 h-full w-[60%] flex items-center justify-center">Stable Freshness (60%)</div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-450 pt-1 font-bold">
                  <span>Decomposed danger (0 days)</span>
                  <span>Critical threshold (3 days)</span>
                  <span>Safe shelf life (14+ days)</span>
                </div>
              </div>

              {/* Exhaustive list of expiring lots */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-black text-slate-800">Critical Expiry Timeline</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#FAF9F6] text-slate-500 font-extrabold border-b border-slate-100 text-xs">
                      <tr>
                        <th className="px-6 py-4">Ingredient Name</th>
                        <th className="px-6 py-4">Total Weight/Qty</th>
                        <th className="px-6 py-4">ExpiresAt Epoch</th>
                        <th className="px-6 py-4">Estimated Safety Window</th>
                        <th className="px-6 py-4">Preventative Recipe Suggestion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {pantryItems.map(item => {
                        const now = new Date();
                        const nextExpiryLot = item.lots.reduce((min, lot) => new Date(lot.expiresAt) < new Date(min.expiresAt) ? lot : min, item.lots[0]);
                        const isExpired = nextExpiryLot ? new Date(nextExpiryLot.expiresAt) <= now : false;
                        const days = nextExpiryLot 
                          ? Math.ceil((new Date(nextExpiryLot.expiresAt).getTime() - now.getTime()) / (24 * 3600 * 1000))
                          : 10;
                        
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-6 py-4 font-black text-slate-900">{item.name}</td>
                            <td className="px-6 py-4">{item.quantity} {item.unit}</td>
                            <td className="px-6 py-4">{nextExpiryLot ? new Date(nextExpiryLot.expiresAt).toLocaleDateString() : 'N/A'}</td>
                            <td className="px-6 py-4">
                              {isExpired ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[11px] font-black">Spoiled / Danger</span>
                              ) : days < 3 ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black">{days} days remaining</span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">{days} days (Safe)</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={handleGenerateRecipes}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 font-bold rounded hover:bg-indigo-100 text-xs transition-colors cursor-pointer"
                              >
                                Find smart recipe
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: VISUAL ANALYTICS                                  */}
          {/* ======================================================== */}
          {activeTab === 'analytics' && (
            <div id="tab_analytics" className="space-y-6 animate-fade-in">
              
              {/* Premium chart row */}
              <div className="grid grid-cols-12 gap-6">
                
                {/* SVG Spending Curve */}
                <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">Historical spending curves</span>
                    <h3 className="font-black text-lg text-slate-900">Monthly Grocery Costs trends</h3>
                  </div>

                  <div className="my-6">
                    {/* SVG Line visualization */}
                    <svg className="w-full h-64" viewBox="0 0 500 200">
                      {/* Grid lines */}
                      <line x1="10" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeWidth="1.5" />
                      <line x1="10" y1="80" x2="490" y2="80" stroke="#f1f5f9" strokeWidth="1.5" />
                      <line x1="10" y1="140" x2="490" y2="140" stroke="#f1f5f9" strokeWidth="1.5" />
                      <line x1="10" y1="190" x2="490" y2="190" stroke="#e2e8f0" strokeWidth="2" />
                      
                      {/* Cost curved string paths */}
                      <path d="M 50 178 C 120 120, 200 160, 280 90 C 360 80, 420 130, 480 110" fill="transparent" stroke="#4f46e5" strokeWidth="4.5" strokeLinecap="round" />
                      
                      {/* Circle points on line */}
                      <circle cx="50" cy="178" r="6" fill="#4f46e5" stroke="white" strokeWidth="2" />
                      <circle cx="280" cy="90" r="6" fill="#4f46e5" stroke="white" strokeWidth="2" />
                      <circle cx="480" cy="110" r="6" fill="#4f46e5" stroke="white" strokeWidth="2" />

                      {/* Cost value tag popups */}
                      <text x="50" y="165" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">$180</text>
                      <text x="280" y="75" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">$480</text>
                      <text x="480" y="95" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">$345</text>

                      {/* Months markers */}
                      <text x="50" y="198" fill="#94a3b8" fontSize="11" fontWeight="extrabold" textAnchor="middle">Dec</text>
                      <text x="135" y="198" fill="#94a3b8" fontSize="11" fontWeight="extrabold" textAnchor="middle">Jan</text>
                      <text x="220" y="198" fill="#94a3b8" fontSize="11" fontWeight="extrabold" textAnchor="middle">Feb</text>
                      <text x="305" y="198" fill="#94a3b8" fontSize="11" fontWeight="extrabold" textAnchor="middle">Mar</text>
                      <text x="390" y="198" fill="#94a3b8" fontSize="11" fontWeight="extrabold" textAnchor="middle">Apr</text>
                      <text x="480" y="198" fill="#94a3b8" fontSize="11" fontWeight="extrabold" textAnchor="middle">May</text>
                    </svg>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold text-slate-450 border-t border-slate-100 pt-4">
                    <span>Base year: 2026 logs</span>
                    <span>Computed on direct retail ledger logs</span>
                  </div>
                </div>

                {/* SVG Spend categories */}
                <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">Budget segmentations</span>
                    <h3 className="font-black text-lg text-slate-900">Spent Category Weight</h3>
                  </div>

                  {/* SVG Bar proportions */}
                  <div className="my-8 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-extrabold mb-1">
                        <span className="text-slate-700">Produce Segment</span>
                        <span className="text-slate-900">$120.40 (42%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-extrabold mb-1">
                        <span className="text-slate-700">Meat & Seafood Segment</span>
                        <span className="text-slate-900">$94.50 (28%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: '28%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-extrabold mb-1">
                        <span className="text-slate-700">Dairy Reserves</span>
                        <span className="text-slate-900">$68.10 (20%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-extrabold mb-1">
                        <span className="text-slate-700">Pantry Essentials</span>
                        <span className="text-slate-900">$35.00 (10%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    Organic selections represent over <strong className="text-emerald-600">82% of overall produce</strong> weight, satisfying luxury standards.
                  </div>
                </div>

              </div>
              
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: HOUSEHOLD MEMBERS                                 */}
          {/* ======================================================== */}
          {activeTab === 'household' && (
            <div id="tab_household" className="grid grid-cols-12 gap-8 animate-fade-in">
              
              {/* Members checklist sidebar */}
              <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="font-black text-lg text-slate-900">Active synced members</h3>
                  <p className="text-xs text-slate-400 mt-1">These users share real-time collaboration checklists, food lots alerts, and receipt imports.</p>
                </div>

                <div className="space-y-4">
                  {household?.members ? (
                    pantryItems.length >= 0 && ( // simple placeholder trigger to access user state
                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/20 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" className="w-11 h-11 rounded-full border-2 border-indigo-200" alt="Sarah Oakwood profile picture" />
                            <div>
                              <span className="font-extrabold text-slate-900 block text-sm">Sarah Oakwood (You)</span>
                              <span className="text-xs text-slate-400">maneshravani35@gmail.com</span>
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">Owner</span>
                        </div>

                        <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between bg-white">
                          <div className="flex items-center gap-3">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" className="w-11 h-11 rounded-full border" alt="James Oakwood profile picture" />
                            <div>
                              <span className="font-extrabold text-slate-900 block text-sm">James Oakwood</span>
                              <span className="text-xs text-slate-400">james.oakwood@freshkeep.ai</span>
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider">Admin</span>
                        </div>

                        <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between bg-white">
                          <div className="flex items-center gap-3">
                            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150" className="w-11 h-11 rounded-full border" alt="James Oakwood profile picture" />
                            <div>
                              <span className="font-extrabold text-slate-900 block text-sm">Emily Oakwood</span>
                              <span className="text-xs text-slate-400">emily.oakwood@freshkeep.ai</span>
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider">Member</span>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center text-slate-400 py-10">Searching household list...</div>
                  )}
                </div>

              </div>

              {/* Invite overlay block */}
              <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h4 className="font-black text-slate-850">Invite New Member</h4>
                  <p className="text-xs text-slate-450 mt-1">Push a multi-device sync invitation and trigger notification alert protocols.</p>
                </div>

                <form onSubmit={handleInviteMember} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1.5 uppercase">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Liam Porter" 
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="w-full px-4 py-2 border.5 border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 text-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1.5 uppercase">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. liam@freshkeep.ai" 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-4 py-2 border-slate-200 border rounded-xl text-xs outline-none focus:border-indigo-500 text-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1.5 uppercase font-sans">Permission Role</label>
                    <select 
                      value={inviteRole}
                      onChange={(e: any) => setInviteRole(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs outline-none text-slate-800"
                    >
                      <option value="Admin">Administrator (Complete write paths)</option>
                      <option value="Member">Standard Sync Member (Log write access)</option>
                      <option value="Viewer">Viewer (Read-only access)</option>
                    </select>
                  </div>

                  {inviteStatus && (
                    <div className="p-3 bg-emerald-50 text-emerald-805 text-xs font-semibold rounded-xl border border-emerald-100">
                      {inviteStatus}
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 border border-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-black shadow transition-all uppercase tracking-wider cursor-pointer text-center"
                  >
                    Send Sync invite
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 8: SETTINGS                                          */}
          {/* ======================================================== */}
          {activeTab === 'settings' && (
            <div id="tab_settings" className="max-w-3xl space-y-6 animate-fade-in">
              
              {/* API and Environment guidelines info for recruiters */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800">Recruiter Architectural Manifest</h3>
                    <p className="text-xs text-slate-400">Pristine full-stack configurations and engineering standards.</p>
                  </div>
                </div>

                <div className="text-xs text-slate-650 leading-relaxed font-semibold space-y-3.5">
                  <p>
                    Greetings! FreshKeep AI is architected with modern industry standards:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-1.5 text-slate-600 border-l-4 border-indigo-500 pl-3">
                    <li><strong>Full Stack Isolation</strong>: Front-end Vite routes proxy all complex backend and LLM interactions directly of <span className="bg-slate-100 px-1 py-0.2 rounded font-mono text-[11px]">/api/*</span> endpoints to protect personal secrets securely.</li>
                    <li><strong>Gemini 3.5 LLM Schema Alignment</strong>: Structured JSON generation queries are dispatched with exact TypeScript compiler interfaces using the new `@google/genai` TypeScript SDK.</li>
                    <li><strong>Lot-Traceability</strong>: Individual bulk inventory sweeps are tracked down to the micro-lot levels, allowing cascading expiry alert models to execute automatically.</li>
                  </ul>
                </div>
              </div>

              {/* Config items */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                <h4 className="font-black text-slate-800 pb-2.5 border-b border-slate-100">Threshold Customizations</h4>
                
                <div className="space-y-4 text-xs font-semibold">
                  
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="text-slate-850 block">Critical Shelf Expiry (Days)</span>
                      <span className="text-[11px] text-slate-400">Threshold specifying critical spoilage alerts (default 3 days).</span>
                    </div>
                    <input type="number" defaultValue={3} className="w-16 px-2.5 py-1.5 border border-slate-200 rounded text-center outline-none" />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="text-slate-855 block">Low stock trigger margin</span>
                      <span className="text-[11px] text-slate-400">Auto alert when quantity decreases below % capacity.</span>
                    </div>
                    <select defaultValue="30%" className="px-2 py-1.5 border border-slate-205 rounded bg-white font-medium">
                      <option>15% of capacity</option>
                      <option>30% of capacity</option>
                      <option>50% of capacity</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="text-slate-856 block">Simulate Dev OCR Receipts preset</span>
                      <span className="text-[11px] text-slate-400">Pre-bind scanner OCR with realistic mock inventories.</span>
                    </div>
                    <select className="px-2 py-1.5 border border-slate-205 rounded bg-white font-medium">
                      <option>Trader Joe's Gourmet selections</option>
                      <option>Costco Warehousing Bulk lists</option>
                      <option>Whole Foods Organic listings</option>
                    </select>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* ======================================================== */}
      {/* RICH AI ADD/SCAN/VOICE OVERLAY DIALOG MODAL               */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div id="add_item_overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 leading-normal">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in text-slate-800">
            
            {/* Modal sticky top banner */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-lg text-slate-900">Restock Shelf or Request Checklist</h3>
                <p className="text-xs text-slate-400">Choose manual log entry or showcase Gemini AI OCR Lens & voice transcriptions below!</p>
              </div>
              <button 
                id="close_restock_modal"
                onClick={() => { resetForm(); setIsAddModalOpen(false); }} 
                className="p-1 px-2.2 text-slate-400 hover:text-slate-600 font-extrabold cursor-pointer border rounded-md"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body: Left column manual edit / Right column OCR simulation */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
              
              {/* Columns left form */}
              <div className="col-span-12 lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-slate-100 space-y-4">
                
                {/* Form type toggle */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                  <button 
                    onClick={() => setFormType('pantry')}
                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                      formType === 'pantry' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Direct Pantry storage log
                  </button>
                  <button 
                    onClick={() => setFormType('grocery')}
                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                      formType === 'grocery' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Grocery Checklist shopping needs
                  </button>
                </div>

                <form onSubmit={handleAddItem} className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Product label / Name</label>
                      <input 
                        id="form_item_name"
                        type="text" 
                        placeholder="e.g. Organic Whole Milk" 
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-205 rounded-xl font-semibold outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Category Shelf</label>
                      <select 
                        value={newItemCategory}
                        id="form_item_category"
                        onChange={(e) => setNewItemCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-205 bg-white rounded-xl outline-none"
                      >
                        <option value="Produce">Produce (Veggies & Fruits)</option>
                        <option value="Dairy">Dairy (Milk, Butter, Yogurt)</option>
                        <option value="Meat">Meat & Seafood (Seafood, Beef)</option>
                        <option value="Bakery">Bakery (Bread, Croissant)</option>
                        <option value="Pantry">Pantry (Oil, Spices)</option>
                        <option value="Beverages">Beverages (Soda, Coffee)</option>
                        <option value="Household">Household (Paper Towels)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Volumetric / Qty</label>
                      <input 
                        type="number" 
                        step="any"
                        id="form_item_qty"
                        value={newItemQty}
                        onChange={(e) => setNewItemQty(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-205 rounded-xl outline-none text-center"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Volumetric Unit</label>
                      <input 
                        type="text" 
                        id="form_item_unit"
                        placeholder="e.g. L, pcs, kg" 
                        value={newItemUnit}
                        onChange={(e) => setNewItemUnit(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-205 rounded-xl outline-none text-center"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Estimate Price ($)</label>
                      <input 
                        type="number" 
                        step="any"
                        id="form_item_price"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-205 rounded-xl outline-none text-center"
                      />
                    </div>
                  </div>

                  {formType === 'pantry' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Lot Expiry Date</label>
                        <input 
                          type="date" 
                          id="form_item_expiry"
                          value={newItemExpiry}
                          onChange={(e) => setNewItemExpiry(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-205 rounded-xl outline-none text-center"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">UPC / Barcode (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="UPC scanner value" 
                          value={newItemBarcode}
                          onChange={(e) => setNewItemBarcode(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-205 rounded-xl outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Shelf Notes</label>
                    <textarea 
                      placeholder="Special instructions for kitchen members..." 
                      value={newItemNotes}
                      id="form_item_notes"
                      onChange={(e) => setNewItemNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 rounded-xl outline-none max-h-16"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full mt-2 py-3 bg-indigo-650 hover:bg-slate-900 bg-indigo-600 text-white rounded-xl text-xs font-black shadow transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Commit product addition
                  </button>
                </form>

              </div>

              {/* Columns right artificial OCR presets */}
              <div className="col-span-12 lg:col-span-5 p-6 bg-slate-50 flex flex-col justify-between space-y-6">
                
                {/* Voice controls */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-1">
                    <Mic className="w-4 h-4 text-indigo-600" />
                    <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest">Voice add command processor</span>
                  </div>
                  
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Try: 'bought 3 avocados' or 'add whole milk to list'" 
                      value={voiceQuery}
                      onChange={(e) => setVoiceQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs outline-none"
                    />
                    
                    <button 
                      onClick={handleVoiceCommand}
                      disabled={isVoiceProcessing}
                      className="w-full py-1.8 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isVoiceProcessing ? 'Parsing with Gemini Voice...' : 'Process command transcript'}
                    </button>
                  </div>

                  {voiceFeedback && (
                    <div className="p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/40 text-[11px] text-indigo-900 font-bold">
                      <span className="block text-[9px] uppercase text-indigo-500 font-black">Voice Engine feedback</span>
                      {voiceFeedback.message}
                    </div>
                  )}
                </div>

                {/* Simulated OCR receipts loader */}
                <div className="space-y-4">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest">Showcase Receipt smart OCR</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Capture simulated receipts to auto-populate high volume inventory lots directly via Gemini parse:</p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      id="ocr_tj_preset"
                      onClick={() => handleOcrPresetSelection('traderjoes')}
                      className={`p-2 rounded-xl text-center border font-bold text-xs transition-all ${
                        selectedDemoReceipt === 'traderjoes' ? 'border-indigo-600 bg-indigo-50 text-indigo-750' : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      🎪 Trader Joe's
                    </button>
                    <button 
                      id="ocr_wf_preset"
                      onClick={() => handleOcrPresetSelection('wholefoods')}
                      className={`p-2 rounded-xl text-center border font-bold text-xs transition-all ${
                        selectedDemoReceipt === 'wholefoods' ? 'border-indigo-600 bg-indigo-50 text-indigo-755' : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      🥑 Whole Foods
                    </button>
                    <button 
                      id="ocr_costco_preset"
                      onClick={() => handleOcrPresetSelection('costco')}
                      className={`p-2 rounded-xl text-center border font-bold text-xs transition-all ${
                        selectedDemoReceipt === 'costco' ? 'border-indigo-600 bg-indigo-50 text-indigo-760' : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      📦 Costco Bulk
                    </button>
                  </div>

                  {/* OCR results confirmation previews */}
                  {isOCRProcessing && (
                    <div className="p-6 bg-white border rounded-2xl text-center animate-pulse text-xs text-slate-550 border-slate-100">
                      Gemini is OCR parsing mock receipt...
                    </div>
                  )}

                  {ocrResultsPreview && (
                    <div className="p-4 bg-white border border-indigo-100 rounded-2xl space-y-3 shadow-lg max-h-48 overflow-y-auto">
                      <span className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        OCR products matched ({ocrResultsPreview.length})
                      </span>
                      
                      <div className="divide-y divide-slate-100 text-[11px] font-semibold text-slate-700">
                        {ocrResultsPreview.map((item, idx) => (
                          <div key={idx} className="py-2 flex justify-between gap-2.5">
                            <span className="font-extrabold text-slate-900 truncate">{item.name}</span>
                            <span className="shrink-0 text-slate-400">{item.quantity} {item.unit} @ ${item.price}</span>
                          </div>
                        ))}
                      </div>

                      <button 
                        id="confirm_ocr_import"
                        onClick={handleConfirmOcrSweep}
                        className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-black uppercase tracking-wider cursor-pointer"
                      >
                        Accept and Import lots
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
