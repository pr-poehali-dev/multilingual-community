"""
Business: Main API handler for Language Connect platform
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with attributes: request_id, function_name
Returns: HTTP response dict with user data, chats, messages
"""

import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def cors_headers():
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
    }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters', {}) or {}
    action = params.get('action', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        if action == 'register':
            return register_user(event)
        elif action == 'login':
            return login_user(event)
        elif action == 'users':
            return get_users(event)
        elif action == 'user':
            return get_user_profile(event)
        elif action == 'update_user':
            return update_user(event)
        elif action == 'chats':
            if method == 'POST':
                return create_chat(event)
            return get_user_chats(event)
        elif action == 'messages':
            if method == 'POST':
                return send_message(event)
            return get_chat_messages(event)
        elif action == 'achievements':
            return get_user_achievements(event)
        elif action == 'add_friend':
            return add_friend(event)
        elif action == 'lessons':
            return get_lessons(event)
        elif action == 'complete_lesson':
            return complete_lesson(event)
        elif action == 'send_gift':
            return send_gift(event)
        elif action == 'gifts':
            return get_gifts(event)
        else:
            return {
                'statusCode': 404,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'Action not found'}),
                'isBase64Encoded': False
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def register_user(event: Dict[str, Any]) -> Dict[str, Any]:
    body = json.loads(event.get('body', '{}'))
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        INSERT INTO users (email, name, avatar, native_language, learning_language, country)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id, email, name, avatar, native_language, learning_language, level, xp, country, is_vip, coins
    """, (
        body['email'],
        body['name'],
        body.get('avatar', '🚀'),
        body['nativeLanguage'],
        body['learningLanguage'],
        body['country']
    ))
    
    user = cur.fetchone()
    
    cur.execute("SELECT id FROM achievements")
    achievements = cur.fetchall()
    
    for ach in achievements:
        cur.execute(
            "INSERT INTO user_achievements (user_id, achievement_id, progress) VALUES (%s, %s, 0)",
            (user['id'], ach['id'])
        )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': cors_headers(),
        'body': json.dumps(dict(user)),
        'isBase64Encoded': False
    }

def login_user(event: Dict[str, Any]) -> Dict[str, Any]:
    body = json.loads(event.get('body', '{}'))
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT id, email, name, avatar, native_language, learning_language, 
               level, xp, country, is_vip, vip_badge, avatar_frame, coins,
               streak_days, total_messages, words_learned, gifts_received,
               region, city, is_online
        FROM users WHERE email = %s
    """, (body['email'],))
    
    user = cur.fetchone()
    
    if user:
        cur.execute(
            "UPDATE users SET last_seen = CURRENT_TIMESTAMP, is_online = true WHERE id = %s",
            (user['id'],)
        )
        conn.commit()
    
    cur.close()
    conn.close()
    
    if not user:
        return {
            'statusCode': 404,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'User not found'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': cors_headers(),
        'body': json.dumps(dict(user)),
        'isBase64Encoded': False
    }

def get_users(event: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters', {}) or {}
    search = params.get('search', '')
    limit = int(params.get('limit', 20))
    region = params.get('region', '')
    country = params.get('country', '')
    online_only = params.get('onlineOnly', '') == 'true'
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query = """
        SELECT id, name, avatar, native_language as language, 
               learning_language as learning, level, country, region, city,
               is_vip, vip_badge, avatar_frame, is_online, last_seen
        FROM users 
        WHERE 1=1
    """
    params_list = []
    
    if search:
        query += " AND (name ILIKE %s OR native_language ILIKE %s OR learning_language ILIKE %s OR country ILIKE %s)"
        search_param = f'%{search}%'
        params_list.extend([search_param, search_param, search_param, search_param])
    
    if region:
        query += " AND region ILIKE %s"
        params_list.append(f'%{region}%')
    
    if country:
        query += " AND country ILIKE %s"
        params_list.append(f'%{country}%')
    
    if online_only:
        query += " AND is_online = true"
    
    query += " ORDER BY is_online DESC, last_seen DESC LIMIT %s"
    params_list.append(limit)
    
    cur.execute(query, tuple(params_list))
    
    users_raw = cur.fetchall()
    
    users = []
    for user in users_raw:
        user_dict = dict(user)
        if 'last_seen' in user_dict and user_dict['last_seen']:
            user_dict['last_seen'] = user_dict['last_seen'].isoformat()
        users.append(user_dict)
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': cors_headers(),
        'body': json.dumps(users),
        'isBase64Encoded': False
    }

