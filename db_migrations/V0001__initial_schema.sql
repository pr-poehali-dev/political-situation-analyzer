-- Создание таблиц для хранения истории анализов и новостей

-- Таблица стран и их текущих показателей
CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    democracy_score INTEGER,
    freedom_score INTEGER,
    authoritarian_score INTEGER,
    press_freedom_score INTEGER,
    fascism_britt_score INTEGER,
    fascism_eco_score INTEGER,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица собранных новостей
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    country_code VARCHAR(3) REFERENCES countries(code),
    title TEXT NOT NULL,
    content TEXT,
    source VARCHAR(200),
    source_type VARCHAR(20) CHECK (source_type IN ('gov', 'opposition', 'independent', 'international')),
    url TEXT,
    published_at TIMESTAMP,
    collected_at TIMESTAMP DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    is_fake BOOLEAN DEFAULT NULL,
    fake_check_reason TEXT
);

-- Таблица ИИ-анализов новостей
CREATE TABLE IF NOT EXISTS news_analysis (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES news_articles(id),
    sentiment VARCHAR(20),
    bias_score INTEGER CHECK (bias_score >= 0 AND bias_score <= 100),
    credibility_score INTEGER CHECK (credibility_score >= 0 AND credibility_score <= 100),
    manipulation_detected BOOLEAN,
    summary TEXT,
    keywords TEXT[],
    analyzed_at TIMESTAMP DEFAULT NOW()
);

-- Таблица истории изменений показателей стран
CREATE TABLE IF NOT EXISTS country_history (
    id SERIAL PRIMARY KEY,
    country_code VARCHAR(3) REFERENCES countries(code),
    democracy_score INTEGER,
    freedom_score INTEGER,
    authoritarian_score INTEGER,
    press_freedom_score INTEGER,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_news_country ON news_articles(country_code);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_source_type ON news_articles(source_type);
CREATE INDEX IF NOT EXISTS idx_analysis_article ON news_analysis(article_id);
CREATE INDEX IF NOT EXISTS idx_history_country ON country_history(country_code);
CREATE INDEX IF NOT EXISTS idx_history_recorded ON country_history(recorded_at DESC);

-- Вставка начальных данных стран
INSERT INTO countries (code, name, democracy_score, freedom_score, authoritarian_score, press_freedom_score, fascism_britt_score, fascism_eco_score)
VALUES 
    ('RU', 'Россия', 35, 28, 72, 20, 80, 82),
    ('US', 'США', 78, 82, 22, 75, 47, 48),
    ('DE', 'Германия', 85, 88, 12, 82, 26, 27),
    ('CN', 'Китай', 25, 18, 82, 10, 86, 82),
    ('NO', 'Норвегия', 95, 97, 5, 95, 19, 19),
    ('BY', 'Беларусь', 22, 15, 85, 12, 84, 85),
    ('FR', 'Франция', 82, 85, 15, 78, 32, 30),
    ('JP', 'Япония', 88, 90, 10, 85, 35, 34)
ON CONFLICT (code) DO NOTHING;
