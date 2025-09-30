const API_URL = 'https://functions.poehali.dev/17f605ed-5358-4d1e-a134-ebb710e595a7';
const TRANSLATE_URL = 'https://functions.poehali.dev/3be83a8b-27f0-4188-97d6-de6fc278ad0e';

export interface User {
  id: number;
  email: string;
  name: string;
  avatar: string;
  native_language: string;
  learning_language: string;
  level: number;
  xp: number;
  country: string;
  region?: string;
  city?: string;
  is_vip: boolean;
  vip_badge?: string | null;
  avatar_frame?: string | null;
  coins: number;
  streak_days?: number;
  total_messages?: number;
  words_learned?: number;
  gifts_received?: number;
  is_online?: boolean;
  last_seen?: string;
}

export interface Chat {
  id: number;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  partner_id: number;
  partner_name: string;
  partner_avatar: string;
  partner_vip: boolean;
  partner_badge?: string | null;
}

export interface Message {
  id: number;
  message: string;
  translated_message?: string | null;
  is_voice: boolean;
  voice_transcription?: string | null;
  created_at: string;
  sender_id: number;
  sender_name: string;
  sender_avatar: string;
  original_language?: string;
  is_translated?: boolean;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
}

export interface Gift {
  id: number;
  name: string;
  icon: string;
  price: number;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  xp_reward: number;
  level_required: number;
  completed: boolean;
}

async function apiCall(action: string, method: string = 'GET', body?: any): Promise<any> {
  const url = `${API_URL}/?action=${action}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API Error');
  }
  
  return response.json();
}

export const api = {
  async register(data: {
    email: string;
    name: string;
    avatar: string;
    nativeLanguage: string;
    learningLanguage: string;
    country: string;
  }): Promise<User> {
    return apiCall('register', 'POST', data);
  },

  async login(email: string): Promise<User> {
    return apiCall('login', 'POST', { email });
  },

  async getUsers(options: {
    search?: string;
    limit?: number;
    region?: string;
    country?: string;
    onlineOnly?: boolean;
  } = {}): Promise<User[]> {
    const { search, limit = 20, region, country, onlineOnly } = options;
    const params = new URLSearchParams({ limit: limit.toString() });
    if (search) params.append('search', search);
    if (region) params.append('region', region);
    if (country) params.append('country', country);
    if (onlineOnly) params.append('onlineOnly', 'true');
    return fetch(`${API_URL}/?action=users&${params.toString()}`).then(r => r.json());
  },

  async getUserProfile(userId: number): Promise<User> {
    return fetch(`${API_URL}/?action=user&id=${userId}`).then(r => r.json());
  },

  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    return apiCall(`update_user&id=${userId}`, 'PUT', data);
  },

  async getChats(userId: number): Promise<Chat[]> {
    return fetch(`${API_URL}/?action=chats&userId=${userId}`).then(r => r.json());
  },

  async createChat(user1Id: number, user2Id: number): Promise<{ chatId: number }> {
    return apiCall('chats', 'POST', { user1Id, user2Id });
  },

  async getMessages(chatId: number, limit: number = 50): Promise<Message[]> {
    return fetch(`${API_URL}/?action=messages&chatId=${chatId}&limit=${limit}`).then(r => r.json());
  },

  async sendMessage(chatId: number, senderId: number, message: string, translatedMessage?: string): Promise<Message> {
    return apiCall('messages', 'POST', { chatId, senderId, message, translatedMessage });
  },

  async getAchievements(userId: number): Promise<Achievement[]> {
    return fetch(`${API_URL}/?action=achievements&userId=${userId}`).then(r => r.json());
  },

  async addFriend(userId: number, friendId: number): Promise<{ success: boolean }> {
    return apiCall('add_friend', 'POST', { userId, friendId });
  },

  async getLessons(language: string, userId: number): Promise<Lesson[]> {
    return fetch(`${API_URL}/?action=lessons&language=${language}&userId=${userId}`).then(r => r.json());
  },

  async completeLesson(userId: number, lessonId: number, score: number = 100): Promise<{ xp: number; level: number; totalXp: number }> {
    return apiCall('complete_lesson', 'POST', { userId, lessonId, score });
  },

  async sendGift(senderId: number, receiverId: number, giftId: number, chatId?: number): Promise<{ success: boolean }> {
    return apiCall('send_gift', 'POST', { senderId, receiverId, giftId, chatId });
  },

  async getGifts(): Promise<Gift[]> {
    return fetch(`${API_URL}/?action=gifts`).then(r => r.json());
  },

  async translateText(text: string, targetLang: string, sourceLang: string = 'auto'): Promise<{
    original: string;
    translated: string;
    sourceLang: string;
    targetLang: string;
  }> {
    const response = await fetch(TRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang, sourceLang })
    });
    return response.json();
  },
};