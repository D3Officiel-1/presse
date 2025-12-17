import { Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  phone?: string;
  bio?: string;
  email?: string;
  admin?: boolean;
  lastSeen?: Timestamp;
  class?: string;
  deviceId?: string;
};

export type Message = {
  id:string;
  chatId: string; // Added to know which chat the message belongs to
  sender: User; // Embedded for display, but only senderId is stored in Firestore
  senderId: string;
  content: string;
  timestamp: Timestamp;
  type: 'text' | 'image' | 'audio' | 'video' | 'poll' | 'event' | 'contact' | 'document' | 'location';
  readBy: string[]; // Array of user IDs who have read the message
  isAnnouncement?: boolean;
  starredBy?: string[];
  replyTo?: {
    messageId: string;
    senderName: string;
    message: string;
  };
  deletedFor?: string[]; // Array of user IDs who have deleted this message for themselves
  audioMetadata?: {
    duration: number; // in seconds
    source: 'recorder' | 'upload';
    fileName?: string;
  };
  documentMetadata?: {
    fileName: string;
    fileSize: number;
    fileType: string;
  };
  pollData?: {
    question: string;
    options: { text: string; votes: string[] }[];
  };
  eventData?: {
    title: string;
    date: Timestamp;
    description?: string;
  };
  editedAt?: Timestamp;
  forwardedFrom?: {
    senderName: string;
    chatId: string;
  };
  contactData?: User;
};

export type Chat = {
  id: string;
  type: 'private' | 'group' | 'community';
  name?: string; // For group/community chats
  members: string[]; // Array of user UIDs
  archivedBy?: string[]; // Array of user IDs who have archived this chat
  mutedBy?: string[]; // Array of user IDs who have muted this chat
  pinnedBy?: string[]; // Array of user IDs who have pinned this chat
  deletedBy?: { [key: string]: Timestamp }; // Map of userId to deletion timestamp
  lastMessage?: {
    content?: string;
    type?: 'text' | 'image' | 'audio' | 'video' | 'poll' | 'event' | 'contact' | 'document' | 'location';
    senderId?: string;
  };
  lastMessageTimestamp?: Timestamp;
  unreadCounts?: { [key: string]: number };
  createdAt: Timestamp;
  typing?: { [key: string]: boolean };
  pinnedMessages?: Message[];
};

export type TrackForPlayer = {
  id: string;
  title: string;
  audioUrl: string;
  clipUrl?: string;
  duration: number;
  cover: string;
  artistName: string;
};

export interface SpotifyArtist {
    id: string;
    name: string;
    images: { url: string }[];
    followers: { total: number };
    genres: string[];
}

export interface Artist {
    id: string;
    type: 'artist';
    name: string;
    slug: string;
    verified: boolean;
    country: string;
    genres: string[];
    profileImage: string;
    bannerImage: string;
    bio: string;
    followersCount: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    source?: 'firestore' | 'spotify';
    spotifyId?: string;
}

export interface Album {
    id: string;
    type: 'album';
    title: string;
    slug: string;
    cover: string;
    releaseDate: string;
    tracksCount: number;
    isExplicit: boolean;
    createdAt: Timestamp;
    artistId: string;
    artistName: string;
    spotifyId?: string;
}

export interface Single {
  id: string;
  type: 'single';
  title: string;
  cover: string;
  audioUrl: string;
  clipUrl?: string;
  duration: number;
  releaseDate: string;
  streams: number;
  isExplicit: boolean;
  createdAt: Timestamp;
  artistId: string;
  artistName: string;
  spotifyId?: string;
}

export interface Track {
  id: string;
  title: string;
  audioUrl: string;
  clipUrl?: string;
  duration: number;
  position: number;
  streams: number;
  isExplicit: boolean;
  cover: string;
  artistName: string;
}
