export interface FeedbackItem {
  id: string;
  name: string;
  avatarCode: string;
  role: string;
  comment: string;
  status: 'COMPLETED' | 'PENDING REVIEW';
  score: number;
}

export interface GoodPoint {
  title: string;
  description: string;
}

export interface BadPoint {
  title: string;
  description: string;
}

export interface PriceSource {
  name: string;
  price: number;
  updated: string;
}

export interface CompetitorBenchmark {
  name: string;
  score: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number; // e.g. 8.4
  popularityScore: number; // e.g. 94
  sentimentScore: number; // e.g. 92% Positive, 78% Mixed, etc.
  liveState: 'LIVE NOW' | 'PENDING' | 'COMPLETED';
  hotItem: boolean;
  goodPoints: GoodPoint[];
  badPoints: BadPoint[];
  sources: PriceSource[];
  competitors: CompetitorBenchmark[];
  tags: string[];
  sentimentTrend: number[]; // e.g. [40, 55, 45, 70, 85, 80, 95]
  feedback: FeedbackItem[];
  participantsCount: number;
  syncStatus: 'check_circle' | 'pending';
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "apex-pro-ultra-grip",
    name: "Apex Pro Ultra-Grip Performance Series",
    category: "Tech/Wearables",
    description: "A comprehensive analysis of consumer sentiment and market positioning for the Q4 hardware release.",
    rating: 8.4,
    popularityScore: 94,
    sentimentScore: 94,
    liveState: "LIVE NOW",
    hotItem: true,
    syncStatus: "check_circle",
    participantsCount: 142,
    goodPoints: [
      {
        title: "Exceptional Ergonomics",
        description: "92% of testers reported significantly reduced wrist fatigue compared to their current primary device."
      },
      {
        title: "Tactile Response",
        description: "Switch engagement feels premium and 'crisp.' Mentioned as the #1 highlight by enthusiasts."
      },
      {
        title: "Battery Longevity",
        description: "Testing confirms 140-hour wireless life under heavy load, exceeding marketing claims."
      }
    ],
    badPoints: [
      {
        title: "Software Friction",
        description: "The companion app setup was described as 'overly complex' by non-technical focus group members."
      },
      {
        title: "Cable Stiffness",
        description: "The included charging cable is less flexible than competitors, causing slight drag during wired use."
      },
      {
        title: "Price Elasticity",
        description: "Market sentiment suggests a $149 MSRP might be $20 higher than the optimal conversion point."
      }
    ],
    sources: [
      { name: "Amazon.com", price: 139.99, updated: "14m ago" },
      { name: "Best Buy", price: 149.00, updated: "2h ago" },
      { name: "B&H Photo", price: 142.50, updated: "41m ago" }
    ],
    competitors: [
      { name: "Market Average", score: 6.2 },
      { name: "Logitech Rival", score: 7.9 },
      { name: "Razer Edge", score: 8.1 }
    ],
    tags: ["ERGONOMIC", "PREMIUM BUILD", "HIGH LATENCY", "SOFTWARE BUG", "LIGHTWEIGHT", "4K POLLING"],
    sentimentTrend: [40, 55, 45, 70, 85, 80, 95],
    feedback: [
      {
        id: "fb-1",
        name: "James Sterling",
        avatarCode: "JS",
        role: "Pro Gamer / Tech Analyst",
        comment: "The glide on glass mousepads is unprecedented. However, the LOD (Lift-off Distance) settings need better calibration in the beta driver.",
        status: "COMPLETED",
        score: 9.5
      },
      {
        id: "fb-2",
        name: "Maria Alverez",
        avatarCode: "MA",
        role: "UX Designer / Casual User",
        comment: "Fits my small hands perfectly, which is rare for 'pro' gear. The clicks are a bit loud for a shared office environment though.",
        status: "PENDING REVIEW",
        score: 7.8
      },
      {
        id: "fb-3",
        name: "Tom Henderson",
        avatarCode: "TH",
        role: "Hardware Enthusiast",
        comment: "Coating is amazing. Doesn't attract fingerprints or sweat. This is a game changer for long sessions. Software is still clunky.",
        status: "COMPLETED",
        score: 8.9
      }
    ]
  },
  {
    id: "lumina-watch-s2",
    name: "Lumina Watch S2",
    category: "Tech/Wearables",
    description: "Premium smartwatch tracking fitness metrics and ambient stress levels via real-time biometric sensors.",
    rating: 9.4,
    popularityScore: 94,
    sentimentScore: 94,
    liveState: "LIVE NOW",
    hotItem: true,
    syncStatus: "check_circle",
    participantsCount: 45,
    goodPoints: [
      { title: "Dynamic AMOLED Screen", description: "Incredibly bright display even under direct glaring sunlight." },
      { title: "Stress Level Tracking", description: "Galvanic skin response sensors track mental strain with high precision." }
    ],
    badPoints: [
      { title: "Proprietary Charging Puck", description: "Lacks standard Qi wireless charging support, requiring a specific dock." }
    ],
    sources: [
      { name: "Amazon.com", price: 299.99, updated: "5m ago" },
      { name: "Target", price: 310.00, updated: "1h ago" }
    ],
    competitors: [
      { name: "Market Average", score: 7.1 },
      { name: "Apple Watch SE", score: 8.8 }
    ],
    tags: ["SMARTWATCH", "FITNESS", "BIOMETRICS", "AMOLED"],
    sentimentTrend: [60, 65, 75, 80, 82, 90, 94],
    feedback: [
      {
        id: "fb-l1",
        name: "Arthur Dent",
        avatarCode: "AD",
        role: "Fitness Enthusiast",
        comment: "Battery lasts a full week easily, even with GPS on. The sleep coach is shockingly accurate.",
        status: "COMPLETED",
        score: 9.2
      }
    ]
  },
  {
    id: "aura-wireless-pods",
    name: "Aura Wireless Pods",
    category: "Audio/Consumer",
    description: "High-fidelity noise cancelling wireless earbuds with ergonomic design and custom spatial EQ preset filters.",
    rating: 7.8,
    popularityScore: 78,
    sentimentScore: 78,
    liveState: "PENDING",
    hotItem: false,
    syncStatus: "pending",
    participantsCount: 32,
    goodPoints: [
      { title: "Immersive Noise Cancellation", description: "Blocks up to 45dB of ambient drone noise, perfect for flights." },
      { title: "Lightweight Form", description: "Sits comfortably in the ear canal without feeling heavy or loose." }
    ],
    badPoints: [
      { title: "Mixed Call Quality", description: "Microphones pick up a lot of wind noise during outdoor usage." }
    ],
    sources: [
      { name: "Amazon.com", price: 179.99, updated: "12m ago" },
      { name: "Best Buy", price: 189.99, updated: "3h ago" }
    ],
    competitors: [
      { name: "Market Average", score: 7.5 },
      { name: "Sony XM5 Earbuds", score: 8.4 }
    ],
    tags: ["ANC", "HI-FI", "AUDIO", "ERGONOMIC"],
    sentimentTrend: [50, 52, 58, 62, 70, 75, 78],
    feedback: [
      {
        id: "fb-a1",
        name: "Chloe Bennett",
        avatarCode: "CB",
        role: "Music Producer",
        comment: "Excellent high-frequency resolution. Bass is a bit over-boosted on standard presets but EQ resolves it.",
        status: "COMPLETED",
        score: 8.1
      }
    ]
  },
  {
    id: "zenth-hub-pro",
    name: "Zenth Hub Pro",
    category: "Home/IoT",
    description: "Smart home dashboard and central controller designed with physical analog toggles and ambient display indicators.",
    rating: 6.2,
    popularityScore: 62,
    sentimentScore: 42,
    liveState: "PENDING",
    hotItem: false,
    syncStatus: "check_circle",
    participantsCount: 58,
    goodPoints: [
      { title: "Elegant Wood Grain Frame", description: "Looks like a piece of high-end furniture rather than plastic tech." }
    ],
    badPoints: [
      { title: "Limited Protocol Support", description: "Lacks native Zigbee radio, requiring third-party bridge adapters." },
      { title: "App Latency", description: "Syncing status with home servers takes up to 4 seconds over standard Wi-Fi." }
    ],
    sources: [
      { name: "Best Buy", price: 149.00, updated: "1h ago" }
    ],
    competitors: [
      { name: "Market Average", score: 7.0 },
      { name: "Google Nest Hub", score: 8.5 }
    ],
    tags: ["SMART HOME", "IOT", "WOOD FRAME", "DASHBOARD"],
    sentimentTrend: [40, 42, 38, 44, 46, 41, 42],
    feedback: [
      {
        id: "fb-z1",
        name: "Harlan Cooper",
        avatarCode: "HC",
        role: "Smart Home Hobbyist",
        comment: "Looks stunning on my sideboard, but software bugs are constant. It randomly disconnects from Hue lights.",
        status: "COMPLETED",
        score: 6.0
      }
    ]
  },
  {
    id: "nano-cam-mini",
    name: "Nano Cam Mini",
    category: "Tech/Wearables",
    description: "Ultra-compact action camera featuring 4K recording at 60 FPS with magnetic clip-on mount mechanisms.",
    rating: 4.1,
    popularityScore: 41,
    sentimentScore: 41,
    liveState: "COMPLETED",
    hotItem: false,
    syncStatus: "check_circle",
    participantsCount: 22,
    goodPoints: [
      { title: "Tiny footprint", description: "Weighs only 28 grams, clips effortlessly onto standard shirt collars." }
    ],
    badPoints: [
      { title: "Thermal Throttling", description: "Overheats and shuts down after 15 minutes of continuous 4K 60FPS recording." },
      { title: "Poor Low Light", description: "Severe digital noise occurs in any indoor or twilight environment." }
    ],
    sources: [
      { name: "Amazon.com", price: 199.00, updated: "2h ago" }
    ],
    competitors: [
      { name: "Market Average", score: 7.2 },
      { name: "GoPro Hero Mini", score: 8.2 }
    ],
    tags: ["CAMERA", "ACTION CAM", "MAGNETIC", "4K"],
    sentimentTrend: [55, 52, 48, 45, 42, 41, 41],
    feedback: [
      {
        id: "fb-n1",
        name: "Sarah Jenkins",
        avatarCode: "SJ",
        role: "Vlogger / Traveler",
        comment: "Great concept, unusable execution. I tried recording a walk and it shut off due to heat after 12 minutes.",
        status: "COMPLETED",
        score: 4.0
      }
    ]
  }
];
