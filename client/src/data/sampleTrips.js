export const SAMPLE_JAIPUR_TRIP = {
  id: 'trip_demo_jaipur_01',
  isDemo: true,
  destination: 'Jaipur, Rajasthan, India',
  destinationCoordinates: {
    name: 'Jaipur',
    lat: 26.9124,
    lon: 75.7873,
    country: 'India',
    countryCode: 'in'
  },
  destinationImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
  startDate: '2026-12-15',
  endDate: '2026-12-18',
  duration: 3,
  travelers: 4,
  currency: 'INR',
  totalEstimatedBudget: 50000,
  perPersonBudget: 12500,
  travelStyle: 'Cultural',
  interests: ['History', 'Food', 'Culture', 'Photography'],
  aiGenerated: true,
  status: 'Upcoming',
  createdAt: '2026-11-01T10:00:00.000Z',
  budgetBreakdown: {
    accommodation: 20000,
    food: 12500,
    transportation: 7500,
    activities: 6000,
    miscellaneous: 4000
  },
  days: [
    {
      day: 1,
      title: 'Exploring the Historic Pink City & Royal Bazaars',
      estimatedDailyCost: 4500,
      activities: [
        {
          id: 'act_1_1',
          name: 'Hawa Mahal (Palace of Winds)',
          description: 'Explore the iconic honeycomb façade with 953 intricately carved jharokhas, built in 1799 by Maharaja Sawai Pratap Singh.',
          time: '09:00 AM',
          slot: 'morning',
          category: 'Historical & Heritage',
          estimatedCost: 50,
          latitude: 26.9239,
          longitude: 75.8267,
          image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 'act_1_2',
          name: 'City Palace & Maharaja Sawai Man Singh II Museum',
          description: 'A striking blend of Mughal and Rajput architecture featuring courtyards, museums, royal vestments and peacocks.',
          time: '11:30 AM',
          slot: 'morning',
          category: 'Historical & Heritage',
          estimatedCost: 200,
          latitude: 26.9258,
          longitude: 75.8237,
          image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 'act_1_3',
          name: 'Jantar Mantar Astronomical Observatory',
          description: 'UNESCO World Heritage site featuring 19 monumental stone architectural instruments including the giant Vrihat Samrat Yantra.',
          time: '02:00 PM',
          slot: 'afternoon',
          category: 'Museum & Heritage',
          estimatedCost: 50,
          latitude: 26.9248,
          longitude: 75.8246,
          image: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 'act_1_4',
          name: 'Johari Bazaar & Traditional Rajasthani Thali',
          description: 'Evening stroll through the bustling jewelry and tie-dye bazaars, culminating in an authentic Dal Baati Churma dinner.',
          time: '06:30 PM',
          slot: 'evening',
          category: 'Food & Dining',
          estimatedCost: 650,
          latitude: 26.9189,
          longitude: 75.8272,
          image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
        }
      ]
    },
    {
      day: 2,
      title: 'Grand Forts & Hilltop Panoramas of Amer',
      estimatedDailyCost: 5800,
      activities: [
        {
          id: 'act_2_1',
          name: 'Amber (Amer) Palace & Fort',
          description: 'Ascend to the majestic hilltop fortress built in yellow and pink sandstone, celebrated for the dazzling Sheesh Mahal mirror palace.',
          time: '09:00 AM',
          slot: 'morning',
          category: 'Historical & Heritage',
          estimatedCost: 100,
          latitude: 26.9855,
          longitude: 75.8513,
          image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 'act_2_2',
          name: 'Panna Meena Ka Kund Stepwell',
          description: 'An architectural marvel of symmetrical criss-cross steps dating back to the 16th century, perfect for photography.',
          time: '12:00 PM',
          slot: 'afternoon',
          category: 'Historical & Heritage',
          estimatedCost: 0,
          latitude: 26.9886,
          longitude: 75.8532,
          image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 'act_2_3',
          name: 'Jal Mahal (Water Palace)',
          description: 'Admire the serene Rajput-style palace floating gracefully in the middle of Man Sagar Lake during golden hour.',
          time: '04:00 PM',
          slot: 'afternoon',
          category: 'Scenic Viewpoint',
          estimatedCost: 0,
          latitude: 26.9535,
          longitude: 75.8462,
          image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 'act_2_4',
          name: 'Nahargarh Fort Sunset View',
          description: 'Panoramic bird’s eye view of the entire illuminated Jaipur city from the edge of the Aravalli hills at sunset.',
          time: '06:00 PM',
          slot: 'evening',
          category: 'Scenic Viewpoint',
          estimatedCost: 50,
          latitude: 26.9378,
          longitude: 75.8156,
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
        }
      ]
    },
    {
      day: 3,
      title: 'Crafts, Heritage Museums & Cultural Feast',
      estimatedDailyCost: 4800,
      activities: [
        {
          id: 'act_3_1',
          name: 'Albert Hall State Museum',
          description: 'The oldest museum in Rajasthan showcasing rare paintings, carpets, ivory, stone sculptures and an Egyptian mummy.',
          time: '10:00 AM',
          slot: 'morning',
          category: 'Museum & Heritage',
          estimatedCost: 40,
          latitude: 26.9116,
          longitude: 75.8195,
          image: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 'act_3_2',
          name: 'Bapu Bazaar Textile & Leather Shopping',
          description: 'Vibrant local bazaar famous for authentic camel leather mojari shoes, handicrafts, and block-printed textiles.',
          time: '01:30 PM',
          slot: 'afternoon',
          category: 'Shopping & Cultural',
          estimatedCost: 200,
          latitude: 26.9181,
          longitude: 75.8228,
          image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 'act_3_3',
          name: 'Chokhi Dhani Ethnic Cultural Village',
          description: 'An immersive cultural resort with folk dancers, acrobatics, puppet shows, camel rides, and a traditional royal feast.',
          time: '06:00 PM',
          slot: 'evening',
          category: 'Cultural & Dining',
          estimatedCost: 900,
          latitude: 26.7667,
          longitude: 75.8361,
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
        }
      ]
    }
  ],
  members: [
    { id: 'mem_1', name: 'Girish', isLeader: true, avatar: '👨‍💼' },
    { id: 'mem_2', name: 'Aryan', isLeader: false, avatar: '🧗‍♂️' },
    { id: 'mem_3', name: 'Riyan', isLeader: false, avatar: '📸' },
    { id: 'mem_4', name: 'Swaroop', isLeader: false, avatar: '🎒' }
  ],
  expenses: [
    {
      id: 'exp_1',
      description: 'Heritage Haveli Hotel (3 Nights)',
      amount: 8000,
      category: 'Accommodation',
      date: '2026-12-15',
      paidBy: 'mem_1', // Girish
      participants: ['mem_1', 'mem_2', 'mem_3', 'mem_4'],
      splitType: 'equal'
    },
    {
      id: 'exp_2',
      description: 'Royal Thali & Street Food Dinners',
      amount: 2000,
      category: 'Food',
      date: '2026-12-16',
      paidBy: 'mem_2', // Aryan
      participants: ['mem_1', 'mem_2', 'mem_3', 'mem_4'],
      splitType: 'equal'
    },
    {
      id: 'exp_3',
      description: 'Outstation Fuel & Sightseeing Cab',
      amount: 1000,
      category: 'Transportation',
      date: '2026-12-17',
      paidBy: 'mem_3', // Riyan
      participants: ['mem_1', 'mem_2', 'mem_3', 'mem_4'],
      splitType: 'equal'
    }
  ]
};

