import { createClient } from '@supabase/supabase-js';

export const supabase = {
  from: (table: string) => {
    return {
      select: (query?: string, options?: any) => {
        let resultPromise = fetch(`/api/supabase/${table}/select`, { method: 'POST' }).then(res => res.json());
        if (options?.count === 'exact') {
          resultPromise = resultPromise.then(res => ({ data: res.data, error: res.error, count: res.data?.length || 0 }));
        }
        
        const chainable = Object.assign(resultPromise, {
          order: (col: string, opts?: any) => chainable,
          single: async () => {
            const result = await resultPromise;
            return { data: result.data?.[0], error: result.error };
          }
        });
        return chainable as any;
      },
      insert: (rows: any[]) => {
        let resultPromise = fetch(`/api/supabase/${table}/insert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rows)
        }).then(res => res.json());

        const chainable = Object.assign(resultPromise, {
          select: () => chainable,
          single: async () => {
            const result = await resultPromise;
            return { data: result.data?.[0], error: result.error };
          }
        });
        return chainable as any;
      },
      update: (data: any) => {
        return {
          eq: (col: string, val: string) => {
            let resultPromise = fetch(`/api/supabase/${table}/update`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data, eq: { col, val } })
            }).then(res => res.json());

            const chainable = Object.assign(resultPromise, {
              select: () => chainable,
              single: async () => {
                const result = await resultPromise;
                return { data: result.data?.[0], error: result.error };
              }
            });
            return chainable as any;
          },
          neq: (col: string, val: string) => {
            let resultPromise = fetch(`/api/supabase/${table}/update`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data, neq: { col, val } })
            }).then(res => res.json());
            
            return resultPromise as any;
          }
        };
      },
      delete: () => {
        return {
          eq: (col: string, val: string) => {
            let resultPromise = fetch(`/api/supabase/${table}/delete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ eq: { col, val } })
            }).then(res => res.json());
            return resultPromise as any;
          },
          neq: (col: string, val: string) => {
            let resultPromise = fetch(`/api/supabase/${table}/delete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ neq: { col, val } })
            }).then(res => res.json());
            return resultPromise as any;
          }
        };
      },
      upsert: (row: any) => {
        let resultPromise = fetch(`/api/supabase/${table}/upsert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row)
        }).then(res => res.json());
        return resultPromise as any;
      }
    };
  }
};

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
