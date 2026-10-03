export type TripHelpCategory = 'flight' | 'train' | 'hotel' | 'cancel' | 'emergency' | 'other';

export interface TripHelpOption {
  id: TripHelpCategory;
  label: string;
  emoji: string;
  description: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'danger' | 'success';
  isRead: boolean;
  createdAt: string;
}

export interface AlternativeOption {
  id: string;
  optionType: string;
  provider: string;
  departureTime: string;
  arrivalTime: string;
  estimatedCost: number;
  status: 'demo' | 'estimated';
  summary: string;
}

export const tripHelpCategories: TripHelpOption[] = [
  { id: 'flight', label: 'Flight Problem', emoji: '✈️', description: 'Delay, cancellation, missed connection, or flight issue.' },
  { id: 'train', label: 'Train Problem', emoji: '🚆', description: 'Late trains, cancellations, or station disruption.' },
  { id: 'hotel', label: 'Hotel Problem', emoji: '🏨', description: 'Booking issue, room unavailable, or property closure.' },
  { id: 'cancel', label: 'Cancel My Trip', emoji: '❌', description: 'Cancel a confirmed trip and review refund details.' },
  { id: 'emergency', label: 'Emergency Assistance', emoji: '🆘', description: 'Urgent help, medical support, or immediate travel assistance.' },
  { id: 'other', label: 'Other Travel Problem', emoji: '📍', description: 'General trip disruption or support request.' },
];

export const demoNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Flight delay detected',
    message: 'Your flight to Goa is delayed by 4 hours. Review alternatives and hotel impact.',
    type: 'warning',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n2',
    title: 'Hotel check-in update',
    message: 'Your hotel may be affected by the revised arrival time. Contact the property or check nearby alternatives.',
    type: 'info',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
];

export function buildDisruptionScenario(category: TripHelpCategory, tripLabel: string) {
  switch (category) {
    case 'flight':
      return {
        title: 'Flight Delay Detected',
        description: `⚠️ Your flight has been delayed by 4 hours. Your hotel check-in may be affected. Would you like to view alternative travel options?`,
        originalTime: '06:30 PM',
        updatedTime: '10:30 PM',
        delayDuration: '4 hours',
        destination: tripLabel,
        hotelCheckInImpact: 'Check-in may be delayed by 1 night arrival window.',
        transportImpact: 'Airport transfer and local transport may require rescheduling.',
        actions: ['View Alternatives', 'Contact Hotel', 'Update My Trip'],
      };
    case 'train':
      return {
        title: 'Train Delay Detected',
        description: `⚠️ Your train is delayed by 2 hours and 30 minutes. We recommend checking alternate transfers to your hotel or destination.`,
        originalTime: '08:15 AM',
        updatedTime: '10:45 AM',
        delayDuration: '2 hours 30 minutes',
        destination: tripLabel,
        hotelCheckInImpact: 'Hotel arrival will be later than planned, but still manageable.',
        transportImpact: 'Local transfer timing may shift due to the new arrival time.',
        actions: ['View Alternatives', 'Contact Hotel', 'Update My Trip'],
      };
    case 'hotel':
      return {
        title: 'Hotel Issue Reported',
        description: 'The hotel is reporting a room availability issue. YatraAI can help you find nearby alternatives with a quick comparison.',
        originalTime: '',
        updatedTime: '',
        delayDuration: '',
        destination: tripLabel,
        hotelCheckInImpact: 'Current booking may be affected or unavailable.',
        transportImpact: 'Local transport to nearby alternatives may be required.',
        actions: ['Check Nearby Hotels', 'Contact Hotel', 'Update My Trip'],
      };
    case 'cancel':
      return {
        title: 'Cancel My Trip',
        description: 'Review your cancellation policy, estimated charges, and refund summary before confirming.',
        originalTime: '',
        updatedTime: '',
        delayDuration: '',
        destination: tripLabel,
        hotelCheckInImpact: 'Affected bookings will be marked cancelled if confirmed.',
        transportImpact: 'Flight/train/transport bookings will be reviewed for cancellation status.',
        actions: ['Confirm Cancellation', 'Keep My Trip'],
      };
    case 'emergency':
      return {
        title: 'Emergency Assistance',
        description: 'Contact relevant local emergency services immediately for critical incidents. YatraAI can help you organize next steps and support contacts.',
        originalTime: '',
        updatedTime: '',
        delayDuration: '',
        destination: tripLabel,
        hotelCheckInImpact: 'Your accommodation and itinerary may need urgent rescheduling.',
        transportImpact: 'Emergency support and alternative transport may be required.',
        actions: ['Call Local Help', 'Review Trip', 'Get Guidance'],
      };
    default:
      return {
        title: 'Your Travel Problem',
        description: 'We can help you assess the issue and review next steps for your trip.',
        originalTime: '',
        updatedTime: '',
        delayDuration: '',
        destination: tripLabel,
        hotelCheckInImpact: 'We will review your current itinerary and nearby support options.',
        transportImpact: 'Alternative travel timing can be reviewed if needed.',
        actions: ['Review Options', 'Contact Support', 'Update My Trip'],
      };
  }
}

