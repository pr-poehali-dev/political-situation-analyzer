import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import WorldMap from '@/components/WorldMap';
import FascismIndicators from '@/components/FascismIndicators';

type Country = {
  name: string;
  code: string;
  democracyScore: number;
  freedomScore: number;
  authoritarianScore: number;
  pressFreedомScore: number;
  trend: 'up' | 'down' | 'stable';
};

const mockCountries: Country[] = [
  { name: 'Россия', code: 'RU', democracyScore: 35, freedomScore: 28, authoritarianScore: 72, pressFreedомScore: 20, trend: 'down' },
  { name: 'США', code: 'US', democracyScore: 78, freedomScore: 82, authoritarianScore: 22, pressFreedомScore: 75, trend: 'stable' },
  { name: 'Германия', code: 'DE', democracyScore: 85, freedomScore: 88, authoritarianScore: 12, pressFreedомScore: 82, trend: 'up' },
  { name: 'Китай', code: 'CN', democracyScore: 25, freedomScore: 18, authoritarianScore: 82, pressFreedомScore: 10, trend: 'down' },
  { name: 'Норвегия', code: 'NO', democracyScore: 95, freedomScore: 97, authoritarianScore: 5, pressFreedомScore: 95, trend: 'stable' },
  { name: 'Беларусь', code: 'BY', democracyScore: 22, freedomScore: 15, authoritarianScore: 85, pressFreedомScore: 12, trend: 'down' },
  { name: 'Франция', code: 'FR', democracyScore: 82, freedomScore: 85, authoritarianScore: 15, pressFreedомScore: 78, trend: 'stable' },
  { name: 'Япония', code: 'JP', democracyScore: 88, freedomScore: 90, authoritarianScore: 10, pressFreedомScore: 85, trend: 'up' },
];

const mockNews = [
  {
    id: 1,
    title: 'Новый законопроект о свободе СМИ принят парламентом',
    source: 'Государственный источник',
    type: 'gov',
    sentiment: 'positive',
    date: '2025-12-23',
  },
  {
    id: 2,
    title: 'Оппозиция заявляет о нарушениях избирательного процесса',
    source: 'Независимый медиа',
    type: 'opposition',
    sentiment: 'negative',
    date: '2025-12-22',
  },
  {
    id: 3,
    title: 'Экономические реформы показывают положительную динамику',
    source: 'Государственный источник',
    type: 'gov',
    sentiment: 'positive',
    date: '2025-12-21',
  },
  {
    id: 4,
    title: 'Правозащитники обеспокоены новым законом о протестах',
    source: 'Международная организация',
    type: 'opposition',
    sentiment: 'negative',
    date: '2025-12-20',
  },
];

