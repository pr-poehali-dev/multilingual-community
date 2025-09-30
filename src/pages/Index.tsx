import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  name: string;
  avatar: string;
  language: string;
  learning: string;
  level: number;
  country: string;
  isVip: boolean;
  vipBadge?: string;
  avatarFrame?: string;
}

interface Gift {
  id: number;
  name: string;
  icon: string;
  price: number;
}

interface VipTier {
  id: number;
  name: string;
  price: number;
  color: string;
  features: string[];
  badge: string;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const currentUser: User = {
    id: 0,
    name: 'Ты',
    avatar: '🚀',
    language: 'Русский',
    learning: 'English',
    level: 15,
    country: 'RU',
    isVip: true,
    vipBadge: 'gold',
    avatarFrame: 'premium'
  };

  const users: User[] = [
    { id: 1, name: 'Sarah Chen', avatar: '👩', language: 'English', learning: 'Русский', level: 12, country: 'US', isVip: false },
    { id: 2, name: 'Yuki Tanaka', avatar: '🧑', language: '日本語', learning: 'English', level: 20, country: 'JP', isVip: true, vipBadge: 'diamond' },
    { id: 3, name: 'Marco Rossi', avatar: '👨', language: 'Italiano', learning: 'Español', level: 8, country: 'IT', isVip: false },
    { id: 4, name: 'Ana Silva', avatar: '👩', language: 'Português', learning: 'English', level: 18, country: 'BR', isVip: true, vipBadge: 'gold' },
  ];

  const gifts: Gift[] = [
    { id: 1, name: 'Роза', icon: '🌹', price: 50 },
    { id: 2, name: 'Торт', icon: '🎂', price: 100 },
    { id: 3, name: 'Трофей', icon: '🏆', price: 200 },
    { id: 4, name: 'Подарок', icon: '🎁', price: 150 },
    { id: 5, name: 'Корона', icon: '👑', price: 500 },
  ];

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

  const achievements: Achievement[] = [
    { id: 1, name: 'Первый друг', description: 'Добавь первого друга', icon: '👋', unlocked: true, progress: 100 },
    { id: 2, name: 'Полиглот', description: 'Выучи 100 слов', icon: '📚', unlocked: true, progress: 100 },
    { id: 3, name: 'Болтун', description: 'Отправь 50 сообщений', icon: '💬', unlocked: false, progress: 70 },
    { id: 4, name: 'Щедрый', description: 'Подари 10 подарков', icon: '🎁', unlocked: false, progress: 40 },
    { id: 5, name: 'Мастер языка', description: 'Достигни 30 уровня', icon: '🎓', unlocked: false, progress: 50 },
    { id: 6, name: 'Неделя практики', description: '7 дней подряд', icon: '🔥', unlocked: false, progress: 85 },
  ];

  const lessons = [
    { id: 1, title: 'Приветствия', completed: true, xp: 50 },
    { id: 2, title: 'Числа 1-20', completed: true, xp: 50 },
    { id: 3, title: 'Цвета', completed: false, xp: 75 },
    { id: 4, title: 'Еда и напитки', completed: false, xp: 100 },
  ];

  const getVipBadgeColor = (badge?: string) => {
    if (badge === 'diamond') return 'bg-gradient-to-r from-blue-400 to-purple-600';
    if (badge === 'gold') return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    return 'bg-gradient-to-r from-gray-300 to-gray-500';
  };

