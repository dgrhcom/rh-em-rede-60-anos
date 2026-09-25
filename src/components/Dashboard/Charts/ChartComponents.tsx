import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import {
  SERVIDORES_POR_AREA,
  TOTAL_SERVIDORES_ATIVOS,
  GENERO_DATA,
  FAIXA_ETARIA_DATA,
  DESTAQUE_FAIXA_ETARIA,
  RACA_COR_DATA,
  RACA_COR_TABELA_2,
  ESCOLARIDADE_EVOLUCAO,
  ESCOLARIDADE_ZOOM_SERIES,
  TOP_CARGOS_2026,
  NACIONALIDADES_DATA,
} from '../../../data/hrStatsData';

/* =========================================================================
   DESIGN SYSTEM OFFICIAL COLOR TOKENS (DGRH / UNICAMP 60 ANOS)
   ========================================================================= */
export const DS_COLORS = {
  primary: '#105e7b',       // Azul DGRH Primária
  primaryHover: '#187fa1',
  primarySurface: '#f2f5f9',
  secondary: '#e5a93a',     // Dourado Unicamp 60 Anos Secundária
  secondaryHover: '#b8801a',
  secondarySurface: '#fffaec',
  aux1: '#477b2f',          // Verde DGRH Auxiliar 1
  aux2: '#5e2a6b',          // Roxo DGRH Auxiliar 2
  aux3: '#d67b27',          // Laranja/Terracota DGRH Auxiliar 3
  // Cores harmônicas complementares do Design System
  cobalt: '#1a508b',        // Azul Cobalto
  wine: '#6b213b',          // Vinho DGRH
  slate: '#475569',         // Slate Neutro
  slateLight: '#94a3b8',    // Slate Claro
  teal: '#0d6e8a',          // Azul Petróleo / Oceano
};