export const POPULAR_DESTINATIONS = [
  {
    id: 'goa',
    name: 'Goa',
    country: 'India',
    tagline: 'Sun, sand, spices & vibrant coastal nightlife',
    description: 'Golden beaches, Portuguese architecture, water sports, and tranquil seaside cafes.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    duration: 4,
    recommendedBudget: 18000,
    travelStyle: 'Relaxation'
  },
  {
    id: 'manali',
    name: 'Manali',
    country: 'India',
    tagline: 'Snow-capped Himalayan peaks & alpine adventures',
    description: 'Pine forests, Solang Valley adventures, Rohtang Pass, and cozy mountain cafes.',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    duration: 4,
    recommendedBudget: 16000,
    travelStyle: 'Adventure'
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    country: 'India',
    tagline: 'The historic Pink City of royal forts and palaces',
    description: 'UNESCO world heritage forts, majestic courtyards, bustling bazaars, and royal dining.',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    duration: 3,
    recommendedBudget: 12500,
    travelStyle: 'Cultural'
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    tagline: 'Tropical temples, lush rice terraces & surf breaks',
    description: 'Iconic sea temples, Ubud lush jungles, cascading waterfalls, and world-class retreats.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    duration: 5,
    recommendedBudget: 45000,
    travelStyle: 'Relaxation'
  },
  {
    id: 'kashmir',
    name: 'Kashmir',
    country: 'India',
    tagline: 'Paradise on Earth with serene Dal Lake & meadows',
    description: 'Charming shikara rides, snow meadows of Gulmarg, Lidder river valley, and saffron gardens.',
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
    duration: 5,
    recommendedBudget: 22000,
    travelStyle: 'Nature'
  }
];
