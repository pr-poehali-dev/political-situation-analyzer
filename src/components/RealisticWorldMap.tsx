import { useState } from 'react';
import { allCountries } from '@/data/countries';

type RealisticWorldMapProps = {
  selectedCountry: string;
  onCountrySelect: (code: string) => void;
  countriesData: Array<{ code: string; democracyScore: number }>;
};

const RealisticWorldMap = ({ selectedCountry, onCountrySelect, countriesData }: RealisticWorldMapProps) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const getColorByScore = (score: number) => {
    if (score >= 70) return '#22c55e';
    if (score >= 40) return '#eab308';
    return '#ef4444';
  };

  const countryPaths: Record<string, string> = {
    RU: 'M 500,100 L 700,100 L 700,200 L 500,200 Z',
    US: 'M 100,200 L 250,200 L 250,300 L 100,300 Z',
    CN: 'M 600,250 L 700,250 L 700,350 L 600,350 Z',
    DE: 'M 420,180 L 450,180 L 450,210 L 420,210 Z',
    GB: 'M 380,160 L 410,160 L 410,190 L 380,190 Z',
    FR: 'M 390,210 L 420,210 L 420,240 L 390,240 Z',
    IT: 'M 430,230 L 460,230 L 460,280 L 430,280 Z',
    ES: 'M 360,240 L 390,240 L 390,270 L 360,270 Z',
    CA: 'M 100,100 L 250,100 L 250,180 L 100,180 Z',
    BR: 'M 280,350 L 360,350 L 360,450 L 280,450 Z',
    JP: 'M 730,260 L 760,260 L 760,320 L 730,320 Z',
    IN: 'M 570,280 L 620,280 L 620,350 L 570,350 Z',
    AU: 'M 650,450 L 750,450 L 750,520 L 650,520 Z',
    NO: 'M 430,120 L 460,120 L 460,160 L 430,160 Z',
    SE: 'M 440,130 L 470,130 L 470,170 L 440,170 Z',
    BY: 'M 480,170 L 510,170 L 510,190 L 480,190 Z',
  };

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-b from-blue-950/30 to-blue-900/20 rounded-lg overflow-hidden border-2">
      <svg viewBox="0 0 800 600" className="w-full h-full">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.2"/>
          </pattern>
          <radialGradient id="mapGlow">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1"/>
            <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0"/>
          </radialGradient>
        </defs>

        <rect width="800" height="600" fill="url(#grid)" />

        {Object.entries(countryPaths).map(([code, path]) => {
          const countryData = countriesData.find((c) => c.code === code);
          const score = countryData?.democracyScore || 50;
          const isSelected = selectedCountry === code;
          const isHovered = hoveredCountry === code;
          const country = allCountries.find(c => c.code === code);

          return (
            <g key={code}>
              <path
                d={path}
                fill={getColorByScore(score)}
                stroke={isSelected ? 'hsl(var(--secondary))' : 'hsl(var(--border))'}
                strokeWidth={isSelected ? 3 : 1}
                opacity={isSelected ? 0.9 : isHovered ? 0.8 : 0.6}
                className="cursor-pointer transition-all duration-300"
                style={{
                  filter: isSelected ? 'drop-shadow(0 0 12px hsl(var(--secondary)))' : 'none',
                }}
                onClick={() => onCountrySelect(code)}
                onMouseEnter={() => setHoveredCountry(code)}
                onMouseLeave={() => setHoveredCountry(null)}
              />
              {(isSelected || isHovered) && (
                <text
                  x={parseInt(path.split(' ')[1]) + 15}
                  y={parseInt(path.split(' ')[2]) - 10}
                  fill="hsl(var(--foreground))"
                  fontSize="14"
                  fontWeight="600"
                  className="pointer-events-none drop-shadow-lg"
                >
                  {country?.name}
                </text>
              )}
            </g>
          );
        })}

        <g transform="translate(30, 520)">
          <circle cx="0" cy="0" r="8" fill="#22c55e" />
          <text x="15" y="5" fill="hsl(var(--muted-foreground))" fontSize="12">
            Высокая демократия (70+)
          </text>

          <circle cx="180" cy="0" r="8" fill="#eab308" />
          <text x="195" y="5" fill="hsl(var(--muted-foreground))" fontSize="12">
            Средний уровень (40-70)
          </text>

          <circle cx="360" cy="0" r="8" fill="#ef4444" />
          <text x="375" y="5" fill="hsl(var(--muted-foreground))" fontSize="12">
            Низкая демократия (&lt;40)
          </text>
        </g>
      </svg>

      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm border rounded-lg p-3 max-w-[200px]">
        <p className="text-xs text-muted-foreground">
          💡 Нажмите на страну для анализа
        </p>
      </div>
    </div>
  );
};

export default RealisticWorldMap;
