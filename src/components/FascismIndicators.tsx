import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type FascismIndicatorsProps = {
  countryCode: string;
};

const brittIndicators = [
  { id: 1, name: 'Мощный национализм', description: 'Использование патриотических лозунгов, символов, песен' },
  { id: 2, name: 'Пренебрежение правами человека', description: 'Оправдание нарушений прав ради безопасности' },
  { id: 3, name: 'Определение врагов/козлов отпущения', description: 'Единство через создание образа врага' },
  { id: 4, name: 'Превосходство военных', description: 'Милитаризация общества, большие военные бюджеты' },
  { id: 5, name: 'Сексизм', description: 'Ограничение прав женщин, традиционные гендерные роли' },
  { id: 6, name: 'Контроль СМИ', description: 'Цензура, пропаганда, государственные медиа' },
  { id: 7, name: 'Одержимость нацбезопасностью', description: 'Страх перед внешними угрозами' },
  { id: 8, name: 'Религия и правительство', description: 'Использование религии для манипуляции' },
  { id: 9, name: 'Защита корпоративных интересов', description: 'Слияние бизнеса и власти' },
  { id: 10, name: 'Подавление рабочего движения', description: 'Запрет профсоюзов, протестов' },
  { id: 11, name: 'Пренебрежение к интеллектуалам', description: 'Антиинтеллектуализм, нападки на науку' },
  { id: 12, name: 'Одержимость преступностью', description: 'Жёсткие законы, полицейское государство' },
  { id: 13, name: 'Кумовство и коррупция', description: 'Назначение лояльных, безнаказанность элиты' },
  { id: 14, name: 'Фальсификация выборов', description: 'Манипуляции с голосованием' },
];

const ecoIndicators = [
  { id: 1, name: 'Культ традиции', description: 'Апелляция к древним ценностям' },
  { id: 2, name: 'Отрицание модернизма', description: 'Рационализм как источник зла' },
  { id: 3, name: 'Культ действия', description: 'Действие ради действия, недоверие к интеллекту' },
  { id: 4, name: 'Несогласие - предательство', description: 'Критическое мышление как измена' },
  { id: 5, name: 'Страх перед различием', description: 'Ксенофобия, расизм' },
  { id: 6, name: 'Апелляция к фрустрированным', description: 'Обращение к среднему классу' },
  { id: 7, name: 'Одержимость заговорами', description: 'Враги внутри и снаружи' },
  { id: 8, name: 'Враги одновременно сильны и слабы', description: 'Противоречивый образ врага' },
  { id: 9, name: 'Жизнь - постоянная борьба', description: 'Пацифизм как предательство' },
  { id: 10, name: 'Элитизм', description: 'Презрение к слабым' },
  { id: 11, name: 'Культ героической смерти', description: 'Героизация жертвенности' },
  { id: 12, name: 'Мачизм и оружие', description: 'Культ мужественности, милитаризм' },
  { id: 13, name: 'Селективный популизм', description: 'Народ един, вождь его выразитель' },
  { id: 14, name: 'Новояз', description: 'Упрощённый язык для ограничения мысли' },
];

