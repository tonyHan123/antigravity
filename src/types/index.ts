export type Category = 'Hair' | 'Nail' | 'Massage' | 'Makeup' | 'Spa';

export interface Service {
    id: string;
    name: string;
    durationMin: number;
    price: number;
    description?: string;
}

export interface Shop {
    id: string;
    name: string;
    category: Category;
    region: string; // e.g., 'Seoul', 'Busan'
    address: string;
    rating: number; // 0-5
    reviewCount: number;
    description: string;
    imageUrl: string; // Placeholder for now
    services: Service[];
    images: string[]; // Gallery
}

export interface Booking {
    id: string;
    userId: string;
    shopId: string;
    serviceId: string;
    date: string; // ISO Date
    time: string; // HH:mm
    status: 'confirmed' | 'cancelled' | 'pending';
    totalPrice: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
}