const Index = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(mockCountries[0]);
  const [chartPeriod, setChartPeriod] = useState('6m');
  const [isExporting, setIsExporting] = useState(false);
  const [realNews, setRealNews] = useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [isCollectingNews, setIsCollectingNews] = useState(false);

  useEffect(() => {
    loadNews(selectedCountry.code);
  }, [selectedCountry.code]);

  const loadNews = async (countryCode: string) => {
    setIsLoadingNews(true);
    try {
      const response = await fetch(`/backend/news-collector?country=${countryCode}&limit=20`);
      const data = await response.json();
      if (data.news && data.news.length > 0) {
        setRealNews(data.news);
      }
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setIsLoadingNews(false);
    }
  };

  const collectNews = async () => {
    setIsCollectingNews(true);
    try {
      await fetch(`/backend/news-collector?country=${selectedCountry.code}`, {
        method: 'POST'
      });
      await loadNews(selectedCountry.code);
    } catch (error) {
      console.error('Error collecting news:', error);
    } finally {
      setIsCollectingNews(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    setTimeout(() => {
      const element = document.createElement('a');
      const reportData = {
        country: selectedCountry.name,
        date: new Date().toLocaleDateString('ru-RU'),
        democracyScore: selectedCountry.democracyScore,
        freedomScore: selectedCountry.freedomScore,
        authoritarianScore: selectedCountry.authoritarianScore,
        pressFreedомScore: selectedCountry.pressFreedомScore,
      };
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      element.href = url;
      element.download = `political-report-${selectedCountry.code}-${Date.now()}.json`;
      element.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 1000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-500/20 border-green-500/50';
    if (score >= 40) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-gradient">
            Политический Анализ
          </h1>
          <p className="text-muted-foreground text-lg">
            Независимый ИИ-анализ демократии, свобод и политических режимов
          </p>
        </header>

        <Card className="p-6 animate-fade-in border-2">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Icon name="Globe" className="text-primary" size={28} />
              <Select value={selectedCountry.code} onValueChange={(code) => {
                const country = mockCountries.find(c => c.code === code);
                if (country) setSelectedCountry(country);
              }}>
                <SelectTrigger className="w-full md:w-[300px] text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockCountries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-2">
                <Icon 
                  name={selectedCountry.trend === 'up' ? 'TrendingUp' : selectedCountry.trend === 'down' ? 'TrendingDown' : 'Minus'} 
                  size={16}
                  className={selectedCountry.trend === 'up' ? 'text-green-400' : selectedCountry.trend === 'down' ? 'text-red-400' : 'text-yellow-400'}
                />
                <span>Тренд: {selectedCountry.trend === 'up' ? 'Улучшение' : selectedCountry.trend === 'down' ? 'Ухудшение' : 'Стабильно'}</span>
              </Badge>
              <Button 
                onClick={handleExportPDF} 
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                <Icon name={isExporting ? 'Loader2' : 'Download'} size={18} className={isExporting ? 'animate-spin' : ''} />
                {isExporting ? 'Экспорт...' : 'Скачать отчёт'}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 animate-fade-in">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Map" className="text-primary" />
            Интерактивная Карта Мира
          </h2>
          <WorldMap
            selectedCountry={selectedCountry.code}
            onCountrySelect={(code) => {
              const country = mockCountries.find(c => c.code === code);
              if (country) setSelectedCountry(country);
            }}
            countriesData={mockCountries.map(c => ({ code: c.code, democracyScore: c.democracyScore }))}
          />
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className={`p-6 border-2 transition-all hover:scale-105 animate-slide-in ${getScoreBg(selectedCountry.democracyScore)}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Icon name="Vote" className="text-primary" size={32} />
                <span className={`text-3xl font-bold ${getScoreColor(selectedCountry.democracyScore)}`}>
                  {selectedCountry.democracyScore}
                </span>
              </div>
              <h3 className="text-lg font-semibold">Индекс Демократии</h3>
              <Progress value={selectedCountry.democracyScore} className="h-2" />
            </div>
          </Card>

          <Card className={`p-6 border-2 transition-all hover:scale-105 animate-slide-in ${getScoreBg(selectedCountry.freedomScore)}`} style={{ animationDelay: '0.1s' }}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Icon name="Users" className="text-primary" size={32} />
                <span className={`text-3xl font-bold ${getScoreColor(selectedCountry.freedomScore)}`}>
                  {selectedCountry.freedomScore}
                </span>
              </div>
              <h3 className="text-lg font-semibold">Гражданские Свободы</h3>
              <Progress value={selectedCountry.freedomScore} className="h-2" />
            </div>
          </Card>

          <Card className={`p-6 border-2 transition-all hover:scale-105 animate-slide-in ${getScoreBg(100 - selectedCountry.authoritarianScore)}`} style={{ animationDelay: '0.2s' }}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Icon name="Shield" className="text-destructive" size={32} />
                <span className={`text-3xl font-bold ${getScoreColor(100 - selectedCountry.authoritarianScore)}`}>
                  {selectedCountry.authoritarianScore}
                </span>
              </div>
              <h3 className="text-lg font-semibold">Уровень Авторитаризма</h3>
              <Progress value={selectedCountry.authoritarianScore} className="h-2 [&>div]:bg-destructive" />
            </div>
          </Card>

          <Card className={`p-6 border-2 transition-all hover:scale-105 animate-slide-in ${getScoreBg(selectedCountry.pressFreedомScore)}`} style={{ animationDelay: '0.3s' }}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Icon name="Newspaper" className="text-primary" size={32} />
                <span className={`text-3xl font-bold ${getScoreColor(selectedCountry.pressFreedомScore)}`}>
                  {selectedCountry.pressFreedомScore}
                </span>
              </div>
              <h3 className="text-lg font-semibold">Свобода Прессы</h3>
              <Progress value={selectedCountry.pressFreedомScore} className="h-2" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 border-2">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Icon name="Activity" className="text-primary" />
                  Динамика Показателей
                </h2>
                <Select value={chartPeriod} onValueChange={setChartPeriod}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 месяц</SelectItem>
                    <SelectItem value="3m">3 месяца</SelectItem>
                    <SelectItem value="6m">6 месяцев</SelectItem>
                    <SelectItem value="1y">1 год</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="h-[300px] bg-card-foreground/5 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute inset-0 flex items-end justify-around p-8 gap-4">
                  {[75, 65, 58, 52, 45, 38, 35].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all hover:opacity-80"
                        style={{ height: `${value}%` }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Дек'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">+12</div>
                  <div className="text-sm text-muted-foreground">Стран улучшили</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">-28</div>
                  <div className="text-sm text-muted-foreground">Стран ухудшили</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">45</div>
                  <div className="text-sm text-muted-foreground">Без изменений</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Icon name="BarChart3" className="text-secondary" />
              Сравнение
            </h2>
            <div className="space-y-4">
              {mockCountries.slice(0, 5).map((country, idx) => (
                <div key={country.code} className="space-y-2 animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{country.name}</span>
                    <span className={getScoreColor(country.democracyScore)}>
                      {country.democracyScore}
                    </span>
                  </div>
                  <Progress value={country.democracyScore} className="h-1.5" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <FascismIndicators countryCode={selectedCountry.code} />

        <Card className="p-6 border-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Icon name="Newspaper" className="text-primary" />
              Анализ Новостей
            </h2>
            <Button 
              onClick={collectNews} 
              disabled={isCollectingNews}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Icon name={isCollectingNews ? 'Loader2' : 'RefreshCw'} size={16} className={isCollectingNews ? 'animate-spin' : ''} />
              {isCollectingNews ? 'Сбор...' : 'Собрать новости'}
            </Button>
          </div>
          
          {isLoadingNews ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={32} className="animate-spin text-primary" />
            </div>
          ) : null}
          
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full md:w-[400px] grid-cols-3">
              <TabsTrigger value="all">Все источники</TabsTrigger>
              <TabsTrigger value="gov">Государственные</TabsTrigger>
              <TabsTrigger value="opposition">Оппозиционные</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {(realNews.length > 0 ? realNews : mockNews).map((news, idx) => (
                <div key={news.id} className="p-4 border-2 rounded-lg hover:bg-card-foreground/5 transition-all animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="flex flex-col md:flex-row justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <h3 className="font-semibold text-lg">{news.title}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant={news.source_type === 'gov' || news.type === 'gov' ? 'default' : 'secondary'}>
                          {news.source}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {news.published_at ? new Date(news.published_at).toLocaleDateString('ru-RU') : news.date}
                        </span>
                        {news.is_fake && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Icon name="AlertCircle" size={14} />
                            Фейк
                          </Badge>
                        )}
                        {news.credibility_score && (
                          <Badge variant="outline">
                            Достоверность: {news.credibility_score}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Icon 
                        name={news.sentiment === 'positive' ? 'ThumbsUp' : 'ThumbsDown'} 
                        className={news.sentiment === 'positive' ? 'text-green-400' : 'text-red-400'}
                        size={24}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="gov" className="space-y-4">
              {mockNews.filter(n => n.type === 'gov').map((news, idx) => (
                <div key={news.id} className="p-4 border-2 rounded-lg hover:bg-card-foreground/5 transition-all animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="flex flex-col md:flex-row justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <h3 className="font-semibold text-lg">{news.title}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge>{news.source}</Badge>
                        <span className="text-sm text-muted-foreground">{news.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Icon 
                        name={news.sentiment === 'positive' ? 'ThumbsUp' : 'ThumbsDown'} 
                        className={news.sentiment === 'positive' ? 'text-green-400' : 'text-red-400'}
                        size={24}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="opposition" className="space-y-4">
              {mockNews.filter(n => n.type === 'opposition').map((news, idx) => (
                <div key={news.id} className="p-4 border-2 rounded-lg hover:bg-card-foreground/5 transition-all animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="flex flex-col md:flex-row justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <h3 className="font-semibold text-lg">{news.title}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="secondary">{news.source}</Badge>
                        <span className="text-sm text-muted-foreground">{news.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Icon 
                        name={news.sentiment === 'positive' ? 'ThumbsUp' : 'ThumbsDown'} 
                        className={news.sentiment === 'positive' ? 'text-green-400' : 'text-red-400'}
                        size={24}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </Card>

        <footer className="text-center text-sm text-muted-foreground pt-8 pb-4">
          <p>Независимый ИИ-анализ на основе открытых данных • Обновляется в реальном времени</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;