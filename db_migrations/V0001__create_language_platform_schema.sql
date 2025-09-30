CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(10) DEFAULT '🚀',
    native_language VARCHAR(100) NOT NULL,
    learning_language VARCHAR(100) NOT NULL,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    country VARCHAR(10) NOT NULL,
    is_vip BOOLEAN DEFAULT FALSE,
    vip_badge VARCHAR(50),
    avatar_frame VARCHAR(50),
    coins INTEGER DEFAULT 100,
    streak_days INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    words_learned INTEGER DEFAULT 0,
    gifts_received INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS friendships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    friend_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER REFERENCES users(id),
    user2_id INTEGER REFERENCES users(id),
    last_message TEXT,
    last_message_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unread_count_user1 INTEGER DEFAULT 0,
    unread_count_user2 INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user1_id, user2_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id),
    sender_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    translated_message TEXT,
    is_voice BOOLEAN DEFAULT FALSE,
    voice_transcription TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(10) NOT NULL,
    requirement_type VARCHAR(50) NOT NULL,
    requirement_value INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    achievement_id INTEGER REFERENCES achievements(id),
    progress INTEGER DEFAULT 0,
    unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS gifts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    price INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS gift_transactions (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    gift_id INTEGER REFERENCES gifts(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    language VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    xp_reward INTEGER NOT NULL,
    level_required INTEGER DEFAULT 1,
    content JSONB
);

CREATE TABLE IF NOT EXISTS user_lessons (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    lesson_id INTEGER REFERENCES lessons(id),
    completed BOOLEAN DEFAULT FALSE,
    score INTEGER,
    completed_at TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_chats_users ON chats(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);

INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
('Первый друг', 'Добавь первого друга', '👋', 'friends', 1),
('Полиглот', 'Выучи 100 слов', '📚', 'words', 100),
('Болтун', 'Отправь 50 сообщений', '💬', 'messages', 50),
('Щедрый', 'Подари 10 подарков', '🎁', 'gifts', 10),
('Мастер языка', 'Достигни 30 уровня', '🎓', 'level', 30),
('Неделя практики', '7 дней подряд', '🔥', 'streak', 7);

INSERT INTO gifts (name, icon, price) VALUES
('Роза', '🌹', 50),
('Торт', '🎂', 100),
('Трофей', '🏆', 200),
('Подарок', '🎁', 150),
('Корона', '👑', 500);

INSERT INTO lessons (language, title, description, xp_reward, level_required, content) VALUES
('English', 'Приветствия', 'Научись здороваться по-английски', 50, 1, '{"words": ["Hello", "Hi", "Good morning"]}'),
('English', 'Числа 1-20', 'Выучи числа от одного до двадцати', 50, 1, '{"words": ["One", "Two", "Three"]}'),
('English', 'Цвета', 'Основные цвета на английском', 75, 2, '{"words": ["Red", "Blue", "Green"]}'),
('English', 'Еда и напитки', 'Популярные слова о еде', 100, 3, '{"words": ["Food", "Water", "Bread"]}');