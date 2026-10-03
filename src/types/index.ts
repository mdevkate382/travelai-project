export interface Destination {
  name: string;
  city: string;
  state: string;
  country: string;
  country_code: string;
  latitude: number | null;
  longitude: number | null;
  place_id: string;
}

export interface TripFormData {
  startLocation: Destination | null;
  destinations: Destination[];
  adults: number;
  children: number;
  totalTravellers: number;
  days: number;
  nights: number;
  startDate: string;
  endDate: string;
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

export interface ItineraryDay {
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

export interface HotelDetail {
  hotelName: string;
  hotelLocation: string;
  hotelCategory: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  approximatePricePerNight: number;
  numberOfNights: number;
  estimatedHotelCost: number;
  whyRecommended: string;
}

export interface TransportationDetail {
  startingLocation: string;
  destination: string;
  recommendedMode: string;
  approximateDuration: string;
  estimatedCost: number;
  localTransportation: string;
  airportOrStationTransfer: string;
  notes: string;
}

export interface WeatherInfo {
  expectedTemperature: string;
  weatherCondition: string;
  rainPossibility: string;
  recommendedClothing: string;
  travelAdvice: string;
  source: string;
}

export interface DayPlanDetail {
  dayNumber: number;
  dayTitle: string;
  summary: string;
  startPoint: string;
  recommendedTransport: string;
  departureInfo: string;
  arrivalInfo: string;
  hotelName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  eveningSnack: string;
  placesToVisit: string[];
  activities: string[];
  approximateTimings: string[];
  localTransport: string;
  estimatedExpenses: { food: number; localTravel: number; activities: number; total: number };
  eveningActivity: string;
  overnightStay: string;
  detailedSchedule: string[];
}

export interface Plan {
  id?: string;
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
  planCategory?: string;
  destination?: string;
  totalNumberOfDays?: number;
  totalNumberOfNights?: number;
  estimatedTotalBudget?: number;
  numberOfTravellers?: number;
  bestSeason?: string;
  recommendedTravelPeriod?: string;
  travelStyle?: string;
  detailedOverview?: string;
  hotelDetails?: HotelDetail;
  transportation?: TransportationDetail;
  placesIncluded?: string[];
  foodRecommendations?: string[];
  budgetBreakdown?: Record<string, number>;
  importantTravelTips?: string[];
  weatherInfo?: WeatherInfo;
  thingsToCarry?: string[];
  bookingInfo?: Record<string, string>;
  dayWiseItinerary?: DayPlanDetail[];
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  start_name: string;
  start_city: string;
  start_state: string;
  start_country: string;
  start_country_code: string;
  start_latitude: number | null;
  start_longitude: number | null;
  start_place_id: string;
  destinations: Destination[];
  primary_country: string;
  primary_country_code: string;
  is_international: boolean;
  adults: number;
  children: number;
  total_travellers: number;
  days: number;
  nights: number;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  hotel_preference: string;
  room_type: string;
  transport_preference: string;
  weather_preference: string;
  location_types: string[];
  travel_type: string;
  food_preference: string;
  activities: string[];
  travel_pace: string;
  special_requirements: string;
  status: string;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  trip_id: string;
  plan_id: string;
  booking_code: string;
  trip_route: string;
  travellers: number;
  start_date: string | null;
  end_date: string | null;
  hotel: string;
  transport: string;
  activities: string[];
  subtotal: number;
  taxes: number;
  total_payable: number;
  status: string;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  payment_mode: string;
  created_at: string;
}

export interface Review {
  id: string;
  destination: string;
  trip_title: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export interface Memory {
  id: string;
  destination: string;
  caption: string;
  photo_url: string;
  memory_date: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
}
