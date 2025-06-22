import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ChatMessage {
  id: string;
  message: string;
  user_id: string;
  created_at: string;
  users?: {
    username: string;
    avatar_url?: string;
  };
}

interface ChatRoomProps {
  roomId: string;
  roomName: string;
}

export function ChatRoom({ roomId, roomName }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadMessages();
    subscribeToMessages();
    
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      // Validate roomId is a valid UUID
      if (!roomId || roomId === 'challenges' || roomId === 'general') {
        console.error('Invalid room ID:', roomId);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          users (username, avatar_url)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMessages = () => {
    // Unsubscribe from previous subscription if exists
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // Validate roomId before subscribing
    if (!roomId || roomId === 'challenges' || roomId === 'general') {
      return;
    }

    subscriptionRef.current = supabase
      .channel(`chat_room_${roomId}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const { data: userData } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          const newMessage = {
            ...payload.new,
            users: userData
          } as ChatMessage;

          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    // Validate roomId
    if (!roomId || roomId === 'challenges' || roomId === 'general') {
      console.error('Cannot send message to invalid room ID:', roomId);
      return;
    }

    setIsSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          message: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Show error state for invalid room IDs
  if (!roomId || roomId === 'challenges' || roomId === 'general') {
    return (
      <Card className="h-96 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{roomName}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>Invalid chat room</p>
            <p className="text-sm">Please select a valid chat room</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{roomName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">Loading messages...</div>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {message.users?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {message.users?.username || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm break-words">{message.message}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isSending}
            />
            <Button type="submit" size="sm" disabled={isSending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}