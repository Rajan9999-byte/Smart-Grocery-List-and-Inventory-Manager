import fs from 'fs';
import path from 'path';
import { 
  User, 
  Household, 
  PantryItem, 
  GroceryItem, 
  SystemNotification,
  SpendingPoint,
  CategorySpend
} from '../types';

const DB_FILE = path.join(process.cwd(), 'database.json');

interface DatabaseSchema {
  users: User[];
  households: Household[];
  pantryItems: PantryItem[];
  groceryItems: GroceryItem[];
  notifications: SystemNotification[];
  spendingHistory: SpendingPoint[];
  categorySpending: CategorySpend[];
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    role: 'Owner' | 'Admin' | 'Member' | 'Viewer';
  };
}

const DEFAULT_CURRENT_USER = {
  id: 'usr_1',
  name: 'Sarah Oakwood',
  email: 'maneshravani35@gmail.com', // Pre-populated from system metadata
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  role: 'Owner' as const
};

const SEED_DATA: DatabaseSchema = {
  currentUser: DEFAULT_CURRENT_USER,
  users: [
    {
      id: 'usr_1',
      name: 'Sarah Oakwood',
      email: 'maneshravani35@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      role: 'Owner',
      joinedAt: '2026-01-10T12:00:00Z'
    },
    {
      id: 'usr_2',
      name: 'James Oakwood',
      email: 'james.oakwood@freshkeep.ai',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      role: 'Admin',
      joinedAt: '2026-01-12T09:30:00Z'
    },
    {
      id: 'usr_3',
      name: 'Emily Oakwood',
      email: 'emily.oakwood@freshkeep.ai',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
      role: 'Member',
      joinedAt: '2026-02-14T15:45:00Z'
    }
  ],
  households: [
    {
      id: 'house_123',
      name: 'Oakwood Residence',
      inviteCode: 'FK-OAKWOOD-99X',
      members: [] // populated dynamically in helper
    }
  ],
  pantryItems: [
    {
      id: 'pantry_1',
      name: 'Organic Whole Milk',
      quantity: 0.5,
      unit: 'L',
      capacity: 2,
      category: 'Dairy',
      isLowStock: true,
      barcode: '0120130140',
      notes: 'For morning coffee and pancakes',
      lots: [
        {
          id: 'lot_1a',
          quantity: 0.5,
          expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // expires in 2 days
          addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          price: 3.49
        }
      ],
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'pantry_2',
      name: 'Hass Avocados',
      quantity: 1,
      unit: 'pcs',
      capacity: 4,
      category: 'Produce',
      isLowStock: true,
      barcode: '0854564531',
      notes: 'Prone to bruising, eat quickly!',
      lots: [
        {
          id: 'lot_2a',
          quantity: 1,
          expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // expires tomorrow!
          addedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          price: 1.99
        }
      ],
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'pantry_3',
      name: 'Greek Yogurt (Plain)',
      quantity: 1.2,
      unit: 'kg',
      capacity: 1.5,
      category: 'Dairy',
      isLowStock: false,
      notes: 'Rich in protein, breakfast base',
      lots: [
        {
          id: 'lot_3a',
          quantity: 1.2,
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // expires in 5 days
          addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          price: 5.99
        }
      ],
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'pantry_4',
      name: 'Sourdough Artisanal Bread',
      quantity: 1,
      unit: 'loaf',
      capacity: 1,
      category: 'Bakery',
      isLowStock: false,
      notes: 'Locally baked wheat sourdough',
      lots: [
        {
          id: 'lot_4a',
          quantity: 1,
          expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // expires in 4 days
          addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          price: 4.50
        }
      ],
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'pantry_5',
      name: 'Atlantic Salmon Fillets',
      quantity: 0.3,
      unit: 'kg',
      capacity: 0.8,
      category: 'Meat & Seafood',
      isLowStock: true,
      notes: 'Keep chilled, bake with lemon and dill',
      lots: [
        {
          id: 'lot_5a',
          quantity: 0.3,
          expiresAt: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString(), // expires in 1.5 days
          addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          price: 12.99
        }
      ],
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'pantry_6',
      name: 'Organic Baby Spinach',
      quantity: 120,
      unit: 'g',
      capacity: 500,
      category: 'Produce',
      isLowStock: true,
      notes: 'For healthy protein smoothies & salads',
      lots: [
        {
          id: 'lot_6a',
          quantity: 120,
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // expires in 3 days
          addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          price: 2.99
        }
      ],
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'pantry_7',
      name: 'Cold Pressed Olive Oil',
      quantity: 0.75,
      unit: 'L',
      capacity: 1,
      category: 'Pantry',
      isLowStock: false,
      notes: 'Premium extra virgin olive oil',
      lots: [
        {
          id: 'lot_7a',
          quantity: 0.75,
          expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // perfectly fresh
          addedAt: new Date().toISOString(),
          price: 14.99
        }
      ],
      lastUpdated: new Date().toISOString()
    },
  ],
  groceryItems: [
    {
      id: 'groc_1',
      name: 'Fresh Sweet Blueberries',
      quantity: 2,
      unit: 'packs',
      category: 'Produce',
      checked: false,
      addedBy: 'Sarah Oakwood',
      price: 3.99,
      notes: 'For pancakes and yogurt toppings'
    },
    {
      id: 'groc_2',
      name: 'Free Range Eggs (Large)',
      quantity: 1,
      unit: 'carton',
      category: 'Dairy',
      checked: false,
      addedBy: 'James Oakwood',
      price: 4.80,
      notes: 'Low stock prediction'
    },
    {
      id: 'groc_3',
      name: 'Ground Espresso Coffee',
      quantity: 1,
      unit: 'bag',
      category: 'Pantry',
      checked: true,
      addedBy: 'Sarah Oakwood',
      price: 8.99,
      notes: 'Purchased yesterday'
    },
    {
      id: 'groc_4',
      name: 'Paper Towels High-Absorbent',
      quantity: 1,
      unit: '6-pack',
      category: 'Household',
      checked: false,
      addedBy: 'Emily Oakwood',
      price: 7.49
    },
  ],
  notifications: [
    {
      id: 'notif_1',
      type: 'warning',
      title: 'Expiry Warning: Hass Avocados',
      description: 'Your Haas Avocados are estimated to spoil tomorrow! Prepare avocado toast or guacamole today to minimize waste.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
      isRead: false,
      itemId: 'pantry_2'
    },
    {
      id: 'notif_2',
      type: 'danger',
      title: 'Low Stock Alert: Organic Whole Milk',
      description: 'Your milk reserve has dipped to 25% remaining (0.5L / 2L capacity). We suggest adding this item to your grocery list.',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hrs ago
      isRead: false,
      itemId: 'pantry_1'
    },
    {
      id: 'notif_3',
      type: 'success',
      title: 'Smart Prediction Completed',
      description: 'FreshKeep AI has processed your historical food consumption rates and recommended 4 predictive restock items.',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      isRead: true
    },
  ],
  spendingHistory: [
    { month: 'Dec', amount: 380, organicPercent: 62 },
    { month: 'Jan', amount: 420, organicPercent: 65 },
    { month: 'Feb', amount: 390, organicPercent: 70 },
    { month: 'Mar', amount: 480, organicPercent: 75 },
    { month: 'Apr', amount: 310, organicPercent: 78 },
    { month: 'May', amount: 340, organicPercent: 82 }
  ],
  categorySpending: [
    { category: 'Meat & Seafood', amount: 125, color: '#f87171' },
    { category: 'Produce', amount: 94, color: '#4ade80' },
    { category: 'Dairy', amount: 68, color: '#60a5fa' },
    { category: 'Bakery', amount: 35, color: '#fbbf24' },
    { category: 'Pantry', amount: 48, color: '#c084fc' }
  ]
};

export function getDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      saveDatabase(SEED_DATA);
      return SEED_DATA;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const db = JSON.parse(raw) as DatabaseSchema;
    
    // Ensure nested structures are present
    if (!db.users) db.users = SEED_DATA.users;
    if (!db.households) db.households = SEED_DATA.households;
    if (!db.pantryItems) db.pantryItems = SEED_DATA.pantryItems;
    if (!db.groceryItems) db.groceryItems = SEED_DATA.groceryItems;
    if (!db.notifications) db.notifications = SEED_DATA.notifications;
    if (!db.spendingHistory) db.spendingHistory = SEED_DATA.spendingHistory;
    if (!db.categorySpending) db.categorySpending = SEED_DATA.categorySpending;
    if (!db.currentUser) db.currentUser = SEED_DATA.currentUser;
    
    // Link users live to Oakwood household members so it remains in sync
    if (db.households && db.households[0]) {
      db.households[0].members = db.users;
    }

    return db;
  } catch (error) {
    console.error("Failed to read database.json, using SEED_DATA instead", error);
    return SEED_DATA;
  }
}

export function saveDatabase(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Failed to write to database.json", error);
  }
}
