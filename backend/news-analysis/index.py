import json
import os
from typing import Any, Dict

def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """
    ИИ-анализ политических новостей для выявления уклона, манипуляций и достоверности
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        news_text = body.get('text', '')
        source_type = body.get('sourceType', 'unknown')
        country_code = body.get('countryCode', 'RU')
        
        if not news_text:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'News text is required'}),
                'isBase64Encoded': False
            }
        
        openai_key = os.environ.get('OPENAI_API_KEY')
        
        if not openai_key:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'sentiment': 'neutral',
                    'bias': 50,
                    'credibility': 70,
                    'manipulation_detected': False,
                    'summary': 'Для полного анализа необходим API ключ OpenAI',
                    'keywords': ['политика', 'новости'],
                    'mock': True
                }),
                'isBase64Encoded': False
            }
        
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)
            
            prompt = f"""Проанализируй следующую новость из {country_code} ({source_type} источник):

"{news_text}"

Предоставь JSON анализ:
1. sentiment: positive/negative/neutral
2. bias: 0-100 (политический уклон)
3. credibility: 0-100 (достоверность)
4. manipulation_detected: true/false
5. summary: краткое резюме на русском
6. keywords: массив ключевых слов"""

            response = client.chat.completions.create(
                model='gpt-4o-mini',
                messages=[
                    {'role': 'system', 'content': 'Ты эксперт по анализу политических новостей и медиаграмотности.'},
                    {'role': 'user', 'content': prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            analysis_text = response.choices[0].message.content
            analysis = json.loads(analysis_text)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(analysis),
                'isBase64Encoded': False
            }
            
        except Exception as ai_error:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'sentiment': 'neutral',
                    'bias': 50,
                    'credibility': 65,
                    'manipulation_detected': False,
                    'summary': f'Ошибка анализа ИИ: {str(ai_error)[:100]}',
                    'keywords': ['error'],
                    'mock': True
                }),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Server error: {str(e)}'}),
            'isBase64Encoded': False
        }