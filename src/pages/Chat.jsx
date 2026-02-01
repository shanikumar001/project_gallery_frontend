import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConversations, useMessages, useSendMessage, useMarkMessagesRead, useUserProfile } from '../hooks/useQueries';
import { getMediaUrl } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Chat() {
  const { user } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(userId);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();
  const { data: otherUser } = useUserProfile(userId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (userId) markRead.mutate(userId);
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return <Navigate to="/login" replace />;

  const selectedConversation = conversations.find((c) => c.id === userId);
  const displayUser = selectedConversation
    ? { id: selectedConversation.id, name: selectedConversation.name, profilePhoto: selectedConversation.profilePhoto }
    : otherUser
      ? { id: otherUser.id, name: otherUser.name, profilePhoto: otherUser.profilePhoto }
      : null;

  const getInitials = (name) =>
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !userId) return;
    sendMessage.mutate(
      { toUserId: userId, text: messageText.trim() },
      {
        onSuccess: () => setMessageText(''),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const photoUrl = (photo) => getMediaUrl(photo);

  return (
    <main className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      <div className="flex flex-1 min-h-0 border rounded-lg overflow-hidden bg-card">
        {/* Connections list (sidebar) */}
        <div
          className={`w-full md:w-72 border-r bg-muted/30 flex flex-col ${
            userId ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversationsLoading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No conversations yet. Message someone from a project card to start chatting.
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/chat/${c.id}`)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors text-left ${
                    userId === c.id ? 'bg-accent' : ''
                  }`}
                >
                  <Avatar className="h-10 w-10 shrink-0 relative">
                    <AvatarImage src={photoUrl(c.profilePhoto)} />
                    <AvatarFallback>{getInitials(c.name)}</AvatarFallback>
                    {c.unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center px-1">
                        {c.unreadCount > 99 ? '99+' : c.unreadCount}
                      </span>
                    )}
                  </Avatar>
                  <div className="min-w-0 flex-1 text-left">
                    <span className="font-medium truncate block">{c.name}</span>
                    {c.lastMessage && (
                      <span className="text-xs text-muted-foreground truncate block">
                        {c.lastMessage.isMe ? 'You: ' : ''}{c.lastMessage.text}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Conversation area */}
        <div className={`flex-1 flex flex-col ${userId ? 'flex' : 'hidden md:flex'}`}>
          {userId ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 p-3 border-b bg-muted/30">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => navigate('/chat')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                {displayUser && (
                  <>
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={photoUrl(displayUser.profilePhoto)} />
                      <AvatarFallback>{getInitials(displayUser.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{displayUser.name}</span>
                  </>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
                {messagesLoading ? (
                  <div className="text-center text-muted-foreground text-sm">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No messages yet. Say hello!
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                          m.isMe
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted border'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1"
                  disabled={sendMessage.isPending}
                />
                <Button type="submit" disabled={!messageText.trim() || sendMessage.isPending}>
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select a conversation or message someone from a project</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
