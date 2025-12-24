import { useState } from 'react';

type WorldMapProps = {
  selectedCountry: string;
  onCountrySelect: (code: string) => void;
  countriesData: Array<{ code: string; democracyScore: number }>;
};

const WorldMap = ({ selectedCountry, onCountrySelect, countriesData }: WorldMapProps) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const getColorByScore = (score: number) => {
    if (score >= 70) return '#22c55e';
    if (score >= 40) return '#eab308';
    return '#ef4444';
  };

  const countries = [
    { code: 'RU', name: 'Россия', x: 65, y: 25, width: 20 },
    { code: 'US', name: 'США', x: 15, y: 30, width: 12 },
    { code: 'CN', name: 'Китай', x: 70, y: 35, width: 12 },
    { code: 'DE', name: 'Германия', x: 48, y: 28, width: 4 },
    { code: 'NO', name: 'Норвегия', x: 48, y: 20, width: 4 },
    { code: 'BY', name: 'Беларусь', x: 52, y: 26, width: 3 },
    { code: 'FR', name: 'Франция', x: 46, y: 32, width: 4 },
    { code: 'JP', name: 'Япония', x: 82, y: 35, width: 5 },
  ];

  return (
    <div className="relative w-full h-[400px] bg-card-foreground/5 rounded-lg overflow-hidden">
      <svg viewBox="0 0 100 60" className="w-full h-full">
        <defs>
          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--background))" />
            <stop offset="100%" stopColor="hsl(var(--card))" />
          </linearGradient>
        </defs>

        <rect width="100" height="60" fill="url(#oceanGradient)" />

        {countries.map((country) => {
          const countryData = countriesData.find((c) => c.code === country.code);
          const score = countryData?.democracyScore || 50;
          const isSelected = selectedCountry === country.code;
          const isHovered = hoveredCountry === country.code;

          return (
            <g key={country.code}>
              <ellipse
                cx={country.x}
                cy={country.y}
                rx={country.width / 2}
                ry={country.width / 3}
                fill={getColorByScore(score)}
                opacity={isSelected ? 1 : isHovered ? 0.8 : 0.6}
                stroke={isSelected ? '#8b5cf6' : 'transparent'}
                strokeWidth={isSelected ? 0.5 : 0}
                className="cursor-pointer transition-all duration-300"
                style={{
                  filter: isSelected ? 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))' : 'none',
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                  transformOrigin: `${country.x}% ${country.y}%`,
                }}
                onClick={() => onCountrySelect(country.code)}
                onMouseEnter={() => setHoveredCountry(country.code)}
                onMouseLeave={() => setHoveredCountry(null)}
              />
              {(isSelected || isHovered) && (
                <text
                  x={country.x}
                  y={country.y - country.width / 3 - 2}
                  textAnchor="middle"
                  fill="hsl(var(--foreground))"
                  fontSize="2.5"
                  fontWeight="600"
                  className="pointer-events-none"
                >
                  {country.name}
                </text>
              )}
            </g>
          );
        })}

        <circle cx="10" cy="55" r="1.5" fill="#22c55e" />
        <text x="13" y="56" fill="hsl(var(--muted-foreground))" fontSize="2">
          Высокая демократия
        </text>

        <circle cx="40" cy="55" r="1.5" fill="#eab308" />
        <text x="43" y="56" fill="hsl(var(--muted-foreground))" fontSize="2">
          Средний уровень
        </text>

        <circle cx="70" cy="55" r="1.5" fill="#ef4444" />
        <text x="73" y="56" fill="hsl(var(--muted-foreground))" fontSize="2">
          Низкая демократия
        </text>
      </svg>
    </div>
  );
};

export default WorldMap;
