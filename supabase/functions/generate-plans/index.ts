import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Destination {
  name: string;
  city: string;
  state: string;
  country: string;
  country_code: string;
  latitude: number | null;
  longitude: number | null;
  place_id: string;
}

interface TripInput {
  startLocation: Destination | null;
  destinations: Destination[];
  adults: number;
  children: number;
  totalTravellers: number;
  days: number;
  nights: number;
  budget: number;
  hotelPreference: string;
  roomType: string;
  transportPreference: string;
  weatherPreference: string;
  locationTypes: string[];
  travelType: string;
  foodPreference: string;
  activities: string[];
  travelPace: string;
  specialRequirements: string;
}

interface ItineraryDay {
  dayNumber: number;
  dayTitle: string;
  location: string;
  morning: string;
  afternoon: string;
  evening: string;
  food: string;
  transport: string;
  hotel: string;
  activities: string[];
  dailyCost: number;
  travelTips: string;
}

interface Plan {
  planName: string;
  description: string;
  route: string[];
  numLocations: number;
  numNights: number;
  hotel: string;
  transport: string;
  activities: string[];
  weather: string;
  matchScore: number;
  hotelCost: number;
  transportCost: number;
  localTransportCost: number;
  foodCost: number;
  activitiesCost: number;
  miscCost: number;
  totalCost: number;
  budgetRemaining: number;
  withinBudget: boolean;
  whyMatches: string;
  itinerary: ItineraryDay[];
}

// ---- Destination knowledge base (mirrors frontend data) ----
const INDIAN_DESTS: Record<string, any> = {
  Manali: { nearby: ["Solang Valley", "Kasol", "Kullu", "Tirthan Valley", "Spiti Valley", "Auli"], attractions: ["Solang Valley", "Hadimba Temple", "Rohtang Pass", "Old Manali", "Vashisht Hot Springs"], hotels: { Budget: 800, "2 Star": 1200, "3 Star": 2000, "4 Star": 3500, "5 Star": 6000, Luxury: 9000, Resort: 7000, Homestay: 1500, Hostel: 500 }, transport: { Flight: 6500, Train: 2500, Bus: 1200, Car: 4000 }, food: 500, activities: 800, weather: "Cold", types: ["Mountains", "Adventure", "Nature"] },
  Jaipur: { nearby: ["Jodhpur", "Udaipur", "Pushkar", "Ajmer", "Bikaner", "Jaisalmer", "Mount Abu"], attractions: ["Amber Fort", "City Palace", "Hawa Mahal", "Jantar Mantar", "Nahargarh Fort"], hotels: { Budget: 700, "2 Star": 1000, "3 Star": 1800, "4 Star": 3000, "5 Star": 5500, Luxury: 8500, Resort: 6500, Homestay: 1200 }, transport: { Flight: 5000, Train: 1800, Bus: 800, Car: 3500 }, food: 450, activities: 600, weather: "Sunny", types: ["Historical", "City", "Culture"] },
  Goa: { nearby: ["South Goa", "Dudhsagar Falls", "Old Goa", "Anjuna", "Palolem", "Gokarna"], attractions: ["Baga Beach", "Fort Aguada", "Basilica of Bom Jesus", "Dudhsagar Falls", "Anjuna Market"], hotels: { Budget: 900, "2 Star": 1400, "3 Star": 2200, "4 Star": 3800, "5 Star": 6500, Luxury: 10000, Resort: 8000, Hostel: 600, Homestay: 1500 }, transport: { Flight: 4500, Train: 1500, Bus: 1000, Car: 5000 }, food: 600, activities: 1000, weather: "Tropical", types: ["Beaches", "Nightlife", "Adventure"] },
  Kerala: { nearby: ["Munnar", "Alleppey", "Kochi", "Thekkady", "Varkala", "Wayanad"], attractions: ["Backwaters of Alleppey", "Munnar Tea Gardens", "Fort Kochi", "Periyar Wildlife Sanctuary", "Varkala Cliff"], hotels: { Budget: 800, "2 Star": 1200, "3 Star": 2000, "4 Star": 3500, "5 Star": 6000, Luxury: 9500, Resort: 7500, Homestay: 1400 }, transport: { Flight: 5500, Train: 2000, Bus: 1200, Car: 5500 }, food: 500, activities: 700, weather: "Tropical", types: ["Nature", "Peaceful", "Scenic"] },
  Agra: { nearby: ["Mathura", "Vrindavan", "Fatehpur Sikri", "Delhi", "Bharatpur"], attractions: ["Taj Mahal", "Agra Fort", "Fatehpur Sikri", "Itmad-ud-Daulah", "Mehtab Bagh"], hotels: { Budget: 600, "2 Star": 900, "3 Star": 1600, "4 Star": 2800, "5 Star": 5000, Luxury: 8000, Homestay: 1000 }, transport: { Flight: 4000, Train: 800, Bus: 500, Car: 2500 }, food: 400, activities: 500, weather: "Sunny", types: ["Historical", "Religious", "Culture"] },
  Darjeeling: { nearby: ["Gangtok", "Kalimpong", "Kurseong", "Mirik", "Pelling"], attractions: ["Tiger Hill Sunrise", "Darjeeling Himalayan Railway", "Batasia Loop", "Peace Pagoda", "Tea Gardens"], hotels: { Budget: 700, "2 Star": 1100, "3 Star": 1900, "4 Star": 3200, "5 Star": 5500, Homestay: 1300 }, transport: { Flight: 6000, Train: 2200, Bus: 1500, Car: 4500 }, food: 450, activities: 600, weather: "Cold", types: ["Mountains", "Nature", "Scenic"] },
  Rishikesh: { nearby: ["Haridwar", "Dehradun", "Mussoorie", "Auli", "Nainital"], attractions: ["Lakshman Jhula", "Triveni Ghat", "Beatles Ashram", "River Rafting", "Neelkanth Mahadev"], hotels: { Budget: 500, "2 Star": 800, "3 Star": 1500, "4 Star": 2800, "5 Star": 5000, Hostel: 300, Homestay: 900 }, transport: { Flight: 4500, Train: 1200, Bus: 700, Car: 3000 }, food: 350, activities: 800, weather: "Pleasant", types: ["Adventure", "Spiritual", "Nature"] },
  Munnar: { nearby: ["Thekkady", "Alleppey", "Kochi", "Marayoor", "Top Station"], attractions: ["Eravikulam National Park", "Tea Museum", "Mattupetty Dam", "Top Station", "Kundala Lake"], hotels: { Budget: 800, "2 Star": 1200, "3 Star": 2000, "4 Star": 3500, "5 Star": 6000, Resort: 7000, Homestay: 1300 }, transport: { Flight: 5500, Train: 2000, Bus: 1200, Car: 5000 }, food: 450, activities: 600, weather: "Pleasant", types: ["Mountains", "Nature", "Scenic"] },
};

