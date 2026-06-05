// ─── Types ──────────────────────────────────────────────────────────────────
export interface OfficeLocation {
    id: string;
    slug: string;
    area: string;
    name: string;
    address: string;
    image: string;
    capacity: string;
    size: string;
    amenities: string[];
    price: string;
    gallery: string[];
    description?: string;
    highlights?: string[];
}

// ─── Helper ─────────────────────────────────────────────────────────────────
export const isVideo = (url: string) =>
    typeof url === 'string' && /\.(mp4|webm|ogg)/i.test(url);

// ─── Images ────────────────────────────────────────────────────────────────
const VTPAltitude = '/images/VTP/VTP_Altitude.webp';
const VTPAltitude1 = '/images/VTP/VTP_Altitude1.webp';
const VTPAltitude2 = '/images/VTP/VTP_Altitude2.webp';
const VTPAltitude3 = '/images/VTP/VTP_Altitude3.webp';
const VTPAltitude4 = '/images/VTP/VTP_Altitude4.webp';
const featureplan = '/images/VTP/feture_plan_map.webp';
const VTPInner1 = '/images/VTP/VTP_Inner1.webp';
const VTPInner2 = '/images/VTP/VTP_Inner2.webp';
const VTPInner3 = '/images/VTP/VTP_Inner3.webp';
const VTPInner4 = '/images/VTP/VTP_Inner4.webp';
const VTPInner5 = '/images/VTP/VTP_Inner02.webp';

const Punawale1 = '/images/PUNAWALE/Sai_Punawale.webp';
const Punawale2 = '/images/PUNAWALE/PUNAWALE_1.webp';
const Punawale3 = '/images/PUNAWALE/PUNAWALE_2.webp';
const Punawale4 = '/images/PUNAWALE/PUNAWALE_3.webp';
const Punawale5 = '/images/PUNAWALE/PUNAWALE_4.webp';
const Punawale6 = '/images/PUNAWALE/PUNAWALE_5.webp';
const Punawale7 = '/images/PUNAWALE/PUNAWALE_6.webp';

const Baner1 = '/images/BANER/YBZ_1.webp';
const Baner2 = '/images/BANER/YBZ_2.webp';
const Baner4 = '/images/BANER/VIRTUAL_MAPS_YBZ.webp';
const Baner5 = '/images/BANER/LOCATION_YBZ.webp';
const BanerVideo = '/videos/YBZ_VIDEO.mp4';



const Bhosari1 = '/images/BHOSARI/gera-front.webp';
const Bhosari2 = '/images/BHOSARI/gera-1.webp';
const Bhosari3 = '/images/BHOSARI/gera-2.webp';
const Bhosari5 = '/images/BHOSARI/gera-4.webp';
const Bhosari6 = '/images/BHOSARI/gera-5.webp';
const Bhosarimaps = '/images/BHOSARI/gera-maps.webp';

