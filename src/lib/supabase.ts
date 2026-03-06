import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Mock Data for fallback
export const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'iPhone 16 Pro Max',
    price: 1199,
    category: 'Smartphones',
    brand: 'Apple',
    images: ['https://picsum.photos/seed/iphone16/800/800'],
    specs: { display: '6.9" Super Retina XDR', chip: 'A18 Pro', camera: '48MP Fusion' },
    stock: 50,
    description: 'The ultimate iPhone with the largest display ever and the most powerful chip.',
    colors: ['Natural Titanium', 'Black Titanium', 'White Titanium', 'Blue Titanium'],
    ramOptions: ['8GB'],
    storageOptions: ['256GB', '512GB', '1TB']
  },
  {
    id: '2',
    name: 'MacBook Pro M4',
    price: 1999,
    category: 'Laptops',
    brand: 'Apple',
    images: ['https://picsum.photos/seed/macbookm4/800/800'],
    specs: { display: '14" Liquid Retina XDR', chip: 'M4 Max', ram: '32GB' },
    stock: 20,
    description: 'The most advanced laptop for demanding workflows.',
    colors: ['Space Black', 'Silver'],
    ramOptions: ['16GB', '32GB', '64GB'],
    storageOptions: ['512GB', '1TB', '2TB']
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5',
    price: 399,
    category: 'Audio',
    brand: 'Sony',
    images: ['https://picsum.photos/seed/sonyh5/800/800'],
    specs: { battery: '30 hours', noise_cancelling: 'Industry Leading', driver: '30mm' },
    stock: 100,
    description: 'Your world, nothing else. Best-in-class noise cancellation.'
  },
  {
    id: '4',
    name: 'Samsung Galaxy Watch Ultra',
    price: 649,
    category: 'Wearables',
    brand: 'Samsung',
    images: ['https://picsum.photos/seed/galaxywatch/800/800'],
    specs: { display: 'Sapphire Crystal', battery: '100 hours', water_resistance: '10ATM' },
    stock: 35,
    description: 'The most rugged and capable Galaxy Watch yet.'
  },
  {
    id: '5',
    name: 'iPad Pro M4',
    price: 999,
    category: 'Tablets',
    brand: 'Apple',
    images: ['https://picsum.photos/seed/ipadpro/800/800'],
    specs: { display: 'Ultra Retina XDR', chip: 'M4', thickness: '5.1mm' },
    stock: 45,
    description: 'Thinner than ever, more powerful than imaginable.'
  }
];