const INTL_DESTS: Record<string, any> = {
  Dubai: { nearby: ["Abu Dhabi", "Sharjah", "Ras Al Khaimah", "Fujairah", "Al Ain"], attractions: ["Burj Khalifa", "Palm Jumeirah", "Dubai Mall", "Desert Safari", "Dubai Marina"], hotels: { Budget: 2500, "2 Star": 3500, "3 Star": 5500, "4 Star": 8000, "5 Star": 14000, Luxury: 22000, Resort: 18000 }, transport: { Flight: 18000 }, food: 1500, activities: 3000, weather: "Sunny", types: ["City", "Shopping", "Adventure"] },
  Singapore: { nearby: ["Sentosa Island", "Johor Bahru", "Kuala Lumpur", "Bali", "Bangkok"], attractions: ["Marina Bay Sands", "Gardens by the Bay", "Universal Studios", "Sentosa Island", "Chinatown"], hotels: { Budget: 2000, "2 Star": 3000, "3 Star": 5000, "4 Star": 7500, "5 Star": 12000, Luxury: 20000, Hostel: 1200 }, transport: { Flight: 22000 }, food: 1200, activities: 2500, weather: "Tropical", types: ["City", "Shopping", "Food & Culture"] },
  Bangkok: { nearby: ["Phuket", "Chiang Mai", "Pattaya", "Krabi", "Ayutthaya"], attractions: ["Grand Palace", "Wat Arun", "Chatuchak Market", "Khao San Road", "Chao Phraya River"], hotels: { Budget: 1200, "2 Star": 2000, "3 Star": 3500, "4 Star": 5500, "5 Star": 9000, Luxury: 15000, Hostel: 600 }, transport: { Flight: 16000 }, food: 800, activities: 1500, weather: "Tropical", types: ["City", "Shopping", "Nightlife"] },
  Bali: { nearby: ["Ubud", "Seminyak", "Nusa Penida", "Lombok", "Gili Islands"], attractions: ["Tanah Lot Temple", "Ubud Monkey Forest", "Tegallalang Rice Terraces", "Uluwatu Temple", "Mount Batur"], hotels: { Budget: 1000, "2 Star": 1800, "3 Star": 3000, "4 Star": 5000, "5 Star": 8500, Luxury: 14000, Resort: 11000 }, transport: { Flight: 18000 }, food: 700, activities: 1200, weather: "Tropical", types: ["Beaches", "Nature", "Spiritual"] },
  London: { nearby: ["Paris", "Edinburgh", "Amsterdam", "Stonehenge", "Oxford"], attractions: ["Big Ben", "Tower of London", "British Museum", "London Eye", "Buckingham Palace"], hotels: { Budget: 3000, "2 Star": 4500, "3 Star": 7000, "4 Star": 11000, "5 Star": 18000, Luxury: 30000 }, transport: { Flight: 45000 }, food: 2000, activities: 3500, weather: "Rainy", types: ["City", "Historical", "Culture"] },
  Tokyo: { nearby: ["Kyoto", "Osaka", "Mount Fuji", "Hakone", "Nikko"], attractions: ["Senso-ji Temple", "Shibuya Crossing", "Tokyo Skytree", "Meiji Shrine", "Tsukiji Market"], hotels: { Budget: 2500, "2 Star": 4000, "3 Star": 6500, "4 Star": 10000, "5 Star": 17000, Luxury: 28000, Hostel: 1800 }, transport: { Flight: 50000 }, food: 1800, activities: 3000, weather: "Pleasant", types: ["City", "Food & Culture", "Shopping"] },
};

