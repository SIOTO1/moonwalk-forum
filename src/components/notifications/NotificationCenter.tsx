import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, MessageSquare, AtSign, Reply, X, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  useNotifications,
  useGroupedNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useClearAllNotifications,
  useRealtimeNotifications,
  type Notification,
  type GroupedNotifications,
} from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { 
  isNotificationSoundEnabled, 
  setNotificationSoundEnabled,
  playNotificationSound 
} from '@/lib/notificationSound';

function NotificationIcon({ type }: { type: Notification['type'] }) {
  switch (type) {
    case 'mention':
      return <AtSign className="w-4 h-4 text-accent" />;
    case 'comment_reply':
      return <Reply className="w-4 h-4 text-primary" />;
    case 'thread_reply':
      return <MessageSquare className="w-4 h-4 text-secondary-foreground" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
}

function SoundToggle() {
  const [soundEnabled, setSoundEnabled] = useState(isNotificationSoundEnabled);

  const handleToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    setNotificationSoundEnabled(newValue);
    if (newValue) {
      // Play a preview sound when enabling
      playNotificationSound(0.2);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleToggle}
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {soundEnabled ? 'Mute notification sounds' : 'Enable notification sounds'}
      </TooltipContent>
    </Tooltip>
  );
}

function NotificationItem({ 
  notification, 
  onMarkRead,
  onDelete,
}: { 
  notification: Notification;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        'group flex gap-3 p-3 border-b border-border/50 hover:bg-muted/50 transition-colors',
        !notification.is_read && 'bg-primary/5 border-l-2 border-l-primary'
      )}
    >
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={notification.actor?.avatar_url || undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {notification.actor?.display_name?.[0] || notification.actor?.username?.[0] || '?'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <Link
          to={notification.link || '#'}
          onClick={onMarkRead}
          className="block"
        >
          <div className="flex items-start gap-2">
            <p className="text-sm font-medium leading-tight flex-1">
              {notification.title}
            </p>
            {!notification.is_read && (
              <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {notification.content}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <NotificationIcon type={notification.type} />
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
          </div>
        </Link>
      </div>

      <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead();
            }}
            title="Mark as read"
          >
            <Check className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function NotificationGroup({ 
  title, 
  notifications,
  onMarkRead,
  onDelete,
}: { 
  title: string;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (notifications.length === 0) return null;

  return (
    <div>
      <div className="px-4 py-2 bg-muted/30 sticky top-0 z-10">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </p>
      </div>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkRead={() => !notification.is_read && onMarkRead(notification.id)}
          onDelete={() => onDelete(notification.id)}
        />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
      <Bell className="w-10 h-10 mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { user } = useAuth();
  
  const { data: notifications = [], isLoading } = useNotifications();
  const grouped = useGroupedNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: clearAll } = useClearAllNotifications();

  // Enable realtime notifications
  useRealtimeNotifications();

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const filteredGrouped = filter === 'unread'
    ? {
        today: grouped.today.filter(n => !n.is_read),
        yesterday: grouped.yesterday.filter(n => !n.is_read),
        thisWeek: grouped.thisWeek.filter(n => !n.is_read),
        earlier: grouped.earlier.filter(n => !n.is_read),
      }
    : grouped;

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-accent text-accent-foreground rounded-full px-1 animate-in zoom-in-50 duration-200">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-[400px] p-0 shadow-xl border-border/50"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-medium text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <SoundToggle />
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => clearAll()}
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium transition-colors',
              filter === 'all' 
                ? 'text-foreground border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium transition-colors',
              filter === 'unread' 
                ? 'text-foreground border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        <ScrollArea className="h-[420px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <EmptyState 
              message={filter === 'unread' ? "You're all caught up!" : "No notifications yet"} 
            />
          ) : (
            <div>
              <NotificationGroup
                title="Today"
                notifications={filteredGrouped.today}
                onMarkRead={markAsRead}
                onDelete={deleteNotification}
              />
              <NotificationGroup
                title="Yesterday"
                notifications={filteredGrouped.yesterday}
                onMarkRead={markAsRead}
                onDelete={deleteNotification}
              />
              <NotificationGroup
                title="This Week"
                notifications={filteredGrouped.thisWeek}
                onMarkRead={markAsRead}
                onDelete={deleteNotification}
              />
              <NotificationGroup
                title="Earlier"
                notifications={filteredGrouped.earlier}
                onMarkRead={markAsRead}
                onDelete={deleteNotification}
              />
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
