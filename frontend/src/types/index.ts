export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string;
  bio: string;
  location: {
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  birthDate: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  isVerified: boolean;
  isOnline: boolean;
  lastSeen: string;
  friends: string[];
  friendRequests: FriendRequest[];
  groups: string[];
  settings: {
    privacy: {
      profileVisibility: 'public' | 'friends' | 'private';
      showOnlineStatus: boolean;
      allowFriendRequests: boolean;
    };
    notifications: {
      email: boolean;
      push: boolean;
      friendRequests: boolean;
      messages: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequest {
  _id: string;
  from: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Post {
  _id: string;
  author: User;
  content: {
    text: string;
    images: { url: string; caption: string }[];
    videos: { url: string; caption: string; thumbnail: string }[];
  };
  type: 'text' | 'image' | 'video' | 'link' | 'poll';
  privacy: 'public' | 'friends' | 'private';
  likes: { user: string; createdAt: string }[];
  comments: Comment[];
  shares: { user: string; comment: string; createdAt: string }[];
  tags: string[];
  location: {
    name: string;
    coordinates: { lat: number; lng: number };
  };
  group: Group;
  isEdited: boolean;
  editHistory: { content: string; editedAt: string }[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  author: User;
  content: string;
  likes: { user: string; createdAt: string }[];
  replies: Reply[];
  createdAt: string;
}

export interface Reply {
  _id: string;
  author: User;
  content: string;
  likes: { user: string; createdAt: string }[];
  createdAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  avatar: string;
  coverImage: string;
  creator: User;
  admins: User[];
  moderators: User[];
  members: { user: User; joinedAt: string; role: 'member' | 'moderator' | 'admin' }[];
  memberRequests: { user: User; message: string; status: 'pending' | 'approved' | 'rejected'; createdAt: string }[];
  privacy: 'public' | 'private' | 'secret';
  postingPermission: 'all' | 'admins_only' | 'admins_and_moderators';
  category: string;
  tags: string[];
  rules: { title: string; description: string }[];
  settings: {
    allowMemberInvites: boolean;
    requireApproval: boolean;
    allowDiscussions: boolean;
    allowFiles: boolean;
    allowPolls: boolean;
  };
  stats: {
    totalPosts: number;
    totalMembers: number;
    activeMembers: number;
  };
  memberCount: number;
  userRole: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  sender: User;
  recipient?: User;
  group?: Group;
  content: {
    text: string;
    images: { url: string; caption: string }[];
    files: { url: string; name: string; size: number; type: string }[];
    sticker: { url: string; name: string };
    gif: { url: string; name: string };
  };
  type: 'text' | 'image' | 'file' | 'sticker' | 'gif' | 'system';
  isRead: boolean;
  readBy: { user: string; readAt: string }[];
  isEdited: boolean;
  editHistory: { content: string; editedAt: string }[];
  replyTo?: Message;
  reactions: { user: string; emoji: string; createdAt: string }[];
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participant: User;
  lastMessage: Message;
  unreadCount: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data?: T;
  message: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pages: number;
    total: number;
    hasMore: boolean;
  };
}