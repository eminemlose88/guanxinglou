import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export interface Message {
  id: string;
  name: string;
  contactInfo: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
}

interface MessageState {
  messages: Message[];
  totalMessages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;

  sendMessage: (name: string, contactInfo: string, message: string) => Promise<boolean>;
  fetchMessages: (page?: number, pageSize?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  totalMessages: 0,
  currentPage: 1,
  loading: false,
  error: null,

  sendMessage: async (name, contactInfo, message) => {
    try {
      set({ loading: true });
      const { error } = await supabase
        .from('contact_messages')
        .insert([{ name, contact_info: contactInfo, message }]);

      if (error) throw error;
      set({ loading: false });
      return true;
    } catch (err: any) {
      console.error('Failed to send message:', err);
      set({ loading: false, error: err.message });
      return false;
    }
  },

  fetchMessages: async (page = 1, pageSize = 10) => {
    try {
      const adminKey = useAuthStore.getState().currentAdminKey;
      if (!adminKey) throw new Error("Unauthorized");

      set({ loading: true });

      const { data, error } = await supabase.rpc('admin_get_messages', {
        admin_secret: adminKey,
        page: page,
        page_size: pageSize
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedMessages = data.map((m: any) => ({
          id: m.id,
          name: m.name,
          contactInfo: m.contact_info,
          message: m.message,
          status: m.status,
          createdAt: m.created_at
        }));
        
        // The total_count is returned in every row (a bit redundant but efficient for simple RPC)
        const total = data[0].total_count;

        set({ 
          messages: mappedMessages, 
          totalMessages: Number(total), 
          currentPage: page, 
          loading: false 
        });
      } else {
        set({ messages: [], totalMessages: 0, loading: false });
      }

    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
      set({ loading: false, error: err.message });
    }
  },

  markAsRead: async (id) => {
    try {
      const adminKey = useAuthStore.getState().currentAdminKey;
      if (!adminKey) throw new Error("Unauthorized");

      const { error } = await supabase.rpc('admin_manage_message', {
        admin_secret: adminKey,
        target_id: id,
        action_type: 'MARK_READ'
      });

      if (error) throw error;

      set(state => ({
        messages: state.messages.map(m => m.id === id ? { ...m, status: 'read' } : m)
      }));
    } catch (err) { console.error(err); }
  },

  deleteMessage: async (id) => {
    try {
      const adminKey = useAuthStore.getState().currentAdminKey;
      if (!adminKey) throw new Error("Unauthorized");

      const { error } = await supabase.rpc('admin_manage_message', {
        admin_secret: adminKey,
        target_id: id,
        action_type: 'DELETE'
      });

      if (error) throw error;

      set(state => ({
        messages: state.messages.filter(m => m.id !== id),
        totalMessages: state.totalMessages - 1
      }));
    } catch (err) { console.error(err); }
  }
}));
