import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import {
  SERVIDORES_POR_AREA,
  GENERO_DATA,
  DESTAQUE_FAIXA_ETARIA,
  RACA_COR_DATA,
  NACIONALIDADES_DATA,
} from '../../data/hrStatsData';
import {
  AreasStackedBarChart,
  GeneroCharts,
  FaixaEtariaBarChart,
  RacaCorBarChart,
  EscolaridadeComparisonChart,
  GrandesAreasLineChart,
  TopCargosBarChart,
  NacionalidadesCharts,
} from './Charts/ChartComponents';

interface HistoricalDashboardProps {
  onBackToTimeline: () => void;
}

interface SlideDefinition {
  id: string;
  title: string;
  subtitle: string;
  category: string;
}

const SLIDES: SlideDefinition[] = [
  {
    id: 'areas',
    category: 'Estrutura Institucional',
    title: 'Servidores Ativos por Área da Universidade',
    subtitle: 'Distribuição do quadro de pessoal entre Faculdades, Saúde, Administração, Centros e Colégios',
  },
  {
    id: 'genero',
    category: 'Diversidade & Perfil',
    title: 'Distribuição Geral por Gênero',
    subtitle: 'Composição feminina e masculina no quadro geral e por carreira na Unicamp',
  },
  {
    id: 'faixaEtaria',
    category: 'Demografia',
    title: 'Perfil Etário dos Servidores',
    subtitle: 'Distribuição por faixas de idade, do servidor mais jovem ao mais experiente',
  },
  {
    id: 'racaCor',
    category: 'Inclusão & Equidade',
    title: 'Distribuição Étnico-Racial',
    subtitle: 'Autodeclaração de raça e cor consolidada entre todas as categorias',
  },
  {
    id: 'escolaridade',
    category: 'Desenvolvimento Profissional',
    title: 'Evolução da Escolaridade PAEPE (2016 - 2026)',
    subtitle: 'Salto histórico na qualificação acadêmica e pós-graduação dos servidores técnico-administrativos',
  },
  {
    id: 'grandesAreas',
    category: 'Campos de Atuação',
    title: 'Evolução por Grandes Áreas (2022 - 2026)',
    subtitle: 'Trajetória dos 8 grandes campos de atuação profissional na Universidade',
  },
  {
    id: 'cargos',
    category: 'Quadro Funcional',
    title: 'Ranking dos Maiores Cargos em 2026',
    subtitle: 'As funções e carreiras com maior número de profissionais em atividade',
  },
  {
    id: 'nacionalidade',
    category: 'Internacionalização',
    title: 'Docentes e Pesquisadores por Nacionalidade',
    subtitle: 'Origem geográfica e presença internacional na pesquisa e docência da Unicamp',
  },
];

