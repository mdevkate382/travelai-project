export type ReelCategory =
  | 'Mountains'
  | 'Beaches'
  | 'Adventure'
  | 'Food'
  | 'Hotels'
  | 'Road Trips'
  | 'Train Journeys'
  | 'Hidden Places'
  | 'Festivals'
  | 'International Travel';

export interface Reel {
  id: string;
  creator: string;
  profile: string;
  destination: string;
  location: string;
  category: ReelCategory;
  caption: string;
  hashtags: string[];
  coverImage: string;
  videoUrl?: string;
  likes: number;
  comments: number;
  saves: number;
  views: number;
  liked: boolean;
  saved: boolean;
  isDemo: boolean;
  destinationId?: string;
}

export const REEL_CATEGORIES: Array<{ label: ReelCategory; emoji: string }> = [
  { label: 'Mountains', emoji: '🏔️' },
  { label: 'Beaches', emoji: '🏖️' },
  { label: 'Adventure', emoji: '⚡' },
  { label: 'Food', emoji: '🍜' },
  { label: 'Hotels', emoji: '🏨' },
  { label: 'Road Trips', emoji: '🚗' },
  { label: 'Train Journeys', emoji: '🚆' },
  { label: 'Hidden Places', emoji: '🗺️' },
  { label: 'Festivals', emoji: '🎉' },
  { label: 'International Travel', emoji: '✈️' },
];

const FALLBACK_VIDEO_URLS = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
];

export const getReelVideoSource = (reel: Pick<Reel, 'id' | 'videoUrl'>): string => {
  if (reel.videoUrl && reel.videoUrl.trim().length > 0) return reel.videoUrl;

  const seed = Number(String(reel.id).replace(/\D/g, '')) || 0;
  return FALLBACK_VIDEO_URLS[seed % FALLBACK_VIDEO_URLS.length];
};

