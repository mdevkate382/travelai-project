export type SubscriptionTier = 'free' | 'premium' | 'pro';

export interface SubscriptionStatus {
  plan: SubscriptionTier;
  price: number;
  status: 'active' | 'inactive';
  startDate: string;
  expiryDate: string;
  paymentId: string;
  billingCycle: 'monthly' | 'yearly';
}

export interface TravelPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  destination: string;
  caption: string;
  tripDuration: string;
  budget: number;
  hotel: string;
  placesVisited: string[];
  hashtags: string[];
  images: string[];
  createdAt: string;
  likes: number;
  comments: Array<{ id: string; user: string; text: string; createdAt: string }>; 
  saved: boolean;
  likedByMe: boolean;
}

export const STORAGE_KEYS = {
  subscription: 'yatraai_subscription_status',
  travelPosts: 'yatraai_travel_posts',
  communitySeed: 'yatraai_community_seed',
};

export const PLAN_DETAILS: Record<SubscriptionTier, {
  name: string;
  price: number;
  annualPrice: number;
  tag: string;
  description: string;
  features: string[];
}> = {
  free: {
    name: 'Free',
    price: 0,
    annualPrice: 0,
    tag: 'Starter',
    description: 'Perfect for exploring YatraAI and checking the community feed.',
    features: [
      '2 AI trip plans per month',
      'Basic itinerary suggestions',
      'Basic destination ideas',
      'View Travel Community',
      'Like and comment on posts',
      'Limited saved trips',
    ],
  },
  premium: {
    name: 'Premium',
    price: 199,
    annualPrice: 1990,
    tag: 'Recommended',
    description: 'Best for regular travelers who want more customized AI travel planning.',
    features: [
      'More AI trip plans',
      'Detailed day-wise itineraries',
      'Advanced hotel recommendations',
      'Flight/train recommendations',
      'Unlimited saved trips',
      'Upload travel experiences',
      'Plan a Similar Trip',
    ],
  },
  pro: {
    name: 'Pro',
    price: 399,
    annualPrice: 3990,
    tag: 'Elite',
    description: 'For frequent planners and power users wanting full flexibility and priority access.',
    features: [
      'Unlimited AI trip planning',
      'Advanced AI travel assistant',
      'Priority itinerary generation',
      'Trip comparison and recommendations',
      'Unlimited travel posts',
      'Premium Travel Passport features',
      'Advanced weather-based suggestions',
    ],
  },
};

export function getDefaultSubscription(): SubscriptionStatus {
  return {
    plan: 'free',
    price: 0,
    status: 'active',
    startDate: new Date().toISOString(),
    expiryDate: '',
    paymentId: 'free-plan',
    billingCycle: 'monthly',
  };
}

export function getSubscriptionStatus(): SubscriptionStatus {
  const raw = localStorage.getItem(STORAGE_KEYS.subscription);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.subscription, JSON.stringify(getDefaultSubscription()));
    return getDefaultSubscription();
  }

  try {
    return { ...getDefaultSubscription(), ...JSON.parse(raw) };
  } catch {
    localStorage.setItem(STORAGE_KEYS.subscription, JSON.stringify(getDefaultSubscription()));
    return getDefaultSubscription();
  }
}

export function setSubscriptionStatus(next: Partial<SubscriptionStatus> & { plan: SubscriptionTier }): SubscriptionStatus {
  const current = getSubscriptionStatus();
  const updated: SubscriptionStatus = {
    ...current,
    ...next,
    startDate: next.startDate || current.startDate,
    expiryDate: next.expiryDate || current.expiryDate,
    paymentId: next.paymentId || current.paymentId,
    billingCycle: next.billingCycle || current.billingCycle,
  };

  localStorage.setItem(STORAGE_KEYS.subscription, JSON.stringify(updated));
  return updated;
}

export function isPremiumUnlocked(): boolean {
  const currentPlan = getSubscriptionStatus().plan;
  return currentPlan === 'premium' || currentPlan === 'pro';
}

export function isProUnlocked(): boolean {
  return getSubscriptionStatus().plan === 'pro';
}

export function getPlanDisplayName(plan: SubscriptionTier): string {
  return PLAN_DETAILS[plan].name;
}

export function getTravelPosts(): TravelPost[] {
  const raw = localStorage.getItem(STORAGE_KEYS.travelPosts);
  if (raw) {
    try {
      return JSON.parse(raw) as TravelPost[];
    } catch {
      localStorage.removeItem(STORAGE_KEYS.travelPosts);
    }
  }

  const defaultPosts: TravelPost[] = [
    {
      id: 'post-1',
      userId: 'u-1',
      userName: 'Mayuri Sharma',
      userAvatar: 'MS',
      destination: 'Manali, Himachal Pradesh',
      caption: 'Beautiful mountain experience in Manali. Scenic views, cosy stays, and the perfect winter escape.',
      tripDuration: '4 Days / 3 Nights',
      budget: 18500,
      hotel: 'Snow Valley Resort',
      placesVisited: ['Solang Valley', 'Mall Road', 'Rohtang Pass'],
      hashtags: ['#Manali', '#HimalayanEscape', '#TravelDiaries'],
      images: [
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      ],
      createdAt: '2026-08-12T08:30:00.000Z',
      likes: 218,
      comments: [
        { id: 'c1', user: 'Rahul', text: 'This looks stunning! Would love a budget version too.', createdAt: '2026-08-12T09:00:00.000Z' },
      ],
      saved: false,
      likedByMe: false,
    },
    {
      id: 'post-2',
      userId: 'u-2',
      userName: 'Aditya Verma',
      userAvatar: 'AV',
      destination: 'Goa',
      caption: 'Sunshine, beaches, and sunset evenings. The perfect quick escape for a weekend recharge.',
      tripDuration: '3 Days / 2 Nights',
      budget: 12000,
      hotel: 'Blue Horizon Stay',
      placesVisited: ['Baga Beach', 'Fort Aguada', 'Anjuna'],
      hashtags: ['#Goa', '#BeachLife', '#WeekendTrip'],
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      ],
      createdAt: '2026-08-20T14:30:00.000Z',
      likes: 184,
      comments: [
        { id: 'c2', user: 'Naina', text: 'I keep coming back to Goa for the sunsets.', createdAt: '2026-08-20T15:00:00.000Z' },
      ],
      saved: true,
      likedByMe: true,
    },
  ];

  localStorage.setItem(STORAGE_KEYS.travelPosts, JSON.stringify(defaultPosts));
  return defaultPosts;
}

export function setTravelPosts(posts: TravelPost[]) {
  localStorage.setItem(STORAGE_KEYS.travelPosts, JSON.stringify(posts));
}

export function getCommunitySeed() {
  const raw = sessionStorage.getItem(STORAGE_KEYS.communitySeed);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    sessionStorage.removeItem(STORAGE_KEYS.communitySeed);
    return null;
  }
}

export function setCommunitySeed(seed: Record<string, unknown> | null) {
  if (!seed) {
    sessionStorage.removeItem(STORAGE_KEYS.communitySeed);
    return;
  }

  sessionStorage.setItem(STORAGE_KEYS.communitySeed, JSON.stringify(seed));
}