// Canvas drawing helper for high-contrast rounded badge / pill
function drawBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  bgColor: string = 'rgba(15, 23, 42, 0.85)',
  textColor: string = '#ffffff',
  fontSize: number = 14.5,
  paddingX: number = 9,
  paddingY: number = 5,
  radius: number = 6,
  borderColor: string = 'transparent'
) {
  ctx.save();
  ctx.font = `bold ${fontSize}px Inter, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const metrics = ctx.measureText(text);
  const width = metrics.width + paddingX * 2;
  const height = fontSize + paddingY * 2;
  const rx = x - width / 2;
  const ry = y - height / 2;

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  if ((ctx as any).roundRect) {
    (ctx as any).roundRect(rx, ry, width, height, radius);
  } else {
    ctx.rect(rx, ry, width, height);
  }
  ctx.fill();

  if (borderColor && borderColor !== 'transparent') {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.fillStyle = textColor;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Helper to safely load Chart.js from window or CDN
async function getChartJS() {
  if (typeof window !== 'undefined' && (window as any).Chart) {
    return (window as any).Chart;
  }
  return new Promise((resolve) => {
    if (typeof document === 'undefined') return resolve(null);
    const existing = document.querySelector('script[src*="chart.js"]');
    if (existing) {
      if ((window as any).Chart) return resolve((window as any).Chart);
      existing.addEventListener('load', () => resolve((window as any).Chart));
      existing.addEventListener('error', () => resolve(null));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => resolve((window as any).Chart);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}

/* =========================================================================
   1. GÊNERO: Pie Chart Geral Ampliado + Bar Chart por Carreira
   ========================================================================= */
export const GeneroCharts: React.FC = () => {
  const pieRef = useRef<HTMLCanvasElement | null>(null);
  const barRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let pieChart: any = null;
    let barChart: any = null;
    let active = true;

    getChartJS().then((Chart) => {
      if (!active || !Chart) return;

      // 1. Pie Chart com rótulo percentual ampliado nas fatias e sem legenda inferior
      if (pieRef.current) {
        const ctx1 = pieRef.current.getContext('2d');
        if (ctx1) {
          const piePercentageBadges = {
            id: 'generoPiePercentageBadges',
            afterDatasetsDraw(chart: any) {
              const { ctx } = chart;
              const meta = chart.getDatasetMeta(0);
              const isMobile = chart.width < 500;
              const badgeFontSize = isMobile ? 16 : 23;
              const padX = isMobile ? 10 : 16;
              const padY = isMobile ? 6 : 10;
              const items = [
                { label: 'Mulheres', pct: GENERO_DATA.total.pctFeminino, total: GENERO_DATA.total.feminino },
                { label: 'Homens', pct: GENERO_DATA.total.pctMasculino, total: GENERO_DATA.total.masculino },
              ];

              meta.data.forEach((element: any, i: number) => {
                const pos = element.tooltipPosition();
                if (!pos) return;
                const pctText = `${items[i].pct.toFixed(1).replace('.', ',')}%`;
                const text = isMobile ? pctText : `${items[i].label}: ${pctText}`;
                drawBadge(
                  ctx,
                  text,
                  pos.x,
                  pos.y,
                  'rgba(15, 23, 42, 0.92)',
                  '#ffffff',
                  badgeFontSize,
                  padX,
                  padY,
                  8,
                  'rgba(255, 255, 255, 0.45)'
                );
              });
            },
          };

          pieChart = new Chart(ctx1, {
            type: 'pie',
            data: {
              labels: ['Feminino', 'Masculino'],
              datasets: [
                {
                  data: [GENERO_DATA.total.feminino, GENERO_DATA.total.masculino],
                  backgroundColor: [DS_COLORS.primary, DS_COLORS.secondary],
                  hoverBackgroundColor: [DS_COLORS.primaryHover, DS_COLORS.secondaryHover],
                  borderWidth: 3,
                  borderColor: '#ffffff',
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: 10,
              },
              plugins: {
                legend: {
                  display: false, // Desativa a legenda inferior conforme solicitado
                },
                tooltip: {
                  padding: 14,
                  titleFont: { size: 15, weight: 'bold' },
                  bodyFont: { size: 14 },
                  callbacks: {
                    label: (ctx: any) => {
                      const val = Number(ctx.raw);
                      const pct = ctx.dataIndex === 0 ? GENERO_DATA.total.pctFeminino : GENERO_DATA.total.pctMasculino;
                      return ` ${ctx.label}: ${val.toLocaleString('pt-BR')} (${pct.toFixed(1).replace('.', ',')}%)`;
                    },
                  },
                },
              },
            },
            plugins: [piePercentageBadges],
          });
        }
      }

      // 2. Bar Chart por Carreira com rótulos de porcentagem e eixos bem maiores
      if (barRef.current) {
        const ctx2 = barRef.current.getContext('2d');
        if (ctx2) {
          const barLabelPlugin = {
            id: 'groupedBarPercentageLabels',
            afterDatasetsDraw(chart: any) {
              const { ctx } = chart;
              const isMobile = chart.width < 500;
              const fontSize = isMobile ? 17 : 24;

              chart.data.datasets.forEach((dataset: any, dIdx: number) => {
                const meta = chart.getDatasetMeta(dIdx);
                meta.data.forEach((element: any, index: number) => {
                  const val = dataset.data[index];
                  const text = `${Number(val).toFixed(1).replace('.', ',')}%`;
                  ctx.save();
                  ctx.font = `bold ${fontSize}px Inter, -apple-system, sans-serif`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'bottom';
                  ctx.fillStyle = '#0f172a';
                  ctx.fillText(text, element.x, element.y - 8);
                  ctx.restore();
                });
              });
            },
          };

          barChart = new Chart(ctx2, {
            type: 'bar',
            data: {
              labels: [
                ['Técnico-administrativos', '(PAEPE)'],
                'Docentes',
                ['Pesquisadores', '(PQ)'],
              ],
              datasets: [
                {
                  label: 'Feminino (%)',
                  data: GENERO_DATA.porCarreira.map((c) => c.pctFeminino),
                  backgroundColor: DS_COLORS.primary,
                  hoverBackgroundColor: DS_COLORS.primaryHover,
                  borderRadius: 8,
                  borderSkipped: false,
                },
                {
                  label: 'Masculino (%)',
                  data: GENERO_DATA.porCarreira.map((c) => c.pctMasculino),
                  backgroundColor: DS_COLORS.secondary,
                  hoverBackgroundColor: DS_COLORS.secondaryHover,
                  borderRadius: 8,
                  borderSkipped: false,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: {
                  top: 28,
                  bottom: 4,
                },
              },
              scales: {
                y: {
                  max: 75,
                  suggestedMax: 75,
                  ticks: {
                    stepSize: 15,
                    callback: (val: any) => `${val}%`,
                    font: { weight: 'bold', size: 14 },
                    color: '#475569',
                  },
                  grid: { color: 'rgba(0,0,0,0.06)' },
                },
                x: {
                  grid: { display: false },
                  ticks: {
                    font: { weight: 'bold', size: 16 },
                    color: '#0f172a',
                    padding: 8,
                  },
                },
              },
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    boxWidth: 16,
                    boxHeight: 16,
                    font: { weight: 'bold', size: 15 },
                    color: '#0f172a',
                    padding: 18,
                  },
                },
                tooltip: {
                  padding: 14,
                  titleFont: { size: 15, weight: 'bold' },
                  bodyFont: { size: 14 },
                  callbacks: {
                    label: (ctx: any) => {
                      const careerIdx = ctx.dataIndex;
                      const career = GENERO_DATA.porCarreira[careerIdx];
                      const count = ctx.datasetIndex === 0 ? career.feminino : career.masculino;
                      return ` ${ctx.dataset.label}: ${Number(ctx.raw).toFixed(1).replace('.', ',')}% (${count.toLocaleString('pt-BR')} servidores)`;
                    },
                  },
                },
              },
            },
            plugins: [barLabelPlugin],
          });
        }
      }
    });

    return () => {
      active = false;
      pieChart?.destroy();
      barChart?.destroy();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-center w-full h-full">
      {/* Coluna Esquerda: Gráfico de Pizza Geral Ampliado (Sem legenda inferior) */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center relative w-full">
        {/* Canvas da Pizza com dimensões substanciais */}
        <div className="w-full h-[350px] sm:h-[420px] lg:h-[480px] xl:h-[530px] relative flex items-center justify-center">
          <canvas ref={pieRef} />
        </div>

        {/* Resumo Absoluto e Percentual no Rodapé da Coluna Esquerda */}
        <div className="w-full max-w-[460px] grid grid-cols-2 gap-2.5 sm:gap-3 mt-2.5">
          <div className="px-3.5 py-2.5 rounded-2xl bg-white border-2 border-[#105e7b] flex flex-col items-center justify-center shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mulheres</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg lg:text-xl font-black text-[#105e7b]">
                {GENERO_DATA.total.feminino.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#105e7b]/80">
                ({GENERO_DATA.total.pctFeminino.toFixed(1).replace('.', ',')}%)
              </span>
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-2xl bg-white border-2 border-[#e5a93a] flex flex-col items-center justify-center shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Homens</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg lg:text-xl font-black text-[#b45309]">
                {GENERO_DATA.total.masculino.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#b45309]/80">
                ({GENERO_DATA.total.pctMasculino.toFixed(1).replace('.', ',')}%)
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mt-2">
          <span className="text-xs sm:text-sm font-semibold text-slate-600">
            Total Institucional: <strong className="text-slate-900 font-black">{GENERO_DATA.total.total.toLocaleString('pt-BR')}</strong> servidores ativos
          </span>
        </div>
      </div>

      {/* Coluna Direita: Gráfico de Barras por Carreira com % e rótulos X bem maiores */}
      <div className="lg:col-span-7 flex flex-col justify-center w-full h-[380px] sm:h-[450px] lg:h-[520px] xl:h-[580px]">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm sm:text-base lg:text-lg font-black uppercase text-slate-800 tracking-wider text-center md:text-left">
            Distribuição Percentual por Carreira
          </h4>
        </div>
        <div className="flex-1 w-full relative">
          <canvas ref={barRef} />
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   2. FAIXA ETÁRIA: Histogram Bar Chart with Highlight & Percentage Badges
   ========================================================================= */
export const FaixaEtariaBarChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any>(null);

  const totalDocentes = FAIXA_ETARIA_DATA.reduce((acc, f) => acc + f.docentes, 0);
  const totalPesquisadores = FAIXA_ETARIA_DATA.reduce((acc, f) => acc + f.pesquisadores, 0);
  const totalTecnicos = FAIXA_ETARIA_DATA.reduce((acc, f) => acc + f.tecnicos, 0);
  const totalGeral = totalDocentes + totalPesquisadores + totalTecnicos;

  const toggleDataset = (datasetIndex: number) => {
    if (!chartInstanceRef.current) return;
    const isVisible = chartInstanceRef.current.isDatasetVisible(datasetIndex);
    chartInstanceRef.current.setDatasetVisibility(datasetIndex, !isVisible);
    chartInstanceRef.current.update();
  };

  useEffect(() => {
    let chart: any = null;
    let active = true;

    getChartJS().then((Chart) => {
      if (!active || !canvasRef.current || !Chart) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const topStackPercentagePlugin = {
        id: 'topStackPercentageBadges',
        afterDatasetsDraw(chartInstance: any) {
          const c = chartInstance.ctx;
          const metaLast = chartInstance.getDatasetMeta(chartInstance.data.datasets.length - 1);
          const isMobile = chartInstance.width < 500;
          const fontSize = isMobile ? 17 : 24;

          FAIXA_ETARIA_DATA.forEach((item, index) => {
            const element = metaLast.data[index];
            if (!element) return;
            const text = `${item.pct.toFixed(1).replace('.', ',')}%`;

            c.save();
            c.font = `bold ${fontSize}px Inter, -apple-system, sans-serif`;
            c.textAlign = 'center';
            c.textBaseline = 'bottom';
            c.fillStyle = '#0f172a';
            c.fillText(text, element.x, element.y - 8);
            c.restore();
          });
        },
      };

      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: FAIXA_ETARIA_DATA.map((f) => f.faixa),
          datasets: [
            {
              label: 'Docentes',
              data: FAIXA_ETARIA_DATA.map((f) => f.docentes),
              backgroundColor: DS_COLORS.aux2, // Roxo DGRH
              borderRadius: 6,
            },
            {
              label: 'Pesquisadores (PQ)',
              data: FAIXA_ETARIA_DATA.map((f) => f.pesquisadores),
              backgroundColor: DS_COLORS.aux1, // Verde DGRH
              borderRadius: 6,
            },
            {
              label: 'Técnicos-administrativos (PAEPE)',
              data: FAIXA_ETARIA_DATA.map((f) => f.tecnicos),
              backgroundColor: DS_COLORS.primary, // Azul Primário DGRH
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: { top: 34 },
          },
          scales: {
            x: {
              stacked: true,
              grid: { display: false },
              ticks: { font: { weight: 'bold', size: 15 }, color: '#0f172a' },
            },
            y: {
              stacked: true,
              suggestedMax: 3450,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { weight: 'bold', size: 14 },
                color: '#475569',
                callback: (val: any) => Number(val).toLocaleString('pt-BR'),
              },
            },
          },
          plugins: {
            legend: {
              display: false, // Desativada a legenda no topo do canvas, transferida para coluna da direita
            },
            tooltip: {
              padding: 12,
              titleFont: { size: 14, weight: 'bold' },
              bodyFont: { size: 13 },
              callbacks: {
                label: (ctx: any) => {
                  const val = Number(ctx.raw);
                  const item = FAIXA_ETARIA_DATA[ctx.dataIndex];
                  const pct = item.total > 0 ? ((val / item.total) * 100).toFixed(1).replace('.', ',') : '0';
                  return ` ${ctx.dataset.label}: ${val.toLocaleString('pt-BR')} (${pct}% da faixa)`;
                },
                footer: (items: any[]) => {
                  if (!items.length) return '';
                  const item = FAIXA_ETARIA_DATA[items[0].dataIndex];
                  return `Total da faixa: ${item.total.toLocaleString('pt-BR')} servidores (${item.pct.toFixed(1).replace('.', ',')}% do quadro)`;
                },
              },
            },
          },
        },
        plugins: [topStackPercentagePlugin],
      });

      chartInstanceRef.current = chart;
    });

    return () => {
      active = false;
      chartInstanceRef.current = null;
      chart?.destroy();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-center w-full h-full">
      {/* Coluna Esquerda: Gráfico de Barras Empilhadas Ampliado (Ocupa a maior parte da tela) */}
      <div className="lg:col-span-8 xl:col-span-9 flex flex-col justify-center relative w-full h-[400px] sm:h-[480px] lg:h-[550px] xl:h-[600px]">
        <canvas ref={canvasRef} />
      </div>

      {/* Coluna Direita Pequena: Destaque Demográfico e depois a Legenda */}
      <div className="lg:col-span-4 xl:col-span-3 flex flex-col justify-center gap-3 sm:gap-3.5 w-full">
        {/* 1. Destaque Demográfico */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-2.5 shadow-xs">
          <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-xs font-black uppercase text-amber-900 tracking-wider block mb-1">
              Destaque Demográfico
            </span>
            <div className="text-xs sm:text-sm font-semibold text-amber-950 leading-relaxed space-y-1">
              <p>• {DESTAQUE_FAIXA_ETARIA.jovem}</p>
              <p>• {DESTAQUE_FAIXA_ETARIA.velho}</p>
            </div>
          </div>
        </div>

        {/* 2. Depois a Legenda */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider px-1">
            Legenda por Carreira
          </span>

          {/* Docentes */}
          <div
            onClick={() => toggleDataset(0)}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between transition-all hover:shadow-md cursor-pointer group select-none"
            style={{ borderLeftWidth: '5px', borderLeftColor: DS_COLORS.aux2 }}
            title="Clique para alternar visibilidade de Docentes"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: DS_COLORS.aux2 }} />
              <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-slate-950">Docentes</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-900 px-2 py-0.5 rounded-lg bg-slate-100">
              {totalDocentes.toLocaleString('pt-BR')}
            </div>
          </div>

          {/* Pesquisadores */}
          <div
            onClick={() => toggleDataset(1)}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between transition-all hover:shadow-md cursor-pointer group select-none"
            style={{ borderLeftWidth: '5px', borderLeftColor: DS_COLORS.aux1 }}
            title="Clique para alternar visibilidade de Pesquisadores"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: DS_COLORS.aux1 }} />
              <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-slate-950">Pesquisadores (PQ)</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-900 px-2 py-0.5 rounded-lg bg-slate-100">
              {totalPesquisadores.toLocaleString('pt-BR')}
            </div>
          </div>

          {/* Técnicos (PAEPE) */}
          <div
            onClick={() => toggleDataset(2)}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between transition-all hover:shadow-md cursor-pointer group select-none"
            style={{ borderLeftWidth: '5px', borderLeftColor: DS_COLORS.primary }}
            title="Clique para alternar visibilidade de PAEPE"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: DS_COLORS.primary }} />
              <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-slate-950">PAEPE</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-900 px-2 py-0.5 rounded-lg bg-slate-100">
              {totalTecnicos.toLocaleString('pt-BR')}
            </div>
          </div>

          {/* Total Geral */}
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 text-white flex items-center justify-between shadow-xs mt-0.5">
            <span className="text-xs font-semibold text-slate-300">Total Analisado</span>
            <span className="text-xs sm:text-sm font-black text-amber-400">
              {totalGeral.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. RAÇA / COR INTEGRADO: Pizza Geral Ampliada (Esq) + Barras por Categoria (Dir)
   ========================================================================= */
export const RacaCorCharts: React.FC = () => {
  const pieRef = useRef<HTMLCanvasElement | null>(null);
  const barRef = useRef<HTMLCanvasElement | null>(null);

  const palette = [
    DS_COLORS.primary,   // Branca (71.9%)
    DS_COLORS.secondary, // Parda (18.3%)
    DS_COLORS.aux3,      // Preta (5.6%)
    DS_COLORS.aux1,      // Amarela (1.3%)
    DS_COLORS.slate,     // Não Informado (2.7%)
    DS_COLORS.aux2,      // Indígena (0.3%)
  ];

  // Fatias com tamanho reduzido (< 4%) que ficam ocultas no corpo da pizza para evitar sobreposição
  const hiddenSlices = RACA_COR_DATA.map((item, index) => ({
    ...item,
    color: palette[index],
  })).filter((item) => item.pct < 4.0);

  useEffect(() => {
    let pieChart: any = null;
    let barChart: any = null;
    let active = true;

    getChartJS().then((Chart) => {
      if (!active || !Chart) return;

      // 1. Pizza Visão Geral Ampliada (Sem legenda inferior, com badges de porcentagem destacados)
      if (pieRef.current) {
        const ctx1 = pieRef.current.getContext('2d');
        if (ctx1) {
          const pieSliceLabelsPlugin = {
            id: 'racaCorPiePercentageLabels',
            afterDatasetsDraw(chartInstance: any) {
              const c = chartInstance.ctx;
              const meta = chartInstance.getDatasetMeta(0);
              const isMobile = chartInstance.width < 500;
              const badgeFontSize = isMobile ? 15 : 21;
              const padX = isMobile ? 8 : 14;
              const padY = isMobile ? 5 : 8;

              RACA_COR_DATA.forEach((item, i) => {
                if (item.pct < 4.0) return; // evita sobreposição em fatias milimétricas (Amarela, Não Info, Indígena)
                const element = meta.data[i];
                if (!element) return;
                const pos = element.tooltipPosition();
                if (!pos) return;
                const text = isMobile ? `${item.pct.toFixed(1).replace('.', ',')}%` : `${item.raca}: ${item.pct.toFixed(1).replace('.', ',')}%`;
                drawBadge(
                  c,
                  text,
                  pos.x,
                  pos.y,
                  'rgba(15, 23, 42, 0.92)',
                  '#ffffff',
                  badgeFontSize,
                  padX,
                  padY,
                  8,
                  'rgba(255, 255, 255, 0.45)'
                );
              });
            },
          };

          pieChart = new Chart(ctx1, {
            type: 'pie',
            data: {
              labels: RACA_COR_DATA.map((r) => r.raca),
              datasets: [
                {
                  data: RACA_COR_DATA.map((r) => r.total),
                  backgroundColor: palette,
                  borderWidth: 3,
                  borderColor: '#ffffff',
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: 10,
              },
              plugins: {
                legend: {
                  display: false, // Desativa legenda inferior do gráfico de pizza conforme solicitado
                },
                tooltip: {
                  padding: 14,
                  titleFont: { size: 15, weight: 'bold' },
                  bodyFont: { size: 14 },
                  callbacks: {
                    label: (ctx: any) => {
                      const item = RACA_COR_DATA[ctx.dataIndex];
                      return ` ${item.raca}: ${item.total.toLocaleString('pt-BR')} (${item.pct.toFixed(1).replace('.', ',')}%)`;
                    },
                  },
                },
              },
            },
            plugins: [pieSliceLabelsPlugin],
          });
        }
      }

      // 2. Barras Empilhadas - Detalhamento por Carreira (Única legenda do slide e fontes ampliadas)
      if (barRef.current) {
        const ctx2 = barRef.current.getContext('2d');
        if (ctx2) {
          const horizontalStackLabelsPlugin = {
            id: 'horizontalStackPercentageLabels',
            afterDatasetsDraw(chartInstance: any) {
              const c = chartInstance.ctx;
              const metaLast = chartInstance.getDatasetMeta(chartInstance.data.datasets.length - 1);
              const isMobile = chartInstance.width < 500;
              const fontSize = isMobile ? 17 : 24;

              RACA_COR_TABELA_2.forEach((item, index) => {
                const element = metaLast.data[index];
                if (!element) return;
                const racaGeral = RACA_COR_DATA.find((r) => r.raca === item.raca);
                const pct = racaGeral ? racaGeral.pct.toFixed(1).replace('.', ',') : '0';
                const text = `${pct}% (${item.total.toLocaleString('pt-BR')})`;

                c.save();
                c.font = `bold ${fontSize}px Inter, -apple-system, sans-serif`;
                c.textAlign = 'left';
                c.textBaseline = 'middle';
                c.fillStyle = '#0f172a';
                c.fillText(text, element.x + 10, element.y);
                c.restore();
              });
            },
          };

          barChart = new Chart(ctx2, {
            type: 'bar',
            data: {
              labels: RACA_COR_TABELA_2.map((r) => r.raca),
              datasets: [
                {
                  label: 'Docentes',
                  data: RACA_COR_TABELA_2.map((r) => r.docentes),
                  backgroundColor: DS_COLORS.aux2, // Roxo DGRH
                  borderRadius: 4,
                },
                {
                  label: 'Pesquisadores',
                  data: RACA_COR_TABELA_2.map((r) => r.pesquisadores),
                  backgroundColor: DS_COLORS.aux1, // Verde DGRH
                  borderRadius: 4,
                },
                {
                  label: 'PAEPE',
                  data: RACA_COR_TABELA_2.map((r) => r.tecnicos),
                  backgroundColor: DS_COLORS.primary, // Azul Primário
                  borderRadius: 4,
                },
                {
                  label: 'Extra-quadro',
                  data: RACA_COR_TABELA_2.map((r) => r.extraQuadro),
                  backgroundColor: DS_COLORS.secondary, // Dourado Secundário
                  borderRadius: 4,
                },
              ],
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: { right: 165 },
              },
              scales: {
                x: {
                  stacked: true,
                  suggestedMax: 12500,
                  grid: { color: 'rgba(0,0,0,0.06)' },
                  ticks: {
                    font: { weight: 'bold', size: 13 },
                    color: '#475569',
                    callback: (val: any) => Number(val).toLocaleString('pt-BR'),
                  },
                },
                y: {
                  stacked: true,
                  grid: { display: false },
                  ticks: {
                    font: { weight: 'bold', size: 16 },
                    color: '#0f172a',
                    padding: 8,
                  },
                },
              },
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    boxWidth: 16,
                    boxHeight: 16,
                    font: { weight: 'bold', size: 14 },
                    color: '#0f172a',
                    padding: 16,
                  },
                },
                tooltip: {
                  padding: 12,
                  titleFont: { size: 14, weight: 'bold' },
                  bodyFont: { size: 13 },
                  callbacks: {
                    label: (ctx: any) => {
                      const val = Number(ctx.raw);
                      const item = RACA_COR_TABELA_2[ctx.dataIndex];
                      const pct = item.total > 0 ? ((val / item.total) * 100).toFixed(1).replace('.', ',') : '0';
                      return ` ${ctx.dataset.label}: ${val.toLocaleString('pt-BR')} (${pct}%)`;
                    },
                    footer: (items: any[]) => {
                      if (!items.length) return '';
                      const item = RACA_COR_TABELA_2[items[0].dataIndex];
                      return `Total no grupo: ${item.total.toLocaleString('pt-BR')} servidores`;
                    },
                  },
                },
              },
            },
            plugins: [horizontalStackLabelsPlugin],
          });
        }
      }
    });

    return () => {
      active = false;
      pieChart?.destroy();
      barChart?.destroy();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-center w-full h-full">
      {/* Coluna Esquerda: Pizza Visão Geral Ampliada com rótulos para fatias menores abaixo */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center relative w-full">
        {/* Canvas da Pizza com proporção harmonizada */}
        <div className="w-full h-[360px] sm:h-[430px] lg:h-[490px] xl:h-[530px] relative flex items-center justify-center">
          <canvas ref={pieRef} />
        </div>

        {/* Rótulos para as peças da pizza ocultadas por conta do tamanho reduzido */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-2.5 px-2">
          {hiddenSlices.map((item) => (
            <div
              key={item.raca}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white shadow-sm border border-slate-700/60"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 border border-white/60 shadow-xs"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs sm:text-sm font-bold tracking-tight">
                {item.raca}:{' '}
                <span className="text-amber-300 font-black">
                  {item.pct.toFixed(1).replace('.', ',')}%
                </span>
              </span>
              <span className="text-[11px] sm:text-xs text-slate-300 font-medium">
                ({item.total.toLocaleString('pt-BR')})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Coluna Direita: Barras Empilhadas por Carreira com Rótulos e Fontes Ampliadas */}
      <div className="lg:col-span-7 flex flex-col justify-center w-full h-[380px] sm:h-[460px] lg:h-[530px] xl:h-[580px]">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm sm:text-base lg:text-lg font-black uppercase text-slate-800 tracking-wider text-center md:text-left">
            Composição por Carreira Funcional
          </h4>
        </div>
        <div className="flex-1 w-full relative">
          <canvas ref={barRef} />
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3b. RAÇA / COR: Tabela 2 Individual (Legado / Suporte)
   ========================================================================= */
export const RacaCorTabela2BarChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let chart: any = null;
    let active = true;

    getChartJS().then((Chart) => {
      if (!active || !canvasRef.current || !Chart) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: RACA_COR_TABELA_2.map((r) => r.raca),
          datasets: [
            {
              label: 'Docentes',
              data: RACA_COR_TABELA_2.map((r) => r.docentes),
              backgroundColor: DS_COLORS.aux2,
              borderRadius: 4,
            },
            {
              label: 'Pesquisadores (PQ)',
              data: RACA_COR_TABELA_2.map((r) => r.pesquisadores),
              backgroundColor: DS_COLORS.aux1,
              borderRadius: 4,
            },
            {
              label: 'Técnicos-administrativos (PAEPE)',
              data: RACA_COR_TABELA_2.map((r) => r.tecnicos),
              backgroundColor: DS_COLORS.primary,
              borderRadius: 4,
            },
            {
              label: 'Extra-quadro',
              data: RACA_COR_TABELA_2.map((r) => r.extraQuadro),
              backgroundColor: DS_COLORS.secondary,
              borderRadius: 4,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: true,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { weight: 'bold', size: 11 },
                color: '#64748b',
                callback: (val: any) => Number(val).toLocaleString('pt-BR'),
              },
            },
            y: {
              stacked: true,
              grid: { display: false },
              ticks: { font: { weight: 'bold', size: 11 }, color: '#0f172a' },
            },
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                boxHeight: 12,
                font: { weight: 'bold', size: 11 },
                color: '#1e293b',
              },
            },
            tooltip: {
              padding: 12,
              callbacks: {
                label: (ctx: any) => {
                  const val = Number(ctx.raw);
                  const item = RACA_COR_TABELA_2[ctx.dataIndex];
                  const pct = item.total > 0 ? ((val / item.total) * 100).toFixed(1).replace('.', ',') : '0';
                  return ` ${ctx.dataset.label}: ${val.toLocaleString('pt-BR')} (${pct}%)`;
                },
                footer: (items: any[]) => {
                  if (!items.length) return '';
                  const item = RACA_COR_TABELA_2[items[0].dataIndex];
                  return `Total: ${item.total.toLocaleString('pt-BR')} servidores`;
                },
              },
            },
          },
        },
      });
    });

    return () => {
      active = false;
      chart?.destroy();
    };
  }, []);

  return (
    <div className="w-full h-[280px] sm:h-[300px]">
      <canvas ref={canvasRef} />
    </div>
  );
};

/* =========================================================================
   3c. RAÇA / COR: Gráfico de Barras Simples (Legado / Suporte)
   ========================================================================= */
export const RacaCorBarChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let chart: any = null;
    let active = true;

    getChartJS().then((Chart) => {
      if (!active || !canvasRef.current || !Chart) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const colors = [
        DS_COLORS.primary,
        DS_COLORS.secondary,
        DS_COLORS.aux3,
        DS_COLORS.aux1,
        DS_COLORS.slate,
        DS_COLORS.aux2,
      ];

      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: RACA_COR_DATA.map((r) => r.raca),
          datasets: [
            {
              label: 'Servidores',
              data: RACA_COR_DATA.map((r) => r.total),
              backgroundColor: colors,
              borderRadius: 6,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { weight: 'bold', size: 11 },
                color: '#64748b',
                callback: (val: any) => Number(val).toLocaleString('pt-BR'),
              },
            },
            y: {
              grid: { display: false },
              ticks: { font: { weight: 'bold', size: 11 }, color: '#0f172a' },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx: any) => {
                  const item = RACA_COR_DATA[ctx.dataIndex];
                  return ` ${item.total.toLocaleString('pt-BR')} (${item.pct.toFixed(1).replace('.', ',')}%)`;
                },
              },
            },
          },
        },
      });
    });

    return () => {
      active = false;
      chart?.destroy();
    };
  }, []);

  return (
    <div className="w-full h-[280px]">
      <canvas ref={canvasRef} />
    </div>
  );
};

/* =========================================================================
   4. ESCOLARIDADE: Evolução Completa em Linhas (Todas as Categorias)
   ========================================================================= */
export const EscolaridadeEvolucaoLineChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let chart: any = null;
    let active = true;

    getChartJS().then((Chart) => {
      if (!active || !canvasRef.current || !Chart) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const totalPAEPE2026 = 7333; // Soma total dos servidores PAEPE em 2026

      const lineEndPercentageBadgesPlugin = {
        id: 'lineEndPercentageBadges',
        afterDatasetsDraw(chartInstance: any) {
          const c = chartInstance.ctx;
          chartInstance.data.datasets.forEach((dataset: any, dIdx: number) => {
            const meta = chartInstance.getDatasetMeta(dIdx);
            const lastElement = meta.data[meta.data.length - 1];
            if (!lastElement) return;

            const lastVal = Number(dataset.data[dataset.data.length - 1]);
            const pct = ((lastVal / totalPAEPE2026) * 100).toFixed(1).replace('.', ',') + '%';

            drawBadge(c, pct, lastElement.x + 30, lastElement.y, dataset.borderColor, '#ffffff', 15.5, 9, 5, 6);
          });
        },
      };

      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ESCOLARIDADE_EVOLUCAO.anos,
          datasets: ESCOLARIDADE_EVOLUCAO.series.map((s) => ({
            label: s.nivel,
            data: s.valores,
            borderColor: s.cor,
            backgroundColor: s.cor,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 3,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: { right: 85 },
          },
          scales: {
            y: {
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { weight: 'bold', size: 13 },
                color: '#475569',
                callback: (val: any) => Number(val).toLocaleString('pt-BR'),
              },
            },
            x: {
              grid: { display: false },
              ticks: { font: { weight: 'bold', size: 14 }, color: '#0f172a' },
            },
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 14,
                boxHeight: 14,
                font: { weight: 'bold', size: 13 },
                color: '#1e293b',
                padding: 14,
              },
            },
            tooltip: {
              padding: 12,
              titleFont: { size: 14, weight: 'bold' },
              bodyFont: { size: 13 },
              callbacks: {
                label: (ctx: any) => {
                  const val = Number(ctx.raw);
                  const pct = ((val / totalPAEPE2026) * 100).toFixed(1).replace('.', ',');
                  return ` ${ctx.dataset.label}: ${val.toLocaleString('pt-BR')} (${pct}% do quadro PAEPE em 2026)`;
                },
              },
            },
          },
        },
        plugins: [lineEndPercentageBadgesPlugin],
      });
    });

    return () => {
      active = false;
      chart?.destroy();
    };
  }, []);

  return (
    <div className="w-full h-[400px] sm:h-[470px] lg:h-[530px] xl:h-[580px] relative">
      <canvas ref={canvasRef} />
    </div>
  );
};

/* =========================================================================
   5. ESCOLARIDADE: Zoom em Linha (Mestrado, Doutorado, Fundamental...)
   ========================================================================= */
export const EscolaridadeZoomLineChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let chart: any = null;
    let active = true;

    getChartJS().then((Chart) => {
      if (!active || !canvasRef.current || !Chart) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const totalPAEPE2026 = 7333;

      const zoomLineEndPercentagePlugin = {
        id: 'zoomLineEndPercentages',
        afterDatasetsDraw(chartInstance: any) {
          const c = chartInstance.ctx;
          chartInstance.data.datasets.forEach((dataset: any, dIdx: number) => {
            const meta = chartInstance.getDatasetMeta(dIdx);
            const lastElement = meta.data[meta.data.length - 1];
            if (!lastElement) return;

            const lastVal = Number(dataset.data[dataset.data.length - 1]);
            const pct = ((lastVal / totalPAEPE2026) * 100).toFixed(1).replace('.', ',') + '%';

            drawBadge(c, pct, lastElement.x + 30, lastElement.y, dataset.borderColor, '#ffffff', 15.5, 9, 5, 6);
          });
        },
      };

      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ESCOLARIDADE_EVOLUCAO.anos,
          datasets: ESCOLARIDADE_ZOOM_SERIES.map((s) => ({
            label: s.nivel,
            data: s.valores,
            borderColor: s.cor,
            backgroundColor: s.cor,
            tension: 0.3,
            pointRadius: 6,
            pointHoverRadius: 8,
            borderWidth: 3.5,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: { right: 85 },
          },
          scales: {
            y: {
              min: 0,
              max: 500,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { weight: 'bold', size: 13 },
                color: '#475569',
                callback: (val: any) => Number(val).toLocaleString('pt-BR'),
              },
            },
            x: {
              grid: { display: false },
              ticks: { font: { weight: 'bold', size: 14 }, color: '#0f172a' },
            },
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 14,
                boxHeight: 14,
                font: { weight: 'bold', size: 13 },
                color: '#1e293b',
                padding: 14,
              },
            },
            tooltip: {
              padding: 12,
              titleFont: { size: 14, weight: 'bold' },
              bodyFont: { size: 13 },
              callbacks: {
                label: (ctx: any) => {
                  const val = Number(ctx.raw);
                  const pct = ((val / totalPAEPE2026) * 100).toFixed(1).replace('.', ',');
                  return ` ${ctx.dataset.label}: ${val.toLocaleString('pt-BR')} servidores (${pct}%)`;
                },
              },
            },
          },
        },
        plugins: [zoomLineEndPercentagePlugin],
      });
    });

    return () => {
      active = false;
      chart?.destroy();
    };
  }, []);

  return (
    <div className="w-full h-[400px] sm:h-[470px] lg:h-[530px] xl:h-[580px] relative">
      <canvas ref={canvasRef} />
    </div>
  );
};

/* =========================================================================
   5b. ESCOLARIDADE: Comparison Bar Chart (Legado / Suporte)
   ========================================================================= */
export const EscolaridadeComparisonChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let chart: any = null;
    let active = true;

    getChartJS().then((Chart) => {
      if (!active || !canvasRef.current || !Chart) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const labels = ESCOLARIDADE_EVOLUCAO.series.map((s) => s.nivel);
      const data2016 = ESCOLARIDADE_EVOLUCAO.series.map((s) => s.valores[0]);
      const data2026 = ESCOLARIDADE_EVOLUCAO.series.map((s) => s.valores[s.valores.length - 1]);

      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Ano 2016',
              data: data2016,
              backgroundColor: DS_COLORS.slateLight,
              borderRadius: 6,
            },
            {
              label: 'Ano 2026',
              data: data2026,
              backgroundColor: DS_COLORS.primary,
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { weight: 'bold', size: 11 },
                color: '#64748b',
                callback: (val: any) => Number(val).toLocaleString('pt-BR'),
              },
            },
            x: {
              grid: { display: false },
              ticks: { font: { weight: 'bold', size: 10 }, color: '#0f172a' },
            },
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                font: { weight: 'bold', size: 12 },
                color: '#1e293b',
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx: any) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString('pt-BR')} servidores`,
              },
            },
          },
        },
      });
    });

    return () => {
      active = false;
      chart?.destroy();
    };
  }, []);

  return (
    <div className="w-full h-[290px]">
      <canvas ref={canvasRef} />
    </div>
  );
};

