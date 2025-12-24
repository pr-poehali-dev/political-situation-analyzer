import json
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor


def handler(event, context):
    """
    Автоматический сбор новостей из различных источников с проверкой на фейки для политического анализа
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        params = event.get('queryStringParameters') or {}
        country_code = params.get('country', 'RU')
        limit = int(params.get('limit', '20'))
        
        db_url = os.environ.get('DATABASE_URL')
        news_api_key = os.environ.get('NEWS_API_KEY')
        groq_key = os.environ.get('GROQ_API_KEY')
        
        print(f'Method: {method}, Country: {country_code}')
        print(f'Has NEWS_API_KEY: {bool(news_api_key)}, Has GROQ_KEY: {bool(groq_key)}')
        
        if method == 'POST' and news_api_key:
            print('Starting news collection...')
            collect_news(db_url, news_api_key, groq_key, country_code)
            print('News collection completed')
        
        news = get_news_from_db(db_url, country_code, limit)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'news': news,
                'count': len(news),
                'country': country_code
            }, default=str),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def get_news_from_db(db_url, country_code, limit):
    """Получение новостей из БД"""
    if not db_url:
        return []
    
    try:
        conn = psycopg2.connect(db_url)
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT 
                        n.id, n.title, n.content, n.source, n.source_type,
                        n.url, n.published_at, n.is_fake, n.fake_check_reason,
                        a.sentiment, a.bias_score, a.credibility_score,
                        a.manipulation_detected, a.summary
                    FROM news_articles n
                    LEFT JOIN news_analysis a ON a.article_id = n.id
                    WHERE n.country_code = %s
                    ORDER BY n.published_at DESC
                    LIMIT %s
                """, (country_code, limit))
                
                rows = cur.fetchall()
                return [dict(row) for row in rows]
        finally:
            conn.close()
    except Exception:
        return []


def collect_news(db_url, news_api_key, groq_key, country_code):
    """Сбор новостей через News API"""
    print(f'collect_news called for {country_code}')
    try:
        import requests
        print('Requests imported')
        
        country_map = {
            'RU': 'ru', 'US': 'us', 'DE': 'de', 'CN': 'cn',
            'NO': 'no', 'BY': 'ru', 'FR': 'fr', 'JP': 'jp'
        }
        
        api_country = country_map.get(country_code, 'us')
        
        url = 'https://newsapi.org/v2/top-headlines'
        params = {
            'country': api_country,
            'apiKey': news_api_key,
            'pageSize': 10
        }
        
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if data.get('status') != 'ok':
            return
        
        articles = data.get('articles', [])
        
        conn = psycopg2.connect(db_url)
        try:
            with conn.cursor() as cur:
                for article in articles:
                    title = article.get('title', '')[:500]
                    content = article.get('description', '')[:2000]
                    source = article.get('source', {}).get('name', 'Unknown')[:200]
                    article_url = article.get('url', '')[:500]
                    published = article.get('publishedAt', datetime.now().isoformat())
                    
                    is_fake, reason = check_fake(title, content, groq_key)
                    
                    cur.execute("""
                        INSERT INTO news_articles 
                        (country_code, title, content, source, source_type, url, published_at, is_fake, fake_check_reason)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                    """, (country_code, title, content, source, 'independent', article_url, published, is_fake, reason))
                    
                    result = cur.fetchone()
                    if result:
                        article_id = result[0]
                        analyze_and_save(article_id, title, content, groq_key, cur)
                
                conn.commit()
        finally:
            conn.close()
            
    except Exception as e:
        print(f'Error collecting news: {e}')


def check_fake(title, content, groq_key):
    """Проверка новости на фейк через ИИ"""
    if not groq_key or not title:
        return None, None
    
    try:
        from groq import Groq
        client = Groq(api_key=groq_key)
        
        text = f"{title}. {content or ''}"[:500]
        
        prompt = f"""Проверь новость на фейк:

{text}

JSON формат:
{{"is_fake": true/false, "reason": "объяснение"}}"""

        response = client.chat.completions.create(
            model='llama-3.1-70b-versatile',
            messages=[
                {'role': 'system', 'content': 'Ты эксперт по фактчекингу.'},
                {'role': 'user', 'content': prompt}
            ],
            temperature=0.2,
            max_tokens=150
        )
        
        result = json.loads(response.choices[0].message.content)
        return result.get('is_fake', False), result.get('reason', '')
        
    except Exception:
        return None, None


def analyze_and_save(article_id, title, content, groq_key, cur):
    """Анализ новости и сохранение в БД"""
    if not groq_key:
        return
    
    try:
        from groq import Groq
        client = Groq(api_key=groq_key)
        
        text = f"{title}. {content or ''}"[:800]
        
        prompt = f"""Анализ новости:

{text}

JSON:
{{"sentiment": "positive/negative/neutral", "bias_score": 0-100, "credibility_score": 0-100, "manipulation_detected": true/false, "summary": "текст", "keywords": ["слово1", "слово2"]}}"""

        response = client.chat.completions.create(
            model='llama-3.1-70b-versatile',
            messages=[
                {'role': 'system', 'content': 'Анализ новостей.'},
                {'role': 'user', 'content': prompt}
            ],
            temperature=0.3,
            max_tokens=250
        )
        
        analysis = json.loads(response.choices[0].message.content)
        
        cur.execute("""
            INSERT INTO news_analysis 
            (article_id, sentiment, bias_score, credibility_score, manipulation_detected, summary, keywords)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            article_id,
            analysis.get('sentiment'),
            analysis.get('bias_score'),
            analysis.get('credibility_score'),
            analysis.get('manipulation_detected'),
            analysis.get('summary'),
            analysis.get('keywords', [])
        ))
        
    except Exception as e:
        print(f'Analysis error: {e}')