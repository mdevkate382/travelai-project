export interface DestData {
  name: string;
  city: string;
  state: string;
  country: string;
  country_code: string;
  lat: number;
  lng: number;
  region: string;
  types: string[];
  weather: string;
  baseCost: number;
  nearby: string[];
  attractions: string[];
  hotels: { tier: string; cost: number }[];
  transport: { mode: string; cost: number; time: string }[];
  restaurants: string[];
  image: string;
  description: string;
}

export const INDIAN_DESTINATIONS: DestData[] = [
  {
    name: 'Manali', city: 'Manali', state: 'Himachal Pradesh', country: 'India', country_code: 'IN',
    lat: 32.2396, lng: 77.1887, region: 'North', types: ['Mountains', 'Adventure', 'Nature', 'Scenic'],
    weather: 'Cold', baseCost: 2500,
    nearby: ['Solang Valley', 'Kasol', 'Kullu', 'Tirthan Valley', 'Spiti Valley', 'Auli', 'Sikkim', 'Shimla'],
    attractions: ['Solang Valley', 'Hadimba Temple', 'Rohtang Pass', 'Old Manali', 'Vashisht Hot Springs', 'Manikaran Sahib'],
    hotels: [
      { tier: 'Budget', cost: 800 }, { tier: '2 Star', cost: 1200 }, { tier: '3 Star', cost: 2000 },
      { tier: '4 Star', cost: 3500 }, { tier: '5 Star', cost: 6000 }, { tier: 'Luxury', cost: 9000 },
      { tier: 'Resort', cost: 7000 }, { tier: 'Homestay', cost: 1500 }, { tier: 'Hostel', cost: 500 },
    ],
    transport: [
      { mode: 'Flight', cost: 6500, time: '2 hours (to Bhuntar)' },
      { mode: 'Train', cost: 2500, time: '14 hours (to Jogindernagar)' },
      { mode: 'Bus', cost: 1200, time: '12 hours' },
      { mode: 'Car', cost: 4000, time: '10 hours' },
    ],
    restaurants: ['Johnson\'s Cafe', 'Cafe Amigos', 'The Lazy Dog', 'Chopsticks', 'Drifters\' Inn'],
    image: 'manali', description: 'A hill station nestled in the Beas River Valley, known for adventure sports and scenic mountain views.',
  },
  {
    name: 'Jaipur', city: 'Jaipur', state: 'Rajasthan', country: 'India', country_code: 'IN',
    lat: 26.9124, lng: 75.7873, region: 'North', types: ['Historical', 'City', 'Culture', 'Shopping'],
    weather: 'Sunny', baseCost: 2200,
    nearby: ['Jodhpur', 'Udaipur', 'Pushkar', 'Ajmer', 'Bikaner', 'Jaisalmer', 'Mount Abu', 'Ranthambore'],
    attractions: ['Amber Fort', 'City Palace', 'Hawa Mahal', 'Jantar Mantar', 'Nahargarh Fort', 'Johari Bazaar'],
    hotels: [
      { tier: 'Budget', cost: 700 }, { tier: '2 Star', cost: 1000 }, { tier: '3 Star', cost: 1800 },
      { tier: '4 Star', cost: 3000 }, { tier: '5 Star', cost: 5500 }, { tier: 'Luxury', cost: 8500 },
      { tier: 'Resort', cost: 6500 }, { tier: 'Heritage', cost: 4500 }, { tier: 'Homestay', cost: 1200 },
    ],
    transport: [
      { mode: 'Flight', cost: 5000, time: '1.5 hours' },
      { mode: 'Train', cost: 1800, time: '8 hours' },
      { mode: 'Bus', cost: 800, time: '10 hours' },
      { mode: 'Car', cost: 3500, time: '7 hours' },
    ],
    restaurants: ['Chokhi Dhani', 'Laxmi Misthan Bhandar', 'Spice Court', '1135 AD', 'Peacock Restaurant'],
    image: 'jaipur', description: 'The Pink City, capital of Rajasthan, famous for majestic forts, palaces, and vibrant bazaars.',
  },
  {
    name: 'Goa', city: 'Goa', state: 'Goa', country: 'India', country_code: 'IN',
    lat: 15.2993, lng: 74.1240, region: 'West', types: ['Beaches', 'Nightlife', 'Food & Culture', 'Adventure'],
    weather: 'Tropical', baseCost: 2800,
    nearby: ['South Goa', 'Dudhsagar Falls', 'Old Goa', 'Anjuna', 'Palolem', 'Hampi', 'Gokarna'],
    attractions: ['Baga Beach', 'Fort Aguada', 'Basilica of Bom Jesus', 'Dudhsagar Falls', 'Anjuna Flea Market', 'Tito\'s Lane'],
    hotels: [
      { tier: 'Budget', cost: 900 }, { tier: '2 Star', cost: 1400 }, { tier: '3 Star', cost: 2200 },
      { tier: '4 Star', cost: 3800 }, { tier: '5 Star', cost: 6500 }, { tier: 'Luxury', cost: 10000 },
      { tier: 'Resort', cost: 8000 }, { tier: 'Hostel', cost: 600 }, { tier: 'Homestay', cost: 1500 },
    ],
    transport: [
      { mode: 'Flight', cost: 4500, time: '1 hour' },
      { mode: 'Train', cost: 1500, time: '12 hours' },
      { mode: 'Bus', cost: 1000, time: '14 hours' },
      { mode: 'Car', cost: 5000, time: '11 hours' },
    ],
    restaurants: ['Britto\'s', 'Thalassa', 'Martin\'s Corner', 'Curlies', 'Fisherman\'s Wharf'],
    image: 'goa', description: 'India\'s sunshine state with golden beaches, Portuguese heritage, and vibrant nightlife.',
  },
  {
    name: 'Kerala', city: 'Kerala', state: 'Kerala', country: 'India', country_code: 'IN',
    lat: 10.1632, lng: 76.6413, region: 'South', types: ['Nature', 'Peaceful', 'Scenic', 'Food & Culture'],
    weather: 'Tropical', baseCost: 2600,
    nearby: ['Munnar', 'Alleppey', 'Kochi', 'Thekkady', 'Varkala', 'Wayanad', 'Kovalam'],
    attractions: ['Backwaters of Alleppey', 'Munnar Tea Gardens', 'Fort Kochi', 'Periyar Wildlife Sanctuary', 'Varkala Cliff', 'Athirappilly Falls'],
    hotels: [
      { tier: 'Budget', cost: 800 }, { tier: '2 Star', cost: 1200 }, { tier: '3 Star', cost: 2000 },
      { tier: '4 Star', cost: 3500 }, { tier: '5 Star', cost: 6000 }, { tier: 'Luxury', cost: 9500 },
      { tier: 'Resort', cost: 7500 }, { tier: 'Homestay', cost: 1400 }, { tier: 'Eco Stay', cost: 2500 },
    ],
    transport: [
      { mode: 'Flight', cost: 5500, time: '2 hours' },
      { mode: 'Train', cost: 2000, time: '18 hours' },
      { mode: 'Bus', cost: 1200, time: '20 hours' },
      { mode: 'Car', cost: 5500, time: '16 hours' },
    ],
    restaurants: ['Kayees Biryani', 'Paragon Restaurant', 'Fort House Restaurant', 'Oceanos', 'Fusion Bay'],
    image: 'kerala', description: 'God\'s Own Country — palm-lined beaches, serene backwaters, and lush tea plantations.',
  },
  {
    name: 'Agra', city: 'Agra', state: 'Uttar Pradesh', country: 'India', country_code: 'IN',
    lat: 27.1767, lng: 78.0081, region: 'North', types: ['Historical', 'Religious', 'Culture'],
    weather: 'Sunny', baseCost: 1800,
    nearby: ['Mathura', 'Vrindavan', 'Fatehpur Sikri', 'Delhi', 'Bharatpur', 'Gwalior'],
    attractions: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Itmad-ud-Daulah', 'Mehtab Bagh', 'Sikandra'],
    hotels: [
      { tier: 'Budget', cost: 600 }, { tier: '2 Star', cost: 900 }, { tier: '3 Star', cost: 1600 },
      { tier: '4 Star', cost: 2800 }, { tier: '5 Star', cost: 5000 }, { tier: 'Luxury', cost: 8000 },
      { tier: 'Homestay', cost: 1000 },
    ],
    transport: [
      { mode: 'Flight', cost: 4000, time: '1 hour (via Delhi)' },
      { mode: 'Train', cost: 800, time: '2 hours' },
      { mode: 'Bus', cost: 500, time: '4 hours' },
      { mode: 'Car', cost: 2500, time: '3 hours' },
    ],
    restaurants: ['Peshawri', 'Pinch of Spice', 'Dasaprakash', 'Joney\'s Place', 'Mughal Darbar'],
    image: 'agra', description: 'Home to the iconic Taj Mahal, a Mughal-era city rich in history and architecture.',
  },
  {
    name: 'Darjeeling', city: 'Darjeeling', state: 'West Bengal', country: 'India', country_code: 'IN',
    lat: 27.0360, lng: 88.2627, region: 'East', types: ['Mountains', 'Nature', 'Scenic', 'Peaceful'],
    weather: 'Cold', baseCost: 2300,
    nearby: ['Gangtok', 'Kalimpong', 'Kurseong', 'Mirik', 'Pelling', 'Lachung'],
    attractions: ['Tiger Hill Sunrise', 'Darjeeling Himalayan Railway', 'Batasia Loop', 'Peace Pagoda', 'Tea Gardens', 'Himalayan Mountaineering Institute'],
    hotels: [
      { tier: 'Budget', cost: 700 }, { tier: '2 Star', cost: 1100 }, { tier: '3 Star', cost: 1900 },
      { tier: '4 Star', cost: 3200 }, { tier: '5 Star', cost: 5500 }, { tier: 'Homestay', cost: 1300 },
    ],
    transport: [
      { mode: 'Flight', cost: 6000, time: '1.5 hours (to Bagdogra)' },
      { mode: 'Train', cost: 2200, time: '16 hours (to NJP)' },
      { mode: 'Bus', cost: 1500, time: '18 hours' },
      { mode: 'Car', cost: 4500, time: '12 hours' },
    ],
    restaurants: ['Glenary\'s', 'Keventers', 'Kunga Restaurant', 'Sonam\'s Kitchen', 'Frank Ross Cafe'],
    image: 'darjeeling', description: 'Queen of the Himalayas — tea gardens, toy trains, and stunning Kanchenjunga views.',
  },
  {
    name: 'Rishikesh', city: 'Rishikesh', state: 'Uttarakhand', country: 'India', country_code: 'IN',
    lat: 30.0869, lng: 78.2676, region: 'North', types: ['Adventure', 'Spiritual', 'Nature', 'Peaceful'],
    weather: 'Pleasant', baseCost: 1800,
    nearby: ['Haridwar', 'Dehradun', 'Mussoorie', 'Auli', 'Nainital', 'Valley of Flowers'],
    attractions: ['Lakshman Jhula', 'Triveni Ghat', 'Beatles Ashram', 'Shivpuri River Rafting', 'Neelkanth Mahadev', 'Vashishta Cave'],
    hotels: [
      { tier: 'Budget', cost: 500 }, { tier: '2 Star', cost: 800 }, { tier: '3 Star', cost: 1500 },
      { tier: '4 Star', cost: 2800 }, { tier: '5 Star', cost: 5000 }, { tier: 'Hostel', cost: 300 },
      { tier: 'Homestay', cost: 900 }, { tier: 'Eco Stay', cost: 1800 },
    ],
    transport: [
      { mode: 'Flight', cost: 4500, time: '1 hour (to Dehradun)' },
      { mode: 'Train', cost: 1200, time: '6 hours (to Haridwar)' },
      { mode: 'Bus', cost: 700, time: '8 hours' },
      { mode: 'Car', cost: 3000, time: '6 hours' },
    ],
    restaurants: ['Chotiwala', 'The Beatles Cafe', 'Freedom Cafe', 'Ayurpak', 'Sitting Elephant'],
    image: 'rishikesh', description: 'Yoga capital of the world, on the Ganges — spiritual retreats and white-water rafting.',
  },
  {
    name: 'Munnar', city: 'Munnar', state: 'Kerala', country: 'India', country_code: 'IN',
    lat: 10.0889, lng: 77.0595, region: 'South', types: ['Mountains', 'Nature', 'Scenic', 'Peaceful'],
    weather: 'Pleasant', baseCost: 2200,
    nearby: ['Thekkady', 'Alleppey', 'Kochi', 'Marayoor', 'Top Station', 'Mattupetty'],
    attractions: ['Eravikulam National Park', 'Tea Museum', 'Mattupetty Dam', 'Top Station', 'Kundala Lake', 'Attukal Waterfalls'],
    hotels: [
      { tier: 'Budget', cost: 800 }, { tier: '2 Star', cost: 1200 }, { tier: '3 Star', cost: 2000 },
      { tier: '4 Star', cost: 3500 }, { tier: '5 Star', cost: 6000 }, { tier: 'Resort', cost: 7000 },
      { tier: 'Homestay', cost: 1300 }, { tier: 'Eco Stay', cost: 2200 },
    ],
    transport: [
      { mode: 'Flight', cost: 5500, time: '2 hours (to Kochi)' },
      { mode: 'Train', cost: 2000, time: '18 hours (to Aluva)' },
      { mode: 'Bus', cost: 1200, time: '20 hours' },
      { mode: 'Car', cost: 5000, time: '14 hours' },
    ],
    restaurants: ['Saravana Bhavan', 'Rapsy Restaurant', 'Guru Restaurant', 'Thattu Kada', 'Cloud 9'],
    image: 'munnar', description: 'Rolling tea plantations in the Western Ghats — cool climate, misty hills, and spice gardens.',
  },
];

