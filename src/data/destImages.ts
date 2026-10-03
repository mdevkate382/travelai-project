// Destination images from Pexels (real, license-free stock photos)
// Used in plan cards and itinerary day cards

export const DEST_IMAGES: Record<string, string> = {
  // Indian destinations
  Manali: 'https://images.pexels.com/photos/29494184/pexels-photo-29494184.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Jaipur: 'https://images.pexels.com/photos/18881277/pexels-photo-18881277.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Goa: 'https://images.pexels.com/photos/6789839/pexels-photo-6789839.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Kerala: 'https://images.pexels.com/photos/17928231/pexels-photo-17928231.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Agra: 'https://images.pexels.com/photos/22602478/pexels-photo-22602478.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Darjeeling: 'https://images.pexels.com/photos/11948660/pexels-photo-11948660.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Rishikesh: 'https://images.pexels.com/photos/4381164/pexels-photo-4381164.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Munnar: 'https://images.pexels.com/photos/36998153/pexels-photo-36998153.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  // Nearby Indian destinations
  'Solang Valley': 'https://images.pexels.com/photos/12366139/pexels-photo-12366139.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Kasol: 'https://images.pexels.com/photos/26184221/pexels-photo-26184221.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Kullu: 'https://images.pexels.com/photos/37911658/pexels-photo-37911658.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Udaipur: 'https://images.pexels.com/photos/7195782/pexels-photo-7195782.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Jodhpur: 'https://images.pexels.com/photos/37350608/pexels-photo-37350608.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Bikaner: 'https://images.pexels.com/photos/31339268/pexels-photo-31339268.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Pushkar: 'https://images.pexels.com/photos/33797768/pexels-photo-33797768.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Delhi: 'https://images.pexels.com/photos/14533217/pexels-photo-14533217.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  'South Goa': 'https://images.pexels.com/photos/19720922/pexels-photo-19720922.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Alleppey: 'https://images.pexels.com/photos/34588372/pexels-photo-34588372.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Kochi: 'https://images.pexels.com/photos/36998153/pexels-photo-36998153.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Gangtok: 'https://images.pexels.com/photos/11948660/pexels-photo-11948660.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Mussoorie: 'https://images.pexels.com/photos/26184221/pexels-photo-26184221.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Haridwar: 'https://images.pexels.com/photos/4381164/pexels-photo-4381164.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',

  // International destinations
  Dubai: 'https://images.pexels.com/photos/28350363/pexels-photo-28350363.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Singapore: 'https://images.pexels.com/photos/15480459/pexels-photo-15480459.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Bangkok: 'https://images.pexels.com/photos/19720922/pexels-photo-19720922.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Bali: 'https://images.pexels.com/photos/11435608/pexels-photo-11435608.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  London: 'https://images.pexels.com/photos/28350363/pexels-photo-28350363.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Tokyo: 'https://images.pexels.com/photos/15693280/pexels-photo-15693280.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  // Nearby international
  'Abu Dhabi': 'https://images.pexels.com/photos/32119558/pexels-photo-32119558.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Sharjah: 'https://images.pexels.com/photos/13748548/pexels-photo-13748548.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  'Ras Al Khaimah': 'https://images.pexels.com/photos/38946093/pexels-photo-38946093.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Phuket: 'https://images.pexels.com/photos/11435608/pexels-photo-11435608.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Kyoto: 'https://images.pexels.com/photos/15693280/pexels-photo-15693280.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Ubud: 'https://images.pexels.com/photos/11435608/pexels-photo-11435608.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
};

// Fallback image — generic travel/landscape
const FALLBACK_IMG = 'https://images.pexels.com/photos/29494184/pexels-photo-29494184.jpeg?auto=compress&cs=tinysrgb&h=400&w=600';

export function getDestImage(name: string): string {
  return DEST_IMAGES[name] || FALLBACK_IMG;
}