export const travelReels: Reel[] = [
  {
    id: 'reel-1',
    creator: 'Aarav Singh',
    profile: 'Travel storyteller',
    destination: 'Manali',
    location: 'Solang Valley, Himachal Pradesh',
    category: 'Mountains',
    caption: 'Snowy peaks, hot chai, and a little adventure. This is the kind of morning that makes every trip worth it.',
    hashtags: ['#Manali', '#HimalayanEscape', '#SnowDrive'],
    coverImage: 'https://images.pexels.com/photos/37911658/pexels-photo-37911658.jpeg?auto=compress&cs=tinysrgb&w=1200',
    videoUrl: 'https://player.vimeo.com/external/372608145.sd.mp4?s=4e3e81ca4a4c4a4d0b3d1ae9643d3f77d1d8c725&profile_id=164&oauth2_token_id=57447761',
    likes: 1840,
    comments: 98,
    saves: 220,
    views: 14200,
    liked: false,
    saved: false,
    isDemo: true,
    destinationId: 'manali',
  },
  {
    id: 'reel-2',
    creator: 'Meera Kapoor',
    profile: 'Beach lover',
    destination: 'Goa',
    location: 'Baga Beach, Goa',
    category: 'Beaches',
    caption: 'Sunset waves, coconut water, and zero stress. Goa always feels like a reset button.',
    hashtags: ['#Goa', '#WeekendEscape', '#BeachLife'],
    coverImage: 'https://images.pexels.com/photos/6789839/pexels-photo-6789839.jpeg?auto=compress&cs=tinysrgb&w=1200',
    videoUrl: 'https://player.vimeo.com/external/195740111.sd.mp4?s=7d6a32d6c2500d3a63fa6c9b0d2b9e026e2e967b&profile_id=164&oauth2_token_id=57447761',
    likes: 2430,
    comments: 150,
    saves: 312,
    views: 18640,
    liked: true,
    saved: false,
    isDemo: true,
    destinationId: 'goa',
  },
  {
    id: 'reel-3',
    creator: 'Rohit Kr',
    profile: 'Adventure planner',
    destination: 'Rajasthan',
    location: 'Jaisalmer, Rajasthan',
    category: 'Adventure',
    caption: 'A desert safari and golden dunes at sunset — the perfect mix of thrill and calm.',
    hashtags: ['#Rajasthan', '#DesertSaga', '#Adventure'],
    coverImage: 'https://images.pexels.com/photos/1007427/pexels-photo-1007427.jpeg?auto=compress&cs=tinysrgb&w=1200',
    videoUrl: 'https://player.vimeo.com/external/450748123.sd.mp4?s=9794f4c7d59bc9e7f445f614e530467c5f8d8aeb&profile_id=171&oauth2_token_id=57447761',
    likes: 1960,
    comments: 111,
    saves: 231,
    views: 16890,
    liked: false,
    saved: true,
    isDemo: true,
    destinationId: 'rajasthan',
  },
  {
    id: 'reel-4',
    creator: 'Sana Khan',
    profile: 'Food explorer',
    destination: 'Jaipur',
    location: 'Johri Bazaar, Jaipur',
    category: 'Food',
    caption: 'Roadside chaat, market strolls, and a little spice. That is what travel memories are made of.',
    hashtags: ['#StreetFood', '#Jaipur', '#FoodTrail'],
    coverImage: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=1200',
    likes: 2200,
    comments: 130,
    saves: 260,
    views: 17300,
    liked: false,
    saved: false,
    isDemo: true,
    destinationId: 'jaipur',
  },
  {
    id: 'reel-5',
    creator: 'Nidhi Rao',
    profile: 'Slow travel',
    destination: 'Kerala',
    location: 'Munnar, Kerala',
    category: 'Hotels',
    caption: 'A quiet hillside stay, tea gardens, and a sunrise you never want to end.',
    hashtags: ['#Kerala', '#TeaGardenStay', '#NatureRetreat'],
    coverImage: 'https://images.pexels.com/photos/17928231/pexels-photo-17928231.jpeg?auto=compress&cs=tinysrgb&w=1200',
    likes: 1705,
    comments: 88,
    saves: 201,
    views: 14900,
    liked: false,
    saved: false,
    isDemo: true,
    destinationId: 'kerala',
  },
  {
    id: 'reel-6',
    creator: 'Kabir Shah',
    profile: 'Road trip diaries',
    destination: 'Leh Ladakh',
    location: 'Khardung La, Ladakh',
    category: 'Road Trips',
    caption: 'Long roads, colder air, and a breathtaking horizon. This is what freedom feels like.',
    hashtags: ['#Ladakh', '#RoadTrip', '#HighPasses'],
    coverImage: 'https://images.pexels.com/photos/37898606/pexels-photo-37898606.jpeg?auto=compress&cs=tinysrgb&w=1200',
    likes: 3180,
    comments: 190,
    saves: 430,
    views: 22070,
    liked: true,
    saved: false,
    isDemo: true,
    destinationId: 'ladakh',
  },
  {
    id: 'reel-7',
    creator: 'Ishaan Sen',
    profile: 'Rail wanderer',
    destination: 'Maharashtra',
    location: 'Konkan Railway',
    category: 'Train Journeys',
    caption: 'Watching the coastline slide by from a train window — one of the best views on earth.',
    hashtags: ['#TrainJourney', '#Konkan', '#RailTravel'],
    coverImage: 'https://images.pexels.com/photos/14533217/pexels-photo-14533217.jpeg?auto=compress&cs=tinysrgb&w=1200',
    likes: 1650,
    comments: 74,
    saves: 144,
    views: 13400,
    liked: false,
    saved: false,
    isDemo: true,
    destinationId: 'konkan',
  },
  {
    id: 'reel-8',
    creator: 'Diya Malhotra',
    profile: 'Hidden gem hunter',
    destination: 'Meghalaya',
    location: 'Double Decker Root Bridge, Meghalaya',
    category: 'Hidden Places',
    caption: 'Some places are not on the usual map, and that is exactly why they feel magical.',
    hashtags: ['#HiddenGem', '#Meghalaya', '#NatureLovers'],
    coverImage: 'https://images.pexels.com/photos/36998153/pexels-photo-36998153.jpeg?auto=compress&cs=tinysrgb&w=1200',
    likes: 1308,
    comments: 69,
    saves: 150,
    views: 12260,
    liked: false,
    saved: false,
    isDemo: true,
    destinationId: 'meghalaya',
  },
  {
    id: 'reel-9',
    creator: 'Tanvi Joshi',
    profile: 'Festival walks',
    destination: 'Udaipur',
    location: 'Lake Pichola, Udaipur',
    category: 'Festivals',
    caption: 'Festivals, lights, music, and warm hospitality. Udaipur turns every evening into a celebration.',
    hashtags: ['#Udaipur', '#FestivalTravel', '#Culture'],
    coverImage: 'https://images.pexels.com/photos/19664340/pexels-photo-19664340.jpeg?auto=compress&cs=tinysrgb&w=1200',
    likes: 2590,
    comments: 142,
    saves: 283,
    views: 19120,
    liked: false,
    saved: true,
    isDemo: true,
    destinationId: 'udaipur',
  },
  {
    id: 'reel-10',
    creator: 'Aisha Rahman',
    profile: 'Global explorer',
    destination: 'Bali',
    location: 'Ubud, Bali',
    category: 'International Travel',
    caption: 'Rice terraces, café corners, and sunsets that feel unreal. Bali still feels like a dream.',
    hashtags: ['#Bali', '#IslandEscape', '#InternationalTravel'],
    coverImage: 'https://images.pexels.com/photos/28350363/pexels-photo-28350363.jpeg?auto=compress&cs=tinysrgb&w=1200',
    likes: 2900,
    comments: 160,
    saves: 339,
    views: 20350,
    liked: false,
    saved: false,
    isDemo: true,
    destinationId: 'bali',
  },
];
