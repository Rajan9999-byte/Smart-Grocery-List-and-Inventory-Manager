/**
 * Shared Type Definitions for FreshKeep AI
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer';
  joinedAt: string;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  members: User[];
}

export interface PantryLot {
  id: string;
  quantity: number;
  expiresAt: string; // ISO String
  addedAt: string; // ISO String
  price: number;
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string; // pieces, grams, ml, oz, etc.
  capacity: number; // max or baseline quantity for low-stock calculation (e.g. 100% capacity)
  category: string; // Produce, Dairy, Meat, Bakery, Pantry, Frozen, Beverages, Household, etc.
  isLowStock: boolean;
  notes?: string;
  barcode?: string;
  lots: PantryLot[];
  lastUpdated: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
  addedBy: string; // User Name
  price: number;
  notes?: string;
  predictedNeed?: boolean; // If flag is populated by predictive AI
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calories: number;
  protein: string;
  carbs: string;
  fats: string;
  ingredients: { name: string; amount: string; inStock: boolean }[];
  instructions: string[];
  reduceWasteScore: number; // rating 1-100 indicating how many expiring items it saves
}

export interface SystemNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  itemId?: string; // links to a pantry item
}

export interface SpendingPoint {
  month: string;
  amount: number;
  organicPercent: number;
}

export interface CategorySpend {
  category: string;
  amount: number;
  color: string;
}

export interface DashboardStats {
  totalItems: number;
  expiringSoonCount: number; // next 3 days
  lowStockCount: number;
  pantryHealthScore: number; // 0-100 based on low stock and spoilage
  monthlySavings: number; // waste reduction estimation
}
