import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, MessageSquare, AtSign, Reply, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useClearAllNotifications,
  type Notification,
} from '@/hooks/useNotifications';

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
        !notification.is_read && 'bg-primary/5'
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={notification.actor?.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          {notification.actor?.display_name?.[0] || notification.actor?.username?.[0] || '?'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <Link
          to={notification.link || '#'}
          onClick={onMarkRead}
          className="block"
        >
          <p className="text-sm font-medium leading-tight">
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.content}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <NotificationIcon type={notification.type} />
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onMarkRead}
            title="Mark as read"
          >
            <Check className="w-3 h-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
          title="Delete"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: clearAll } = useClearAllNotifications();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-accent text-accent-foreground rounded-full px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-[380px] p-0 shadow-lg"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => clearAll()}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={() => !notification.is_read && markAsRead(notification.id)}
                  onDelete={() => deleteNotification(notification.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
