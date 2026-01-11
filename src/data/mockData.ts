import { User, Category, Post, Comment } from '@/types/forum';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'bouncehouse_pro',
    displayName: 'Mike Johnson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    role: 'verified_vendor',
    reputation: 2450,
    joinedAt: new Date('2022-03-15'),
    bio: '15 years in the party rental industry. Owner of Jump Around Rentals.',
  },
  {
    id: '2',
    username: 'tent_master',
    displayName: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    role: 'industry_expert',
    reputation: 5200,
    joinedAt: new Date('2021-08-22'),
    bio: 'Event tent specialist. IFAI certified.',
  },
  {
    id: '3',
    username: 'rental_newbie',
    displayName: 'Chris Davis',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    role: 'member',
    reputation: 120,
    joinedAt: new Date('2024-01-10'),
  },
  {
    id: '4',
    username: 'mod_alex',
    displayName: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    role: 'moderator',
    reputation: 8900,
    joinedAt: new Date('2020-05-01'),
    bio: 'Forum moderator. 20+ years in event rentals.',
  },
];

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Inflatables',
    slug: 'inflatables',
    description: 'Bounce houses, slides, obstacle courses, and inflatable games',
    type: 'equipment',
    icon: '🎪',
    postCount: 342,
    color: 'category-equipment',
  },
  {
    id: '2',
    name: 'Tents & Canopies',
    slug: 'tents',
    description: 'Frame tents, pole tents, canopies, and tent accessories',
    type: 'equipment',
    icon: '⛺',
    postCount: 189,
    color: 'category-equipment',
  },
  {
    id: '3',
    name: 'Tables & Chairs',
    slug: 'tables-chairs',
    description: 'Folding tables, chiavari chairs, linens, and seating',
    type: 'equipment',
    icon: '🪑',
    postCount: 156,
    color: 'category-equipment',
  },
  {
    id: '4',
    name: 'Operations',
    slug: 'operations',
    description: 'Logistics, delivery, setup procedures, and efficiency',
    type: 'business',
    icon: '📋',
    postCount: 278,
    color: 'category-business',
  },
  {
    id: '5',
    name: 'Marketing',
    slug: 'marketing',
    description: 'Advertising, social media, SEO, and customer acquisition',
    type: 'business',
    icon: '📣',
    postCount: 201,
    color: 'category-business',
  },
  {
    id: '6',
    name: 'Insurance & Legal',
    slug: 'insurance-legal',
    description: 'Liability coverage, contracts, waivers, and regulations',
    type: 'business',
    icon: '📜',
    postCount: 134,
    color: 'category-business',
  },
];

