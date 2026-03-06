import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle, Trash2, Clock, Info, AlertTriangle, ChevronRight } from 'lucide-react';
import { useNotificationStore } from '../store';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

export const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, clearAll, deleteNotification, incrementViewCount } = useNotificationStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-emerald-500" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-amber-500" />;
      case 'info':
        return <Info size={20} className="text-blue-500" />;
      default:
        return <Bell size={20} className="text-ios-orange" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20';
      default:
        return 'bg-ios-orange/10 border-ios-orange/20';
    }
  };

  const groupedNotifications = notifications.reduce((acc: any, n) => {
    const date = new Date(n.createdAt);
    let group = 'Earlier';
    
    if (date.toDateString() === new Date().toDateString()) {
      group = 'Today';
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        group = 'Yesterday';
      }
    }
    
    if (!acc[group]) acc[group] = [];
    acc[group].push(n);
    return acc;
  }, {});

  const groups = ['Today', 'Yesterday', 'Earlier'].filter(g => groupedNotifications[g]?.length > 0);

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen max-w-4xl mx-auto">
      <div className="bg-glow top-0 right-0 bg-ios-orange/10" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="w-12 h-12 neu-button flex items-center justify-center text-ios-orange">
              <Bell size={24} />
            </div>
            <h1 className="text-4xl font-display font-bold tracking-tight">Notifications</h1>
          </motion.div>
          <p className="text-[var(--text-secondary)] max-w-md">
            Stay updated with your orders, account activity, and exclusive offers.
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-ios-orange text-white">
                {unreadCount} New
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {unreadCount > 0 && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={markAllAsRead}
              className="neu-button px-6 py-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ios-orange transition-colors"
            >
              <CheckCircle size={16} />
              Mark all as read
            </motion.button>
          )}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={clearAll}
            className="neu-button px-6 py-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-ios-orange transition-colors"
          >
            <Trash2 size={16} />
            Clear All
          </motion.button>
        </div>
      </div>

      <div className="space-y-12">
        {groups.length > 0 ? (
          groups.map((group) => (
            <div key={group} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xs font-bold uppercase tracking-[0.3em] opacity-40">{group}</h2>
                <div className="h-px flex-1 bg-black/5" />
              </div>
              
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {groupedNotifications[group].map((n: any, index: number) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "neu-flat p-6 relative group transition-all duration-500",
                        !n.read && "ring-2 ring-ios-orange/20"
                      )}
                      onClick={() => {
                        markAsRead(n.id);
                        incrementViewCount(n.id);
                      }}
                    >
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110 duration-500",
                          getBgColor(n.type)
                        )}>
                          {getIcon(n.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className={cn(
                                "text-lg font-bold tracking-tight mb-1 transition-colors",
                                !n.read ? "text-ios-orange" : "text-[var(--foreground)]"
                              )}>
                                {n.title}
                              </h3>
                              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest opacity-40">
                                <span className="flex items-center gap-1">
                                  <Clock size={10} />
                                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-current" />
                                <span>{n.type}</span>
                              </div>
                            </div>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(n.id);
                              }}
                              className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <p className="text-sm opacity-60 leading-relaxed mb-4">
                            {n.message}
                          </p>

                          <div className="flex items-center justify-between">
                            {!n.read && (
                              <span className="text-[10px] font-bold text-ios-orange uppercase tracking-widest flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-ios-orange animate-pulse" />
                                New Notification
                              </span>
                            )}
                            <button className="ml-auto text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 flex items-center gap-1 group/btn">
                              View Details
                              <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="neu-flat p-20 text-center"
          >
            <div className="w-20 h-20 neu-button flex items-center justify-center mx-auto mb-6 text-ios-orange opacity-20">
              <Bell size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-2">All caught up!</h3>
            <p className="text-[var(--text-secondary)]">You don't have any notifications at the moment.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