def get_user_profile(event: Dict[str, Any]) -> Dict[str, Any]:
    user_id = event.get('pathParameters', {}).get('id')
    if not user_id:
        params = event.get('queryStringParameters', {}) or {}
        user_id = params.get('id')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT id, email, name, avatar, native_language, learning_language,
               level, xp, country, is_vip, vip_badge, avatar_frame, coins,
               streak_days, total_messages, words_learned, gifts_received
        FROM users WHERE id = %s
    """, (user_id,))
    
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if not user:
        return {
            'statusCode': 404,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'User not found'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': cors_headers(),
        'body': json.dumps(dict(user)),
        'isBase64Encoded': False
    }

def update_user(event: Dict[str, Any]) -> Dict[str, Any]:
    user_id = event.get('pathParameters', {}).get('id')
    body = json.loads(event.get('body', '{}'))
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    update_fields = []
    values = []
    
    if 'name' in body:
        update_fields.append('name = %s')
        values.append(body['name'])
    if 'avatar' in body:
        update_fields.append('avatar = %s')
        values.append(body['avatar'])
    if 'avatarFrame' in body:
        update_fields.append('avatar_frame = %s')
        values.append(body['avatarFrame'])
    if 'learningLanguage' in body:
        update_fields.append('learning_language = %s')
        values.append(body['learningLanguage'])
    
    values.append(user_id)
    
    if update_fields:
        cur.execute(f"""
            UPDATE users SET {', '.join(update_fields)}
            WHERE id = %s
            RETURNING id, name, avatar, avatar_frame, learning_language
        """, values)
        
        user = cur.fetchone()
        conn.commit()
    else:
        user = None
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': cors_headers(),
        'body': json.dumps(dict(user) if user else {}),
        'isBase64Encoded': False
    }

def get_user_chats(event: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters', {}) or {}
    user_id = params.get('userId')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT c.id, c.last_message, c.last_message_time,
               CASE 
                   WHEN c.user1_id = %s THEN c.unread_count_user1
                   ELSE c.unread_count_user2
               END as unread_count,
               u.id as partner_id, u.name as partner_name, u.avatar as partner_avatar,
               u.is_vip as partner_vip, u.vip_badge as partner_badge
        FROM chats c
        JOIN users u ON (
            CASE 
                WHEN c.user1_id = %s THEN c.user2_id = u.id
                ELSE c.user1_id = u.id
            END
        )
        WHERE c.user1_id = %s OR c.user2_id = %s
        ORDER BY c.last_message_time DESC
    """, (user_id, user_id, user_id, user_id))
    
    chats = cur.fetchall()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': cors_headers(),
        'body': json.dumps([dict(c) for c in chats]),
        'isBase64Encoded': False
    }

def create_chat(event: Dict[str, Any]) -> Dict[str, Any]:
    body = json.loads(event.get('body', '{}'))
    user1_id = body['user1Id']
    user2_id = body['user2Id']
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT id FROM chats 
        WHERE (user1_id = %s AND user2_id = %s) OR (user1_id = %s AND user2_id = %s)
    """, (user1_id, user2_id, user2_id, user1_id))
    
    existing = cur.fetchone()
    
    if existing:
        chat_id = existing['id']
    else:
        cur.execute("""
            INSERT INTO chats (user1_id, user2_id, last_message)
            VALUES (%s, %s, 'Начните общение!')
            RETURNING id
        """, (user1_id, user2_id))
        chat_id = cur.fetchone()['id']
        conn.commit()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': cors_headers(),
        'body': json.dumps({'chatId': chat_id}),
        'isBase64Encoded': False
    }

def get_chat_messages(event: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters', {}) or {}
    chat_id = params.get('chatId')
    limit = int(params.get('limit', 50))
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT m.id, m.message, m.translated_message, m.is_voice, 
               m.voice_transcription, m.created_at, m.sender_id,
               u.name as sender_name, u.avatar as sender_avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.chat_id = %s
        ORDER BY m.created_at DESC
        LIMIT %s
    """, (chat_id, limit))
    
    messages = cur.fetchall()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': cors_headers(),
        'body': json.dumps([dict(m) for m in reversed(messages)]),
        'isBase64Encoded': False
    }