const HOTEL_NAMES: Record<string, Record<string, string>> = {
  Manali: { Budget: "The Holiday Resorts", "2 Star": "Hotel Snow Park", "3 Star": "The Anantmaya Resort", "4 Star": "The Himalayan", "5 Star": "Manali Heights", Luxury: "Span Resort & Spa", Resort: "The Orchard Greens", Homestay: "Johnson Lodge", Hostel: "The Lost Tribe Hostel" },
  Jaipur: { Budget: "Hotel Pearl Palace", "2 Star": "Umaid Bhawan", "3 Star": "Shahpura House", "4 Star": "Ramada by Wyndham Jaipur", "5 Star": "ITC Rajputana", Luxury: "The Oberoi Rajvilas", Resort: "Fairmont Jaipur", Homestay: "Jaipur Homestay" },
  Goa: { Budget: "The Yellow House", "2 Star": "Resort Terra Paraiso", "3 Star": "Lemon Tree Amarante Beach Resort", "4 Star": "Novotel Goa Candolim", "5 Star": "Taj Resort & Convention Centre", Luxury: "W Goa", Resort: "Alila Diwa Goa", Homestay: "Pachuau's Homestay", Hostel: "The Hosteller Goa" },
  Kerala: { Budget: "Kochi Marriott Guest House", "2 Star": "Fort Castle", "3 Star": "Abad Atrium", "4 Star": "The Leela Ashtamudi", "5 Star": "Taj Malabar Resort & Spa", Luxury: "Kumarakom Lake Resort", Resort: "The Zuri Kumarakom", Homestay: "Marari Beach Homestay" },
  Agra: { Budget: "Hotel Sidhartha", "2 Star": "Hotel Atithi", "3 Star": "Hotel Clarks Shiraz", "4 Star": "Courtyard by Marriott Agra", "5 Star": "ITC Mughal", Luxury: "The Oberoi Amarvilas", Homestay: "Taj View Homestay" },
  Darjeeling: { Budget: "Hotel Broadway", "2 Star": "Summit Hermon Hotel", "3 Star": "Cedar Inn", "4 Star": "Mayfair Darjeeling", "5 Star": "Windamere Hotel", Homestay: "Darjeeling Homestay" },
  Rishikesh: { Budget: "Hotel Yog Vashishth", "2 Star": "Hotel Natraj", "3 Star": "Aloha On The Ganges", "4 Star": "Panambi Resort", "5 Star": "Ananda in the Himalayas", Hostel: "goSTOPS Rishikesh", Homestay: "Rishikesh Riverside Homestay" },
  Munnar: { Budget: "Munnar Inn", "2 Star": "Tea County", "3 Star": "Amber Dale Luxury Hotel", "4 Star": "Blanket Hotel & Spa", "5 Star": "The Tall Trees", Resort: "The Leaf Munnar", Homestay: "Munnar Tea Garden Homestay" },
  Dubai: { Budget: "Rove Downtown", "2 Star": "Citymax Hotel Bur Dubai", "3 Star": "Premier Inn Dubai Al Jaddaf", "4 Star": "Millennium Plaza Downtown", "5 Star": "JW Marriott Marquis Dubai", Luxury: "Burj Al Arab Jumeirah", Resort: "Atlantis The Palm" },
  Singapore: { Budget: "Hotel 81", "2 Star": "ibis budget Singapore", "3 Star": "Hotel Boss", "4 Star": "Carlton Hotel Singapore", "5 Star": "Marina Bay Sands", Luxury: "Raffles Singapore", Hostel: "The Pod Boutique Capsule Hotel" },
  Bangkok: { Budget: "D&D Inn Bangkok", "2 Star": "ibis Bangkok Riverside", "3 Star": "Novotel Bangkok Platinum", "4 Star": "Amari Watergate Bangkok", "5 Star": "The Athenee Hotel", Luxury: "Mandarin Oriental Bangkok", Hostel: "Lub d Bangkok Siam" },
  Bali: { Budget: "Puri Garden Hotel & Hostel", "2 Star": "Matahari Bungalows", "3 Star": "Anumana Ubud Hotel", "4 Star": "Alaya Resort Ubud", "5 Star": "The Westin Resort Nusa Dua", Luxury: "Four Seasons Resort Bali", Resort: "Hard Rock Hotel Bali" },
  London: { Budget: "Point A Hotel London", "2 Star": "ibis London City", "3 Star": "The Resident Covent Garden", "4 Star": "The Tower Hotel", "5 Star": "The Savoy", Luxury: "The Ritz London" },
  Tokyo: { Budget: "APA Hotel Shinjuku", "2 Star": "Hotel Gracery Shinjuku", "3 Star": "Mitsui Garden Hotel", "4 Star": "The Prince Gallery Tokyo", "5 Star": "The Peninsula Tokyo", Luxury: "Aman Tokyo", Hostel: "Book and Bed Tokyo" },
};

function getHotelName(destination: string, hotelTier: string): string {
  const resolvedTier = hotelTier === "No Preference" ? "3 Star" : hotelTier;
  return HOTEL_NAMES[destination]?.[resolvedTier] || `${resolvedTier} Hotel in ${destination}`;
}

function getDestData(name: string, isIndian: boolean): any {
  const db = isIndian ? INDIAN_DESTS : INTL_DESTS;
  return db[name];
}

function getNearbyPool(primaryName: string, isIndian: boolean): string[] {
  const data = getDestData(primaryName, isIndian);
  if (!data) return [];
  return data.nearby.filter((n: string) => n !== primaryName);
}

