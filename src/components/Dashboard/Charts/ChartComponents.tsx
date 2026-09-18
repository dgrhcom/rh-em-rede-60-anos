import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import {
  SERVIDORES_POR_AREA,
  GENERO_DATA,
  FAIXA_ETARIA_DATA,
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
  fontSize: number = 10,
  paddingX: number = 6,
  paddingY: number = 3,
  radius: number = 4
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
   1. GÊNERO: Doughnut Chart Geral + Bar Chart por Carreira
   ========================================================================= */
export const GeneroCharts: React.FC = () => {
  const donutRef = useRef<HTMLCanvasElement | null>(null);
  const barRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let donutChart: any = null;
    let barChart: any = null;
    let active = true;

    getChartJS().then((Chart) => {
      if (!active || !Chart) return;

      // 1. Donut Chart com rótulo percentual nas fatias
      if (donutRef.current) {
        const ctx1 = donutRef.current.getContext('2d');
        if (ctx1) {
          const doughnutPlugin = {
            id: 'donutPercentageBadges',
            afterDatasetsDraw(chart: any) {
              const { ctx } = chart;
              const meta = chart.getDatasetMeta(0);
              const pcts = [GENERO_DATA.total.pctFeminino, GENERO_DATA.total.pctMasculino];

              meta.data.forEach((element: any, i: number) => {
                const pos = element.tooltipPosition();
                if (!pos) return;
                const text = `${pcts[i].toFixed(1).replace('.', ',')}%`;
                drawBadge(ctx, text, pos.x, pos.y, 'rgba(15, 23, 42, 0.85)', '#ffffff', 11, 7, 3, 5);
              });
            },
          };

          donutChart = new Chart(ctx1, {
            type: 'doughnut',
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
              cutout: '68%',
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    boxWidth: 12,
                    boxHeight: 12,
                    font: { weight: 'bold', size: 11 },
                    color: '#1e293b',
                  },
                },
                tooltip: {
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
            plugins: [doughnutPlugin],
          });
        }
      }

      // 2. Bar Chart por Carreira com rótulos de porcentagem
      if (barRef.current) {
        const ctx2 = barRef.current.getContext('2d');
        if (ctx2) {
          const barLabelPlugin = {
            id: 'groupedBarPercentageLabels',
            afterDatasetsDraw(chart: any) {
              const { ctx } = chart;
              chart.data.datasets.forEach((dataset: any, dIdx: number) => {
                const meta = chart.getDatasetMeta(dIdx);
                meta.data.forEach((element: any, index: number) => {
                  const val = dataset.data[index];
                  const text = `${Number(val).toFixed(1).replace('.', ',')}%`;
                  ctx.save();
                  ctx.font = 'bold 10.5px Inter, -apple-system, sans-serif';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'bottom';
                  ctx.fillStyle = dIdx === 0 ? DS_COLORS.primary : '#855807';
                  ctx.fillText(text, element.x, element.y - 4);
                  ctx.restore();
                });
              });
            },
          };

          barChart = new Chart(ctx2, {
            type: 'bar',
            data: {
              labels: GENERO_DATA.porCarreira.map((c) => c.carreira),
              datasets: [
                {
                  label: 'Feminino (%)',
                  data: GENERO_DATA.porCarreira.map((c) => c.pctFeminino),
                  backgroundColor: DS_COLORS.primary,
                  borderRadius: 6,
                },
                {
                  label: 'Masculino (%)',
                  data: GENERO_DATA.porCarreira.map((c) => c.pctMasculino),
                  backgroundColor: DS_COLORS.secondary,
                  borderRadius: 6,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  max: 108,
                  ticks: {
                    callback: (val: any) => `${val}%`,
                    font: { weight: 'bold', size: 11 },
                    color: '#64748b',
                  },
                  grid: { color: 'rgba(0,0,0,0.05)' },
                },
                x: {
                  grid: { display: false },
                  ticks: { font: { weight: 'bold', size: 11 }, color: '#0f172a' },
                },
              },
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    boxWidth: 12,
                    font: { weight: 'bold', size: 11 },
                    color: '#1e293b',
                  },
                },
                tooltip: {
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
      donutChart?.destroy();
      barChart?.destroy();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      <div className="md:col-span-5 flex flex-col items-center justify-center relative">
        <div className="w-[230px] h-[230px] sm:w-[250px] sm:h-[250px] relative">
          <canvas ref={donutRef} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
            <span className="text-3xl font-black text-[#105e7b]">55,9%</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 font-sans">Mulheres</span>
          </div>
        </div>
        <div className="text-center mt-1">
          <span className="text-xs font-bold text-slate-500">
            Total: <strong>{GENERO_DATA.total.total.toLocaleString('pt-BR')}</strong> servidores ativos
          </span>
        </div>
      </div>

      <div className="md:col-span-7 h-[300px] sm:h-[330px]">
        <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 text-center md:text-left">
          Distribuição Percentual por Carreira
        </h4>
        <canvas ref={barRef} />
      </div>
    </div>
  );
};

/* =========================================================================
   2. FAIXA ETÁRIA: Histogram Bar Chart with Highlight & Percentage Badges
   ========================================================================= */
export const FaixaEtariaBarChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

          FAIXA_ETARIA_DATA.forEach((item, index) => {
            const element = metaLast.data[index];
            if (!element) return;
            const x = element.x;
            const y = element.y - 12;
            const text = `${item.pct.toFixed(1).replace('.', ',')}%`;

            drawBadge(c, text, x, y, DS_COLORS.primary, '#ffffff', 10, 6, 2.5, 4);
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
              borderRadius: 4,
            },
            {
              label: 'Pesquisadores (PQ)',
              data: FAIXA_ETARIA_DATA.map((f) => f.pesquisadores),
              backgroundColor: DS_COLORS.aux1, // Verde DGRH
              borderRadius: 4,
            },
            {
              label: 'Técnicos-administrativos (PAEPE)',
              data: FAIXA_ETARIA_DATA.map((f) => f.tecnicos),
              backgroundColor: DS_COLORS.primary, // Azul Primário DGRH
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: { top: 22 },
          },
          scales: {
            x: {
              stacked: true,
              grid: { display: false },
              ticks: { font: { weight: 'bold', size: 11 }, color: '#0f172a' },
            },
            y: {
              stacked: true,
              suggestedMax: 3450,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { weight: 'bold', size: 11 },
                color: '#64748b',
                callback: (val: any) => Number(val).toLocaleString('pt-BR'),
              },
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
    });

    return () => {
      active = false;
      chart?.destroy();
    };
  }, []);

  return (
    <div className="w-full h-[330px] sm:h-[360px]">
      <canvas ref={canvasRef} />
    </div>
  );
};

/* =========================================================================
   3. RAÇA / COR INTEGRADO: Pizza Geral (Esq) + Barras por Categoria (Dir)
   ========================================================================= */
export const RacaCorCharts: React.FC = () => {
  const pieRef = useRef<HTMLCanvasElement | null>(null);
  const barRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let pieChart: any = null;
    let barChart: any = null;
    let active = true;

    getChartJS().then((Chart) => {
      if (!active || !Chart) return;

      const palette = [
        DS_COLORS.primary,   // Branca (71.9%)
        DS_COLORS.secondary, // Parda (18.3%)
        DS_COLORS.aux3,      // Preta (5.6%)
        DS_COLORS.aux1,      // Amarela (1.3%)
        DS_COLORS.slate,     // Não Informado (2.7%)
        DS_COLORS.aux2,      // Indígena (0.3%)
      ];

      // 1. Pizza / Donut - Visão Geral
      if (pieRef.current) {
        const ctx1 = pieRef.current.getContext('2d');
        if (ctx1) {
          const donutSliceLabelsPlugin = {
            id: 'donutSlicePercentageLabels',
            afterDatasetsDraw(chartInstance: any) {
              const c = chartInstance.ctx;
              const meta = chartInstance.getDatasetMeta(0);
              RACA_COR_DATA.forEach((item, i) => {
                if (item.pct < 4.0) return; // evitar sobreposição em fatias milimétricas
                const element = meta.data[i];
                if (!element) return;
                const pos = element.tooltipPosition();
                if (!pos) return;
                const text = `${item.pct.toFixed(1).replace('.', ',')}%`;
                drawBadge(c, text, pos.x, pos.y, 'rgba(15, 23, 42, 0.85)', '#ffffff', 10, 6, 2.5, 4);
              });
            },
          };

          pieChart = new Chart(ctx1, {
            type: 'doughnut',
            data: {
              labels: RACA_COR_DATA.map((r) => r.raca),
              datasets: [
                {
                  data: RACA_COR_DATA.map((r) => r.total),
                  backgroundColor: palette,
                  borderWidth: 2.5,
                  borderColor: '#ffffff',
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '52%',
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    boxWidth: 10,
                    boxHeight: 10,
                    font: { weight: 'bold', size: 10 },
                    color: '#1e293b',
                    padding: 6,
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (ctx: any) => {
                      const item = RACA_COR_DATA[ctx.dataIndex];
                      return ` ${item.raca}: ${item.total.toLocaleString('pt-BR')} (${item.pct.toFixed(1).replace('.', ',')}%)`;
                    },
                  },
                },
              },
            },
            plugins: [donutSliceLabelsPlugin],
          });
        }
      }

      // 2. Barras Empilhadas - Detalhamento por Carreira
      if (barRef.current) {
        const ctx2 = barRef.current.getContext('2d');
        if (ctx2) {
          const horizontalStackLabelsPlugin = {
            id: 'horizontalStackPercentageLabels',
            afterDatasetsDraw(chartInstance: any) {
              const c = chartInstance.ctx;
              const metaLast = chartInstance.getDatasetMeta(chartInstance.data.datasets.length - 1);

              RACA_COR_TABELA_2.forEach((item, index) => {
                const element = metaLast.data[index];
                if (!element) return;
                const racaGeral = RACA_COR_DATA.find((r) => r.raca === item.raca);
                const pct = racaGeral ? racaGeral.pct.toFixed(1).replace('.', ',') : '0';
                const text = `${pct}% (${item.total.toLocaleString('pt-BR')})`;

                c.save();
                c.font = 'bold 10px Inter, -apple-system, sans-serif';
                c.textAlign = 'left';
                c.textBaseline = 'middle';
                c.fillStyle = '#1e293b';
                c.fillText(text, element.x + 6, element.y);
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
                  borderRadius: 3,
                },
                {
                  label: 'Pesquisadores',
                  data: RACA_COR_TABELA_2.map((r) => r.pesquisadores),
                  backgroundColor: DS_COLORS.aux1, // Verde DGRH
                  borderRadius: 3,
                },
                {
                  label: 'PAEPE',
                  data: RACA_COR_TABELA_2.map((r) => r.tecnicos),
                  backgroundColor: DS_COLORS.primary, // Azul Primário
                  borderRadius: 3,
                },
                {
                  label: 'Extra-quadro',
                  data: RACA_COR_TABELA_2.map((r) => r.extraQuadro),
                  backgroundColor: DS_COLORS.secondary, // Dourado Secundário
                  borderRadius: 3,
                },
              ],
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: { right: 80 },
              },
              scales: {
                x: {
                  stacked: true,
                  suggestedMax: 11800,
                  grid: { color: 'rgba(0,0,0,0.05)' },
                  ticks: {
                    font: { weight: 'bold', size: 10 },
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
                    boxWidth: 10,
                    boxHeight: 10,
                    font: { weight: 'bold', size: 10 },
                    color: '#1e293b',
                  },
                },
                tooltip: {
                  padding: 10,
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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
      {/* Left Column: Donut/Pizza Visão Geral */}
      <div className="md:col-span-5 flex flex-col items-center justify-center">
        <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1 text-center">
          Visão Geral (Autodeclaração)
        </div>
        <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] relative">
          <canvas ref={pieRef} />
        </div>
        <div className="text-center mt-1.5">
          <span className="text-xs font-bold text-slate-500">
            Total Geral: <strong>13.554</strong> servidores cadastrados
          </span>
        </div>
      </div>

      {/* Right Column: Barras Empilhadas por Categoria */}
      <div className="md:col-span-7 flex flex-col justify-center">
        <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1 text-center sm:text-left">
          Composição por Carreira Funcional
        </div>
        <div className="w-full h-[300px] sm:h-[330px]">
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

            drawBadge(c, pct, lastElement.x + 23, lastElement.y, dataset.borderColor, '#ffffff', 9, 5, 2, 4);
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
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2.5,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: { right: 52 },
          },
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
              ticks: { font: { weight: 'bold', size: 11 }, color: '#0f172a' },
            },
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 10,
                boxHeight: 10,
                font: { weight: 'bold', size: 10 },
                color: '#1e293b',
              },
            },
            tooltip: {
              padding: 10,
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
    <div className="w-full h-[330px] sm:h-[360px]">
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

            drawBadge(c, pct, lastElement.x + 23, lastElement.y, dataset.borderColor, '#ffffff', 9.5, 5, 2, 4);
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
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 3,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: { right: 54 },
          },
          scales: {
            y: {
              min: 0,
              max: 500,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { weight: 'bold', size: 11 },
                color: '#64748b',
                callback: (val: any) => Number(val).toLocaleString('pt-BR'),
              },
            },
            x: {
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
              padding: 10,
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
    <div className="w-full h-[330px] sm:h-[360px]">
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
          SERVIDORES_POR_AREA.forEach((area, i) => {
            const element = meta.data[i];
            if (!element) return;
            const pos = element.tooltipPosition();
            if (!pos) return;
            const text = `${area.percentual.toFixed(1).replace('.', ',')}%`;
            drawBadge(c, text, pos.x, pos.y, 'rgba(15, 23, 42, 0.85)', '#ffffff', 11, 7, 3, 5);
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
              borderWidth: 2.5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                boxHeight: 12,
                padding: 10,
                font: { weight: 'bold', size: 11 },
                color: '#1e293b',
              },
            },
            tooltip: {
              padding: 12,
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full h-full">
      {/* Left Column: Official Pie Chart with Data Labels */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center relative h-[330px] sm:h-[370px]">
        <canvas ref={canvasRef} />
      </div>

      {/* Right Column: Highlights & Cards with Exact Percentages */}
      <div className="lg:col-span-7 flex flex-col justify-center gap-3">
        {/* Callout box for highlighted percentages */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#105e7b] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <strong>Concentração Funcional:</strong> <strong>70,6%</strong> de todo o quadro funcional concentra-se em <strong>Faculdades e Institutos (38,5%)</strong> e na <strong>Área da Saúde (32,1%)</strong>, com representação integral na Administração Central (<strong>22,2%</strong>), Centros e Núcleos (<strong>4,6%</strong>) e Colégios Técnicos (<strong>2,6%</strong>).
          </div>
        </div>

        {/* 5 Area Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SERVIDORES_POR_AREA.map((item) => (
            <div
              key={item.tipoOrgao}
              className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between"
              style={{ borderLeftWidth: '4px', borderLeftColor: item.cor }}
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-bold text-slate-800 truncate">{item.tipoOrgao}</div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {item.total.toLocaleString('pt-BR')} servidores
                </div>
              </div>
              <div
                className="px-2.5 py-1 rounded-lg text-xs font-black text-white shrink-0"
                style={{ backgroundColor: item.cor }}
              >
                {item.percentual.toFixed(1).replace('.', ',')}%
              </div>
            </div>
          ))}
          {/* Total summary banner */}
          <div className="p-2.5 rounded-xl bg-slate-900 text-white flex items-center justify-between col-span-1 sm:col-span-2">
            <span className="text-xs font-bold">Total Geral da Universidade</span>
            <span className="text-sm font-black text-amber-400">9.416 servidores ativos</span>
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

          top20.forEach((cargo, index) => {
            const element = meta.data[index];
            if (!element) return;
            const pct = ((cargo.quantidade / totalGeral) * 100).toFixed(1).replace('.', ',');
            const text = `${cargo.quantidade.toLocaleString('pt-BR')} (${pct}%)`;

            c.save();
            c.font = 'bold 9.5px Inter, -apple-system, sans-serif';
            c.textAlign = 'left';
            c.textBaseline = 'middle';
            c.fillStyle = '#0f172a';
            c.fillText(text, element.x + 5, element.y);
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
              borderRadius: 3,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: { right: 85 },
          },
          scales: {
            x: {
              suggestedMax: 1650,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { weight: 'bold', size: 10 },
                color: '#64748b',
                callback: (val: any) => Number(val).toLocaleString('pt-BR'),
              },
            },
            y: {
              grid: { display: false },
              ticks: {
                font: { weight: 'bold', size: 9 },
                color: '#0f172a',
              },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx: any) => {
                  const cargo = top20[ctx.dataIndex];
                  const pct = ((cargo.quantidade / totalGeral) * 100).toFixed(1).replace('.', ',');
                  return ` ${cargo.quantidade.toLocaleString('pt-BR')} servidores (${pct}% do quadro total) • ${cargo.categoria}`;
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
    <div className="w-full flex flex-col justify-center h-full">
      {/* Legenda Oficial por Classificação da Universidade */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-2 text-[11px] font-bold text-slate-700">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: DS_COLORS.primary }} />
          Administração e RH
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: DS_COLORS.aux3 }} />
          Saúde
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: DS_COLORS.aux1 }} />
          Educação, Pesquisa e Ciência
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: DS_COLORS.secondary }} />
          Tecnologia da Informação (TI)
        </span>
      </div>

      <div className="w-full h-[350px] sm:h-[370px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

/* =========================================================================
   8. NACIONALIDADES: Doughnut + Continental Bar Chart com Porcentagens
   ========================================================================= */
export const NacionalidadesCharts: React.FC = () => {
  const donutRef = useRef<HTMLCanvasElement | null>(null);
  const barRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let donutChart: any = null;
    let barChart: any = null;
    let active = true;

    getChartJS().then((Chart) => {
      if (!active || !Chart) return;

      // 1. Donut (Brasileiros vs Estrangeiros)
      if (donutRef.current) {
        const ctx1 = donutRef.current.getContext('2d');
        if (ctx1) {
          const donutLabelsPlugin = {
            id: 'donutNacionalidadeBadges',
            afterDatasetsDraw(chartInstance: any) {
              const c = chartInstance.ctx;
              const meta = chartInstance.getDatasetMeta(0);
              const pcts = ['94,9%', '5,1%'];

              meta.data.forEach((element: any, i: number) => {
                const pos = element.tooltipPosition();
                if (!pos) return;
                drawBadge(c, pcts[i], pos.x, pos.y, 'rgba(15, 23, 42, 0.85)', '#ffffff', 11, 7, 3, 5);
              });
            },
          };

          donutChart = new Chart(ctx1, {
            type: 'doughnut',
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
              cutout: '68%',
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    boxWidth: 12,
                    font: { weight: 'bold', size: 11 },
                    color: '#1e293b',
                  },
                },
                tooltip: {
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
            plugins: [donutLabelsPlugin],
          });
        }
      }

      // 2. Bar (Origem dos Estrangeiros) com cores DS e rótulos
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

              NACIONALIDADES_DATA.regioesEstrangeiros.forEach((item, index) => {
                const element = meta.data[index];
                if (!element) return;
                const text = `${item.pct.toFixed(1).replace('.', ',')}% (${item.total})`;

                c.save();
                c.font = 'bold 10px Inter, -apple-system, sans-serif';
                c.textAlign = 'center';
                c.textBaseline = 'bottom';
                c.fillStyle = '#0f172a';
                c.fillText(text, element.x, element.y - 5);
                c.restore();
              });
            },
          };

          barChart = new Chart(ctx2, {
            type: 'bar',
            data: {
              labels: NACIONALIDADES_DATA.regioesEstrangeiros.map((r) => r.regiao),
              datasets: [
                {
                  label: 'Estrangeiros por Continente',
                  data: NACIONALIDADES_DATA.regioesEstrangeiros.map((r) => r.total),
                  backgroundColor: continentColors,
                  borderRadius: 6,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: { top: 20 },
              },
              scales: {
                y: {
                  suggestedMax: 56,
                  grid: { color: 'rgba(0,0,0,0.05)' },
                  ticks: { font: { weight: 'bold', size: 11 }, color: '#64748b' },
                },
                x: {
                  grid: { display: false },
                  ticks: { font: { weight: 'bold', size: 10 }, color: '#0f172a' },
                },
              },
              plugins: {
                legend: { display: false },
                tooltip: {
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
      donutChart?.destroy();
      barChart?.destroy();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      <div className="md:col-span-5 flex flex-col items-center justify-center relative">
        <div className="w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] relative">
          <canvas ref={donutRef} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
            <span className="text-3xl font-black text-[#105e7b]">94,9%</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 font-sans">Brasileiros</span>
          </div>
        </div>
      </div>

      <div className="md:col-span-7 h-[300px] sm:h-[330px]">
        <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 text-center md:text-left">
          Distribuição dos 110 Estrangeiros por Região
        </h4>
        <canvas ref={barRef} />
      </div>
    </div>
  );
};
