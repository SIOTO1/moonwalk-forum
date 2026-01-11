export type UserRole = 'member' | 'verified_vendor' | 'industry_expert' | 'moderator' | 'admin';

export type CategoryType = 'equipment' | 'business';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: UserRole;
  reputation: number;
  joinedAt: Date;
  bio?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: CategoryType;
  icon: string;
  postCount: number;
  color: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  views: number;
  isPinned: boolean;
  hasAcceptedAnswer: boolean;
  tags: string[];
  userVote?: 'up' | 'down' | null;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  userVote?: 'up' | 'down' | null;
  replies?: Comment[];
}

export interface SearchFilters {
  query: string;
  category?: string;
  sortBy: 'newest' | 'popular' | 'unanswered';
  timeRange: 'all' | 'day' | 'week' | 'month' | 'year';
}