// Generate 7 diverse plans
function generatePlans(input: TripInput): Plan[] {
  const isIndian = input.destinations[0]?.country_code === "IN";
  const primaryDest = input.destinations[0]?.name || "Unknown";
  const nearbyPool = getNearbyPool(primaryDest, isIndian);
  const destData = getDestData(primaryDest, isIndian);

  if (!destData) {
    return generateGenericPlans(input, isIndian);
  }

  const plans: Plan[] = [];
  const hotelPref = input.hotelPreference;
  const transportPref = input.transportPreference;
  const travellers = input.totalTravellers;
  const days = input.days;
  const nights = days - 1;
  const budget = input.budget;

  const hotelCostPerNight = (destData.hotels[hotelPref] !== undefined ? destData.hotels[hotelPref] : destData.hotels["3 Star"]) * (travellers > 2 ? Math.ceil(travellers / 2) : 1);

  let transportMode = transportPref;
  if (transportMode === "No Preference") {
    if (budget < 50000 && isIndian) transportMode = "Train";
    else transportMode = "Flight";
  }
  const transportCost = destData.transport[transportMode] !== undefined ? destData.transport[transportMode] * travellers : (isIndian ? 2000 : 15000) * travellers;

  const foodPerDay = destData.food * travellers;
  const activitiesPerDay = destData.activities * travellers;
  const localTransportPerDay = (isIndian ? 300 : 800) * travellers;
  const miscPerDay = (isIndian ? 200 : 500) * travellers;

  const planThemes = [
    { name: `Classic ${primaryDest} Experience`, category: "Classic Explorer", extraDests: nearbyPool.slice(0, 1), paceMultiplier: 1.0, hotelAdjust: 1.0, activityAdjust: 1.0, desc: "A well-balanced itinerary covering the must-see highlights of the destination and a nearby attraction for a complete experience." },
    { name: `Budget Explorer - ${primaryDest}`, category: "Budget Explorer", extraDests: nearbyPool.slice(1, 2), paceMultiplier: 0.8, hotelAdjust: 0.6, activityAdjust: 0.7, desc: "A value-focused trip designed to maximize your budget with affordable lodging, local food, and must-do sights." },
    { name: `Luxury Retreat - ${primaryDest}`, category: "Premium Experience", extraDests: nearbyPool.slice(0, 1), paceMultiplier: 0.7, hotelAdjust: 1.8, activityAdjust: 1.3, desc: "A premium experience featuring elevated stays, leisurely sightseeing, and indulgent dining and comfort." },
    { name: `Adventure Trail - ${primaryDest} Circuit`, category: "Adventure Traveller", extraDests: nearbyPool.slice(0, 3), paceMultiplier: 1.3, hotelAdjust: 0.8, activityAdjust: 1.5, desc: "A more energetic route full of outdoor activities, scenic drives, adventure stops, and active experiences." },
    { name: `Cultural Deep Dive - ${primaryDest}`, category: "Culture Enthusiast", extraDests: nearbyPool.slice(2, 3), paceMultiplier: 0.9, hotelAdjust: 1.0, activityAdjust: 1.1, desc: "A heritage-driven trip centered on historical places, cultural walks, local neighborhoods, and authentic cuisine." },
    { name: `Relaxed Getaway - ${primaryDest}`, category: "Relaxed Getaway", extraDests: nearbyPool.slice(1, 2), paceMultiplier: 0.6, hotelAdjust: 1.2, activityAdjust: 0.6, desc: "A gentle pace with scenic rest, slow mornings, and flexible exploration for a calm holiday." },
    { name: `Offbeat Discovery - ${primaryDest} & Beyond`, category: "Hidden Gems", extraDests: nearbyPool.slice(3, 5), paceMultiplier: 1.1, hotelAdjust: 0.9, activityAdjust: 1.2, desc: "A curated offbeat route with lesser-known stops, scenic views, and unique local experiences beyond the usual tourist trail." },
  ];

  for (let i = 0; i < 7; i++) {
    const theme = planThemes[i];
    const routeDests = [primaryDest, ...theme.extraDests].filter((v, idx, arr) => arr.indexOf(v) === idx);
    const numLocations = routeDests.length;

    const hotelCost = Math.round(hotelCostPerNight * nights * theme.hotelAdjust);
    const transportCostPlan = Math.round(transportCost * (numLocations > 2 ? 1.2 : 1.0));
    const foodCost = Math.round(foodPerDay * days);
    const activitiesCost = Math.round(activitiesPerDay * days * theme.activityAdjust);
    const localTransportCost = Math.round(localTransportPerDay * days * (numLocations > 1 ? 1.3 : 1.0));
    const miscCost = Math.round(miscPerDay * days);

    let totalCost = hotelCost + transportCostPlan + foodCost + activitiesCost + localTransportCost + miscCost;
    let withinBudget = totalCost <= budget;
    let adjustedHotelCost = hotelCost;
    let adjustedTransportCost = transportCostPlan;
    let adjustedActivitiesCost = activitiesCost;
    let totalAdjusted = totalCost;

    if (!withinBudget) {
      const cheaperHotels = Object.entries(destData.hotels).filter(([tier]: [string, any]) => {
        const tCost = destData.hotels[tier];
        return tCost < (destData.hotels[hotelPref] !== undefined ? destData.hotels[hotelPref] : destData.hotels["3 Star"]);
      });
      if (cheaperHotels.length > 0) {
        const cheapest = cheaperHotels[0];
        adjustedHotelCost = Math.round(cheapest[1] * (travellers > 2 ? Math.ceil(travellers / 2) : 1) * nights * theme.hotelAdjust);
      }
      adjustedActivitiesCost = Math.round(activitiesCost * 0.6);
      if (isIndian) {
        const cheaperTrans = Object.entries(destData.transport).filter(([m]: [string, any]) => destData.transport[m] < destData.transport[transportMode]);
        if (cheaperTrans.length > 0) {
          adjustedTransportCost = Math.round(cheaperTrans[0][1] * travellers * (numLocations > 2 ? 1.2 : 1.0));
        }
      }
      totalAdjusted = adjustedHotelCost + adjustedTransportCost + foodCost + adjustedActivitiesCost + localTransportCost + miscCost;
      withinBudget = totalAdjusted <= budget;
    }

    const finalHotelCost = withinBudget ? adjustedHotelCost : hotelCost;
    const finalTransportCost = withinBudget ? adjustedTransportCost : transportCostPlan;
    const finalActivitiesCost = withinBudget ? adjustedActivitiesCost : activitiesCost;
    const finalTotal = withinBudget ? totalAdjusted : totalCost;

    let hotelLabel = hotelPref;
    if (withinBudget && adjustedHotelCost < hotelCost) {
      const cheaperHotels = Object.entries(destData.hotels).filter(([tier, cost]: [string, any]) => cost * (travellers > 2 ? Math.ceil(travellers / 2) : 1) * nights * theme.hotelAdjust <= adjustedHotelCost);
      if (cheaperHotels.length > 0) hotelLabel = cheaperHotels[cheaperHotels.length - 1][0];
    }

    const planActivities = input.activities.length > 0 ? input.activities : destData.types;
    const weather = destData.weather;
    const typeOverlap = input.locationTypes.filter((t) => destData.types.includes(t)).length;
    let score = 70 + (withinBudget ? 15 : -20) + typeOverlap * 3;
    if (input.weatherPreference !== "No Preference" && weather.toLowerCase().includes(input.weatherPreference.toLowerCase())) score += 8;
    if (input.travelPace === "Relaxed" && theme.paceMultiplier < 0.8) score += 5;
    if (input.travelPace === "Adventure-packed" && theme.paceMultiplier > 1.2) score += 5;
    if (input.travelPace === "Balanced" && Math.abs(theme.paceMultiplier - 1.0) < 0.2) score += 5;
    if (budget - finalTotal > budget * 0.15) score += 3;
    score = Math.min(99, Math.max(50, score));

    const hotelName = getHotelName(primaryDest, hotelLabel);
    const hotelDetails = {
      hotelName,
      hotelLocation: `${primaryDest}, ${input.startLocation?.state || "Destination"}`,
      hotelCategory: hotelLabel,
      roomType: input.roomType || "Double",
      checkIn: "Day 1, 12:00 PM",
      checkOut: `Day ${nights + 1}, 11:00 AM`,
      approximatePricePerNight: Math.round((destData.hotels[hotelLabel] || destData.hotels["3 Star"]) * (travellers > 2 ? Math.ceil(travellers / 2) : 1)),
      numberOfNights: nights,
      estimatedHotelCost: finalHotelCost,
      whyRecommended: `${hotelName} suits your ${hotelLabel.toLowerCase()} preference, keeps the trip comfortably within budget, and is well-positioned for ${primaryDest} sightseeing.`,
    };

    const transportation = {
      startingLocation: input.startLocation?.city || "Your city",
      destination: routeDests.join(' → '),
      recommendedMode: transportMode,
      approximateDuration: transportMode === "Flight" ? "1 hr 30 min to 3 hrs" : transportMode === "Train" ? "4 hrs to 12 hrs" : transportMode === "Car" ? "5 hrs to 10 hrs" : "4 hrs to 8 hrs",
      estimatedCost: finalTransportCost,
      localTransportation: "Cab / app-based taxi / local bus / walking for heritage zones",
      airportOrStationTransfer: "Pickup and transfer included in estimate",
      notes: `Estimated transport cost is based on your ${input.transportPreference === "No Preference" ? "preferred route and budget" : input.transportPreference.toLowerCase()} choice and the travel distance to ${primaryDest}.`,
    };

    const detailedOverview = `${theme.desc} This itinerary is tailored for ${input.travelType.toLowerCase()} travelers with a ${input.travelPace.toLowerCase()} rhythm, a ${input.hotelPreference.toLowerCase()} hotel preference, and a ${input.foodPreference.toLowerCase()} food style, while staying aligned with your expected budget.`;

    const dayWiseItinerary = generateDetailedDayWisePlan(input, routeDests, primaryDest, hotelName, hotelDetails.roomType, transportMode, finalTotal, nights, isIndian, <any>destData);
    const hotelBudget = finalHotelCost;
    const foodRecommendations = buildFoodRecommendations(input.foodPreference, destinationName(primaryDest), isIndian);
    const importantTravelTips = [
      `Carry comfortable walking shoes for exploring ${primaryDest}.`,
      `Keep digital and printed copies of your bookings and identification handy.`,
      `Try the local cuisine during lunch and dinner for a more authentic trip experience.`,
      `Check sunrise and sunset timings to plan the best sightseeing windows.`,
      `Keep some emergency cash for local markets, taxi rides, and small purchases.`,
    ];
    const weatherInfo = {
      expectedTemperature: `Estimated ${destData.weather === "Sunny" ? "24°C to 34°C" : destData.weather === "Cold" ? "8°C to 18°C" : destData.weather === "Tropical" ? "26°C to 33°C" : "18°C to 28°C"}`,
      weatherCondition: destData.weather,
      rainPossibility: input.weatherPreference === "Rainy" || destData.weather === "Tropical" ? "Moderate to high" : "Low to moderate",
      recommendedClothing: destData.weather === "Cold" ? "Light woollens, warm jacket, and comfortable layers" : destData.weather === "Tropical" ? "Cotton clothes, sunscreen, and a light rain jacket" : "Comfortable casual wear with light layers for evenings",
      travelAdvice: `Weather is estimated and may vary by date. Keep season-appropriate clothing and stay hydrated throughout the trip.`,
      source: "Estimated based on seasonal patterns for this destination",
    };
    const thingsToCarry = [
      'Government-issued ID and booking confirmations',
      'Comfortable footwear',
      'Power bank and charging cable',
      'Sunscreen / cap / sunglasses',
      'Reusable water bottle',
      'Light rain jacket or extra layer',
    ];
    const budgetBreakdown = {
      transportation: finalTransportCost,
      hotel: hotelBudget,
      food: foodCost,
      localTravel: localTransportCost,
      activities: finalActivitiesCost,
      shopping: Math.round(miscCost * 0.4),
      miscellaneous: Math.round(miscCost * 0.6),
      total: finalTotal,
    };

    const whyMatchesParts: string[] = [];
    whyMatchesParts.push(`Stays ${withinBudget ? "within" : "over"} your ₹${budget.toLocaleString("en-IN")} budget`);
    if (typeOverlap > 0) whyMatchesParts.push(`matches ${typeOverlap} of your preferred location types`);
    if (input.weatherPreference !== "No Preference" && weather.toLowerCase().includes(input.weatherPreference.toLowerCase())) whyMatchesParts.push(`matches your preferred weather`);
    whyMatchesParts.push(`includes ${numLocations} ${numLocations > 1 ? "destinations" : "destination"} with a ${input.travelPace.toLowerCase()} pace`);

    plans.push({
      planName: theme.name,
      description: theme.desc,
      route: routeDests,
      numLocations,
      numNights: nights,
      hotel: hotelName,
      transport: transportMode,
      activities: planActivities,
      weather,
      matchScore: score,
      hotelCost: finalHotelCost,
      transportCost: finalTransportCost,
      localTransportCost,
      foodCost,
      activitiesCost: finalActivitiesCost,
      miscCost,
      totalCost: finalTotal,
      budgetRemaining: budget - finalTotal,
      withinBudget,
      whyMatches: whyMatchesParts.join(', '),
      itinerary: dayWiseItinerary.map((day) => ({
        dayNumber: day.dayNumber,
        dayTitle: day.dayTitle,
        location: day.location,
        morning: day.summary,
        afternoon: day.activities.join(' '),
        evening: day.eveningActivity,
        food: day.breakfast,
        transport: day.recommendedTransport,
        hotel: day.hotelName,
        activities: day.activities,
        dailyCost: day.estimatedExpenses.total,
        travelTips: day.detailedSchedule[day.detailedSchedule.length - 1] || day.summary,
      })),
      planCategory: theme.category,
      destination: primaryDest,
      totalNumberOfDays: days,
      totalNumberOfNights: nights,
      estimatedTotalBudget: finalTotal,
      numberOfTravellers: travellers,
      bestSeason: getBestSeason(destData.weather),
      recommendedTravelPeriod: `${getBestSeason(destData.weather)} is recommended for this trip based on the likely weather and crowds.`,
      travelStyle: `${input.travelType} / ${input.travelPace}`,
      detailedOverview,
      hotelDetails,
      transportation,
      placesIncluded: routeDests.concat(destData.attractions.slice(0, 4)),
      foodRecommendations,
      budgetBreakdown,
      importantTravelTips,
      weatherInfo,
      thingsToCarry,
      bookingInfo: {
        hotel: `Book ${hotelName} with estimated rates starting around ₹${Math.round(finalHotelCost / nights).toLocaleString('en-IN')} per night.`,
        flight: `Estimated flight pricing is based on your selected route from ${input.startLocation?.city || 'your starting city'}.`,
        train: `Train option is estimated based on route and season.`,
        localTransport: `Use local cabs or metro where available for city transfers.`,
      },
      dayWiseItinerary,
    });
  }

  return plans;
}