export const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Best practices for anchoring inflatables on concrete?',
    content: `I've been in the business for 5 years but recently got a contract for a lot of indoor/parking lot events. What are you all using for anchoring on concrete surfaces? 

I've tried sandbags but they seem to shift. Looking for recommendations on:
- Weight requirements per anchor point
- Best sandbag brands
- Alternative anchoring methods

Any input from experienced operators would be greatly appreciated!`,
    author: mockUsers[2],
    category: mockCategories[0],
    createdAt: new Date('2024-01-08T14:30:00'),
    updatedAt: new Date('2024-01-08T14:30:00'),
    upvotes: 47,
    downvotes: 2,
    commentCount: 23,
    views: 892,
    isPinned: false,
    hasAcceptedAnswer: true,
    tags: ['anchoring', 'safety', 'indoor-events'],
  },
  {
    id: '2',
    title: '[GUIDE] Complete tent installation checklist - 2024 Edition',
    content: `After 15 years installing tents of all sizes, I've compiled my complete checklist. This covers everything from site assessment to final walkthrough.

**Pre-Installation:**
- Site survey and ground conditions
- Underground utility check
- Permit verification
- Weather forecast review

**Equipment Check:**
- All stakes and anchors
- Tent top condition
- Sidewall inventory
- Lighting and accessories

This is a living document - feel free to suggest additions!`,
    author: mockUsers[1],
    category: mockCategories[1],
    createdAt: new Date('2024-01-05T09:15:00'),
    updatedAt: new Date('2024-01-07T11:20:00'),
    upvotes: 156,
    downvotes: 3,
    commentCount: 42,
    views: 2341,
    isPinned: true,
    hasAcceptedAnswer: false,
    tags: ['guide', 'tents', 'installation', 'checklist'],
  },
  {
    id: '3',
    title: 'Insurance claim denied - what are my options?',
    content: `Had a bounce house incident last month where a child was injured (minor scrapes, parents overreacted). Filed a claim with my insurance and they're trying to deny it claiming I didn't follow proper setup procedures.

I have photos of the setup, signed waivers, and followed manufacturer guidelines to the letter. Anyone dealt with this before? Looking for advice on:
- How to appeal the decision
- Whether I need a lawyer
- What documentation to gather

This is really stressing me out.`,
    author: mockUsers[0],
    category: mockCategories[5],
    createdAt: new Date('2024-01-07T16:45:00'),
    updatedAt: new Date('2024-01-07T16:45:00'),
    upvotes: 34,
    downvotes: 0,
    commentCount: 18,
    views: 567,
    isPinned: false,
    hasAcceptedAnswer: false,
    tags: ['insurance', 'claims', 'legal-help'],
  },
  {
    id: '4',
    title: 'ROI on social media advertising - real numbers',
    content: `I want to share some real data from our marketing efforts this past year. We're a mid-sized operation in Texas.

**Facebook Ads:**
- Spent: $4,200
- Bookings attributed: 67
- Revenue generated: $38,000
- ROI: 804%

**Google Ads:**
- Spent: $2,800
- Bookings attributed: 31
- Revenue generated: $22,500
- ROI: 703%

Happy to answer questions about our targeting strategy.`,
    author: mockUsers[0],
    category: mockCategories[4],
    createdAt: new Date('2024-01-06T10:00:00'),
    updatedAt: new Date('2024-01-06T10:00:00'),
    upvotes: 89,
    downvotes: 5,
    commentCount: 31,
    views: 1203,
    isPinned: false,
    hasAcceptedAnswer: false,
    tags: ['marketing', 'advertising', 'roi', 'data'],
  },
  {
    id: '5',
    title: 'Chiavari chairs - wood vs resin debate',
    content: `Looking to expand our chair inventory and torn between wood and resin chiavari chairs. Currently have 200 wood ones but considering resin for the next batch.

What's everyone's experience with:
- Durability comparison
- Customer perception/preference  
- Weight considerations for delivery
- Long-term maintenance costs

Price difference is about $15/chair in favor of resin.`,
    author: mockUsers[2],
    category: mockCategories[2],
    createdAt: new Date('2024-01-04T13:20:00'),
    updatedAt: new Date('2024-01-04T13:20:00'),
    upvotes: 28,
    downvotes: 1,
    commentCount: 19,
    views: 445,
    isPinned: false,
    hasAcceptedAnswer: true,
    tags: ['chairs', 'chiavari', 'equipment-purchase'],
  },
];

export const mockComments: Comment[] = [
  {
    id: 'c1',
    content: `For concrete anchoring, I highly recommend the 50lb vinyl sandbags from ABC Inflatables. We use 4 per unit minimum, 6 for larger slides. 

Key tips:
- Stack them, don't just lay flat
- Use the ones with handles for easier positioning
- Replace any that show wear - not worth the risk

Been doing this for 12 years without an incident.`,
    author: mockUsers[1],
    postId: '1',
    createdAt: new Date('2024-01-08T15:45:00'),
    updatedAt: new Date('2024-01-08T15:45:00'),
    upvotes: 32,
    downvotes: 0,
    isAccepted: true,
  },
  {
    id: 'c2',
    content: `Great advice above. I'd also add that you should consider concrete anchors for permanent or semi-permanent locations. The initial investment is worth it for venues you return to regularly.`,
    author: mockUsers[0],
    postId: '1',
    parentId: 'c1',
    createdAt: new Date('2024-01-08T16:30:00'),
    updatedAt: new Date('2024-01-08T16:30:00'),
    upvotes: 12,
    downvotes: 0,
    isAccepted: false,
  },
];
