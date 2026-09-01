import React, { useState } from 'react';
import { VisualDiagramData } from '../types';
import { Sparkles, Play, Pause, RotateCcw, Info, Eye, Layers, ZoomIn, ZoomOut } from 'lucide-react';

interface InteractiveVisualConceptProps {
  topic: string;
  subjectName?: string;
  diagramData?: VisualDiagramData;
}

export const InteractiveVisualConcept: React.FC<InteractiveVisualConceptProps> = ({
  topic,
  subjectName = 'Science',
  diagramData,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeStage, setActiveStage] = useState(0);

  const title = diagramData?.title || `${topic} Visual Model`;
  const description =
    diagramData?.description ||
    `Interactive pedagogical model depicting the fundamental mechanisms and relationships governing ${topic}.`;
  const svgType = diagramData?.svgType || (
    /chem|atom|molecul|bond|reaction/i.test(`${topic} ${subjectName}`) ? 'atom_molecule' :
    /phys|force|motion|gravit|kinemat|veloc/i.test(`${topic} ${subjectName}`) ? 'force_motion' :
    /circuit|electric|current|volt|resistan/i.test(`${topic} ${subjectName}`) ? 'circuit_flow' :
    /math|calculus|graph|deriv|integr|function/i.test(`${topic} ${subjectName}`) ? 'math_curve' :
    /bio|cell|organ|dna|plant|gene/i.test(`${topic} ${subjectName}`) ? 'biology_cell' : 'concept_map'
  );

  const labels = diagramData?.labels || [
    'System Input / Boundary Condition',
    'Governing Transformation Mechanism',
    'Dynamic Equilibrium State',
    'Resultant Observation / Output',
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D3] shadow-xs overflow-hidden text-[#1C1E1B] space-y-4">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-[#E8E4D9] flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] border border-emerald-300 text-[#1B4332] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#1B4332] bg-[#E8F5E9] border border-emerald-300 px-2 py-0.5 rounded">
                Professor Visual Diagram
              </span>
              <span className="text-xs text-[#6B7267] hidden sm:inline">
                Interactive Model & Animated Mechanism
              </span>
            </div>
            <h3 className="font-serif-display text-lg sm:text-xl font-semibold text-[#1C1E1B] mt-0.5">
              {title}
            </h3>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#DCD6C7] text-xs">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-2.5 py-1 rounded-lg text-[#1B4332] hover:bg-[#E8F5E9] flex items-center gap-1 transition-colors cursor-pointer font-medium"
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer font-medium ${
              showLabels ? 'bg-[#FAF8F5] text-[#1B4332] font-semibold border border-[#DCD6C7]' : 'text-[#6B7267] hover:text-[#1C1E1B]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Labels</span>
          </button>

          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
            className="p-1 text-[#6B7267] hover:text-[#1C1E1B] rounded hover:bg-[#FAF8F5] cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
            className="p-1 text-[#6B7267] hover:text-[#1C1E1B] rounded hover:bg-[#FAF8F5] cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage Area */}
      <div className="p-4 sm:p-6 flex flex-col items-center justify-center">
        <div
          className="w-full max-w-2xl h-[280px] sm:h-[340px] bg-[#FAF8F5] rounded-xl border border-[#E2DDCF] flex items-center justify-center relative overflow-hidden transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#1B4332 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* SVG RENDERING BASED ON TYPE */}
          {svgType === 'atom_molecule' && (
            <svg viewBox="0 0 400 300" className="w-full h-full max-h-[300px]">
              {/* Nucleus */}
              <circle cx="200" cy="150" r="22" fill="#1B4332" className="drop-shadow-md" />
              <circle cx="195" cy="145" r="8" fill="#2D6A4F" opacity="0.8" />
              <text x="200" y="154" textAnchor="middle" fill="#FAF8F5" fontSize="10" fontFamily="monospace" fontWeight="bold">
                NUCLEUS
              </text>

              {/* Orbit 1 */}
              <ellipse
                cx="200"
                cy="150"
                rx="70"
                ry="35"
                fill="none"
                stroke="#52B788"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                transform="rotate(25 200 150)"
              />
              {/* Orbit 2 */}
              <ellipse
                cx="200"
                cy="150"
                rx="70"
                ry="35"
                fill="none"
                stroke="#52B788"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                transform="rotate(-25 200 150)"
              />
              {/* Orbit 3 */}
              <ellipse
                cx="200"
                cy="150"
                rx="120"
                ry="55"
                fill="none"
                stroke="#B7E4C7"
                strokeWidth="1.5"
                strokeDasharray="5 5"
              />

              {/* Animated Electrons */}
              <circle cx="140" cy="130" r="6" fill="#D8F3DC" stroke="#1B4332" strokeWidth="1.5">
                {isPlaying && (
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 200 150"
                    to="360 200 150"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>
              <circle cx="260" cy="170" r="6" fill="#D8F3DC" stroke="#1B4332" strokeWidth="1.5">
                {isPlaying && (
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="180 200 150"
                    to="540 200 150"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>
              <circle cx="200" cy="95" r="7" fill="#74C69D" stroke="#1B4332" strokeWidth="2">
                {isPlaying && (
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 200 150"
                    to="-360 200 150"
                    dur="6s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>

              {/* Energy Waves / Bonds */}
              <path
                d="M 60 150 Q 130 110, 200 150 T 340 150"
                fill="none"
                stroke="#1B4332"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              >
                {isPlaying && (
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;40"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                )}
              </path>
            </svg>
          )}

          {svgType === 'force_motion' && (
            <svg viewBox="0 0 400 300" className="w-full h-full max-h-[300px]">
              {/* Incline / Surface */}
              <line x1="50" y1="220" x2="350" y2="220" stroke="#1B4332" strokeWidth="3" />
              <pattern id="hatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#D8D4C7" strokeWidth="1" />
              </pattern>
              <rect x="50" y="223" width="300" height="15" fill="url(#hatch)" />

              {/* Mass Block */}
              <rect
                x="160"
                y="150"
                width="80"
                height="70"
                rx="6"
                fill="#FAF8F5"
                stroke="#1B4332"
                strokeWidth="2.5"
              />
              <text x="200" y="190" textAnchor="middle" fill="#1B4332" fontSize="14" fontWeight="bold" fontFamily="serif">
                Mass (m)
              </text>

              {/* Force Arrows */}
              {/* Normal Force Fn */}
              <line x1="200" y1="150" x2="200" y2="70" stroke="#2D6A4F" strokeWidth="2.5" markerEnd="url(#arrow)" />
              <polygon points="195,75 200,60 205,75" fill="#2D6A4F" />
              <text x="210" y="80" fill="#2D6A4F" fontSize="12" fontWeight="bold" fontFamily="monospace">
                F_N = m·g
              </text>

              {/* Gravity Fg */}
              <line x1="200" y1="190" x2="200" y2="270" stroke="#1B4332" strokeWidth="2.5" />
              <polygon points="195,265 200,280 205,265" fill="#1B4332" />
              <text x="210" y="270" fill="#1B4332" fontSize="12" fontWeight="bold" fontFamily="monospace">
                F_g = m·g (Weight)
              </text>

              {/* Applied Force F_applied */}
              <line x1="240" y1="185" x2="330" y2="185" stroke="#E63946" strokeWidth="3" />
              <polygon points="325,180 340,185 325,190" fill="#E63946" />
              <text x="285" y="175" fill="#E63946" fontSize="12" fontWeight="bold" fontFamily="monospace">
                F_net = m·a
              </text>

              {/* Friction Force */}
              <line x1="160" y1="215" x2="90" y2="215" stroke="#B08968" strokeWidth="2.5" />
              <polygon points="95,210 80,215 95,220" fill="#B08968" />
              <text x="90" y="205" fill="#B08968" fontSize="11" fontWeight="bold" fontFamily="monospace">
                f_k = μ·N
              </text>
            </svg>
          )}

          {svgType === 'math_curve' && (
            <svg viewBox="0 0 400 300" className="w-full h-full max-h-[300px]">
              {/* Axes */}
              <line x1="50" y1="250" x2="360" y2="250" stroke="#888E83" strokeWidth="1.5" />
              <line x1="80" y1="30" x2="80" y2="260" stroke="#888E83" strokeWidth="1.5" />
              <text x="360" y="265" fill="#555A50" fontSize="11" fontFamily="monospace">x</text>
              <text x="65" y="40" fill="#555A50" fontSize="11" fontFamily="monospace">f(x)</text>

              {/* Mathematical Curve: f(x) = sin or polynomial */}
              <path
                d="M 80 200 C 140 60, 220 280, 320 80"
                fill="none"
                stroke="#1B4332"
                strokeWidth="3"
              />

              {/* Tangent Line / Derivative Slope */}
              <line x1="150" y1="170" x2="280" y2="170" stroke="#E63946" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="215" cy="170" r="5" fill="#E63946" />
              <text x="225" y="160" fill="#E63946" fontSize="11" fontWeight="bold" fontFamily="monospace">
                dy/dx = Slope (f'(x) = 0)
              </text>

              {/* Area Under Curve / Integral */}
              <path
                d="M 120 250 L 120 140 C 160 100, 200 180, 250 195 L 250 250 Z"
                fill="#D8F3DC"
                opacity="0.6"
              />
              <text x="185" y="235" textAnchor="middle" fill="#1B4332" fontSize="11" fontWeight="bold" fontFamily="serif">
                ∫ f(x) dx
              </text>
            </svg>
          )}

          {svgType === 'circuit_flow' && (
            <svg viewBox="0 0 400 300" className="w-full h-full max-h-[300px]">
              {/* Circuit wire loop */}
              <rect x="70" y="60" width="260" height="180" rx="12" fill="none" stroke="#1B4332" strokeWidth="2.5" />

              {/* Voltage source (Battery) */}
              <rect x="60" y="130" width="20" height="40" fill="#FAF8F5" />
              <line x1="55" y1="140" x2="85" y2="140" stroke="#1B4332" strokeWidth="3" />
              <line x1="63" y1="160" x2="77" y2="160" stroke="#1B4332" strokeWidth="2" />
              <text x="35" y="155" fill="#1B4332" fontSize="12" fontWeight="bold" fontFamily="monospace">
                V (Battery)
              </text>

              {/* Resistor (Zig-zag) */}
              <rect x="160" y="50" width="80" height="20" fill="#FAF8F5" />
              <path
                d="M 160 60 L 170 50 L 180 70 L 190 50 L 200 70 L 210 50 L 220 70 L 230 60 L 240 60"
                fill="none"
                stroke="#B08968"
                strokeWidth="2.5"
              />
              <text x="200" y="40" textAnchor="middle" fill="#B08968" fontSize="11" fontWeight="bold" fontFamily="monospace">
                R (Resistor: V = I·R)
              </text>

              {/* Current Indicator / Flow */}
              <polygon points="325,140 330,155 335,140" fill="#2D6A4F" />
              <text x="345" y="150" fill="#2D6A4F" fontSize="11" fontWeight="bold" fontFamily="monospace">
                I (Current)
              </text>
            </svg>
          )}

          {(svgType === 'concept_map' || svgType === 'process_flow' || svgType === 'biology_cell') && (
            <div className="w-full h-full p-4 flex flex-col justify-around">
              {/* Interactive Multi-Stage Hierarchy */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full">
                {labels.slice(0, 4).map((label, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveStage(idx)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer select-none ${
                      activeStage === idx
                        ? 'bg-[#1B4332] text-[#FAF8F5] border-[#1B4332] shadow-md scale-102 font-bold'
                        : 'bg-white text-[#333830] border-[#DCD6C7] hover:border-emerald-500'
                    }`}
                  >
                    <div className="text-[10px] font-mono-code uppercase opacity-80 mb-1">
                      Stage 0{idx + 1}
                    </div>
                    <div className="text-xs leading-snug line-clamp-2">{label}</div>
                  </div>
                ))}
              </div>

              {/* Active Stage Detail */}
              <div className="bg-white rounded-xl p-3.5 border border-[#E5E0D3] shadow-xs text-xs space-y-1 mt-2">
                <div className="flex items-center gap-1.5 text-[#1B4332] font-bold uppercase tracking-wider text-[11px]">
                  <Info className="w-3.5 h-3.5" />
                  Stage {activeStage + 1} Analysis: {labels[activeStage] || 'Core Step'}
                </div>
                <p className="text-[#555A50] leading-relaxed">
                  During this stage of <strong className="text-[#1C1E1B]">{topic}</strong>, fundamental axioms convert boundary inputs into observable equilibrium outcomes. Keep this sequence in mind for multi-step exam proofs.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Description & Labels Bar */}
      {showLabels && (
        <div className="p-4 sm:p-5 border-t border-[#E8E4D9] bg-[#FAF8F5] text-xs text-[#555A50] flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-xl">
            <span className="font-bold text-[#1C1E1B] uppercase tracking-wide block mb-1">
              Pedagogical Visual Guide
            </span>
            <p className="leading-relaxed">{description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {labels.map((lbl, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md bg-white border border-[#DCD6C7] text-[#1C1E1B] font-mono-code text-[11px]"
              >
                {lbl}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