function destinationName(dest: string): string {
  return dest || 'Destination';
}

function getBestSeason(weather: string): string {
  if (['Pleasant', 'Sunny', 'Spring', 'Autumn'].includes(weather)) return 'Spring / Early Summer';
  if (['Mountain Weather', 'Cold', 'Snowy'].includes(weather)) return 'Winter';
  if (['Tropical', 'Rainy'].includes(weather)) return 'Post-Monsoon';
  return 'Winter / Shoulder Season';
}

function buildFoodRecommendations(preference: string, destination: string, isIndian: boolean): string[] {
  const base = [
    `Breakfast: Fresh ${isIndian ? 'Indian breakfast' : 'local breakfast'} near ${destination}.`,
    `Lunch: Try local specialties and a popular family-style restaurant.`,
    `Evening snack: Local chai, coffee, or pastry stop while exploring the area.`,
    `Dinner: Choose a restaurant with regional cuisine plus vegetarian and non-vegetarian options.`,
  ];

  if (preference === 'Vegetarian') {
    return [
      `Breakfast: North Indian breakfast spread with poha, paratha, and coffee in ${destination}.`,
      `Lunch: Pure veg thali with local breads and seasonal vegetables.`,
      `Evening snack: Masala chai and local sweets from a neighborhood cafe.`,
      `Dinner: Family restaurant serving vegetarian regional fare and mocktails.`,
    ];
  }
  if (preference === 'Non-Vegetarian') {
    return [
      `Breakfast: Local breakfast with eggs, toast, and coffee.`,
      `Lunch: Specialty restaurant with grilled dishes or biryani.`,
      `Evening snack: Street snacks or kebabs near a local market.`,
      `Dinner: Regional restaurant serving tandoori or coastal seafood options.`,
    ];
  }
  if (preference === 'Vegan') {
    return [
      `Breakfast: Vegan smoothie bowl, paratha, and fruit.`,
      `Lunch: Plant-based curry with rice and seasonal veggies.`,
      `Evening snack: Fresh fruit juices or vegan snacks.`,
      `Dinner: Vegan cafe with local-inspired bowls and desserts.`,
    ];
  }
  return base;
}

