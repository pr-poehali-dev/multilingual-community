import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const setCurrentUser = useStore(state => state.setCurrentUser);
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    avatar: '🚀',
    nativeLanguage: 'Русский',
    learningLanguage: 'English',
    country: 'RU'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const user = await api.login(formData.email);
        setCurrentUser(user);
        toast.success('Добро пожаловать!');
        onClose();
      } else {
        const user = await api.register(formData);
        setCurrentUser(user);
        toast.success('Регистрация успешна!');
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const avatars = ['🚀', '👨', '👩', '🧑', '👤', '😊', '🎮', '🎨', '🎭', '🎪'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">{isLogin ? 'Вход' : 'Регистрация'}</DialogTitle>
          <DialogDescription>
            {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ваше имя"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="avatar">Аватар</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {avatars.map(av => (
                    <button
                      key={av}
                      type="button"
                      className={`text-3xl p-2 rounded-lg border-2 transition-all hover:scale-110 ${
                        formData.avatar === av ? 'border-primary bg-primary/10' : 'border-muted'
                      }`}
                      onClick={() => setFormData({ ...formData, avatar: av })}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="nativeLanguage">Родной язык</Label>
                <Select 
                  value={formData.nativeLanguage} 
                  onValueChange={(value) => setFormData({ ...formData, nativeLanguage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Русский">Русский</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Español">Español</SelectItem>
                    <SelectItem value="中文">中文</SelectItem>
                    <SelectItem value="日本語">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="learningLanguage">Изучаю</Label>
                <Select 
                  value={formData.learningLanguage} 
                  onValueChange={(value) => setFormData({ ...formData, learningLanguage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Русский">Русский</SelectItem>
                    <SelectItem value="Español">Español</SelectItem>
                    <SelectItem value="中文">中文</SelectItem>
                    <SelectItem value="日本語">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="country">Страна</Label>
                <Select 
                  value={formData.country} 
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RU">🇷🇺 Россия</SelectItem>
                    <SelectItem value="US">🇺🇸 США</SelectItem>
                    <SelectItem value="GB">🇬🇧 Великобритания</SelectItem>
                    <SelectItem value="ES">🇪🇸 Испания</SelectItem>
                    <SelectItem value="CN">🇨🇳 Китай</SelectItem>
                    <SelectItem value="JP">🇯🇵 Япония</SelectItem>
                    <SelectItem value="BR">🇧🇷 Бразилия</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;