export function buildAlternativeOptions(category: TripHelpCategory, tripLabel: string): AlternativeOption[] {
  if (category === 'flight') {
    return [
      {
        id: 'flight-1',
        optionType: 'Alternative Flight',
        provider: 'Demo/Estimated Option',
        departureTime: '6:00 PM',
        arrivalTime: '8:40 PM',
        estimatedCost: 5500,
        status: 'demo',
        summary: 'Best premium replacement option for the same route.',
      },
      {
        id: 'flight-2',
        optionType: 'Alternative Train',
        provider: 'Demo/Estimated Option',
        departureTime: '8:30 PM',
        arrivalTime: '11:00 PM',
        estimatedCost: 1800,
        status: 'demo',
        summary: 'Budget-friendly alternative if you want to save on air travel.',
      },
      {
        id: 'flight-3',
        optionType: 'Alternative Bus',
        provider: 'Demo/Estimated Option',
        departureTime: '9:00 PM',
        arrivalTime: '12:30 AM',
        estimatedCost: 1200,
        status: 'demo',
        summary: 'Economy option for flexible travellers.',
      },
    ];
  }

  if (category === 'train') {
    return [
      {
        id: 'train-1',
        optionType: 'Alternative Train',
        provider: 'Demo/Estimated Option',
        departureTime: '9:15 PM',
        arrivalTime: '12:00 AM',
        estimatedCost: 2200,
        status: 'demo',
        summary: 'Quick replacement train option with similar route coverage.',
      },
      {
        id: 'train-2',
        optionType: 'Flight',
        provider: 'Demo/Estimated Option',
        departureTime: '5:40 PM',
        arrivalTime: '7:25 PM',
        estimatedCost: 6200,
        status: 'demo',
        summary: 'Faster but pricier option for time-sensitive travel.',
      },
      {
        id: 'train-3',
        optionType: 'Bus',
        provider: 'Demo/Estimated Option',
        departureTime: '10:00 PM',
        arrivalTime: '1:00 AM',
        estimatedCost: 1500,
        status: 'demo',
        summary: 'Best value option with flexible timing.',
      },
    ];
  }

  if (category === 'hotel') {
    return [
      {
        id: 'hotel-1',
        optionType: 'Nearby Hotel',
        provider: 'Demo/Estimated Option',
        departureTime: 'Check-in 4:00 PM',
        arrivalTime: 'Check-in 4:00 PM',
        estimatedCost: 4200,
        status: 'demo',
        summary: '3.8★ hotel, 1.2 km away, breakfast included.',
      },
      {
        id: 'hotel-2',
        optionType: 'Premium Stay',
        provider: 'Demo/Estimated Option',
        departureTime: 'Check-in 2:00 PM',
        arrivalTime: 'Check-in 2:00 PM',
        estimatedCost: 6800,
        status: 'demo',
        summary: '4.6★ property with quick city access and airport transfer.',
      },
      {
        id: 'hotel-3',
        optionType: 'Budget Alternative',
        provider: 'Demo/Estimated Option',
        departureTime: 'Check-in 3:00 PM',
        arrivalTime: 'Check-in 3:00 PM',
        estimatedCost: 2900,
        status: 'demo',
        summary: 'Good value option with basic amenities and easy access.',
      },
    ];
  }

  return [
    {
      id: `${category}-default`,
      optionType: 'Support Review',
      provider: 'Demo/Estimated Option',
      departureTime: 'As soon as possible',
      arrivalTime: 'Based on selected next step',
      estimatedCost: 0,
      status: 'estimated',
      summary: `We can review ${tripLabel} support options and recommend the most suitable next step.`,
    },
  ];
}

export function getEmergencyGuidance() {
  return [
    'Contact the local emergency service number relevant to your area immediately if the situation is serious.',
    'Inform your hotel or transport provider about the issue and ask for written confirmation.',
    'Keep your booking reference, ID, and contact details ready for quick assistance.',
    'Use the YatraAI support flow to review your trip, nearby alternatives, and possible rescheduling.',
  ];
}

export function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'Delayed':
      return 'bg-yellow-100 text-yellow-700';
    case 'Cancelled':
      return 'bg-red-100 text-red-700';
    case 'Action Required':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-green-100 text-green-700';
  }
}
