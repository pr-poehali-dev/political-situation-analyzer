import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor


def handler(event, context):
    """
    Анализ уже собранных новостей через Groq AI и пересчёт статистики
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        params = event.get('queryStringParameters') or {}
        country_code = params.get('country', 'RU')
        
        db_url = os.environ.get('DATABASE_URL')
        groq_key = os.environ.get('GROQ_API_KEY')
        
        if not groq_key:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'GROQ_API_KEY not configured',
                    'message': 'Добавьте GROQ_API_KEY в секреты проекта'
                }),
                'isBase64Encoded': False
            }
        
        if method == 'POST':
            result = analyze_existing_news(db_url, groq_key, country_code)
            stats = calculate_statistics(db_url, country_code)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'analyzed': result['analyzed'],
                    'failed': result['failed'],
                    'statistics': stats
                }),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'Error: {e}')
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def analyze_existing_news(db_url, groq_key, country_code):
    """Анализ новостей без is_fake и анализа"""
    if not db_url:
        return {'analyzed': 0, 'failed': 0}
    
    analyzed_count = 0
    failed_count = 0
    
    try:
        conn = psycopg2.connect(db_url)
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Получаем новости без анализа
                cur.execute("""
                    SELECT n.id, n.title, n.content
                    FROM news_articles n
                    LEFT JOIN news_analysis a ON a.article_id = n.id
                    WHERE n.country_code = %s AND a.id IS NULL
                    LIMIT 50
                """, (country_code,))
                
                articles = cur.fetchall()
                print(f'Found {len(articles)} articles to analyze')
                
                for article in articles:
                    try:
                        # Проверка на фейк
                        is_fake, reason = check_fake(article['title'], article['content'], groq_key)
                        
                        if is_fake is not None:
                            cur.execute("""
                                UPDATE news_articles 
                                SET is_fake = %s, fake_check_reason = %s
                                WHERE id = %s
                            """, (is_fake, reason, article['id']))
                        
                        # Полный анализ
                        analyze_and_save(article['id'], article['title'], article['content'], groq_key, cur)
                        analyzed_count += 1
                        
                    except Exception as e:
                        print(f'Error analyzing article {article["id"]}: {e}')
                        failed_count += 1
                
                conn.commit()
                print(f'Analyzed: {analyzed_count}, Failed: {failed_count}')
                
        finally:
            conn.close()
            
    except Exception as e:
        print(f'Database error: {e}')
    
    return {'analyzed': analyzed_count, 'failed': failed_count}


def calculate_statistics(db_url, country_code):
    """Расчёт статистики по новостям"""
    if not db_url:
        return {}
    
    try:
        conn = psycopg2.connect(db_url)
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Общая статистика
                cur.execute("""
                    SELECT 
                        COUNT(*) as total_news,
                        COUNT(CASE WHEN is_fake = true THEN 1 END) as fake_news,
                        COUNT(CASE WHEN a.manipulation_detected = true THEN 1 END) as manipulation_count,
                        AVG(a.bias_score) as avg_bias,
                        AVG(a.credibility_score) as avg_credibility,
                        COUNT(CASE WHEN a.sentiment = 'positive' THEN 1 END) as positive_count,
                        COUNT(CASE WHEN a.sentiment = 'negative' THEN 1 END) as negative_count,
                        COUNT(CASE WHEN a.sentiment = 'neutral' THEN 1 END) as neutral_count
                    FROM news_articles n
                    LEFT JOIN news_analysis a ON a.article_id = n.id
                    WHERE n.country_code = %s
                """, (country_code,))
                
                stats = cur.fetchone()
                
                if stats:
                    return {
                        'totalNews': stats['total_news'] or 0,
                        'fakeNews': stats['fake_news'] or 0,
                        'manipulationCount': stats['manipulation_count'] or 0,
                        'avgBias': round(float(stats['avg_bias'] or 0), 1),
                        'avgCredibility': round(float(stats['avg_credibility'] or 0), 1),
                        'positiveCount': stats['positive_count'] or 0,
                        'negativeCount': stats['negative_count'] or 0,
                        'neutralCount': stats['neutral_count'] or 0,
                        'democracyScore': calculate_democracy_score(stats),
                        'freedomScore': calculate_freedom_score(stats),
                        'pressFreedomScore': calculate_press_freedom(stats)
                    }
                
        finally:
            conn.close()
            
    except Exception as e:
        print(f'Stats calculation error: {e}')
    
    return {}


def calculate_democracy_score(stats):
    """Расчёт индекса демократии на основе анализа"""
    if not stats or not stats['total_news']:
        return 50
    
    credibility = stats['avg_credibility'] or 50
    bias = 100 - (stats['avg_bias'] or 50)
    fake_ratio = (stats['fake_news'] or 0) / max(stats['total_news'], 1)
    
    score = (credibility * 0.4 + bias * 0.3 + (1 - fake_ratio) * 100 * 0.3)
    return round(max(0, min(100, score)), 1)


def calculate_freedom_score(stats):
    """Расчёт индекса свободы"""
    if not stats or not stats['total_news']:
        return 50
    
    manipulation_ratio = (stats['manipulation_count'] or 0) / max(stats['total_news'], 1)
    credibility = stats['avg_credibility'] or 50
    
    score = credibility * 0.6 + (1 - manipulation_ratio) * 100 * 0.4
    return round(max(0, min(100, score)), 1)


def calculate_press_freedom(stats):
    """Расчёт индекса свободы прессы"""
    if not stats or not stats['total_news']:
        return 50
    
    bias = 100 - (stats['avg_bias'] or 50)
    fake_ratio = (stats['fake_news'] or 0) / max(stats['total_news'], 1)
    
    score = bias * 0.5 + (1 - fake_ratio) * 100 * 0.5
    return round(max(0, min(100, score)), 1)


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
        
    except Exception as e:
        print(f'Fake check error: {e}')
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
            ON CONFLICT (article_id) DO UPDATE SET
                sentiment = EXCLUDED.sentiment,
                bias_score = EXCLUDED.bias_score,
                credibility_score = EXCLUDED.credibility_score,
                manipulation_detected = EXCLUDED.manipulation_detected,
                summary = EXCLUDED.summary,
                keywords = EXCLUDED.keywords
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
        raise
