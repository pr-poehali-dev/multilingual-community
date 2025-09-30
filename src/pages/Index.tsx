import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from '@/components/ui/icon';
import AuthModal from '@/components/AuthModal';
import { useStore } from '@/lib/store';
import { api, type User, type Chat, type Message, type Achievement, type Gift, type Lesson } from '@/lib/api';
import { toast } from 'sonner';

interface VipTier {
  id: number;
  name: string;
  price: number;
  color: string;
  features: string[];
  badge: string;
}

const Index = () => {
  const { currentUser, isAuthenticated, logout } = useStore();
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuth(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentUser) {
      loadUsers();
      loadGifts();
      loadAchievements();
      loadLessons();
      loadChats();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers(searchQuery);
      setUsers(data);
    } catch (error: any) {
      toast.error('Ошибка загрузки пользователей');
    }
  };

  const loadChats = async () => {
    if (!currentUser) return;
    try {
      const data = await api.getChats(currentUser.id);
      setChats(data);
    } catch (error: any) {
      toast.error('Ошибка загрузки чатов');
    }
  };

  const loadMessages = async (chatId: number) => {
    try {
      const data = await api.getMessages(chatId);
      setMessages(data);
    } catch (error: any) {
      toast.error('Ошибка загрузки сообщений');
    }
  };

  const loadAchievements = async () => {
    if (!currentUser) return;
    try {
      const data = await api.getAchievements(currentUser.id);
      setAchievements(data);
    } catch (error: any) {
      toast.error('Ошибка загрузки достижений');
    }
  };

  const loadGifts = async () => {
    try {
      const data = await api.getGifts();
      setGifts(data);
    } catch (error: any) {
      toast.error('Ошибка загрузки подарков');
    }
  };

  const loadLessons = async () => {
    if (!currentUser) return;
    try {
      const data = await api.getLessons(currentUser.learning_language, currentUser.id);
      setLessons(data);
    } catch (error: any) {
      toast.error('Ошибка загрузки уроков');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !currentUser) return;
    
    try {
      await api.sendMessage(selectedChat.id, currentUser.id, newMessage);
      setNewMessage('');
      await loadMessages(selectedChat.id);
      await loadChats();
      toast.success('Сообщение отправлено!');
    } catch (error: any) {
      toast.error('Ошибка отправки сообщения');
    }
  };

  const handleStartChat = async (user: User) => {
    if (!currentUser) return;
    
    try {
      const existingChat = chats.find(c => c.partner_id === user.id);
      if (existingChat) {
        setSelectedChat(existingChat);
        setActiveTab('chats');
        return;
      }
      
      const { chatId } = await api.createChat(currentUser.id, user.id);
      await loadChats();
      
      const newChat = {
        id: chatId,
        last_message: '',
        last_message_time: new Date().toISOString(),
        unread_count: 0,
        partner_id: user.id,
        partner_name: user.name,
        partner_avatar: user.avatar,
        partner_vip: user.is_vip,
        partner_badge: user.vip_badge
      };
      setSelectedChat(newChat);
      setActiveTab('chats');
      toast.success('Чат создан!');
    } catch (error: any) {
      toast.error('Ошибка создания чата');
    }
  };

  const handleCompleteLesson = async (lesson: Lesson) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const result = await api.completeLesson(currentUser.id, lesson.id, 100);
      toast.success(`+${result.xp} XP! Уровень ${result.level}`);
      await loadLessons();
    } catch (error: any) {
      toast.error('Ошибка выполнения урока');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (friendId: number) => {
    if (!currentUser) return;
    
    try {
      await api.addFriend(currentUser.id, friendId);
      toast.success('Друг добавлен!');
    } catch (error: any) {
      toast.error('Ошибка добавления друга');
    }
  };

  const vipTiers: VipTier[] = [
    {
      id: 1,
      name: 'Silver VIP',
      price: 99,
      color: 'from-gray-300 to-gray-500',
      features: ['Без рекламы', 'x2 опыт', '5 рамок аватара'],
      badge: '🥈'
    },
    {
      id: 2,
      name: 'Gold VIP',
      price: 299,
      color: 'from-yellow-300 to-yellow-600',
      features: ['Всё из Silver', 'x3 опыт', '15 рамок', 'Exclusive бейджи', 'Приоритет в поиске'],
      badge: '🥇'
    },
    {
      id: 3,
      name: 'Diamond VIP',
      price: 999,
      color: 'from-blue-300 to-purple-600',
      features: ['Всё из Gold', 'x5 опыт', 'Все рамки', 'Diamond бейдж', 'ИИ-переводчик PRO', 'Безлимит подарков'],
      badge: '💎'
    },
  ];

  const getVipBadgeColor = (badge?: string | null) => {
    if (badge === 'diamond') return 'bg-gradient-to-r from-blue-400 to-purple-600';
    if (badge === 'gold') return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    return 'bg-gradient-to-r from-gray-300 to-gray-500';
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'US': '🇺🇸', 'JP': '🇯🇵', 'IT': '🇮🇹', 'BR': '🇧🇷', 'RU': '🇷🇺',
      'GB': '🇬🇧', 'ES': '🇪🇸', 'CN': '🇨🇳', 'KR': '🇰🇷', 'FR': '🇫🇷'
    };
    return flags[country] || '🌍';
  };

  if (!currentUser) {
    return <AuthModal open={showAuth} onClose={() => {}} />;
  }

  const renderHome = () => (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-gradient-to-br from-turquoise via-primary to-mint p-8 text-white border-none animate-scale-in">
        <h2 className="text-4xl font-bold mb-2">Привет, {currentUser.name}! 🎉</h2>
        <p className="text-xl opacity-90 mb-4">Продолжай учить {currentUser.learning_language}</p>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Уровень {currentUser.level}</span>
            <span className="font-semibold">{currentUser.xp} / {currentUser.level * 100} XP</span>
          </div>
          <Progress value={(currentUser.xp / (currentUser.level * 100)) * 100} className="h-3 bg-white/30" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1" onClick={() => setActiveTab('chats')}>
          <CardHeader className="text-center">
            <div className="text-5xl mb-2">💬</div>
            <CardTitle className="text-lg">Активные чаты</CardTitle>
            <CardDescription className="text-3xl font-bold text-primary">{chats.length}</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1">
          <CardHeader className="text-center">
            <div className="text-5xl mb-2">🔥</div>
            <CardTitle className="text-lg">Дни подряд</CardTitle>
            <CardDescription className="text-3xl font-bold text-secondary">{currentUser.streak_days || 0}</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1" onClick={() => setActiveTab('profile')}>
          <CardHeader className="text-center">
            <div className="text-5xl mb-2">🏆</div>
            <CardTitle className="text-lg">Достижения</CardTitle>
            <CardDescription className="text-3xl font-bold text-gold">
              {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            Продолжить обучение
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lessons.slice(0, 4).map(lesson => (
            <div key={lesson.id} className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all hover:scale-[1.02] cursor-pointer ${lesson.completed ? 'bg-success/10 border-success' : 'bg-muted border-muted-foreground/20'}`}>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{lesson.completed ? '✅' : '📖'}</div>
                <div>
                  <h4 className="font-semibold">{lesson.title}</h4>
                  <p className="text-sm text-muted-foreground">+{lesson.xp_reward} XP</p>
                </div>
              </div>
              {!lesson.completed && (
                <Button 
                  className="bg-gradient-to-r from-primary to-turquoise"
                  onClick={() => handleCompleteLesson(lesson)}
                  disabled={loading}
                >
                  Начать
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            Найди собеседника
          </CardTitle>
          <CardDescription>Общайся с людьми со всего мира</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Icon name="Search" className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <Input 
              placeholder="Поиск по языку, стране..."
              className="pl-10 h-12 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadUsers()}
            />
          </div>
          <Button onClick={loadUsers} className="mt-3 w-full">
            Искать
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map(user => (
          <Card key={user.id} className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer animate-scale-in">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl ${user.is_vip ? `bg-gradient-to-br ${getVipBadgeColor(user.vip_badge)} p-1` : 'bg-gradient-to-br from-muted to-muted-foreground/50'}`}>
                    <div className="bg-white rounded-xl w-full h-full flex items-center justify-center">
                      {user.avatar}
                    </div>
                  </div>
                  {user.is_vip && (
                    <div className="absolute -top-2 -right-2 text-2xl animate-pulse-glow">
                      {user.vip_badge === 'diamond' ? '💎' : '🥇'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <span className="text-xl">{getCountryFlag(user.country)}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="bg-primary/10">
                        Говорит: {user.native_language}
                      </Badge>
                      <Badge variant="secondary" className="bg-secondary/10">
                        Учит: {user.learning_language}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Уровень {user.level}</span>
                      <Progress value={(user.level / 30) * 100} className="h-2 flex-1" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="flex-1 bg-gradient-to-r from-primary to-turquoise" onClick={() => handleStartChat(user)}>
                  <Icon name="MessageCircle" size={18} className="mr-2" />
                  Написать
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleAddFriend(user.id)}>
                  <Icon name="UserPlus" size={18} className="mr-2" />
                  Добавить
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderChats = () => (
    <div className="space-y-4 animate-fade-in">
      {!selectedChat ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💬</span>
              Твои чаты
            </CardTitle>
            <CardDescription>Умный перевод в реальном времени</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {chats.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Нет активных чатов. Найдите собеседника в разделе "Поиск"!
                  </p>
                ) : (
                  chats.map(chat => (
                    <Card key={chat.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedChat(chat)}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl">
                              {chat.partner_avatar}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{chat.partner_name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{chat.last_message || 'Начните общение!'}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground">
                              {new Date(chat.last_message_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {chat.unread_count > 0 && (
                              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs text-white font-bold mt-1">
                                {chat.unread_count}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedChat(null)}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <div className="text-3xl">{selectedChat.partner_avatar}</div>
              <div>
                <CardTitle className="text-lg">{selectedChat.partner_name}</CardTitle>
                <CardDescription>В сети</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] mb-4">
              <div className="space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-3 ${msg.sender_id === currentUser.id ? 'flex-row-reverse' : ''}`}>
                    <div className="text-2xl">{msg.sender_avatar}</div>
                    <div className={`max-w-[70%] rounded-2xl p-3 ${msg.sender_id === currentUser.id ? 'bg-primary text-white' : 'bg-muted'}`}>
                      <p className="text-sm font-semibold mb-1">{msg.sender_name}</p>
                      <p>{msg.message}</p>
                      {msg.translated_message && (
                        <p className="text-xs mt-2 opacity-70 italic">🤖 {msg.translated_message}</p>
                      )}
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                placeholder="Введите сообщение..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} className="bg-gradient-to-r from-primary to-turquoise">
                <Icon name="Send" size={20} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderVIP = () => (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-gradient-to-br from-gold via-yellow-400 to-orange-400 text-white border-none">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4 animate-float">👑</div>
          <CardTitle className="text-3xl">VIP Подписки</CardTitle>
          <CardDescription className="text-white/90 text-lg">Получи больше возможностей!</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vipTiers.map(tier => (
          <Card key={tier.id} className="hover:shadow-2xl transition-all hover:scale-105 animate-scale-in">
            <CardHeader className="text-center">
              <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-5xl mb-4 animate-pulse-glow`}>
                {tier.badge}
              </div>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <div className="text-4xl font-bold text-primary mt-2">
                {tier.price}₽
                <span className="text-lg text-muted-foreground">/мес</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Icon name="Check" size={18} className="text-success" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className={`w-full bg-gradient-to-r ${tier.color} text-white`}>
                Купить {tier.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            Магазин подарков
          </CardTitle>
          <CardDescription>Дари яркие эмоции друзьям</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {gifts.map(gift => (
              <Card key={gift.id} className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-5xl mb-2">{gift.icon}</div>
                  <h4 className="font-semibold text-sm mb-1">{gift.name}</h4>
                  <div className="flex items-center justify-center gap-1 text-gold font-bold">
                    <span className="text-lg">🪙</span>
                    <span>{gift.price}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            У вас: {currentUser.coins} 🪙
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-gradient-to-br from-turquoise to-primary text-white border-none">
        <CardContent className="pt-8 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-gold to-yellow-600 p-2 animate-pulse-glow">
              <div className="bg-white rounded-2xl w-full h-full flex items-center justify-center text-6xl">
                {currentUser.avatar}
              </div>
            </div>
            {currentUser.is_vip && (
              <div className="absolute -top-3 -right-3 text-4xl">
                {currentUser.vip_badge === 'diamond' ? '💎' : '🥇'}
              </div>
            )}
          </div>
          <h2 className="text-3xl font-bold mb-2">{currentUser.name}</h2>
          {currentUser.is_vip && (
            <Badge className="bg-gold text-white mb-4">
              {currentUser.vip_badge === 'diamond' ? 'Diamond' : 'Gold'} VIP Member
            </Badge>
          )}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <div className="text-3xl font-bold">{currentUser.level}</div>
              <div className="text-sm opacity-90">Уровень</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{chats.length}</div>
              <div className="text-sm opacity-90">Чаты</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{currentUser.streak_days || 0}</div>
              <div className="text-sm opacity-90">Дни подряд</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Изучаемые языки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🌐</div>
              <div>
                <h4 className="font-semibold">{currentUser.learning_language}</h4>
                <p className="text-sm text-muted-foreground">Уровень {currentUser.level}</p>
              </div>
            </div>
            <Badge>Активный</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Достижения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map(ach => (
              <div key={ach.id} className={`p-4 rounded-xl border-2 text-center transition-all ${ach.unlocked ? 'border-success bg-success/5' : 'border-muted opacity-50'}`}>
                <div className={`text-4xl mb-2 ${!ach.unlocked && 'grayscale'}`}>{ach.icon}</div>
                <h4 className="font-semibold text-sm mb-1">{ach.name}</h4>
                <Progress value={ach.progress} className="h-1" />
                <p className="text-xs text-muted-foreground mt-1">{ach.progress}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Статистика</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Слов выучено</span>
            <span className="font-bold text-lg">{currentUser.words_learned || 0}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm">Сообщений отправлено</span>
            <span className="font-bold text-lg">{currentUser.total_messages || 0}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm">Подарков получено</span>
            <span className="font-bold text-lg">{currentUser.gifts_received || 0}</span>
          </div>
          <Separator />
          <Button variant="destructive" onClick={logout} className="w-full mt-4">
            Выйти из аккаунта
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-muted">
      <div className="container max-w-6xl mx-auto p-4 pb-24">
        <header className="mb-8 pt-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-primary via-secondary to-mint bg-clip-text text-transparent mb-2">
            LANGUAGE CONNECT
          </h1>
          <p className="text-center text-muted-foreground">Учи языки через живое общение 🌍</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 h-auto p-2 bg-card">
            <TabsTrigger value="home" className="flex flex-col gap-1 py-3">
              <Icon name="Home" size={24} />
              <span className="text-xs">Главная</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex flex-col gap-1 py-3">
              <Icon name="Search" size={24} />
              <span className="text-xs">Поиск</span>
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex flex-col gap-1 py-3">
              <Icon name="MessageCircle" size={24} />
              <span className="text-xs">Чаты</span>
              {Array.isArray(chats) && chats.some(c => c.unread_count > 0) && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </TabsTrigger>
            <TabsTrigger value="vip" className="flex flex-col gap-1 py-3">
              <Icon name="Crown" size={24} />
              <span className="text-xs">VIP</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col gap-1 py-3">
              <Icon name="User" size={24} />
              <span className="text-xs">Профиль</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home">{renderHome()}</TabsContent>
          <TabsContent value="search">{renderSearch()}</TabsContent>
          <TabsContent value="chats">{renderChats()}</TabsContent>
          <TabsContent value="vip">{renderVIP()}</TabsContent>
          <TabsContent value="profile">{renderProfile()}</TabsContent>
        </Tabs>

        {selectedChat && (
          <div className="fixed bottom-4 right-4">
            <Button 
              size="lg" 
              className="rounded-full w-16 h-16 shadow-2xl bg-gradient-to-r from-secondary to-coral animate-pulse-glow"
              onClick={() => setActiveTab('chats')}
            >
              <Icon name="MessageCircle" size={28} />
            </Button>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-primary/10 to-transparent h-2 pointer-events-none"></div>
    </div>
  );
};

export default Index;