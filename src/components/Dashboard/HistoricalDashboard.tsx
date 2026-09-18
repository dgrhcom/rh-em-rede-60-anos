import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  TrendingUp,
  LayoutGrid,
  Play,
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import {
  DESTAQUE_FAIXA_ETARIA,
} from '../../data/hrStatsData';
import {
  GeneroCharts,
  FaixaEtariaBarChart,
  RacaCorCharts,
  EscolaridadeEvolucaoLineChart,
  EscolaridadeZoomLineChart,
  ServidoresPorAreaPieChart,
  TopCargosBarChart,
  NacionalidadesCharts,
} from './Charts/ChartComponents';

interface HistoricalDashboardProps {
  onBackToTimeline: () => void;
}

interface SlideDefinition {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  tag: string;
}

// Deep, vibrant auxiliary and secondary design system colors for each chart card
export const SLIDE_BG_COLORS = [
  'bg-[#5e2a6b]', // 0: Gênero - Aux 2 (Roxo DGRH)
  'bg-[#d67b27]', // 1: Faixa Etária - Aux 3 (Laranja DGRH)
  'bg-[#477b2f]', // 2: Raça / Cor - Aux 1 (Verde DGRH)
  'bg-[#6b213b]', // 3: Escolaridade PAEPE - Aux 2 (Vinho Profundo)
  'bg-[#c05621]', // 4: Escolaridade Zoom - Aux 3 (Terracota)
  'bg-[#366023]', // 5: Áreas da Unicamp - Aux 1 (Verde Floresta)
  'bg-[#b8801a]', // 6: Top 20 Cargos - Secundária (Dourado Profundo 60 Anos)
  'bg-[#701a75]', // 7: Nacionalidades - Aux 2 (Ameixa DGRH)
];

const SLIDES: SlideDefinition[] = [
  {
    id: 'genero',
    category: 'Diversidade & Perfil',
    title: 'Distribuição Geral por Gênero',
    subtitle: 'Composição feminina e masculina no quadro geral e por carreira na Unicamp',
    tag: 'Gênero',
  },
  {
    id: 'faixaEtaria',
    category: 'Demografia',
    title: 'Perfil Etário dos Servidores por Categoria',
    subtitle: 'Distribuição por faixas etárias diferenciando Docentes, Pesquisadores e Técnicos-Administrativos',
    tag: 'Faixa Etária',
  },
  {
    id: 'racaCor',
    category: 'Inclusão & Equidade',
    title: 'Distribuição Étnico-Racial dos Servidores',
    subtitle: 'Autodeclaração geral de raça/cor e detalhamento por carreira funcional na Universidade',
    tag: 'Raça / Cor',
  },
  {
    id: 'escolaridadeGeral',
    category: 'Desenvolvimento Profissional',
    title: 'Evolução da Escolaridade PAEPE (2016 - 2026)',
    subtitle: 'Histórico decenal de todos os níveis de formação dos servidores técnico-administrativos',
    tag: 'Escolaridade',
  },
  {
    id: 'escolaridadeZoom',
    category: 'Desenvolvimento Profissional',
    title: 'Evolução da Escolaridade PAEPE (Zoom em Detalhe)',
    subtitle: 'Foco ampliado em Mestrado, Fundamental, Doutorado, Fundamental Incompleto e Maior que Doutorado',
    tag: 'Pós-Graduação',
  },
  {
    id: 'areas',
    category: 'Estrutura Institucional',
    title: 'Servidores Ativos - Por Área da Universidade',
    subtitle: 'Distribuição do quadro de pessoal entre Faculdades, Saúde, Administração Central, Centros e Colégios',
    tag: 'Áreas da Unicamp',
  },
  {
    id: 'cargos',
    category: 'Quadro Funcional',
    title: 'Ranking dos 20 Maiores Cargos em 2026',
    subtitle: 'As 20 funções e carreiras com maior número de profissionais em atividade',
    tag: 'Top 20 Cargos',
  },
  {
    id: 'nacionalidade',
    category: 'Internacionalização',
    title: 'Docentes e Pesquisadores por Nacionalidade',
    subtitle: 'Origem geográfica e presença internacional na pesquisa e docência da Unicamp',
    tag: 'Nacionalidades',
  },
];