// ─── Data ───────────────────────────────────────────────────────────────────
export const locations: OfficeLocation[] = [
    {
        id: 'wakad-01',
        slug: 'wakad',
        area: 'Wakad',
        name: 'VTP Altitude',
        address: '18/6, Aundh - Ravet BRTS Rd, Pawar Nagar, Mangal Nagar, Wakad, Pune 411033',
        image: VTPAltitude,
        capacity: '20 - 25 Seats - 1 Cabin',
        size: '880 sq.ft',
        price: 'Starting ₹6,500/seat',
        description:
            "A premium managed workspace nestled in the heart of Wakad, VTP Altitude offers a sophisticated environment for businesses that demand excellence. With state-of-the-art infrastructure and a prime location on the Aundh-Ravet BRTS corridor, this space is designed to elevate your team's productivity.",
        highlights: [
            'Prime BRTS Corridor Location',
            'Dedicated Cabin Available',
            'Fully Managed Services',
            'Flexible Seat Plans'
        ],
        amenities: [
            'High-Speed Wifi',
            'Conference Rooms',
            'Valet Parking',
            'Power Backup',
            '24/7 Security & CCTV Surveillance',
            'Housekeeping Services'
        ],
        gallery: [
            VTPAltitude,
            VTPAltitude4,
            featureplan,
            VTPAltitude1,
            VTPInner1,
            VTPInner2,
            VTPInner3,
            VTPInner4,
            VTPInner5,
            VTPAltitude2,
            VTPAltitude3
        ],
    },

    {
        id: 'punawale-01',
        slug: 'punawale',
        area: 'Punawale',
        name: 'Sai Millenium',
        address: 'service road, 585, Mumbai Pune Bypass Rd Flyover, Kate Wasti, Punawale, Dattwadi, Maharashtra 411033',
        image: Punawale1,
        capacity: '50 Seats',
        size: '2000 sq.ft',
        price: 'Starting ₹6,500/seat',
        description:
            'Sai Millenium is a spacious, well-connected workspace sitting right on the Mumbai-Pune Bypass — making it the ideal base for teams that value accessibility and scale. With 2000 sq.ft of thoughtfully designed floor space, it comfortably accommodates growing teams.',
        highlights: [
            'Mumbai-Pune Bypass Access',
            'Large Team Capacity',
            'Scalable Floor Plans',
            'Easy Highway Connectivity'
        ],
        amenities: [
            'High-Speed Wifi',
            'Conference Rooms',
            'Valet Parking',
            'Power Backup',
            '24/7 Security & CCTV Surveillance',
            'Housekeeping Services'
        ],
        gallery: [
            Punawale1,
            Punawale2,
            Punawale3,
            Punawale4,
            Punawale5,
            Punawale6,
            Punawale7
        ],
    },

    {
        id: 'baner-01',
        slug: 'baner',
        area: 'Baner',
        name: 'YBZ Yashada Business Zone Baner',
        address: '2nd Floor, Kashiniketan, HQ7H+H8J, Kashiniketan, Ram Indu Park Rd, Lalit Estate, Baner, Pune, Maharashtra 411069',
        image: Baner1,
        capacity: '40 Seats',
        size: '1200 sq.ft',
        price: 'Starting ₹6,500/seat',
        description:
            "Strategically located in Baner — one of Pune's most vibrant business districts — YBZ Yashada Business Zone puts you steps away from the metro and surrounded by Pune's top tech companies and startups. A dynamic space for a dynamic team.",
        highlights: [
            'Steps from Metro Station',
            'Baner Business Hub',
            'Modern Infrastructure',
            'Vibrant Startup Ecosystem'
        ],
        amenities: [
            'High-Speed Wifi',
            'Near Metro Station',
            'Conference Rooms',
            'Valet Parking',
            'Power Backup',
            '24/7 Security & CCTV Surveillance',
            'Housekeeping Services'
        ],
        gallery: [
            Baner1,
            Baner2,
            Baner4,
            Baner5,
            BanerVideo
        ],
    },

    {
        id: 'kasarwadi-01',
        slug: 'kasarwadi',
        area: 'Kasarwadi',
        name: "Gera's Imperium Gateway",
        address: 'Old Mumbai Pune Highway, Kasarwadi, Pimpri-Chinchwad, Pune, Maharashtra 411034',
        image: Bhosari1,
        capacity: '6-7 seats',
        size: '381 sq.ft per',
        price: 'Starting ₹6,500/seat',
        description:
            "Located in the heart of PCMC, Gera's Imperium Gateway is a premium metro-connected commercial destination offering managed offices, retail spaces, and business infrastructure. Its strategic location on the Old Mumbai-Pune Highway ensures excellent connectivity to Pune, Pimpri-Chinchwad, and major business hubs.",
        highlights: [
            'Bhosari Metro Station(Nashik Phata)',
            'Direct Metro Connectivity',
            'Prime PCMC Business Location',
            'Premium Commercial Development',
            'High Visibility & Accessibility'
        ],
        amenities: [
            'High-Speed Wifi',
            'Metro Connectivity',
            'Conference Rooms',
            '100% Power Backup',
            '24/7 Security & CCTV Surveillance',
            'Ample Parking',
            'Food Court & Restaurants',
            'Housekeeping Services'
        ],
        gallery: [
            Bhosari1,
            Bhosari2,
            Bhosari3,
            Bhosari5,
            Bhosari6,
            Bhosarimaps
        ],
    }
];