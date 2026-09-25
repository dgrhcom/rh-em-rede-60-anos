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

      // 1. Pie Chart com Homens primeiro e Mulheres depois (ordem e cores invertidas, fonte ampliada)
      if (pieRef.current) {
        const ctx1 = pieRef.current.getContext('2d');
        if (ctx1) {
          const piePercentageBadges = {
            id: 'generoPiePercentageBadges',
            afterDatasetsDraw(chart: any) {
              const { ctx } = chart;
              const meta = chart.getDatasetMeta(0);
              const isMobile = chart.width < 500;
              const badgeFontSize = isMobile ? 22 : 32;
              const padX = isMobile ? 12 : 20;
              const padY = isMobile ? 8 : 12;
              const items = [
                { label: 'Homens', pct: GENERO_DATA.total.pctMasculino, total: GENERO_DATA.total.masculino },
                { label: 'Mulheres', pct: GENERO_DATA.total.pctFeminino, total: GENERO_DATA.total.feminino },
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
                  10,
                  'rgba(255, 255, 255, 0.5)'
                );
              });
            },
          };

          pieChart = new Chart(ctx1, {
            type: 'pie',
            data: {
              labels: ['Homens', 'Mulheres'],
              datasets: [
                {
                  data: [GENERO_DATA.total.masculino, GENERO_DATA.total.feminino],
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
                padding: 12,
              },
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  padding: 14,
                  titleFont: { size: 16, weight: 'bold' },
                  bodyFont: { size: 15 },
                  callbacks: {
                    label: (ctx: any) => {
                      const val = Number(ctx.raw);
                      const pct = ctx.dataIndex === 0 ? GENERO_DATA.total.pctMasculino : GENERO_DATA.total.pctFeminino;
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

      // 2. Bar Chart por Carreira com legendas "Homens" e "Mulheres", mesmas cores da pizza e eixo X padronizado
      if (barRef.current) {
        const ctx2 = barRef.current.getContext('2d');
        if (ctx2) {
          const barLabelPlugin = {
            id: 'groupedBarPercentageLabels',
            afterDatasetsDraw(chart: any) {
              const { ctx } = chart;
              const isMobile = chart.width < 500;
              const fontSize = isMobile ? 18 : 24;

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
                  label: 'Homens',
                  data: GENERO_DATA.porCarreira.map((c) => c.pctMasculino),
                  backgroundColor: DS_COLORS.primary,
                  hoverBackgroundColor: DS_COLORS.primaryHover,
                  borderRadius: 8,
                  borderSkipped: false,
                },
                {
                  label: 'Mulheres',
                  data: GENERO_DATA.porCarreira.map((c) => c.pctFeminino),
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
                  top: 32,
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
                    font: { weight: 'bold', size: 15 },
                    color: '#475569',
                  },
                  grid: { color: 'rgba(0,0,0,0.06)' },
                },
                x: {
                  grid: { display: false },
                  ticks: {
                    font: { weight: 'bold', size: 22 }, // Padronizado e ampliado para igualar às porcentagens
                    color: '#0f172a',
                    padding: 10,
                  },
                },
              },
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    boxWidth: 20,
                    boxHeight: 20,
                    font: { weight: 'bold', size: 18 },
                    color: '#0f172a',
                    padding: 20,
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
                      const count = ctx.datasetIndex === 0 ? career.masculino : career.feminino;
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
      {/* Coluna Esquerda: Gráfico de Pizza Geral Ampliado (Homens depois Mulheres) */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center relative w-full">
        {/* Canvas da Pizza com dimensões substanciais */}
        <div className="w-full h-[350px] sm:h-[420px] lg:h-[480px] xl:h-[530px] relative flex items-center justify-center">
          <canvas ref={pieRef} />
        </div>

        {/* Resumo Absoluto e Percentual no Rodapé da Coluna Esquerda (Mesma ordem: Homens, Mulheres) */}
        <div className="w-full max-w-[480px] grid grid-cols-2 gap-3 sm:gap-3.5 mt-2.5">
          <div className="px-4 py-3 rounded-2xl bg-white border-2 border-[#105e7b] flex flex-col items-center justify-center shadow-sm">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Homens</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg sm:text-xl lg:text-2xl font-black text-[#105e7b]">
                {GENERO_DATA.total.masculino.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#105e7b]/90">
                ({GENERO_DATA.total.pctMasculino.toFixed(1).replace('.', ',')}%)
              </span>
            </div>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-white border-2 border-[#e5a93a] flex flex-col items-center justify-center shadow-sm">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Mulheres</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg sm:text-xl lg:text-2xl font-black text-[#b45309]">
                {GENERO_DATA.total.feminino.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#b45309]/90">
                ({GENERO_DATA.total.pctFeminino.toFixed(1).replace('.', ',')}%)
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mt-2.5">
          <span className="text-xs sm:text-sm font-semibold text-slate-600">
            Total Institucional: <strong className="text-slate-900 font-black">{GENERO_DATA.total.total.toLocaleString('pt-BR')}</strong> servidores ativos
          </span>
        </div>
      </div>

      {/* Coluna Direita: Gráfico de Barras por Carreira (Sem título "Por Carreira") */}
      <div className="lg:col-span-7 flex flex-col justify-center w-full h-[400px] sm:h-[470px] lg:h-[540px] xl:h-[600px]">
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
              ticks: { font: { weight: 'bold', size: 22 }, color: '#0f172a', padding: 8 },
            },
            y: {
              stacked: true,
              suggestedMax: 3450,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { weight: 'bold', size: 15 },
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
              padding: 14,
              titleFont: { size: 15, weight: 'bold' },
              bodyFont: { size: 14 },
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
      <div className="lg:col-span-8 xl:col-span-8 flex flex-col justify-center relative w-full h-[400px] sm:h-[480px] lg:h-[550px] xl:h-[600px]">
        <canvas ref={canvasRef} />
      </div>

      {/* Coluna Direita: Destaque Demográfico e Legenda Padronizada com Tipografia Ampliada */}
      <div className="lg:col-span-4 xl:col-span-4 flex flex-col justify-center gap-3.5 sm:gap-4 w-full">
        {/* 1. Destaque Demográfico */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs">
          <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-black uppercase text-amber-900 tracking-wider block mb-1">
              Destaque Demográfico
            </span>
            <div className="text-sm sm:text-base font-bold text-amber-950 leading-relaxed space-y-1">
              <p>• {DESTAQUE_FAIXA_ETARIA.jovem}</p>
              <p>• {DESTAQUE_FAIXA_ETARIA.velho}</p>
            </div>
          </div>
        </div>

        {/* 2. Legenda Padronizada com Tipografia Ampliada */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs sm:text-sm font-black uppercase text-slate-500 tracking-wider px-1">
            Legenda por Carreira
          </span>

          {/* Docentes */}
          <div
            onClick={() => toggleDataset(0)}
            className="px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between transition-all hover:shadow-md cursor-pointer group select-none"
            style={{ borderLeftWidth: '6px', borderLeftColor: DS_COLORS.aux2 }}
            title="Clique para alternar visibilidade de Docentes"
          >
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: DS_COLORS.aux2 }} />
              <span className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 group-hover:text-slate-950">Docentes</span>
            </div>
            <div className="text-base sm:text-lg lg:text-xl font-black text-slate-900 px-3 py-1 rounded-xl bg-slate-100">
              {totalDocentes.toLocaleString('pt-BR')}
            </div>
          </div>

          {/* Pesquisadores */}
          <div
            onClick={() => toggleDataset(1)}
            className="px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between transition-all hover:shadow-md cursor-pointer group select-none"
            style={{ borderLeftWidth: '6px', borderLeftColor: DS_COLORS.aux1 }}
            title="Clique para alternar visibilidade de Pesquisadores"
          >
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: DS_COLORS.aux1 }} />
              <span className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 group-hover:text-slate-950">Pesquisadores (PQ)</span>
            </div>
            <div className="text-base sm:text-lg lg:text-xl font-black text-slate-900 px-3 py-1 rounded-xl bg-slate-100">
              {totalPesquisadores.toLocaleString('pt-BR')}
            </div>
          </div>

          {/* Técnicos (PAEPE) */}
          <div
            onClick={() => toggleDataset(2)}
            className="px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between transition-all hover:shadow-md cursor-pointer group select-none"
            style={{ borderLeftWidth: '6px', borderLeftColor: DS_COLORS.primary }}
            title="Clique para alternar visibilidade de PAEPE"
          >
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: DS_COLORS.primary }} />
              <span className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 group-hover:text-slate-950">PAEPE</span>
            </div>
            <div className="text-base sm:text-lg lg:text-xl font-black text-slate-900 px-3 py-1 rounded-xl bg-slate-100">
              {totalTecnicos.toLocaleString('pt-BR')}
            </div>
          </div>

          {/* Total Geral */}
          <div className="px-4 py-3 rounded-2xl bg-slate-950 text-white flex items-center justify-between shadow-xs mt-1">
            <span className="text-xs sm:text-sm lg:text-base font-bold text-slate-300">Total Analisado</span>
            <span className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-amber-400">
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
  const barRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let barChart: any = null;
    let active = true;

    getChartJS().then((Chart) => {
      if (!active || !Chart) return;

      // Barras Empilhadas por Carreira Funcional - Ocupa todo o slide
      if (barRef.current) {
        const ctx2 = barRef.current.getContext('2d');
        if (ctx2) {
          const horizontalStackLabelsPlugin = {
            id: 'horizontalStackPercentageLabels',
            afterDatasetsDraw(chartInstance: any) {
              const c = chartInstance.ctx;
              const metaLast = chartInstance.getDatasetMeta(chartInstance.data.datasets.length - 1);
              const isMobile = chartInstance.width < 500;
              const fontSize = isMobile ? 18 : 24;

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
                c.fillText(text, element.x + 12, element.y);
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
                  borderRadius: 6,
                },
                {
                  label: 'Pesquisadores (PQ)',
                  data: RACA_COR_TABELA_2.map((r) => r.pesquisadores),
                  backgroundColor: DS_COLORS.aux1, // Verde DGRH
                  borderRadius: 6,
                },
                {
                  label: 'Técnicos-administrativos (PAEPE)',
                  data: RACA_COR_TABELA_2.map((r) => r.tecnicos),
                  backgroundColor: DS_COLORS.primary, // Azul Primário
                  borderRadius: 6,
                },
                {
                  label: 'Extra-quadro',
                  data: RACA_COR_TABELA_2.map((r) => r.extraQuadro),
                  backgroundColor: DS_COLORS.secondary, // Dourado Secundário
                  borderRadius: 6,
                },
              ],
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: { right: 230, top: 10, bottom: 10 },
              },
              scales: {
                x: {
                  stacked: true,
                  suggestedMax: 12500,
                  grid: { color: 'rgba(0,0,0,0.06)' },
                  ticks: {
                    font: { weight: 'bold', size: 14 },
                    color: '#475569',
                    callback: (val: any) => Number(val).toLocaleString('pt-BR'),
                  },
                },
                y: {
                  stacked: true,
                  grid: { display: false },
                  ticks: {
                    font: { weight: 'bold', size: 22 }, // Tipografia do eixo Y ampliada e destacada
                    color: '#0f172a',
                    padding: 12,
                  },
                },
              },
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    boxWidth: 20,
                    boxHeight: 20,
                    font: { weight: 'bold', size: 17 },
                    color: '#0f172a',
                    padding: 22,
                  },
                },
                tooltip: {
                  padding: 14,
                  titleFont: { size: 16, weight: 'bold' },
                  bodyFont: { size: 14 },
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
      barChart?.destroy();
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-center min-h-0">
      {/* Gráfico de Barras Empilhadas ocupa o espaço todo, sem subtítulo de carreira */}
      <div className="flex-1 w-full h-[450px] sm:h-[530px] lg:h-[600px] xl:h-[650px] relative">
        <canvas ref={barRef} />
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
            padding: { right: 75, top: 10, bottom: 6 },
          },
          scales: {
            y: {
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { weight: 'bold', size: 14 },
                color: '#475569',
                callback: (val: any) => Number(val).toLocaleString('pt-BR'),
              },
            },
            x: {
              grid: { display: false },
              ticks: { font: { weight: 'bold', size: 16 }, color: '#0f172a' },
            },
          },
          plugins: {
            legend: {
              display: false, // Desativada do topo e movida para a coluna lateral direita
            },
            tooltip: {
              padding: 14,
              titleFont: { size: 15, weight: 'bold' },
              bodyFont: { size: 14 },
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

  const totalPAEPE2026 = 7333;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6 items-center w-full h-full min-h-0">
      {/* Canvas da Linha Geral */}
      <div className="lg:col-span-8 xl:col-span-8 flex flex-col justify-center relative w-full h-[360px] sm:h-[420px] lg:h-[470px] xl:h-[510px]">
        <canvas ref={canvasRef} />
      </div>

      {/* Legenda Padronizada em Coluna à Direita */}
      <div className="lg:col-span-4 xl:col-span-4 flex flex-col justify-center gap-1.5 sm:gap-2 w-full p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 pb-1.5 border-b border-slate-200">
          Níveis de Escolaridade (2026)
        </span>
        <div className="flex flex-col gap-1.5">
          {ESCOLARIDADE_EVOLUCAO.series.map((s) => {
            const val2026 = s.valores[s.valores.length - 1];
            const pct = ((val2026 / totalPAEPE2026) * 100).toFixed(1).replace('.', ',');
            return (
              <div
                key={s.nivel}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100 transition-colors"
                style={{ borderLeftWidth: '5px', borderLeftColor: s.cor }}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: s.cor }} />
                  <span className="text-xs sm:text-sm lg:text-base font-bold text-slate-900 truncate">{s.nivel}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs sm:text-sm lg:text-base font-black text-slate-900">
                    {val2026.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                    ({pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
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
            padding: { right: 75, top: 10, bottom: 6 },
          },
          scales: {
            y: {
              min: 0,
              max: 500,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { weight: 'bold', size: 14 },
                color: '#475569',
                callback: (val: any) => Number(val).toLocaleString('pt-BR'),
              },
            },
            x: {
              grid: { display: false },
              ticks: { font: { weight: 'bold', size: 16 }, color: '#0f172a' },
            },
          },
          plugins: {
            legend: {
              display: false, // Movida para a coluna lateral à direita
            },
            tooltip: {
              padding: 14,
              titleFont: { size: 15, weight: 'bold' },
              bodyFont: { size: 14 },
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

  const totalPAEPE2026 = 7333;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6 items-center w-full h-full min-h-0">
      {/* Canvas do Gráfico de Zoom */}
      <div className="lg:col-span-8 xl:col-span-8 flex flex-col justify-center relative w-full h-[360px] sm:h-[420px] lg:h-[470px] xl:h-[510px]">
        <canvas ref={canvasRef} />
      </div>

      {/* Legenda Padronizada em Coluna à Direita */}
      <div className="lg:col-span-4 xl:col-span-4 flex flex-col justify-center gap-2 sm:gap-2.5 w-full p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 pb-1.5 border-b border-slate-200">
          Categorias em Destaque (Zoom)
        </span>
        <div className="flex flex-col gap-2">
          {ESCOLARIDADE_ZOOM_SERIES.map((s) => {
            const val2026 = s.valores[s.valores.length - 1];
            const pct = ((val2026 / totalPAEPE2026) * 100).toFixed(1).replace('.', ',');
            return (
              <div
                key={s.nivel}
                className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100 transition-colors"
                style={{ borderLeftWidth: '5px', borderLeftColor: s.cor }}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <span className="w-4 h-4 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: s.cor }} />
                  <span className="text-sm sm:text-base font-bold text-slate-900 truncate">{s.nivel}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-sm sm:text-base font-black text-slate-900">
                    {val2026.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    ({pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
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

  const hiddenAreas = SERVIDORES_POR_AREA.filter((a) => a.percentual < 5.0);

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
          const badgeFontSize = isMobile ? 26 : 42; // Dobrado o tamanho da porcentagem
          const padX = isMobile ? 14 : 22;
          const padY = isMobile ? 8 : 12;

          SERVIDORES_POR_AREA.forEach((area, i) => {
            if (area.percentual < 5.0) return; // Fatias ocultadas para exibição abaixo do gráfico
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
              10,
              'rgba(255, 255, 255, 0.5)'
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
            padding: 12,
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              padding: 14,
              titleFont: { size: 16, weight: 'bold' },
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
      {/* Coluna Esquerda: Gráfico de Pizza Ampliado + Badges abaixo para fatias menores ocultadas */}
      <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-center justify-center relative w-full">
        <div className="w-full h-[360px] sm:h-[430px] lg:h-[490px] xl:h-[540px] relative flex items-center justify-center">
          <canvas ref={canvasRef} />
        </div>

        {/* Porcentagens que ficaram ocultas na pizza colocadas abaixo do gráfico */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-3 px-2">
          {hiddenAreas.map((item) => (
            <div
              key={item.tipoOrgao}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white border-2 shadow-xs transition-all hover:shadow-sm"
              style={{ borderColor: item.cor }}
            >
              <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: item.cor }} />
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {item.tipoOrgao}:{' '}
                <strong className="font-black text-sm sm:text-base" style={{ color: item.cor }}>
                  {item.percentual.toFixed(1).replace('.', ',')}%
                </strong>
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                ({item.total.toLocaleString('pt-BR')} servidores)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Coluna Direita: Cards com Legenda Lateral e Tipografia Muito Ampliada */}
      <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center gap-3 sm:gap-3.5">
        {/* Destaque Institucional */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-300 text-slate-800 flex items-start gap-3 shadow-xs">
          <Sparkles className="w-5 h-5 text-[#105e7b] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm lg:text-base leading-relaxed font-medium text-slate-700">
            <span className="font-bold text-slate-900">Concentração Funcional:</span> 70,6% de todo o quadro concentra-se em <span className="font-bold text-slate-900">Faculdades e Institutos (38,5%)</span> e na <span className="font-bold text-slate-900">Área da Saúde (32,1%)</span>.
          </div>
        </div>

        {/* 5 Cards de Áreas com Tipografia Bem Grande */}
        <div className="flex flex-col gap-2 sm:gap-2.5">
          {SERVIDORES_POR_AREA.map((item) => (
            <div
              key={item.tipoOrgao}
              className="px-4 py-3 sm:py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md"
              style={{ borderLeftWidth: '6px', borderLeftColor: item.cor }}
            >
              <div className="min-w-0 pr-3">
                <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-slate-900 tracking-tight">
                  {item.tipoOrgao}
                </div>
              </div>
              <div
                className="px-4 py-1.5 sm:py-2 rounded-xl text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-white shrink-0 shadow-xs tracking-wider"
                style={{ backgroundColor: item.cor }}
              >
                {item.total.toLocaleString('pt-BR')}
              </div>
            </div>
          ))}

          {/* Total Geral da Universidade */}
          <div className="px-4 py-3 sm:py-3.5 rounded-2xl bg-slate-950 text-white flex items-center justify-between shadow-md mt-1">
            <span className="text-xs sm:text-sm lg:text-base font-bold text-slate-200">Total Geral da Universidade</span>
            <span className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-amber-400 tracking-wider">
              {TOTAL_SERVIDORES_ATIVOS.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   6b. TOP 20 CARGOS: Tabela Diagramada dos 20 Maiores Cargos em 2026
   ========================================================================= */
export const TopCargosTable: React.FC = () => {
  const top20 = TOP_CARGOS_2026.slice(0, 20);
  const totalGeral = TOTAL_SERVIDORES_ATIVOS; // 9416
  const totalTop20 = top20.reduce((acc, c) => acc + c.quantidade, 0); // 7246
  const pctTop20 = ((totalTop20 / totalGeral) * 100).toFixed(1).replace('.', ',');

  const getAreaColor = (categoria: string) => {
    switch (categoria) {
      case 'Saúde':
        return { bg: '#fff7ed', border: '#d67b27', text: '#9a3412', dot: '#d67b27' };
      case 'Ensino e Pesquisa':
        return { bg: '#f0fdf4', border: '#477b2f', text: '#166534', dot: '#477b2f' };
      case 'Tecnologia da Informação (TI)':
        return { bg: '#fffbeb', border: '#e5a93a', text: '#854d0e', dot: '#e5a93a' };
      case 'Técnica-Administrativa':
      default:
        return { bg: '#f0f9ff', border: '#105e7b', text: '#0369a1', dot: '#105e7b' };
    }
  };

  const col1 = top20.slice(0, 10);
  const col2 = top20.slice(10, 20);

  return (
    <div className="w-full h-full flex flex-col justify-between py-1 min-h-0 gap-2.5 sm:gap-3">
      {/* Grid com 2 colunas: 1 a 10 e 11 a 20 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 xl:gap-5 flex-1 min-h-0 overflow-y-auto pr-1">
        {/* Coluna 1: 1º ao 10º */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {col1.map((item, index) => {
            const rank = index + 1;
            const areaStyle = getAreaColor(item.categoria);
            const pct = ((item.quantidade / totalGeral) * 100).toFixed(1).replace('.', ',');
            return (
              <div
                key={item.cargo}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Badge de Posição */}
                  <span
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-2xs ${
                      rank === 1
                        ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-900 font-black ring-2 ring-slate-200'
                        : rank === 3
                        ? 'bg-amber-700 text-white font-black'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {rank}º
                  </span>

                  {/* Nome do Cargo e Área */}
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm lg:text-[14.5px] font-black text-slate-900 truncate">
                      {item.cargo}
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md mt-0.5"
                      style={{ backgroundColor: areaStyle.bg, color: areaStyle.text, border: `1px solid ${areaStyle.border}40` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: areaStyle.dot }} />
                      {item.categoria}
                    </span>
                  </div>
                </div>

                {/* Quantidade e Porcentagem */}
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className="text-sm sm:text-base lg:text-lg font-black text-slate-950">
                    {item.quantidade.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coluna 2: 11º ao 20º */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {col2.map((item, index) => {
            const rank = index + 11;
            const areaStyle = getAreaColor(item.categoria);
            const pct = ((item.quantidade / totalGeral) * 100).toFixed(1).replace('.', ',');
            return (
              <div
                key={item.cargo}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Badge de Posição */}
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 bg-slate-100 text-slate-700 shadow-2xs">
                    {rank}º
                  </span>

                  {/* Nome do Cargo e Área */}
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm lg:text-[14.5px] font-black text-slate-900 truncate">
                      {item.cargo}
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md mt-0.5"
                      style={{ backgroundColor: areaStyle.bg, color: areaStyle.text, border: `1px solid ${areaStyle.border}40` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: areaStyle.dot }} />
                      {item.categoria}
                    </span>
                  </div>
                </div>

                {/* Quantidade e Porcentagem */}
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className="text-sm sm:text-base lg:text-lg font-black text-slate-950">
                    {item.quantidade.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Banner de Rodapé: Síntese Estatística do Top 20 */}
      <div className="px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-950 text-white flex flex-wrap items-center justify-between gap-3 shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm lg:text-base font-bold text-slate-200">
            Total dos 20 Maiores Cargos:
          </span>
          <span className="text-sm sm:text-base lg:text-lg font-black text-amber-400">
            {totalTop20.toLocaleString('pt-BR')} servidores ({pctTop20}% do quadro geral)
          </span>
        </div>
        <div className="text-xs sm:text-sm font-semibold text-slate-400">
          Total da Universidade: <strong className="text-white font-black">{totalGeral.toLocaleString('pt-BR')}</strong> servidores ativos
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
          case 'Ensino e Pesquisa':
            return DS_COLORS.aux1;     // Verde DGRH (#477b2f)
          case 'Tecnologia da Informação (TI)':
            return DS_COLORS.secondary;// Dourado 60 Anos (#e5a93a)
          case 'Técnica-Administrativa':
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
          const fontSize = isMobile ? 15 : 20;

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
            padding: { right: 170, top: 4, bottom: 4 },
          },
          scales: {
            x: {
              max: 1650,
              suggestedMax: 1650,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                stepSize: 200,
                font: { weight: 'bold', size: 13 },
                color: '#64748b',
                callback: (val: any) => Number(val).toLocaleString('pt-BR'),
              },
            },
            y: {
              grid: { display: false },
              ticks: {
                font: { weight: 'bold', size: 16 },
                color: '#0f172a',
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

      {/* Legenda Oficial Vertical à Direita com Tipografia Bem Grande */}
      <div className="flex flex-col gap-3.5 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm shrink-0 self-center w-full lg:w-auto min-w-[260px] xl:min-w-[280px]">
        <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-200">
          Áreas
        </span>
        <div className="flex flex-col gap-3 text-sm sm:text-base lg:text-lg font-bold text-slate-800">
          <span className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: DS_COLORS.primary }} />
            <span>Técnica-Administrativa</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: DS_COLORS.aux3 }} />
            <span>Saúde</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: DS_COLORS.aux1 }} />
            <span>Ensino e Pesquisa</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: DS_COLORS.secondary }} />
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
              const padX = isMobile ? 14 : 22;
              const padY = isMobile ? 8 : 12;
              const items = [
                { label: 'Brasileiros', pct: '94,9%', total: NACIONALIDADES_DATA.totalNatoOuNaturalizado, size: isMobile ? 26 : 44 },
                { label: 'Estrangeiros', pct: '5,1%', total: NACIONALIDADES_DATA.totalEstrangeiro, size: isMobile ? 22 : 34 },
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
                  10,
                  'rgba(255, 255, 255, 0.5)'
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
                padding: 12,
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
              const fontSize = isMobile ? 18 : 24;

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
                    font: { weight: 'bold', size: 22 }, // Tipografia do eixo X ampliada
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

      {/* Coluna Direita: Gráfico de Barras por Região (Sem título acima do canvas) */}
      <div className="lg:col-span-7 flex flex-col justify-center w-full h-[400px] sm:h-[470px] lg:h-[540px] xl:h-[600px]">
        <div className="flex-1 w-full relative">
          <canvas ref={barRef} />
        </div>
      </div>
    </div>
  );
};