export const HistoricalDashboard: React.FC<HistoricalDashboardProps> = ({ onBackToTimeline }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      const slideParam = search.get('slide');
      if (slideParam) {
        if (slideParam === 'index' || slideParam === '0') {
          return -1;
        }
        const s = parseInt(slideParam, 10);
        if (!isNaN(s) && s >= 1 && s <= SLIDES.length) {
          return s - 1;
        }
      }
    }
    return -1;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalSlides = SLIDES.length;
  const isIndex = currentSlideIndex === -1;
  const currentSlide = isIndex ? null : SLIDES[currentSlideIndex];

  // Navigation handlers
  const handlePrevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => {
      if (prev > -1) {
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
        if (currentSlideIndex === -1) {
          soundFx.playCardTick();
          onBackToTimeline();
        } else {
          handlePrevSlide();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        soundFx.playCardTick();
        if (currentSlideIndex >= 0) {
          setCurrentSlideIndex(-1);
        } else {
          onBackToTimeline();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextSlide, handlePrevSlide, currentSlideIndex, onBackToTimeline]);

  // Sync slide with URL query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'dashboard');
      if (currentSlideIndex === -1) {
        url.searchParams.set('slide', 'index');
      } else {
        url.searchParams.set('slide', String(currentSlideIndex + 1));
      }
      window.history.replaceState(null, '', url.toString());
    }
  }, [currentSlideIndex]);

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
    <div className="w-full text-slate-900 px-2 sm:px-4 max-w-[1400px] mx-auto flex flex-col items-center justify-center select-none py-1">
      {isIndex ? (
        /* ================= 1. ÍNDICE DE GRÁFICOS (SEM CONTAINER DE FUNDO) ================= */
        <div className="w-full max-w-[1360px] flex flex-col justify-center my-auto py-2">
          {/* Grid de 8 Cards no estilo dos cards da linha do tempo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
            {SLIDES.map((slide, idx) => {
              const cardBg = SLIDE_BG_COLORS[idx % SLIDE_BG_COLORS.length];
              return (
                <button
                  key={slide.id}
                  onClick={() => {
                    soundFx.playCardTick();
                    setCurrentSlideIndex(idx);
                  }}
                  className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl ${cardBg} border-2.5 border-slate-950 shadow-lg hover:shadow-2xl transition-all duration-200 text-left cursor-pointer overflow-hidden transform hover:-translate-y-1 hover:brightness-105 select-none min-h-[220px] sm:min-h-[240px]`}
                >
                  <div>
                    {/* Topo: Categoria e Número do Card */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider border border-white/30 shadow-xs">
                        {slide.category}
                      </span>
                      <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-white text-slate-950 font-black text-xs flex items-center justify-center shadow-xs border border-slate-900 shrink-0">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Título */}
                    <h3 className="text-base sm:text-lg font-black text-white leading-snug tracking-tight">
                      {slide.title}
                    </h3>

                    {/* Subtítulo em tom claro */}
                    <p className="text-xs sm:text-[13px] text-white/85 font-medium leading-relaxed mt-2 line-clamp-3">
                      {slide.subtitle}
                    </p>
                  </div>

                  {/* Rodapé do Card: Tag e Ação (Sem ícones) */}
                  <div className="pt-3 border-t border-white/20 flex items-center justify-between mt-4 text-xs font-bold text-white/90">
                    <span className="truncate">{slide.tag}</span>
                    <span className="shrink-0 font-black text-white group-hover:translate-x-1 transition-transform">
                      Ver gráfico →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Barra Inferior do Índice: Voltar à Linha do Tempo e Iniciar Apresentação */}
          <div className="w-full flex items-center justify-between pt-6 px-1 shrink-0">
            <button
              onClick={onBackToTimeline}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer border-2 border-white/80"
              title="Voltar à Linha do Tempo Contínua"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Linha do Tempo</span>
            </button>

            <button
              onClick={() => {
                soundFx.playCardTick();
                setCurrentSlideIndex(0);
              }}
              className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer border-2 border-white/80 group"
              title="Iniciar Apresentação a partir do 1º gráfico"
            >
              <Play className="w-4 h-4 fill-[#e5a93a] text-[#e5a93a] group-hover:scale-110 transition-transform" />
              <span>Iniciar Apresentação</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        /* ================= 2. APRESENTAÇÃO DO SLIDE ATUAL (COM CONTAINER DE FUNDO BRANCO) ================= */
        <div className="w-full flex flex-col justify-center my-auto items-center">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-slate-950 p-6 sm:p-7 md:p-8 shadow-2xl transition-all duration-300 relative overflow-hidden w-full max-w-[1360px] h-[640px] flex flex-col justify-between">
            {/* Header of the Current Slide */}
            <div className="border-b border-black/10 pb-2 mb-2 shrink-0 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 tracking-tight">
                  {currentSlide?.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                  {currentSlide?.subtitle}
                </p>
              </div>
              <button
                onClick={() => {
                  soundFx.playCardTick();
                  setCurrentSlideIndex(-1);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-300 shadow-xs"
                title="Voltar ao Índice de Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#105e7b]" />
                <span>Ver Índice</span>
              </button>
            </div>

          {/* ================= SLIDE 1: GÊNERO ================= */}
          {currentSlideIndex === 0 && (
            <div className="flex-1 flex flex-col justify-center min-h-0 py-1 overflow-hidden">
              <GeneroCharts />
            </div>
          )}

          {/* ================= SLIDE 2: FAIXA ETÁRIA ================= */}
          {currentSlideIndex === 1 && (
            <div className="flex-1 flex flex-col justify-center min-h-0 py-1 gap-2.5 overflow-hidden">
              {/* Highlight callout box */}
              <div className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-center gap-3 shrink-0">
                <Sparkles className="w-5 h-5 text-amber-700 shrink-0" />
                <div className="text-xs sm:text-sm font-bold leading-relaxed">
                  📌 <strong>Destaque Demográfico:</strong> "{DESTAQUE_FAIXA_ETARIA.jovem}" e "{DESTAQUE_FAIXA_ETARIA.velho}".
                </div>
              </div>

              {/* Age Stacked Bar Chart by Categories */}
              <FaixaEtariaBarChart />
            </div>
          )}

          {/* ================= SLIDE 3: RAÇA / COR (INTEGRADO) ================= */}
          {currentSlideIndex === 2 && (
            <div className="flex-1 flex flex-col justify-center min-h-0 py-1 overflow-hidden">
              <RacaCorCharts />
            </div>
          )}

          {/* ================= SLIDE 4: ESCOLARIDADE (TODAS AS CATEGORIAS EM LINHAS) ================= */}
          {currentSlideIndex === 3 && (
            <div className="flex-1 flex flex-col justify-center min-h-0 py-1 gap-2.5 overflow-hidden">
              {/* Highlight callout box */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-3 shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-700 shrink-0" />
                <div className="text-xs sm:text-sm">
                  <strong>Evolução Histórica (2016 - 2026):</strong> Salto contínuo de Especialização (<strong>1.139 ➔ 1.697, +49%</strong>) e consolidação da formação acadêmica e pós-graduação no PAEPE.
                </div>
              </div>

              {/* All education levels Line Chart */}
              <EscolaridadeEvolucaoLineChart />
            </div>
          )}

          {/* ================= SLIDE 5: ESCOLARIDADE (ZOOM EM LINHAS) ================= */}
          {currentSlideIndex === 4 && (
            <div className="flex-1 flex flex-col justify-center min-h-0 py-1 gap-2.5 overflow-hidden">
              {/* Highlight callout box */}
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-300 text-sky-950 flex items-center gap-3 shrink-0">
                <Sparkles className="w-5 h-5 text-sky-700 shrink-0" />
                <div className="text-xs sm:text-sm">
                  <strong>Visão em Zoom (Escala 0 a 500):</strong> Crescimento expressivo em <strong>Mestrado (+17%)</strong>, <strong>Doutorado (+47%)</strong> e <strong>Maior que Doutorado (+211%)</strong>, com redução nos níveis Fundamental e Fundamental Incompleto (<strong>-65%</strong>).
                </div>
              </div>

              {/* Zoom Line Chart */}
              <EscolaridadeZoomLineChart />
            </div>
          )}

          {/* ================= SLIDE 6: SERVIDORES ATIVOS POR ÁREA (PIE DA PLANILHA) ================= */}
          {currentSlideIndex === 5 && (
            <div className="flex-1 flex flex-col justify-center min-h-0 py-1 overflow-hidden">
              <ServidoresPorAreaPieChart />
            </div>
          )}

          {/* ================= SLIDE 7: MAIORES CARGOS ================= */}
          {currentSlideIndex === 6 && (
            <div className="flex-1 flex flex-col justify-center min-h-0 py-1 overflow-hidden">
              <TopCargosBarChart />
            </div>
          )}

          {/* ================= SLIDE 8: NACIONALIDADES ================= */}
          {currentSlideIndex === 7 && (
            <div className="flex-1 flex flex-col justify-center min-h-0 py-1 overflow-hidden">
              <NacionalidadesCharts />
            </div>
          )}

          {/* Slide Footer with Dots Navigation and Index Controls */}
          <div className="pt-2.5 mt-2 border-t border-black/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {isIndex ? (
                <button
                  onClick={() => {
                    soundFx.playCardTick();
                    onBackToTimeline();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs transition-all cursor-pointer"
                  title="Voltar à Linha do Tempo (Esc)"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Linha do Tempo (Esc)</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePrevSlide}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-xs transition-all cursor-pointer"
                    title={currentSlideIndex === 0 ? "Voltar ao Índice Geral" : "Slide Anterior"}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{currentSlideIndex === 0 ? "Índice" : "Anterior"}</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playCardTick();
                      setCurrentSlideIndex(-1);
                    }}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                    title="Ver Grade de Índice"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-[#105e7b]" />
                    <span>Índice</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playCardTick();
                      onBackToTimeline();
                    }}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                    title="Voltar à Linha do Tempo (Esc)"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Linha do Tempo</span>
                  </button>
                </>
              )}
            </div>

            {/* Dots Navigation with Index Shortcut */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  soundFx.playCardTick();
                  setCurrentSlideIndex(-1);
                }}
                className={`h-6 px-2.5 rounded-full transition-all cursor-pointer flex items-center gap-1 text-[11px] font-black ${
                  isIndex
                    ? 'bg-[#105e7b] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                }`}
                title="Página de Índice Geral"
              >
                <LayoutGrid className="w-3 h-3" />
                <span className="hidden md:inline">Índice</span>
              </button>

              <div className="w-px h-3.5 bg-slate-300 mx-0.5" />

              {SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    soundFx.playCardTick();
                    setCurrentSlideIndex(idx);
                  }}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === currentSlideIndex
                      ? 'w-7 bg-[#105e7b]'
                      : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={`Slide ${idx + 1}: ${s.title}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                title="Tela Cheia"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={handleNextSlide}
                disabled={currentSlideIndex === totalSlides - 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-black text-xs disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                title="Próximo Slide (Seta Direita / Espaço)"
              >
                <span>Próximo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
