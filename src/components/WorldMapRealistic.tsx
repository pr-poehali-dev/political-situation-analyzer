import { useState } from 'react';
import { allCountries } from '@/data/countries';

type WorldMapRealisticProps = {
  selectedCountry: string;
  onCountrySelect: (code: string) => void;
  countriesData: Array<{ code: string; democracyScore: number }>;
};

const WorldMapRealistic = ({ selectedCountry, onCountrySelect, countriesData }: WorldMapRealisticProps) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const getColorByScore = (score: number) => {
    if (score >= 70) return '#22c55e';
    if (score >= 40) return '#eab308';
    return '#ef4444';
  };

  const countryPaths: Record<string, { path: string; label: { x: number; y: number } }> = {
    // Северная Америка
    US: { path: 'M 80,140 L 85,135 L 95,130 L 110,125 L 125,120 L 145,118 L 165,120 L 180,125 L 190,132 L 195,140 L 198,150 L 198,165 L 195,180 L 190,190 L 180,198 L 165,203 L 145,205 L 125,203 L 110,198 L 95,190 L 85,180 L 80,165 Z', label: { x: 130, y: 160 } },
    CA: { path: 'M 70,80 L 90,75 L 115,72 L 140,70 L 165,72 L 185,75 L 200,82 L 210,95 L 215,110 L 210,120 L 195,115 L 180,112 L 165,110 L 145,108 L 125,108 L 110,110 L 95,112 L 80,115 L 70,110 L 65,95 Z', label: { x: 140, y: 95 } },
    MX: { path: 'M 85,205 L 95,200 L 110,198 L 125,197 L 140,198 L 152,202 L 160,210 L 165,220 L 162,230 L 155,235 L 145,237 L 132,238 L 118,237 L 105,233 L 95,225 L 88,215 Z', label: { x: 125, y: 218 } },
    
    // Южная Америка
    BR: { path: 'M 220,260 L 235,255 L 250,253 L 265,255 L 278,260 L 288,270 L 295,285 L 298,305 L 295,325 L 288,340 L 275,350 L 258,355 L 240,357 L 222,353 L 208,345 L 200,330 L 197,310 L 200,290 L 208,275 Z', label: { x: 250, y: 305 } },
    AR: { path: 'M 205,360 L 215,358 L 230,357 L 242,360 L 250,368 L 255,380 L 258,400 L 257,420 L 253,438 L 245,450 L 235,456 L 222,458 L 210,455 L 202,445 L 198,425 L 197,405 L 200,385 L 203,370 Z', label: { x: 228, y: 408 } },
    CL: { path: 'M 195,360 L 200,355 L 205,358 L 207,370 L 208,390 L 207,410 L 205,430 L 202,450 L 198,465 L 193,472 L 188,468 L 190,448 L 192,428 L 193,408 L 193,388 L 193,370 Z', label: { x: 198, y: 415 } },
    CO: { path: 'M 190,245 L 200,242 L 212,240 L 224,242 L 232,248 L 237,258 L 235,268 L 228,275 L 218,278 L 206,277 L 196,272 L 190,262 L 188,252 Z', label: { x: 213, y: 260 } },
    PE: { path: 'M 185,280 L 195,277 L 207,276 L 218,278 L 226,285 L 230,295 L 230,310 L 225,323 L 217,330 L 205,332 L 193,330 L 185,322 L 182,310 L 183,295 Z', label: { x: 207, y: 304 } },
    VE: { path: 'M 210,235 L 222,233 L 235,232 L 247,235 L 255,242 L 258,252 L 253,260 L 243,263 L 230,263 L 218,260 L 210,252 L 208,242 Z', label: { x: 233, y: 248 } },
    
    // Европа
    RU: { path: 'M 480,75 L 510,72 L 545,70 L 580,72 L 615,75 L 645,80 L 670,88 L 690,98 L 705,110 L 715,125 L 720,142 L 718,160 L 710,175 L 695,185 L 675,190 L 650,192 L 620,190 L 590,185 L 560,180 L 530,175 L 505,168 L 485,158 L 472,145 L 465,130 L 463,115 L 468,100 L 475,87 Z', label: { x: 590, y: 130 } },
    DE: { path: 'M 445,145 L 455,143 L 465,142 L 475,144 L 483,150 L 487,158 L 485,168 L 478,175 L 468,178 L 457,177 L 447,173 L 442,165 L 440,155 Z', label: { x: 463, y: 160 } },
    FR: { path: 'M 430,160 L 440,158 L 450,157 L 460,159 L 468,165 L 472,173 L 470,183 L 463,190 L 453,193 L 442,192 L 432,188 L 427,180 L 425,170 Z', label: { x: 448, y: 175 } },
    GB: { path: 'M 415,130 L 423,128 L 432,127 L 440,129 L 446,135 L 448,143 L 445,152 L 438,157 L 428,158 L 418,155 L 412,148 L 410,139 Z', label: { x: 428, y: 143 } },
    IT: { path: 'M 450,175 L 458,173 L 467,173 L 474,178 L 478,186 L 478,197 L 475,208 L 468,217 L 458,222 L 448,220 L 442,212 L 440,202 L 442,192 L 447,183 Z', label: { x: 459, y: 198 } },
    ES: { path: 'M 410,180 L 422,178 L 435,177 L 447,180 L 455,188 L 457,198 L 452,207 L 442,210 L 428,210 L 416,207 L 408,198 L 406,188 Z', label: { x: 431, y: 194 } },
    PL: { path: 'M 465,130 L 475,128 L 485,128 L 494,131 L 500,138 L 501,147 L 497,155 L 489,159 L 479,160 L 469,158 L 462,151 L 460,142 Z', label: { x: 480, y: 144 } },
    UA: { path: 'M 488,148 L 500,146 L 513,146 L 525,149 L 534,156 L 538,165 L 535,174 L 526,179 L 513,180 L 500,178 L 490,173 L 485,165 L 484,156 Z', label: { x: 511, y: 163 } },
    BY: { path: 'M 475,118 L 485,116 L 496,116 L 506,119 L 513,126 L 515,135 L 511,143 L 502,147 L 491,148 L 480,145 L 473,138 L 471,129 Z', label: { x: 493, y: 132 } },
    NO: { path: 'M 445,85 L 455,82 L 467,80 L 478,83 L 486,90 L 490,100 L 488,110 L 481,117 L 470,120 L 458,118 L 448,112 L 443,102 L 442,93 Z', label: { x: 465, y: 100 } },
    SE: { path: 'M 462,90 L 472,87 L 484,86 L 495,89 L 503,96 L 507,106 L 505,116 L 498,123 L 487,126 L 475,124 L 465,118 L 460,108 L 459,98 Z', label: { x: 482, y: 106 } },
    FI: { path: 'M 480,80 L 492,77 L 505,76 L 517,79 L 526,87 L 530,97 L 527,107 L 518,113 L 505,115 L 492,112 L 482,105 L 477,95 L 476,85 Z', label: { x: 503, y: 96 } },
    TR: { path: 'M 485,195 L 497,193 L 510,193 L 523,196 L 533,203 L 538,212 L 535,221 L 525,226 L 511,227 L 497,225 L 487,219 L 482,210 L 481,201 Z', label: { x: 509, y: 210 } },
    GR: { path: 'M 465,200 L 473,198 L 482,198 L 490,202 L 495,209 L 495,217 L 490,224 L 481,227 L 471,226 L 463,221 L 460,213 L 461,205 Z', label: { x: 477, y: 213 } },
    
    // Азия
    CN: { path: 'M 630,155 L 655,152 L 680,150 L 705,153 L 728,158 L 748,167 L 763,180 L 772,197 L 775,217 L 770,237 L 757,252 L 738,262 L 715,268 L 690,270 L 665,267 L 642,260 L 623,248 L 610,232 L 603,213 L 602,193 L 608,175 L 618,163 Z', label: { x: 688, y: 210 } },
    IN: { path: 'M 580,220 L 598,217 L 617,216 L 636,219 L 652,226 L 665,237 L 673,252 L 677,270 L 675,288 L 667,303 L 653,313 L 635,318 L 615,318 L 595,313 L 578,303 L 567,288 L 562,270 L 562,252 L 567,237 L 575,227 Z', label: { x: 620, y: 268 } },
    JP: { path: 'M 780,180 L 788,177 L 797,177 L 805,181 L 810,188 L 812,198 L 810,208 L 803,215 L 793,218 L 783,217 L 775,211 L 771,202 L 770,192 L 773,184 Z M 785,220 L 793,218 L 802,219 L 809,225 L 812,233 L 810,242 L 803,248 L 793,250 L 784,248 L 778,241 L 776,232 L 778,224 Z', label: { x: 792, y: 205 } },
    KR: { path: 'M 755,185 L 762,183 L 770,183 L 777,187 L 781,194 L 781,202 L 776,209 L 768,212 L 759,211 L 752,206 L 749,199 L 750,191 Z', label: { x: 765, y: 198 } },
    KP: { path: 'M 752,175 L 760,173 L 769,173 L 776,177 L 780,184 L 779,192 L 774,199 L 766,202 L 757,201 L 750,196 L 747,189 L 748,181 Z', label: { x: 763, y: 188 } },
    TH: { path: 'M 640,275 L 650,273 L 661,273 L 671,277 L 678,285 L 682,295 L 680,305 L 673,312 L 663,315 L 652,314 L 643,309 L 638,300 L 636,290 L 638,282 Z', label: { x: 659, y: 294 } },
    VN: { path: 'M 655,260 L 665,258 L 676,258 L 686,262 L 693,270 L 697,282 L 697,297 L 693,311 L 685,321 L 673,326 L 661,325 L 652,319 L 647,308 L 646,293 L 649,278 L 652,268 Z', label: { x: 672, y: 292 } },
    ID: { path: 'M 650,310 L 662,308 L 675,308 L 688,311 L 698,318 L 703,328 L 703,340 L 698,350 L 688,356 L 675,358 L 662,356 L 652,350 L 647,340 L 646,328 Z M 710,320 L 720,318 L 730,319 L 738,325 L 742,333 L 740,342 L 733,348 L 723,350 L 713,348 L 707,341 L 705,332 L 707,324 Z', label: { x: 676, y: 333 } },
    MY: { path: 'M 640,295 L 650,293 L 661,293 L 671,297 L 678,305 L 680,315 L 675,323 L 666,327 L 655,327 L 646,322 L 641,314 L 640,305 Z M 685,300 L 693,298 L 702,299 L 709,305 L 712,313 L 709,321 L 701,326 L 691,327 L 683,323 L 679,315 L 680,307 Z', label: { x: 659, y: 310 } },
    PH: { path: 'M 730,260 L 738,258 L 747,259 L 754,265 L 757,273 L 755,283 L 748,289 L 738,291 L 729,289 L 724,282 L 723,274 L 726,266 Z', label: { x: 740, y: 275 } },
    PK: { path: 'M 555,200 L 565,198 L 576,198 L 586,202 L 593,210 L 596,220 L 594,230 L 587,237 L 577,240 L 566,239 L 557,234 L 552,226 L 551,216 L 553,208 Z', label: { x: 573, y: 219 } },
    BD: { path: 'M 610,245 L 618,243 L 627,243 L 635,247 L 640,254 L 641,263 L 637,271 L 629,276 L 619,277 L 610,274 L 605,267 L 604,258 L 606,251 Z', label: { x: 623, y: 260 } },
    IR: { path: 'M 520,195 L 532,193 L 545,193 L 557,197 L 566,205 L 570,215 L 568,225 L 560,232 L 548,235 L 535,234 L 524,229 L 518,221 L 516,211 L 518,203 Z', label: { x: 543, y: 214 } },
    IQ: { path: 'M 500,205 L 510,203 L 521,203 L 531,207 L 538,214 L 541,223 L 538,232 L 530,237 L 519,239 L 508,237 L 500,231 L 496,223 L 495,214 Z', label: { x: 518, y: 221 } },
    SA: { path: 'M 490,220 L 502,218 L 515,218 L 528,222 L 538,230 L 543,242 L 543,256 L 538,269 L 528,277 L 515,280 L 502,279 L 491,273 L 486,261 L 485,247 L 487,233 Z', label: { x: 514, y: 249 } },
    AE: { path: 'M 540,245 L 548,243 L 557,244 L 564,249 L 567,256 L 565,264 L 558,268 L 549,269 L 541,265 L 537,258 L 537,251 Z', label: { x: 552, y: 256 } },
    IL: { path: 'M 475,210 L 481,208 L 488,209 L 493,214 L 495,221 L 492,228 L 486,231 L 479,230 L 474,225 L 472,218 L 473,213 Z', label: { x: 483, y: 220 } },
    SG: { path: 'M 668,318 L 673,317 L 678,318 L 682,322 L 683,327 L 680,331 L 675,333 L 670,332 L 666,328 L 665,323 Z', label: { x: 674, y: 325 } },
    KZ: { path: 'M 520,120 L 545,118 L 572,117 L 600,120 L 625,125 L 645,132 L 660,142 L 668,155 L 670,170 L 665,183 L 653,192 L 635,197 L 612,198 L 587,195 L 562,190 L 540,182 L 523,172 L 512,158 L 507,143 L 508,128 Z', label: { x: 590, y: 158 } },
    
    // Африка
    EG: { path: 'M 470,230 L 482,228 L 495,228 L 507,232 L 516,240 L 520,250 L 518,260 L 510,267 L 498,270 L 485,269 L 473,264 L 467,255 L 465,245 L 467,237 Z', label: { x: 492, y: 249 } },
    ZA: { path: 'M 480,390 L 495,388 L 512,388 L 528,392 L 541,400 L 548,412 L 550,427 L 545,441 L 533,450 L 516,453 L 498,451 L 483,444 L 473,432 L 470,418 L 472,403 Z', label: { x: 510, y: 420 } },
    NG: { path: 'M 438,280 L 450,278 L 463,278 L 475,282 L 484,290 L 488,300 L 486,310 L 478,317 L 466,320 L 453,319 L 442,314 L 436,305 L 434,295 L 436,287 Z', label: { x: 461, y: 299 } },
    KE: { path: 'M 505,295 L 515,293 L 526,293 L 536,297 L 543,305 L 546,315 L 544,325 L 536,332 L 525,335 L 513,334 L 503,329 L 498,320 L 497,310 L 499,302 Z', label: { x: 521, y: 314 } },
    ET: { path: 'M 500,275 L 510,273 L 521,273 L 531,277 L 538,285 L 541,295 L 539,305 L 531,312 L 520,315 L 508,314 L 498,309 L 493,300 L 492,290 L 494,282 Z', label: { x: 516, y: 294 } },
    GH: { path: 'M 425,295 L 435,293 L 446,293 L 456,297 L 463,305 L 465,315 L 461,323 L 452,327 L 441,328 L 430,324 L 423,316 L 421,306 L 423,299 Z', label: { x: 443, y: 311 } },
    
    // Океания
    AU: { path: 'M 710,380 L 730,378 L 752,377 L 775,380 L 795,387 L 810,398 L 820,413 L 823,432 L 818,450 L 805,463 L 785,470 L 760,472 L 735,468 L 713,458 L 697,443 L 688,425 L 685,405 L 690,388 L 700,378 Z', label: { x: 755, y: 425 } },
    NZ: { path: 'M 835,450 L 843,448 L 852,449 L 859,455 L 862,463 L 860,472 L 853,478 L 844,480 L 835,478 L 829,471 L 827,463 L 829,455 Z M 840,485 L 847,483 L 855,484 L 861,490 L 863,498 L 860,506 L 853,511 L 844,512 L 836,508 L 832,500 L 831,492 L 834,486 Z', label: { x: 846, y: 467 } },
    
    // Непризнанные и спорные территории
    XK: { path: 'M 460,180 L 466,179 L 472,180 L 477,184 L 479,190 L 476,196 L 470,199 L 464,198 L 459,194 L 457,188 L 458,184 Z', label: { x: 468, y: 189 } },
    TW: { path: 'M 730,235 L 737,233 L 745,234 L 751,239 L 754,246 L 752,253 L 746,258 L 738,259 L 731,256 L 727,249 L 726,242 L 728,237 Z', label: { x: 740, y: 246 } },
    PS: { path: 'M 472,222 L 477,220 L 483,221 L 487,225 L 488,231 L 485,236 L 480,238 L 474,237 L 470,233 L 469,228 L 470,224 Z', label: { x: 478, y: 229 } }
  };

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-blue-950/30 to-indigo-950/20 rounded-lg overflow-hidden border-2">
      <svg viewBox="0 0 900 550" className="w-full h-full">
        <defs>
          <pattern id="worldGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="hsl(var(--border))" strokeWidth="0.3" opacity="0.15"/>
          </pattern>
          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0c4a6e" stopOpacity="0.1"/>
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.2"/>
          </linearGradient>
        </defs>

        <rect width="900" height="550" fill="url(#worldGrid)" />
        <rect width="900" height="550" fill="url(#oceanGradient)" />

        {Object.entries(countryPaths).map(([code, data]) => {
          const countryData = countriesData.find((c) => c.code === code);
          const score = countryData?.democracyScore || 50;
          const isSelected = selectedCountry === code;
          const isHovered = hoveredCountry === code;
          const country = allCountries.find(c => c.code === code);

          return (
            <g key={code}>
              <path
                d={data.path}
                fill={getColorByScore(score)}
                stroke={isSelected ? 'hsl(var(--secondary))' : 'hsl(var(--border))'}
                strokeWidth={isSelected ? 2.5 : 0.8}
                opacity={isSelected ? 1 : isHovered ? 0.85 : 0.7}
                className="cursor-pointer transition-all duration-300"
                style={{
                  filter: isSelected ? 'drop-shadow(0 0 8px hsl(var(--secondary)))' : isHovered ? 'brightness(1.2)' : 'none',
                }}
                onClick={() => onCountrySelect(code)}
                onMouseEnter={() => setHoveredCountry(code)}
                onMouseLeave={() => setHoveredCountry(null)}
              />
              {(isSelected || isHovered) && country && (
                <text
                  x={data.label.x}
                  y={data.label.y}
                  fill="hsl(var(--foreground))"
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                  className="pointer-events-none"
                  style={{
                    textShadow: '0 0 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)'
                  }}
                >
                  {country.name}
                </text>
              )}
            </g>
          );
        })}

        <g transform="translate(20, 485)">
          <circle cx="0" cy="0" r="7" fill="#22c55e" />
          <text x="15" y="4" fill="hsl(var(--muted-foreground))" fontSize="11" fontWeight="500">
            Высокая (70+)
          </text>

          <circle cx="130" cy="0" r="7" fill="#eab308" />
          <text x="145" y="4" fill="hsl(var(--muted-foreground))" fontSize="11" fontWeight="500">
            Средняя (40-69)
          </text>

          <circle cx="250" cy="0" r="7" fill="#ef4444" />
          <text x="265" y="4" fill="hsl(var(--muted-foreground))" fontSize="11" fontWeight="500">
            Низкая (&lt;40)
          </text>
        </g>
      </svg>

      <div className="absolute top-3 right-3 bg-card/95 backdrop-blur-sm border rounded-lg p-2.5 shadow-lg max-w-[180px]">
        <p className="text-xs text-muted-foreground leading-relaxed">
          🌍 Нажмите на любую страну для детального анализа
        </p>
      </div>
    </div>
  );
};

export default WorldMapRealistic;
