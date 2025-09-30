INSERT INTO t_p22749112_multilingual_communi.users (email, name, avatar, native_language, learning_language, country, region, city, is_vip, coins, level, xp, is_online, last_seen) VALUES 
('maria@example.com', 'Мария', '👩', 'Русский', 'Английский', 'Россия', 'Москва', 'Москва', false, 120, 3, 250, true, CURRENT_TIMESTAMP),
('john@example.com', 'John', '👨', 'English', 'Russian', 'USA', 'New York', 'New York', false, 150, 2, 180, true, CURRENT_TIMESTAMP),
('pierre@example.com', 'Pierre', '🧑', 'Français', 'English', 'France', 'Paris', 'Paris', true, 500, 5, 450, false, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('anna@example.com', 'Анна', '👧', 'Русский', 'Французский', 'Россия', 'Санкт-Петербург', 'Санкт-Петербург', false, 100, 1, 50, true, CURRENT_TIMESTAMP),
('carlos@example.com', 'Carlos', '🤵', 'Español', 'English', 'Spain', 'Madrid', 'Madrid', false, 200, 4, 380, false, CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
('yuki@example.com', 'Yuki', '👩‍🦰', '日本語', 'English', 'Japan', 'Tokyo', 'Tokyo', true, 600, 8, 780, true, CURRENT_TIMESTAMP),
('ahmed@example.com', 'Ahmed', '🧔', 'العربية', 'English', 'UAE', 'Dubai', 'Dubai', false, 180, 2, 120, false, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('lisa@example.com', 'Lisa', '👱‍♀️', 'Deutsch', 'English', 'Germany', 'Berlin', 'Berlin', false, 140, 3, 220, true, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;