/* =========================================================================
   6. SERVIDORES ATIVOS: Gráfico de Pizza Oficial da Planilha (Por Área)
   ========================================================================= */
export const ServidoresPorAreaPieChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let chart: any = null;
    let active = true;

    getChartJS().then((Chart) => {
      if (!active || !canvasRef.current || !Chart) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const pieSliceBadgePlugin = {
        id: 'pieSliceBadges',
        afterDatasetsDraw(chartInstance: any) {
          const c = chartInstance.ctx;
          const meta = chartInstance.getDatasetMeta(0);
          const isMobile = chartInstance.width < 500;
          const badgeFontSize = isMobile ? 16 : 23;
          const padX = isMobile ? 10 : 15;
          const padY = isMobile ? 6 : 9;
          SERVIDORES_POR_AREA.forEach((area, i) => {
            const element = meta.data[i];
            if (!element) return;
            const pos = element.tooltipPosition();
            if (!pos) return;
            const text = `${area.percentual.toFixed(1).replace('.', ',')}%`;
            drawBadge(
              c,
              text,
              pos.x,
              pos.y,
              'rgba(15, 23, 42, 0.92)',
              '#ffffff',
              badgeFontSize,
              padX,
              padY,
              8,
              'rgba(255, 255, 255, 0.45)'
            );
          });
        },
      };

      chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: SERVIDORES_POR_AREA.map((a) => `${a.tipoOrgao} (${a.percentual.toFixed(1).replace('.', ',')}%)`),
          datasets: [
            {
              data: SERVIDORES_POR_AREA.map((a) => a.total),
              backgroundColor: SERVIDORES_POR_AREA.map((a) => a.cor),
              hoverBackgroundColor: SERVIDORES_POR_AREA.map((a) => a.cor),
              borderColor: '#ffffff',
              borderWidth: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: 10,
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              padding: 14,
              titleFont: { size: 15, weight: 'bold' },
              bodyFont: { size: 14 },
              callbacks: {
                label: (ctx: any) => {
                  const area = SERVIDORES_POR_AREA[ctx.dataIndex];
                  return ` ${area.tipoOrgao}: ${area.total.toLocaleString('pt-BR')} servidores (${area.percentual.toFixed(1).replace('.', ',')}%)`;
                },
                afterLabel: (ctx: any) => {
                  const area = SERVIDORES_POR_AREA[ctx.dataIndex];
                  return ` Docentes: ${area.docentes.toLocaleString('pt-BR')} | Pesquisadores: ${area.pesquisadores} | PAEPE: ${area.tecnicos.toLocaleString('pt-BR')}`;
                },
              },
            },
          },
        },
        plugins: [pieSliceBadgePlugin],
      });
    });

    return () => {
      active = false;
      chart?.destroy();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-center w-full h-full">
      {/* Left Column: Official Pie Chart with Data Labels (Significantly enlarged) */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-center relative w-full h-[400px] sm:h-[480px] lg:h-[550px] xl:h-[610px]">
        <canvas ref={canvasRef} />
      </div>

      {/* Right Column: Cards with Absolute Values & Large Typography (Narrower column) */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-center gap-2.5 sm:gap-3">
        {/* Callout box for highlighted percentages */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-800 flex items-start gap-2.5 shadow-xs">
          <Sparkles className="w-5 h-5 text-[#105e7b] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm lg:text-[14px] leading-relaxed font-normal text-slate-700">
            <span className="font-semibold text-slate-900">Concentração Funcional:</span> 70,6% de todo o quadro concentra-se em <span className="font-medium text-slate-900">Faculdades e Institutos (38,5%)</span> e na <span className="font-medium text-slate-900">Área da Saúde (32,1%)</span>.
          </div>
        </div>

        {/* 5 Area Breakdown Cards - 1 column layout, elegant lighter font weight, absolute server count in badge */}
        <div className="flex flex-col gap-2 sm:gap-2.5">
          {SERVIDORES_POR_AREA.map((item) => (
            <div
              key={item.tipoOrgao}
              className="px-4 py-2.5 sm:py-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md"
              style={{ borderLeftWidth: '5px', borderLeftColor: item.cor }}
            >
              <div className="min-w-0 pr-3">
                <div className="text-sm sm:text-base lg:text-lg xl:text-[19px] font-medium text-slate-800 tracking-tight">
                  {item.tipoOrgao}
                </div>
              </div>
              <div
                className="px-3.5 sm:px-4 py-1.5 rounded-xl text-sm sm:text-base lg:text-lg font-semibold text-white shrink-0 shadow-xs tracking-wider"
                style={{ backgroundColor: item.cor }}
              >
                {item.total.toLocaleString('pt-BR')}
              </div>
            </div>
          ))}

          {/* Total summary banner */}
          <div className="px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-950 text-white flex items-center justify-between shadow-md mt-1">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-slate-300">Total Geral da Universidade</span>
            <span className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-amber-400 tracking-wider">
              {TOTAL_SERVIDORES_ATIVOS.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   7. TOP 20 CARGOS: Ranked Horizontal Bar Chart com Rótulos de Porcentagem
   ========================================================================= */
export const TopCargosBarChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let chart: any = null;
    let active = true;

    getChartJS().then((Chart) => {
      if (!active || !canvasRef.current || !Chart) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const top20 = TOP_CARGOS_2026.slice(0, 20);
      const totalGeral = 9416;

      const cargoCategoryColor = (categoria: string) => {
        switch (categoria) {
          case 'Saúde':
            return DS_COLORS.aux3;     // Laranja/Terracota Saúde (#d67b27)
          case 'Educação, Pesquisa e Ciência':
            return DS_COLORS.aux1;     // Verde DGRH (#477b2f)
          case 'Tecnologia da Informação (TI)':
            return DS_COLORS.secondary;// Dourado 60 Anos (#e5a93a)
          case 'Administração e RH':
          default:
            return DS_COLORS.primary;  // Azul Primário DGRH (#105e7b)
        }
      };

      const horizontalPercentageLabelsPlugin = {
        id: 'horizontalBarPercentageLabels',
        afterDatasetsDraw(chartInstance: any) {
          const c = chartInstance.ctx;
          const meta = chartInstance.getDatasetMeta(0);

          const isMobile = chartInstance.width < 500;
          const fontSize = isMobile ? 14 : 19;

          top20.forEach((cargo, index) => {
            const element = meta.data[index];
            if (!element) return;
            const pct = ((cargo.quantidade / totalGeral) * 100).toFixed(1).replace('.', ',');
            const text = `${pct}% (${cargo.quantidade.toLocaleString('pt-BR')})`;

            c.save();
            c.font = `bold ${fontSize}px Inter, -apple-system, sans-serif`;
            c.textAlign = 'left';
            c.textBaseline = 'middle';
            c.fillStyle = '#0f172a';
            c.fillText(text, element.x + 9, element.y);
            c.restore();
          });
        },
      };

      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: top20.map((c, i) => `${i + 1}º ${c.cargo}`),
          datasets: [
            {
              label: 'Total de Profissionais',
              data: top20.map((c) => c.quantidade),
              backgroundColor: top20.map((c) => cargoCategoryColor(c.categoria)),
              borderRadius: 4,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: { right: 160, top: 4, bottom: 4 },
          },
          scales: {
            x: {
              max: 1650,
              suggestedMax: 1650,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                stepSize: 200,
                font: { weight: 'bold', size: 12 },
                color: '#64748b',
                callback: (val: any) => Number(val).toLocaleString('pt-BR'),
              },
            },
            y: {
              grid: { display: false },
              ticks: {
                font: { weight: 'bold', size: 15 },
                color: '#0f172a',
              },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              padding: 12,
              callbacks: {
                label: (ctx: any) => {
                  const cargo = top20[ctx.dataIndex];
                  const pct = ((cargo.quantidade / totalGeral) * 100).toFixed(1).replace('.', ',');
                  return ` ${pct}% (${cargo.quantidade.toLocaleString('pt-BR')} servidores) • ${cargo.categoria}`;
                },
              },
            },
          },
        },
        plugins: [horizontalPercentageLabelsPlugin],
      });
    });

    return () => {
      active = false;
      chart?.destroy();
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 min-h-0">
      {/* Gráfico de Barras com Altura Aumentada e Nomes dos Cargos Maiores */}
      <div className="flex-1 w-full h-[520px] sm:h-[580px] lg:h-[640px] xl:h-[680px] min-h-0">
        <canvas ref={canvasRef} />
      </div>

      {/* Legenda Oficial Vertical à Direita */}
      <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-xs shrink-0 self-center w-full lg:w-auto min-w-[220px]">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 pb-1.5 border-b border-slate-200">
          Carreiras
        </span>
        <div className="flex flex-col gap-3 text-xs sm:text-sm font-medium text-slate-800">
          <span className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: DS_COLORS.primary }} />
            <span>Administração e RH</span>
          </span>
          <span className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: DS_COLORS.aux3 }} />
            <span>Saúde</span>
          </span>
          <span className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: DS_COLORS.aux1 }} />
            <span>Educação, Pesquisa e Ciência</span>
          </span>
          <span className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: DS_COLORS.secondary }} />
            <span>Tecnologia da Informação (TI)</span>
          </span>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   8. NACIONALIDADES: Pie Chart Geral Ampliado + Continental Bar Chart
   ========================================================================= */
