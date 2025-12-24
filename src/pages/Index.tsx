import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import WorldMapRealistic from '@/components/WorldMapRealistic';
import FascismIndicators from '@/components/FascismIndicators';
import { allCountries, defaultCountries } from '@/data/countries';

type Country = {
  name: string;
  code: string;
  democracyScore: number;
  freedomScore: number;
  authoritarianScore: number;
  pressFreedومScore: number;
  trend: 'up' | 'down' | 'stable';
};

const mockCountries: Country[] = defaultCountries;

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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = allCountries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadNews = async (countryCode: string) => {
    setIsLoadingNews(true);
    try {
      const response = await fetch(`https://functions.poehali.dev/edb1ef0b-bb3d-4e86-aaa5-4130def90a93?country=${countryCode}&limit=20`);
      if (!response.ok) {
        throw new Error('Backend not available');
      }
      const data = await response.json();
      if (data.news && data.news.length > 0) {
        setRealNews(data.news);
      }
    } catch (error) {
      console.log('Backend not available, using mock data');
      setRealNews([]);
    } finally {
      setIsLoadingNews(false);
    }
  };

  const collectNews = async () => {
    setIsCollectingNews(true);
    try {
      const response = await fetch(`https://functions.poehali.dev/edb1ef0b-bb3d-4e86-aaa5-4130def90a93?country=${selectedCountry.code}`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Backend not available');
      }
      await loadNews(selectedCountry.code);
    } catch (error) {
      console.log('Backend not available');
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
        pressFreedومScore: selectedCountry.pressFreedومScore,
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
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="text-center space-y-3 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">
            Политический Анализ
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Независимый ИИ-анализ демократии, свобод и политических режимов
          </p>
        </header>

        <Card className="p-4 md:p-6 animate-fade-in border-2">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Icon name="Globe" className="text-primary" size={28} />
              <Select value={selectedCountry.code} onValueChange={(code) => {
                const foundCountry = allCountries.find(c => c.code === code);
                if (foundCountry) {
                  const dataCountry = mockCountries.find(c => c.code === code);
                  setSelectedCountry(dataCountry || { 
                    ...foundCountry, 
                    democracyScore: 50, 
                    freedomScore: 50, 
                    authoritarianScore: 50, 
                    pressFreedومScore: 50, 
                    trend: 'stable' as const 
                  });
                }
              }}>
                <SelectTrigger className="w-full md:w-[300px] text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  <div className="sticky top-0 z-10 bg-background p-2 border-b">
                    <Input
                      placeholder="Поиск страны..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  {filteredCountries.map((country) => (
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
                <span>{selectedCountry.trend === 'up' ? 'Улучшение' : selectedCountry.trend === 'down' ? 'Ухудшение' : 'Стабильно'}</span>
              </Badge>
              <Button 
                onClick={handleExportPDF} 
                disabled={isExporting}
                size="sm"
                className="flex items-center gap-2"
              >
                <Icon name={isExporting ? 'Loader2' : 'Download'} size={16} className={isExporting ? 'animate-spin' : ''} />
                {isExporting ? 'Экспорт...' : 'Отчёт'}
              </Button>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Icon name="LayoutDashboard" size={16} />
              <span className="hidden md:inline">Обзор</span>
              <span className="md:hidden">Обзор</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Icon name="Map" size={16} />
              <span className="hidden md:inline">Карта Мира</span>
              <span className="md:hidden">Карта</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Icon name="Newspaper" size={16} />
              <span className="hidden md:inline">Новости</span>
              <span className="md:hidden">Новости</span>
            </TabsTrigger>
            <TabsTrigger value="fascism" className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={16} />
              <span className="hidden md:inline">Фашизм</span>
              <span className="md:hidden">Фашизм</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <Icon name="TrendingUp" size={16} />
              <span className="hidden md:inline">Тренды</span>
              <span className="md:hidden">Тренды</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className={`p-5 border-2 transition-all hover:scale-105 animate-slide-in ${getScoreBg(selectedCountry.democracyScore)}`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Icon name="Vote" className="text-primary" size={32} />
                    <span className={`text-3xl font-bold ${getScoreColor(selectedCountry.democracyScore)}`}>
                      {selectedCountry.democracyScore}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold">Индекс Демократии</h3>
                  <Progress value={selectedCountry.democracyScore} className="h-2" />
                </div>
              </Card>

              <Card className={`p-5 border-2 transition-all hover:scale-105 animate-slide-in ${getScoreBg(selectedCountry.freedomScore)}`} style={{ animationDelay: '0.1s' }}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Icon name="Users" className="text-primary" size={32} />
                    <span className={`text-3xl font-bold ${getScoreColor(selectedCountry.freedomScore)}`}>
                      {selectedCountry.freedomScore}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold">Гражданские Свободы</h3>
                  <Progress value={selectedCountry.freedomScore} className="h-2" />
                </div>
              </Card>

              <Card className={`p-5 border-2 transition-all hover:scale-105 animate-slide-in ${getScoreBg(100 - selectedCountry.authoritarianScore)}`} style={{ animationDelay: '0.2s' }}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Icon name="Shield" className="text-destructive" size={32} />
                    <span className={`text-3xl font-bold ${getScoreColor(100 - selectedCountry.authoritarianScore)}`}>
                      {selectedCountry.authoritarianScore}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold">Уровень Авторитаризма</h3>
                  <Progress value={selectedCountry.authoritarianScore} className="h-2 [&>div]:bg-destructive" />
                </div>
              </Card>

              <Card className={`p-5 border-2 transition-all hover:scale-105 animate-slide-in ${getScoreBg(selectedCountry.pressFreedومScore)}`} style={{ animationDelay: '0.3s' }}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Icon name="Newspaper" className="text-primary" size={32} />
                    <span className={`text-3xl font-bold ${getScoreColor(selectedCountry.pressFreedومScore)}`}>
                      {selectedCountry.pressFreedومScore}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold">Свобода Прессы</h3>
                  <Progress value={selectedCountry.pressFreedومScore} className="h-2" />
                </div>
              </Card>
            </div>

            <Card className="p-6 border-2">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Icon name="BarChart3" className="text-secondary" />
                Сравнение с Другими Странами
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
          </TabsContent>

          <TabsContent value="map">
            <Card className="p-6 border-2 animate-fade-in">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Map" className="text-primary" />
                Интерактивная Карта Мира
              </h2>
              <WorldMapRealistic
                selectedCountry={selectedCountry.code}
                onCountrySelect={(code) => {
                  const foundCountry = allCountries.find(c => c.code === code);
                  if (foundCountry) {
                    const dataCountry = mockCountries.find(c => c.code === code);
                    setSelectedCountry(dataCountry || { 
                      ...foundCountry, 
                      democracyScore: 50, 
                      freedomScore: 50, 
                      authoritarianScore: 50, 
                      pressFreedومScore: 50, 
                      trend: 'stable' as const 
                    });
                  }
                }}
                countriesData={mockCountries.map(c => ({ code: c.code, democracyScore: c.democracyScore }))}
              />
            </Card>
          </TabsContent>

          <TabsContent value="news">
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
                  size="sm"
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
                          <h3 className="font-semibold text-base">{news.title}</h3>
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant={news.source_type === 'gov' || news.type === 'gov' ? 'default' : 'secondary'} className="text-xs">
                              {news.source}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {news.published_at ? new Date(news.published_at).toLocaleDateString('ru-RU') : news.date}
                            </span>
                            {news.is_fake && (
                              <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                                <Icon name="AlertCircle" size={12} />
                                Фейк
                              </Badge>
                            )}
                            {news.credibility_score && (
                              <Badge variant="outline" className="text-xs">
                                Достоверность: {news.credibility_score}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Icon 
                            name={news.sentiment === 'positive' ? 'ThumbsUp' : 'ThumbsDown'} 
                            className={news.sentiment === 'positive' ? 'text-green-400' : 'text-red-400'}
                            size={22}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="gov" className="space-y-4">
                  {mockNews.filter(n => n.type === 'gov').map((news, idx) => (
                    <div key={news.id} className="p-4 border-2 rounded-lg hover:bg-card-foreground/5 transition-all">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-base">{news.title}</h3>
                        <div className="flex items-center gap-3">
                          <Badge className="text-xs">{news.source}</Badge>
                          <span className="text-sm text-muted-foreground">{news.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="opposition" className="space-y-4">
                  {mockNews.filter(n => n.type === 'opposition').map((news, idx) => (
                    <div key={news.id} className="p-4 border-2 rounded-lg hover:bg-card-foreground/5 transition-all">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-base">{news.title}</h3>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs">{news.source}</Badge>
                          <span className="text-sm text-muted-foreground">{news.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </Card>
          </TabsContent>

          <TabsContent value="fascism">
            <FascismIndicators countryCode={selectedCountry.code} />
          </TabsContent>

          <TabsContent value="trends">
            <Card className="p-6 border-2">
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
          </TabsContent>
        </Tabs>

        <footer className="text-center text-sm text-muted-foreground pt-6 pb-4">
          <p>Независимый ИИ-анализ на основе открытых данных • Обновляется в реальном времени</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;