function generateDetailedDayWisePlan(
  input: TripInput,
  routeDests: string[],
  primaryDest: string,
  hotelName: string,
  roomType: string,
  transportMode: string,
  totalCost: number,
  nights: number,
  isIndian: boolean,
  destData: any
): any[] {
  const days = input.days;
  const itinerary: any[] = [];
  const attractionPool = destData?.attractions || ["Local Sightseeing", "Main Market", "Heritage Walk"];

  for (let day = 1; day <= days; day++) {
    const dest = routeDests[(day - 1) % routeDests.length] || primaryDest;
    const attractionOne = attractionPool[(day - 1) % attractionPool.length] || "Local sightseeing";
    const attractionTwo = attractionPool[(day + 1) % attractionPool.length] || "City market";
    const attractionThree = attractionPool[(day + 2) % attractionPool.length] || "Cultural center";
    const startPoint = day === 1 ? (input.startLocation?.city || 'Your city') : routeDests[Math.max(0, (day - 2) % routeDests.length)] || primaryDest;
    const morningNarrative = `Start the morning with breakfast and leave early for ${attractionOne}. Spend roughly 2 to 3 hours exploring the area, soaking in the history, architecture, and surrounding atmosphere. This is a good window for photographs, quiet observation, and local interaction.`;
    const afternoonNarrative = `After lunch, continue to ${attractionTwo}. Spend the next 2 to 3 hours strolling through the location, taking in local culture, cafés, markets, or scenic views depending on the destination. Keep the pace comfortable and flexible.`;
    const eveningNarrative = `Enjoy the evening with ${attractionThree} or a relaxed local walk, followed by dinner at a recommended restaurant. Return to ${hotelName} for a restful overnight stay.`;

    itinerary.push({
      dayNumber: day,
      location: dest,
      dayTitle: day === 1 ? `${dest} Arrival & Local Exploration` : day === 2 ? `${dest} Main Sightseeing` : day === days ? `${dest} Farewell & Departure` : `${dest} Day ${day}`,
      summary: day === 1 ? `Arrival in ${dest}, check-in, and local exploration for a smooth start to the trip.` : day === days ? `Final day in ${dest} with a relaxed sightseeing routine and departure planning.` : `A full day of culturally rich and practical sightseeing including key attractions, food, and restful downtime.`,
      startPoint,
      recommendedTransport: day === 1 ? transportMode : 'Cab / local transport / hired vehicle',
      departureInfo: day === 1 ? `Travel from ${input.startLocation?.city || 'your starting city'} to ${dest} using ${transportMode}.` : `Depart from ${startPoint} to ${dest} in the morning.`,
      arrivalInfo: day === 1 ? `Arrival by late morning or afternoon, followed by hotel check-in and refresh.` : `Arrive in ${dest} and proceed to the day’s first attraction.`,
      hotelName,
      roomType,
      checkIn: day === 1 ? 'Day 1, 12:00 PM' : 'Standard daily check-in',
      checkOut: day === days ? `Day ${nights + 1}, 11:00 AM` : 'Next day before 11:00 AM',
      breakfast: input.foodPreference === 'Vegetarian' ? 'Vegetarian breakfast spread with local specialties' : input.foodPreference === 'Non-Vegetarian' ? 'Breakfast with eggs, toast, and a light local option' : 'Breakfast at the hotel or a nearby café with local options',
      lunch: `Local lunch near ${attractionOne} with ${isIndian ? 'regional Indian favorites' : 'regional cuisine options'}.`,
      dinner: `Dinner at a popular local restaurant with ${input.foodPreference.toLowerCase()} choices and house specialties.`,
      eveningSnack: 'Tea, coffee, or a local snack stop in the evening.',
      placesToVisit: [attractionOne, attractionTwo, attractionThree],
      activities: [
        `Explore ${attractionOne} and spend quality time understanding the significance of the site.`,
        `Enjoy a relaxed lunch break before heading to ${attractionTwo}.`,
        `Wind down with ${attractionThree} in the evening and enjoy local shopping or café time.`,
      ],
      approximateTimings: [
        '08:00 AM – Breakfast and departure',
        '09:30 AM – First attraction visit',
        '01:00 PM – Lunch break',
        '03:00 PM – Second attraction visit',
        '07:00 PM – Dinner and evening stroll',
      ],
      localTransport: day === 1 ? 'Pre-booked cab / local taxi from station or airport' : 'Cab, auto-rickshaw, or local bus as per route and convenience',
      estimatedExpenses: {
        food: Math.round(totalCost / days * 0.18),
        localTravel: Math.round(totalCost / days * 0.12),
        activities: Math.round(totalCost / days * 0.22),
        total: Math.round(totalCost / days),
      },
      eveningActivity: day === days ? 'Relaxed evening walk and packing for departure.' : 'Evening walk, local market browse, and dinner with a short rest afterward.',
      overnightStay: `${hotelName} — ${roomType} room`,
      detailedSchedule: [morningNarrative, afternoonNarrative, eveningNarrative],
      travelTips: day === 1 ? `Reach the hotel early to avoid delays and settle in before sightseeing. Keep luggage and valuables with you.` : `Plan the evening early and avoid rushing between attractions to stay refreshed.`,
    });
  }

  return itinerary;
}