const mockScores: Record<string, { britt: number[]; eco: number[] }> = {
  RU: {
    britt: [85, 75, 90, 80, 60, 95, 85, 70, 80, 85, 75, 80, 90, 70],
    eco: [80, 70, 85, 90, 75, 80, 95, 85, 90, 75, 70, 80, 90, 85],
  },
  CN: {
    britt: [90, 80, 85, 75, 55, 98, 90, 60, 85, 90, 70, 85, 88, 75],
    eco: [75, 65, 80, 95, 70, 75, 90, 80, 85, 70, 65, 75, 95, 90],
  },
  BY: {
    britt: [88, 85, 92, 70, 65, 97, 88, 75, 82, 90, 78, 85, 93, 80],
    eco: [82, 75, 88, 93, 80, 85, 93, 88, 92, 78, 75, 82, 93, 88],
  },
  US: {
    britt: [60, 40, 55, 65, 45, 35, 70, 50, 70, 40, 35, 65, 60, 45],
    eco: [50, 40, 45, 40, 55, 50, 60, 50, 55, 45, 40, 55, 50, 40],
  },
  DE: {
    britt: [30, 20, 25, 20, 15, 25, 35, 20, 40, 15, 20, 30, 35, 20],
    eco: [25, 20, 30, 20, 20, 25, 30, 25, 25, 20, 18, 25, 25, 28],
  },
  NO: {
    britt: [20, 15, 18, 15, 10, 20, 25, 15, 35, 10, 15, 25, 28, 15],
    eco: [18, 15, 22, 15, 15, 20, 22, 20, 20, 15, 12, 20, 20, 22],
  },
  FR: {
    britt: [35, 25, 30, 25, 20, 28, 40, 25, 45, 20, 22, 35, 40, 25],
    eco: [30, 25, 32, 25, 25, 28, 35, 28, 30, 22, 20, 28, 28, 30],
  },
  JP: {
    britt: [45, 25, 35, 50, 40, 30, 35, 35, 55, 30, 25, 30, 40, 28],
    eco: [40, 30, 38, 30, 30, 35, 38, 35, 40, 28, 30, 35, 35, 35],
  },
};

const FascismIndicators = ({ countryCode }: FascismIndicatorsProps) => {
  const scores = mockScores[countryCode] || mockScores['US'];
  
  const brittAverage = Math.round(scores.britt.reduce((a, b) => a + b, 0) / scores.britt.length);
  const ecoAverage = Math.round(scores.eco.reduce((a, b) => a + b, 0) / scores.eco.length);
  const totalFascismScore = Math.round((brittAverage + ecoAverage) / 2);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Критический';
    if (score >= 60) return 'Высокий';
    if (score >= 40) return 'Средний';
    return 'Низкий';
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-2 bg-gradient-to-br from-red-500/10 to-orange-500/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Icon name="AlertTriangle" className="text-destructive" />
            Индекс Фашизма
          </h2>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(totalFascismScore)}`}>
              {totalFascismScore}
            </div>
            <div className="text-sm text-muted-foreground">
              {getScoreLabel(totalFascismScore)} уровень
            </div>
          </div>
        </div>
        <Progress value={totalFascismScore} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-red-500" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Icon name="List" className="text-destructive" size={24} />
                14 признаков фашизма (Лоуренс Бритт)
              </h3>
              <div className={`text-2xl font-bold ${getScoreColor(brittAverage)}`}>
                {brittAverage}
              </div>
            </div>
            <Progress value={brittAverage} className="h-2 [&>div]:bg-red-500" />
            
            <Accordion type="single" collapsible className="space-y-2">
              {brittIndicators.map((indicator, idx) => (
                <AccordionItem key={indicator.id} value={`britt-${indicator.id}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="text-sm font-medium text-left">{indicator.name}</span>
                      <span className={`text-sm font-bold ${getScoreColor(scores.britt[idx])}`}>
                        {scores.britt[idx]}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      <p className="text-sm text-muted-foreground">{indicator.description}</p>
                      <Progress value={scores.britt[idx]} className="h-1.5 [&>div]:bg-red-500" />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Card>

        <Card className="p-6 border-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Icon name="BookOpen" className="text-destructive" size={24} />
                Ур-фашизм (Умберто Эко)
              </h3>
              <div className={`text-2xl font-bold ${getScoreColor(ecoAverage)}`}>
                {ecoAverage}
              </div>
            </div>
            <Progress value={ecoAverage} className="h-2 [&>div]:bg-orange-500" />
            
            <Accordion type="single" collapsible className="space-y-2">
              {ecoIndicators.map((indicator, idx) => (
                <AccordionItem key={indicator.id} value={`eco-${indicator.id}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="text-sm font-medium text-left">{indicator.name}</span>
                      <span className={`text-sm font-bold ${getScoreColor(scores.eco[idx])}`}>
                        {scores.eco[idx]}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      <p className="text-sm text-muted-foreground">{indicator.description}</p>
                      <Progress value={scores.eco[idx]} className="h-1.5 [&>div]:bg-orange-500" />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FascismIndicators;
