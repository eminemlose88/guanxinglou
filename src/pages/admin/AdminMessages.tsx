import React, { useEffect } from 'react';
import { useMessageStore } from '../../store/messageStore';
import { motion } from 'framer-motion';
import { Mail, Trash2, Check, Clock, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';

export const AdminMessages: React.FC = () => {
  const { messages, fetchMessages, markAsRead, deleteMessage, currentPage, totalMessages, loading } = useMessageStore();
  const pageSize = 10;
  const totalPages = Math.ceil(totalMessages / pageSize);

  useEffect(() => {
    fetchMessages(currentPage, pageSize);
  }, [fetchMessages, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchMessages(newPage, pageSize);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <MessageSquare className="text-red-600 w-8 h-8" />
          加密留言板 <span className="text-red-600 text-lg align-top">{totalMessages}</span>
        </h1>
        <button 
            onClick={() => fetchMessages(currentPage, pageSize)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
        >
            <Clock className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="bg-abyss-light border border-white/5 rounded-lg overflow-hidden">
        {loading ? (
            <div className="p-12 text-center text-gray-500 font-mono">LOADING ENCRYPTED DATA...</div>
        ) : messages.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-mono">NO MESSAGES FOUND</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-xs uppercase text-gray-500 font-mono">
                <th className="p-4">Status</th>
                <th className="p-4">From</th>
                <th className="p-4">Contact</th>
                <th className="p-4 w-1/3">Message</th>
                <th className="p-4">Time</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {messages.map((msg) => (
                <motion.tr 
                  key={msg.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`hover:bg-white/5 transition-colors ${msg.status === 'unread' ? 'bg-red-900/10' : ''}`}
                >
                  <td className="p-4">
                    {msg.status === 'unread' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/20">
                        UNREAD
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/20">
                        READ
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-bold text-white">{msg.name}</td>
                  <td className="p-4 font-mono text-xs text-gray-400">{msg.contactInfo}</td>
                  <td className="p-4 text-gray-300 break-words max-w-xs">{msg.message}</td>
                  <td className="p-4 text-xs font-mono text-gray-500">
                    {new Date(msg.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {msg.status === 'unread' && (
                      <button
                        onClick={() => markAsRead(msg.id)}
                        className="p-2 hover:bg-green-500/20 text-green-500 rounded transition-colors"
                        title="Mark as Read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('确认删除此留言？此操作无法撤销。')) {
                            deleteMessage(msg.id);
                        }
                      }}
                      className="p-2 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 text-xs font-mono text-gray-500">
          <div>
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-white/10 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-white/10 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