export const HistoricalDashboard: React.FC<HistoricalDashboardProps> = ({ onBackToTimeline }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalSlides = SLIDES.length;
  const currentSlide = SLIDES[currentSlideIndex];

  // Navigation handlers
  const handlePrevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => {
      if (prev > 0) {
        soundFx.playCardTick();
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const handleNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => {
      if (prev < totalSlides - 1) {
        soundFx.playCardTick();
        return prev + 1;
      }
      return prev;
    });
  }, [totalSlides]);

  // Keyboard navigation for presentation mode: Arrow Left / Right / Space / Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        soundFx.playCardTick();
        onBackToTimeline();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextSlide, handlePrevSlide, onBackToTimeline]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] text-slate-900 pb-20 px-3 sm:px-6 md:px-8 max-w-6xl mx-auto flex flex-col justify-between select-none">
      {/* ================= PRESENTATION TOP BAR ================= */}
      <div className="pt-3 pb-4 flex items-center justify-between gap-4 border-b border-black/15">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundFx.playCardTick();
              onBackToTimeline();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-md border border-white/20 transition-all cursor-pointer hover:scale-105 active:scale-95 group"
            title="Voltar à Linha do Tempo contínua (Esc)"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Voltar à Linha do Tempo</span>
            <span className="sm:hidden">Linha do Tempo</span>
          </button>

          <div className="h-5 w-px bg-black/20 hidden sm:block" />

          <div className="hidden sm:block">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#105e7b]">
              A Gestão de Pessoas nos 60 Anos da Unicamp
            </span>
            <div className="text-xs font-black text-slate-900">
              Painel Comemorativo de Indicadores
            </div>
          </div>
        </div>

        {/* Slide Counter & Mode Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-slate-950 shadow-xs text-xs font-black text-slate-900">
            <span className="text-[#105e7b]">{currentSlideIndex + 1}</span>
            <span className="text-slate-400">/</span>
            <span>{totalSlides}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-900 border border-slate-950 shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Alternar Tela Cheia para Apresentação"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ================= PRESENTATION SLIDE STAGE ================= */}
      <div className="flex-1 my-4 flex flex-col justify-center">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-slate-950 p-6 sm:p-8 md:p-10 shadow-2xl transition-all duration-300 relative overflow-hidden min-h-[540px] flex flex-col justify-between">
          {/* Header of the Current Slide */}
          <div className="border-b border-black/10 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#105e7b] mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#105e7b] text-white text-[10px]">
                  {currentSlide.category}
                </span>
                <span>• Slide {currentSlideIndex + 1} de {totalSlides}</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 tracking-tight">
                {currentSlide.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                {currentSlide.subtitle}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-1 text-[11px] font-bold text-slate-400">
              <span>Navegue com</span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300 font-mono text-slate-700">⬅</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300 font-mono text-slate-700">➡</kbd>
            </div>
          </div>

          {/* ================= SLIDE 1: SERVIDORES POR ÁREA ================= */}
          {currentSlideIndex === 0 && (
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-1">
                {SERVIDORES_POR_AREA.map((item) => (
                  <div key={item.tipoOrgao} className="p-2.5 rounded-2xl bg-slate-50 border border-black/10 text-center">
                    <div className="text-base sm:text-xl font-black text-slate-950">{item.total.toLocaleString('pt-BR')}</div>
                    <div className="text-[11px] font-black text-[#105e7b]">{item.percentual.toFixed(1)}%</div>
                    <div className="text-[10px] font-bold text-slate-600 truncate mt-0.5">{item.tipoOrgao}</div>
                  </div>
                ))}
              </div>

              {/* Stacked Horizontal Bar Chart */}
              <AreasStackedBarChart />
            </div>
          )}

          {/* ================= SLIDE 2: GÊNERO ================= */}
          {currentSlideIndex === 1 && (
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <GeneroCharts />
            </div>
          )}

          {/* ================= SLIDE 3: FAIXA ETÁRIA ================= */}
          {currentSlideIndex === 2 && (
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {/* Highlight callout box */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-700 shrink-0" />
                <div className="text-xs sm:text-sm font-bold leading-relaxed">
                  📌 <strong>Destaque Demográfico:</strong> "{DESTAQUE_FAIXA_ETARIA.jovem}" e "{DESTAQUE_FAIXA_ETARIA.velho}".
                </div>
              </div>

              {/* Age Histogram */}
              <FaixaEtariaBarChart />
            </div>
          )}

          {/* ================= SLIDE 4: RAÇA / COR ================= */}
          {currentSlideIndex === 3 && (
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-1">
                {RACA_COR_DATA.map((item) => (
                  <div key={item.raca} className="p-2.5 rounded-2xl bg-slate-50 border border-black/10 text-center">
                    <div className="text-base sm:text-lg font-black text-slate-950">{item.total.toLocaleString('pt-BR')}</div>
                    <div className="text-xs font-black text-amber-700">{item.pct.toFixed(1)}%</div>
                    <div className="text-[10px] font-bold text-slate-600 truncate mt-0.5">{item.raca}</div>
                  </div>
                ))}
              </div>

              {/* Raça/Cor Chart */}
              <RacaCorBarChart />
            </div>
          )}

          {/* ================= SLIDE 5: ESCOLARIDADE (2016-2026) ================= */}
          {currentSlideIndex === 4 && (
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {/* Highlight callout box */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-700 shrink-0" />
                <div className="text-xs sm:text-sm">
                  <strong>Salto na Pós-Graduação (2016 a 2026):</strong> Em 2016 eram 1.139 com Especialização e 221 com Doutorado. Em 2026 são <strong>1.697 (+49%)</strong> e <strong>325 (+47%)</strong>!
                </div>
              </div>

              {/* Escolaridade Comparison Chart */}
              <EscolaridadeComparisonChart />
            </div>
          )}

          {/* ================= SLIDE 6: GRANDES ÁREAS ================= */}
          {currentSlideIndex === 5 && (
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <GrandesAreasLineChart />
            </div>
          )}

          {/* ================= SLIDE 7: MAIORES CARGOS ================= */}
          {currentSlideIndex === 6 && (
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <TopCargosBarChart />
            </div>
          )}

          {/* ================= SLIDE 8: NACIONALIDADES ================= */}
          {currentSlideIndex === 7 && (
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <NacionalidadesCharts />
            </div>
          )}

          {/* Slide Footer with Dots Navigation */}
          <div className="pt-4 mt-4 border-t border-black/10 flex items-center justify-between">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-xs disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    soundFx.playCardTick();
                    setCurrentSlideIndex(idx);
                  }}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === currentSlideIndex
                      ? 'w-7 bg-[#105e7b]'
                      : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={`Ir para o slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNextSlide}
              disabled={currentSlideIndex === totalSlides - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-black text-xs disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <span>Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