  const renderHome = () => (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-gradient-to-br from-turquoise via-primary to-mint p-8 text-white border-none animate-scale-in">
        <h2 className="text-4xl font-bold mb-2">Привет, {currentUser.name}! 🎉</h2>
        <p className="text-xl opacity-90 mb-4">Продолжай учить {currentUser.learning}</p>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Уровень {currentUser.level}</span>
            <span className="font-semibold">450 / 500 XP</span>
          </div>
          <Progress value={90} className="h-3 bg-white/30" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1">
          <CardHeader className="text-center">
            <div className="text-5xl mb-2">💬</div>
            <CardTitle className="text-lg">Активные чаты</CardTitle>
            <CardDescription className="text-3xl font-bold text-primary">8</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1">
          <CardHeader className="text-center">
            <div className="text-5xl mb-2">🔥</div>
            <CardTitle className="text-lg">Дни подряд</CardTitle>
            <CardDescription className="text-3xl font-bold text-secondary">12</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1">
          <CardHeader className="text-center">
            <div className="text-5xl mb-2">🏆</div>
            <CardTitle className="text-lg">Достижения</CardTitle>
            <CardDescription className="text-3xl font-bold text-gold">15/30</CardDescription>
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
          {lessons.map(lesson => (
            <div key={lesson.id} className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all hover:scale-[1.02] cursor-pointer ${lesson.completed ? 'bg-success/10 border-success' : 'bg-muted border-muted-foreground/20'}`}>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{lesson.completed ? '✅' : '📖'}</div>
                <div>
                  <h4 className="font-semibold">{lesson.title}</h4>
                  <p className="text-sm text-muted-foreground">+{lesson.xp} XP</p>
                </div>
              </div>
              {!lesson.completed && (
                <Button className="bg-gradient-to-r from-primary to-turquoise">
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
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map(user => (
          <Card key={user.id} className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer animate-scale-in" onClick={() => setSelectedUser(user)}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl ${user.isVip ? `bg-gradient-to-br ${getVipBadgeColor(user.vipBadge)} p-1` : 'bg-gradient-to-br from-muted to-muted-foreground/50'}`}>
                    <div className="bg-white rounded-xl w-full h-full flex items-center justify-center">
                      {user.avatar}
                    </div>
                  </div>
                  {user.isVip && (
                    <div className="absolute -top-2 -right-2 text-2xl animate-pulse-glow">
                      {user.vipBadge === 'diamond' ? '💎' : '🥇'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <span className="text-xl">{user.country === 'US' ? '🇺🇸' : user.country === 'JP' ? '🇯🇵' : user.country === 'IT' ? '🇮🇹' : '🇧🇷'}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="bg-primary/10">
                        Говорит: {user.language}
                      </Badge>
                      <Badge variant="secondary" className="bg-secondary/10">
                        Учит: {user.learning}
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
                <Button className="flex-1 bg-gradient-to-r from-primary to-turquoise">
                  <Icon name="MessageCircle" size={18} className="mr-2" />
                  Написать
                </Button>
                <Button variant="outline" className="flex-1">
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
              {users.slice(0, 3).map(user => (
                <Card key={user.id} className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl">
                          {user.avatar}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">Привет! Как дела?</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">2 мин</span>
                        {Math.random() > 0.5 && (
                          <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs text-white font-bold mt-1">
                            {Math.floor(Math.random() * 5 + 1)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-primary/10 to-turquoise/10 border-primary/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🤖</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">ИИ Переводчик PRO</h3>
              <p className="text-sm text-muted-foreground">Автоматический перевод и транскрипция голосовых</p>
            </div>
            <Badge className="bg-gold text-white">VIP</Badge>
          </div>
        </CardContent>
      </Card>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🖼️</span>
            Рамки для аватара
          </CardTitle>
          <CardDescription>Выделись среди других!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {['🌟', '⚡', '🔥', '💎', '🌈', '👑'].map((frame, idx) => (
              <div key={idx} className="aspect-square rounded-2xl border-4 border-dashed border-primary/30 hover:border-primary transition-all cursor-pointer hover:scale-110 flex items-center justify-center text-4xl animate-scale-in" style={{animationDelay: `${idx * 0.1}s`}}>
                {frame}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white border-none">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🏆</div>
          <CardTitle className="text-3xl">Достижения</CardTitle>
          <CardDescription className="text-white/90 text-lg">Собери их все!</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map(achievement => (
          <Card key={achievement.id} className={`transition-all hover:shadow-lg ${achievement.unlocked ? 'border-success bg-success/5' : 'opacity-60'}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`text-5xl ${!achievement.unlocked && 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>{achievement.unlocked ? 'Выполнено!' : 'В процессе...'}</span>
                      <span className="font-semibold">{achievement.progress}%</span>
                    </div>
                    <Progress value={achievement.progress} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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
            <div className="absolute -top-3 -right-3 text-4xl">
              🥇
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">{currentUser.name}</h2>
          <Badge className="bg-gold text-white mb-4">Gold VIP Member</Badge>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <div className="text-3xl font-bold">15</div>
              <div className="text-sm opacity-90">Уровень</div>
            </div>
            <div>
              <div className="text-3xl font-bold">234</div>
              <div className="text-sm opacity-90">Друзья</div>
            </div>
            <div>
              <div className="text-3xl font-bold">12</div>
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
              <div className="text-3xl">🇬🇧</div>
              <div>
                <h4 className="font-semibold">Английский</h4>
                <p className="text-sm text-muted-foreground">Средний уровень</p>
              </div>
            </div>
            <Badge>Активный</Badge>
          </div>
          <Button variant="outline" className="w-full">
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить язык
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Статистика</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Слов выучено</span>
            <span className="font-bold text-lg">1,234</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm">Сообщений отправлено</span>
            <span className="font-bold text-lg">856</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm">Подарков получено</span>
            <span className="font-bold text-lg">23</span>
          </div>
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

        <div className="fixed bottom-4 right-4">
          <Button 
            size="lg" 
            className="rounded-full w-16 h-16 shadow-2xl bg-gradient-to-r from-secondary to-coral animate-pulse-glow"
            onClick={() => setActiveTab('chats')}
          >
            <Icon name="MessageCircle" size={28} />
          </Button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-primary/10 to-transparent h-2 pointer-events-none"></div>
    </div>
  );
};

export default Index;