export const INTERNATIONAL_DESTINATIONS: DestData[] = [
  {
    name: 'Dubai', city: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', country_code: 'AE',
    lat: 25.2048, lng: 55.2708, region: 'Middle East', types: ['City', 'Shopping', 'Adventure', 'Nightlife'],
    weather: 'Sunny', baseCost: 8000,
    nearby: ['Abu Dhabi', 'Sharjah', 'Ras Al Khaimah', 'Fujairah', 'Al Ain', 'Ajman', 'Muscat', 'Doha'],
    attractions: ['Burj Khalifa', 'Palm Jumeirah', 'Dubai Mall', 'Desert Safari', 'Dubai Marina', 'Jumeirah Beach'],
    hotels: [
      { tier: 'Budget', cost: 2500 }, { tier: '2 Star', cost: 3500 }, { tier: '3 Star', cost: 5500 },
      { tier: '4 Star', cost: 8000 }, { tier: '5 Star', cost: 14000 }, { tier: 'Luxury', cost: 22000 },
      { tier: 'Resort', cost: 18000 },
    ],
    transport: [
      { mode: 'Flight', cost: 18000, time: '3.5 hours' },
      { mode: 'Bus', cost: 3000, time: 'N/A' },
    ],
    restaurants: ['Al Mahara', 'Pierchic', 'Ravi Restaurant', 'Al Ustad Special Kabab', 'Armani Amal'],
    image: 'dubai', description: 'Futuristic city in the desert — luxury shopping, towering skyscrapers, and Arabian culture.',
  },
  {
    name: 'Singapore', city: 'Singapore', state: 'Singapore', country: 'Singapore', country_code: 'SG',
    lat: 1.3521, lng: 103.8198, region: 'Southeast Asia', types: ['City', 'Shopping', 'Food & Culture', 'Adventure'],
    weather: 'Tropical', baseCost: 7000,
    nearby: ['Sentosa Island', 'Johor Bahru', 'Kuala Lumpur', 'Bali', 'Bangkok', 'Jakarta'],
    attractions: ['Marina Bay Sands', 'Gardens by the Bay', 'Universal Studios', 'Sentosa Island', 'Chinatown', 'Night Safari'],
    hotels: [
      { tier: 'Budget', cost: 2000 }, { tier: '2 Star', cost: 3000 }, { tier: '3 Star', cost: 5000 },
      { tier: '4 Star', cost: 7500 }, { tier: '5 Star', cost: 12000 }, { tier: 'Luxury', cost: 20000 },
      { tier: 'Hostel', cost: 1200 },
    ],
    transport: [
      { mode: 'Flight', cost: 22000, time: '5.5 hours' },
    ],
    restaurants: ['Hawker Chan', 'Burnt Ends', 'Odette', 'Komala Vilas', 'Jumbo Seafood'],
    image: 'singapore', description: 'A garden city — futuristic architecture, world-class food, and diverse cultural neighborhoods.',
  },
  {
    name: 'Bangkok', city: 'Bangkok', state: 'Bangkok', country: 'Thailand', country_code: 'TH',
    lat: 13.7563, lng: 100.5018, region: 'Southeast Asia', types: ['City', 'Shopping', 'Nightlife', 'Food & Culture'],
    weather: 'Tropical', baseCost: 5000,
    nearby: ['Phuket', 'Chiang Mai', 'Pattaya', 'Krabi', 'Ayutthaya', 'Koh Samui'],
    attractions: ['Grand Palace', 'Wat Arun', 'Chatuchak Market', 'Khao San Road', 'Chao Phraya River', 'Wat Pho'],
    hotels: [
      { tier: 'Budget', cost: 1200 }, { tier: '2 Star', cost: 2000 }, { tier: '3 Star', cost: 3500 },
      { tier: '4 Star', cost: 5500 }, { tier: '5 Star', cost: 9000 }, { tier: 'Luxury', cost: 15000 },
      { tier: 'Hostel', cost: 600 },
    ],
    transport: [
      { mode: 'Flight', cost: 16000, time: '4.5 hours' },
    ],
    restaurants: ['Jay Fai', 'Thip Samai', 'Err ', 'Bo.lan', 'Gaggan'],
    image: 'bangkok', description: 'Thailand\'s vibrant capital — ornate temples, street food, bustling markets, and nightlife.',
  },
  {
    name: 'Bali', city: 'Bali', state: 'Bali', country: 'Indonesia', country_code: 'ID',
    lat: -8.3405, lng: 115.0920, region: 'Southeast Asia', types: ['Beaches', 'Nature', 'Spiritual', 'Peaceful'],
    weather: 'Tropical', baseCost: 4500,
    nearby: ['Ubud', 'Seminyak', 'Nusa Penida', 'Lombok', 'Gili Islands', 'Canggu', 'Uluwatu'],
    attractions: ['Tanah Lot Temple', 'Ubud Monkey Forest', 'Tegallalang Rice Terraces', 'Uluwatu Temple', 'Mount Batur', 'Sekumpul Waterfall'],
    hotels: [
      { tier: 'Budget', cost: 1000 }, { tier: '2 Star', cost: 1800 }, { tier: '3 Star', cost: 3000 },
      { tier: '4 Star', cost: 5000 }, { tier: '5 Star', cost: 8500 }, { tier: 'Luxury', cost: 14000 },
      { tier: 'Resort', cost: 11000 }, { tier: 'Villa', cost: 7000 },
    ],
    transport: [
      { mode: 'Flight', cost: 18000, time: '7 hours' },
    ],
    restaurants: ['Locavore', 'Mozaic', 'Bumbu Bali', 'Warung Babi Guling', 'La Lucciola'],
    image: 'bali', description: 'Island of the Gods — lush rice terraces, volcanic mountains, and serene beaches.',
  },
  {
    name: 'London', city: 'London', state: 'England', country: 'United Kingdom', country_code: 'GB',
    lat: 51.5074, lng: -0.1278, region: 'Europe', types: ['City', 'Historical', 'Culture', 'Shopping'],
    weather: 'Rainy', baseCost: 12000,
    nearby: ['Paris', 'Edinburgh', 'Amsterdam', 'Stonehenge', 'Oxford', 'Cambridge', 'Manchester'],
    attractions: ['Big Ben', 'Tower of London', 'British Museum', 'London Eye', 'Buckingham Palace', 'Hyde Park'],
    hotels: [
      { tier: 'Budget', cost: 3000 }, { tier: '2 Star', cost: 4500 }, { tier: '3 Star', cost: 7000 },
      { tier: '4 Star', cost: 11000 }, { tier: '5 Star', cost: 18000 }, { tier: 'Luxury', cost: 30000 },
    ],
    transport: [
      { mode: 'Flight', cost: 45000, time: '9 hours' },
    ],
    restaurants: ['The Ritz', 'Sketch', 'Dishoom', 'Borough Market', 'Rules'],
    image: 'london', description: 'Historic global city — royal palaces, world-class museums, and cosmopolitan culture.',
  },
  {
    name: 'Tokyo', city: 'Tokyo', state: 'Tokyo', country: 'Japan', country_code: 'JP',
    lat: 35.6762, lng: 139.6503, region: 'East Asia', types: ['City', 'Food & Culture', 'Shopping', 'Nightlife'],
    weather: 'Pleasant', baseCost: 10000,
    nearby: ['Kyoto', 'Osaka', 'Mount Fuji', 'Hakone', 'Nikko', 'Yokohama', 'Nara'],
    attractions: ['Senso-ji Temple', 'Shibuya Crossing', 'Tokyo Skytree', 'Meiji Shrine', 'Tsukiji Market', 'Akihabara'],
    hotels: [
      { tier: 'Budget', cost: 2500 }, { tier: '2 Star', cost: 4000 }, { tier: '3 Star', cost: 6500 },
      { tier: '4 Star', cost: 10000 }, { tier: '5 Star', cost: 17000 }, { tier: 'Luxury', cost: 28000 },
      { tier: 'Hostel', cost: 1800 },
    ],
    transport: [
      { mode: 'Flight', cost: 50000, time: '10 hours' },
    ],
    restaurants: ['Sukiyabashi Jiro', 'Ichiran Ramen', 'Gonpachi', 'Tsunahachi', 'Afuri'],
    image: 'tokyo', description: 'Where tradition meets the future — neon districts, ancient shrines, and incredible cuisine.',
  },
];

export const ALL_DESTINATIONS = [...INDIAN_DESTINATIONS, ...INTERNATIONAL_DESTINATIONS];

export function findDestination(name: string): DestData | undefined {
  const lower = name.toLowerCase().trim();
  return ALL_DESTINATIONS.find(
    (d) => d.name.toLowerCase() === lower || d.city.toLowerCase() === lower
  );
}

export function isIndianCountry(code: string): boolean {
  return code === 'IN';
}