export const NacionalidadesCharts: React.FC = () => {
  const pieRef = useRef<HTMLCanvasElement | null>(null);
  const barRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let pieChart: any = null;
    let barChart: any = null;
    let active = true;

    getChartJS().then((Chart) => {
      if (!active || !Chart) return;

      // 1. Pie Chart (Brasileiros vs Estrangeiros) Ampliado e Sem Legenda Inferior
      if (pieRef.current) {
        const ctx1 = pieRef.current.getContext('2d');
        if (ctx1) {
          const pieLabelsPlugin = {
            id: 'pieNacionalidadeBadges',
            afterDatasetsDraw(chartInstance: any) {
              const c = chartInstance.ctx;
              const meta = chartInstance.getDatasetMeta(0);
              const isMobile = chartInstance.width < 500;
              const padX = isMobile ? 10 : 16;
              const padY = isMobile ? 6 : 10;
              const items = [
                { label: 'Brasileiros', pct: '94,9%', total: NACIONALIDADES_DATA.totalNatoOuNaturalizado, size: isMobile ? 16 : 23 },
                { label: 'Estrangeiros', pct: '5,1%', total: NACIONALIDADES_DATA.totalEstrangeiro, size: isMobile ? 13 : 17 },
              ];

              meta.data.forEach((element: any, i: number) => {
                const pos = element.tooltipPosition();
                if (!pos) return;
                const text = isMobile ? items[i].pct : `${items[i].label}: ${items[i].pct}`;
                drawBadge(
                  c,
                  text,
                  pos.x,
                  pos.y,
                  'rgba(15, 23, 42, 0.92)',
                  '#ffffff',
                  items[i].size,
                  padX,
                  padY,
                  8,
                  'rgba(255, 255, 255, 0.45)'
                );
              });
            },
          };

          pieChart = new Chart(ctx1, {
            type: 'pie',
            data: {
              labels: ['Brasileiros', 'Estrangeiros'],
              datasets: [
                {
                  data: [
                    NACIONALIDADES_DATA.totalNatoOuNaturalizado,
                    NACIONALIDADES_DATA.totalEstrangeiro,
                  ],
                  backgroundColor: [DS_COLORS.primary, DS_COLORS.secondary],
                  hoverBackgroundColor: [DS_COLORS.primaryHover, DS_COLORS.secondaryHover],
                  borderWidth: 3,
                  borderColor: '#ffffff',
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: 10,
              },
              plugins: {
                legend: {
                  display: false, // Desativa legenda inferior da pizza conforme solicitado
                },
                tooltip: {
                  padding: 14,
                  titleFont: { size: 15, weight: 'bold' },
                  bodyFont: { size: 14 },
                  callbacks: {
                    label: (ctx: any) => {
                      const val = Number(ctx.raw);
                      const pct = ctx.dataIndex === 0 ? '94,9%' : '5,1%';
                      return ` ${ctx.label}: ${val.toLocaleString('pt-BR')} (${pct})`;
                    },
                  },
                },
              },
            },
            plugins: [pieLabelsPlugin],
          });
        }
      }

      // 2. Bar (Origem dos Estrangeiros) com fontes e rótulos bem maiores
      if (barRef.current) {
        const ctx2 = barRef.current.getContext('2d');
        if (ctx2) {
          const continentColors = [
            DS_COLORS.primary,   // América Latina
            DS_COLORS.secondary, // Europa
            DS_COLORS.aux1,      // América do Norte
            DS_COLORS.aux2,      // Ásia
            DS_COLORS.aux3,      // Outros
          ];

          const barPercentageLabelsPlugin = {
            id: 'continentBarPercentageLabels',
            afterDatasetsDraw(chartInstance: any) {
              const c = chartInstance.ctx;
              const meta = chartInstance.getDatasetMeta(0);
              const isMobile = chartInstance.width < 500;
              const fontSize = isMobile ? 17 : 24;

              NACIONALIDADES_DATA.regioesEstrangeiros.forEach((item, index) => {
                const element = meta.data[index];
                if (!element) return;
                const text = `${item.pct.toFixed(1).replace('.', ',')}% (${item.total})`;

                c.save();
                c.font = `bold ${fontSize}px Inter, -apple-system, sans-serif`;
                c.textAlign = 'center';
                c.textBaseline = 'bottom';
                c.fillStyle = '#0f172a';
                c.fillText(text, element.x, element.y - 8);
                c.restore();
              });
            },
          };

          barChart = new Chart(ctx2, {
            type: 'bar',
            data: {
              labels: [
                ['América', 'Latina'],
                'Europa',
                ['América do', 'Norte'],
                'Ásia',
                'Outros',
              ],
              datasets: [
                {
                  label: 'Estrangeiros por Continente',
                  data: NACIONALIDADES_DATA.regioesEstrangeiros.map((r) => r.total),
                  backgroundColor: continentColors,
                  borderRadius: 8,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: { top: 32 },
              },
              scales: {
                y: {
                  suggestedMax: 56,
                  grid: { color: 'rgba(0,0,0,0.06)' },
                  ticks: { font: { weight: 'bold', size: 14 }, color: '#475569' },
                },
                x: {
                  grid: { display: false },
                  ticks: {
                    font: { weight: 'bold', size: 16 },
                    color: '#0f172a',
                    padding: 8,
                  },
                },
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  padding: 14,
                  titleFont: { size: 15, weight: 'bold' },
                  bodyFont: { size: 14 },
                  callbacks: {
                    label: (ctx: any) => {
                      const item = NACIONALIDADES_DATA.regioesEstrangeiros[ctx.dataIndex];
                      return ` ${item.total} pesquisadores/docentes (${item.pct.toFixed(1).replace('.', ',')}%)`;
                    },
                  },
                },
              },
            },
            plugins: [barPercentageLabelsPlugin],
          });
        }
      }
    });

    return () => {
      active = false;
      pieChart?.destroy();
      barChart?.destroy();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-center w-full h-full">
      {/* Coluna Esquerda: Gráfico de Pizza Geral Ampliado (Sem legenda inferior) */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center relative w-full">
        {/* Canvas da Pizza com altura generosa */}
        <div className="w-full h-[350px] sm:h-[420px] lg:h-[480px] xl:h-[530px] relative flex items-center justify-center">
          <canvas ref={pieRef} />
        </div>

        {/* Resumo Absoluto e Percentual no Rodapé da Coluna Esquerda */}
        <div className="w-full max-w-[460px] grid grid-cols-2 gap-2.5 sm:gap-3 mt-2.5">
          <div className="px-3.5 py-2.5 rounded-2xl bg-white border-2 border-[#105e7b] flex flex-col items-center justify-center shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Brasileiros</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg lg:text-xl font-black text-[#105e7b]">
                {NACIONALIDADES_DATA.totalNatoOuNaturalizado.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#105e7b]/80">(94,9%)</span>
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-2xl bg-white border-2 border-[#e5a93a] flex flex-col items-center justify-center shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estrangeiros</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg lg:text-xl font-black text-[#b45309]">
                {NACIONALIDADES_DATA.totalEstrangeiro.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#b45309]/80">(5,1%)</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-2">
          <span className="text-xs sm:text-sm font-semibold text-slate-600">
            Total de Docentes e Pesquisadores: <strong className="text-slate-900 font-black">2.084</strong>
          </span>
        </div>
      </div>

      {/* Coluna Direita: Gráfico de Barras por Região com Fontes e % Ampliados */}
      <div className="lg:col-span-7 flex flex-col justify-center w-full h-[380px] sm:h-[450px] lg:h-[520px] xl:h-[580px]">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm sm:text-base lg:text-lg font-black uppercase text-slate-800 tracking-wider text-center md:text-left">
            Distribuição dos 106 Estrangeiros por Região
          </h4>
        </div>
        <div className="flex-1 w-full relative">
          <canvas ref={barRef} />
        </div>
      </div>
    </div>
  );
};
