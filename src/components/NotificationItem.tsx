import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, UserPlus, Trophy } from 'lucide-react';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'challenge';
  username: string;
  avatar: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkRead }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="text-red-500" size={16} />;
      case 'comment': return <MessageCircle className="text-blue-500" size={16} />;
      case 'follow': return <UserPlus className="text-green-500" size={16} />;
      case 'challenge': return <Trophy className="text-[#843dff]" size={16} />;
      default: return null;
    }
  };

  return (
    <div 
      className={`flex items-center p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800 ${
        !notification.isRead ? 'bg-gray-800/50' : ''
      }`}
      onClick={() => onMarkRead(notification.id)}
    >
      <Avatar className="w-10 h-10 mr-3">
        <AvatarImage src={notification.avatar} />
        <AvatarFallback>{notification.username[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center mb-1">
          {getIcon(notification.type)}
          <span className="text-white text-sm ml-2">
            <span className="font-semibold">{notification.username}</span>
            {' '}{notification.message}
          </span>
        </div>
        <span className="text-gray-400 text-xs">{notification.timestamp}</span>
      </div>
      
      {!notification.isRead && (
        <div className="w-2 h-2 bg-[#843dff] rounded-full"></div>
      )}
    </div>
  );
};

export default NotificationItem;