function generateItinerary(input: TripInput, routeDests: string[], isIndian: boolean, hotelLabel: string, transportMode: string, paceMultiplier: number, totalCost: number): ItineraryDay[] {
  const days = input.days;
  const itinerary: ItineraryDay[] = [];
  const foodOptions = getFoodOptions(input.foodPreference, isIndian);
  const destinationSet = routeDests;

  for (let day = 1; day <= days; day++) {
    const location = destinationSet[(day - 1) % destinationSet.length] || destinationSet[0];
    const baseText = `Start with breakfast and continue to ${location}. Spend time exploring the area, engaging in local activities, and enjoying a well-paced travel schedule suited to your preferences.`;
    itinerary.push({
      dayNumber: day,
      dayTitle: day === 1 ? `${location} Arrival & Local Exploration` : day === days ? `${location} Final Day & Departure` : `${location} Day ${day}`,
      location,
      morning: baseText,
      afternoon: `Lunch at a recommended local restaurant and a scheduled second stop or market walk with enough time to relax and take in the surroundings.`,
      evening: `Enjoy dinner, a light evening walk, and return to ${getHotelName(location, hotelLabel)} for an overnight stay.`,
      food: foodOptions[day % foodOptions.length],
      transport: transportMode,
      hotel: getHotelName(location, hotelLabel),
      activities: [location, 'Local food experience', 'Sightseeing'],
      dailyCost: Math.round(totalCost / days),
      travelTips: getTravelTip(location, isIndian, day),
    });
  }

  return itinerary;
}

