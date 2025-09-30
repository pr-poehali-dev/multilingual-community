"""
Business: Translate messages using Google Cloud Translation API
Args: event - dict with httpMethod, body containing text and target language
      context - object with attributes: request_id, function_name
Returns: HTTP response dict with translated text
"""

import json
import os
from typing import Dict, Any
import urllib.request
import urllib.parse

def cors_headers():
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
        'Access-Control-Max-Age': '86400'
    }

def translate_with_google(text: str, target_lang: str, source_lang: str = 'auto') -> str:
    api_key = os.environ.get('GOOGLE_TRANSLATE_API_KEY')
    
    if not api_key:
        return text
    
    url = 'https://translation.googleapis.com/language/translate/v2'
    
    params = {
        'key': api_key,
        'q': text,
        'target': target_lang
    }
    
    if source_lang != 'auto':
        params['source'] = source_lang
    
    data = urllib.parse.urlencode(params).encode('utf-8')
    
    try:
        req = urllib.request.Request(url, data=data, method='POST')
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['data']['translations'][0]['translatedText']
    except Exception:
        return text

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        text = body.get('text', '')
        target_lang = body.get('targetLang', 'en')
        source_lang = body.get('sourceLang', 'auto')
        
        if not text:
            return {
                'statusCode': 400,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'Text is required'}),
                'isBase64Encoded': False
            }
        
        translated_text = translate_with_google(text, target_lang, source_lang)
        
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps({
                'original': text,
                'translated': translated_text,
                'sourceLang': source_lang,
                'targetLang': target_lang
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }