// ===== FILE: src/types/index.ts =====
export interface Room {
    id: string;
    name: string;
}

export interface Booking {
    id?: number;
    email: string;
    phone: string;
    room_id: number;
    date: string;
    start_time: string;
    end_time: string;
    status?: string;
    created_at?: string;
}

export interface BookingFormData {
    email: string;
    phone: string;
    room_id: string;
    date: string;
    start_time: string;
    end_time: string;
}

export interface Blog {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    image_url: string;
    slug: string;
    tags: string[];
    status: string;
    author: string;
    seo_title?: string;
    seo_description?: string;
    created_at: string;
    published_at?: string;
}

export interface PaymentIntent {
    id?: string;
    email: string;
    amount: number;
    currency: string;
    status: string;
    booking_data: any;
    created_at: string;
    updated_at?: string;
}

export type TabType = 'home' | 'booking' | 'mybookings' | 'blogs';