function getTravelTip(dest: string, isIndian: boolean, day: number): string {
  const tips = [
    "Carry water and stay hydrated throughout the day.",
    "Keep extra cash for small purchases and tips.",
    "Wear comfortable walking shoes for sightseeing.",
    "Respect local customs and dress modestly at religious sites.",
    "Take photos but always ask permission at sacred places.",
    "Keep your valuables secure and be aware of your surroundings.",
    "Try to learn a few local phrases - locals appreciate it!",
    "Carry a light jacket for evening temperature drops.",
  ];
  return tips[day % tips.length];
}

function getFoodOptions(pref: string, isIndian: boolean): string[] {
  const base: Record<string, string[]> = {
    Vegetarian: ["Vegetarian Thali at local restaurant", "Pure Veg restaurant - North Indian cuisine", "South Indian vegetarian breakfast", "Veg street food tour", "Jain-friendly restaurant"],
    Jain: ["Jain restaurant - no onion/garlic", "Jain Thali at local eatery", "Simple Jain meal at hotel", "Jain-friendly street food"],
    Vegan: ["Vegan cafe - plant-based meals", "Vegan-friendly local restaurant", "Fresh fruit and vegan snacks", "Vegan curry and rice at local eatery"],
    "Non-Vegetarian": ["Local non-veg specialty restaurant", "Famous biryani/mutton place", "Seafood specialty (if coastal)", "Tandoori chicken and kebabs", "Local meat curry and rice"],
    "No Preference": ["Local specialty restaurant", "Popular local eatery", "Street food tour", "Hotel restaurant", "Rooftop cafe with local cuisine"],
  };
  return base[pref] || base["No Preference"];
}

function getTravelTip(dest: string, isIndian: boolean, day: number): string {
  const tips = [
    "Carry water and stay hydrated throughout the day.",
    "Keep extra cash for small purchases and tips.",
    "Wear comfortable walking shoes for sightseeing.",
    "Respect local customs and dress modestly at religious sites.",
    "Take photos but always ask permission at sacred places.",
    "Keep your valuables secure and be aware of surroundings.",
    "Try to learn a few local phrases - locals appreciate it!",
    "Carry a light jacket for evening temperature drops.",
  ];
  return tips[day % tips.length];
}

function generateGenericPlans(input: TripInput, isIndian: boolean): Plan[] {
  const plans: Plan[] = [];
  const primaryDest = input.destinations[0]?.name || "Your Destination";
  const hotelCostPerNight = (isIndian ? 1800 : 5000) * Math.ceil(input.totalTravellers / 2);
  const transportCost = (isIndian ? 3000 : 20000) * input.totalTravellers;
  const foodPerDay = (isIndian ? 500 : 1200) * input.totalTravellers;
  const activitiesPerDay = (isIndian ? 700 : 2000) * input.totalTravellers;

  for (let i = 0; i < 7; i++) {
    const hotelAdjust = 0.6 + i * 0.15;
    const hotelCost = Math.round(hotelCostPerNight * input.nights * hotelAdjust);
    const foodCost = Math.round(foodPerDay * input.days);
    const activitiesCost = Math.round(activitiesPerDay * input.days * (0.7 + i * 0.1));
    const localTransportCost = Math.round((isIndian ? 300 : 800) * input.totalTravellers * input.days);
    const miscCost = Math.round((isIndian ? 200 : 500) * input.totalTravellers * input.days);
    const totalCost = hotelCost + transportCost + foodCost + activitiesCost + localTransportCost + miscCost;
    const withinBudget = totalCost <= input.budget;

    plans.push({
      planName: `${primaryDest} Plan ${i + 1}`,
      description: `A personalized plan for ${primaryDest} tailored to your preferences.`,
      route: [primaryDest],
      numLocations: 1,
      numNights: input.nights,
      hotel: getHotelName(primaryDest, input.hotelPreference),
      transport: input.transportPreference === "No Preference" ? (isIndian ? "Train" : "Flight") : input.transportPreference,
      activities: input.activities.length > 0 ? input.activities : ["Sightseeing", "Culture"],
      weather: input.weatherPreference,
      matchScore: withinBudget ? 80 + i : 55,
      hotelCost, transportCost: transportCost, localTransportCost, foodCost, activitiesCost, miscCost,
      totalCost, budgetRemaining: input.budget - totalCost, withinBudget,
      whyMatches: `Custom plan for ${primaryDest}`,
      itinerary: generateItinerary(input, [primaryDest], isIndian, input.hotelPreference, "Flight", 1.0, totalCost),
    });
  }
  return plans;
}

// Validation: check plans meet requirements
function validatePlans(plans: Plan[], input: TripInput): Plan[] {
  const isIndian = input.destinations[0]?.country_code === "IN";
  return plans.filter((p) => {
    // Rule: total cost must be <= budget (or clearly marked as over budget)
    // Rule: correct country
    const routeIsIndian = !p.route.some((r) => {
      return INTL_DESTS[r] !== undefined;
    });
    if (isIndian && !routeIsIndian) return false;
    if (!isIndian && routeIsIndian && p.route.some((r) => INDIAN_DESTS[r] !== undefined)) return false;
    // Must have itinerary matching days
    if (p.itinerary.length !== input.days) return false;
    return true;
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const input: TripInput = await req.json();

    // Generate 7 plans
    let plans = generatePlans(input);

    // Validate
    plans = validatePlans(plans, input);

    // If some plans were filtered out, regenerate to fill 7
    if (plans.length < 7) {
      const generic = generateGenericPlans(input, input.destinations[0]?.country_code === "IN");
      while (plans.length < 7 && generic.length > 0) {
        const g = generic.shift()!;
        if (!plans.some((p) => p.planName === g.planName)) {
          plans.push(g);
        }
      }
    }

    // Sort by match score
    plans.sort((a, b) => b.matchScore - a.matchScore);

    // Mark best match
    if (plans.length > 0) {
      plans[0].planName = "⭐ " + plans[0].planName;
    }

    return new Response(JSON.stringify({ plans }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