def send_message(event: Dict[str, Any]) -> Dict[str, Any]:
    body = json.loads(event.get('body', '{}'))
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        INSERT INTO messages (chat_id, sender_id, message, translated_message, is_voice)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id, message, translated_message, created_at
    """, (
        body['chatId'],
        body['senderId'],
        body['message'],
        body.get('translatedMessage'),
        body.get('isVoice', False)
    ))
    
    message = cur.fetchone()
    
    cur.execute("""
        UPDATE chats 
        SET last_message = %s, last_message_time = CURRENT_TIMESTAMP,
            unread_count_user1 = CASE WHEN user1_id != %s THEN unread_count_user1 + 1 ELSE unread_count_user1 END,
            unread_count_user2 = CASE WHEN user2_id != %s THEN unread_count_user2 + 1 ELSE unread_count_user2 END
        WHERE id = %s
    """, (body['message'], body['senderId'], body['senderId'], body['chatId']))
    
    cur.execute("""
        UPDATE users 
        SET total_messages = total_messages + 1
        WHERE id = %s
    """, (body['senderId'],))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': cors_headers(),
        'body': json.dumps(dict(message)),
        'isBase64Encoded': False
    }

def get_user_achievements(event: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters', {}) or {}
    user_id = params.get('userId')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT a.id, a.name, a.description, a.icon, 
               ua.progress, ua.unlocked, a.requirement_value
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = %s
    """, (user_id,))
    
    achievements = cur.fetchall()
    
    result = []
    for ach in achievements:
        result.append({
            'id': ach['id'],
            'name': ach['name'],
            'description': ach['description'],
            'icon': ach['icon'],
            'unlocked': ach['unlocked'],
            'progress': int((ach['progress'] / ach['requirement_value']) * 100) if ach['requirement_value'] > 0 else 0
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': cors_headers(),
        'body': json.dumps(result),
        'isBase64Encoded': False
    }

def add_friend(event: Dict[str, Any]) -> Dict[str, Any]:
    body = json.loads(event.get('body', '{}'))
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        INSERT INTO friendships (user_id, friend_id, status)
        VALUES (%s, %s, 'accepted')
        ON CONFLICT (user_id, friend_id) DO NOTHING
        RETURNING id
    """, (body['userId'], body['friendId']))
    
    friendship = cur.fetchone()
    
    if friendship:
        cur.execute("""
            INSERT INTO friendships (user_id, friend_id, status)
            VALUES (%s, %s, 'accepted')
            ON CONFLICT (user_id, friend_id) DO NOTHING
        """, (body['friendId'], body['userId']))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': cors_headers(),
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def get_lessons(event: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters', {}) or {}
    language = params.get('language', 'English')
    user_id = params.get('userId')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT l.id, l.title, l.description, l.xp_reward, l.level_required,
               COALESCE(ul.completed, FALSE) as completed
        FROM lessons l
        LEFT JOIN user_lessons ul ON l.id = ul.lesson_id AND ul.user_id = %s
        WHERE l.language = %s
        ORDER BY l.level_required, l.id
    """, (user_id, language))
    
    lessons = cur.fetchall()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': cors_headers(),
        'body': json.dumps([dict(l) for l in lessons]),
        'isBase64Encoded': False
    }

def complete_lesson(event: Dict[str, Any]) -> Dict[str, Any]:
    body = json.loads(event.get('body', '{}'))
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        INSERT INTO user_lessons (user_id, lesson_id, completed, score, completed_at)
        VALUES (%s, %s, TRUE, %s, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, lesson_id) 
        DO UPDATE SET completed = TRUE, score = %s, completed_at = CURRENT_TIMESTAMP
    """, (body['userId'], body['lessonId'], body.get('score', 100), body.get('score', 100)))
    
    cur.execute("SELECT xp_reward FROM lessons WHERE id = %s", (body['lessonId'],))
    lesson = cur.fetchone()
    
    if lesson:
        cur.execute("""
            UPDATE users 
            SET xp = xp + %s, 
                level = CASE WHEN (xp + %s) >= level * 100 THEN level + 1 ELSE level END,
                words_learned = words_learned + 10
            WHERE id = %s
            RETURNING level, xp
        """, (lesson['xp_reward'], lesson['xp_reward'], body['userId']))
        
        user = cur.fetchone()
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': cors_headers(),
        'body': json.dumps({'xp': lesson['xp_reward'], 'level': user['level'], 'totalXp': user['xp']}),
        'isBase64Encoded': False
    }

def send_gift(event: Dict[str, Any]) -> Dict[str, Any]:
    body = json.loads(event.get('body', '{}'))
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT price FROM gifts WHERE id = %s", (body['giftId'],))
    gift = cur.fetchone()
    
    if not gift:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'Gift not found'}),
            'isBase64Encoded': False
        }
    
    cur.execute("SELECT coins FROM users WHERE id = %s", (body['senderId'],))
    sender = cur.fetchone()
    
    if sender['coins'] < gift['price']:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'Not enough coins'}),
            'isBase64Encoded': False
        }
    
    chat_id = body.get('chatId')
    
    cur.execute("""
        INSERT INTO gift_transactions (sender_id, receiver_id, gift_id, chat_id)
        VALUES (%s, %s, %s, %s)
    """, (body['senderId'], body['receiverId'], body['giftId'], chat_id))
    
    cur.execute("UPDATE users SET coins = coins - %s WHERE id = %s", (gift['price'], body['senderId']))
    cur.execute("UPDATE users SET gifts_received = gifts_received + 1 WHERE id = %s", (body['receiverId'],))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': cors_headers(),
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def get_gifts(event: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT id, name, icon, price FROM gifts ORDER BY price")
    gifts = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': cors_headers(),
        'body': json.dumps([dict(g) for g in gifts]),
        'isBase64Encoded': False
    }