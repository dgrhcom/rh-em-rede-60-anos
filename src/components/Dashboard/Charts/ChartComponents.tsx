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
   1. ÁREAS: Stacked Horizontal Bar Chart
   ========================================================================= */
export const AreasStackedBarChart: React.FC = () => {
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
          labels: SERVIDORES_POR_AREA.map((a) => a.tipoOrgao),
          datasets: [
            {
              label: 'Docentes',
              data: SERVIDORES_POR_AREA.map((a) => a.docentes),
              backgroundColor: '#b43a2b',
              borderRadius: 4,
            },
            {
              label: 'Pesquisadores (PQ)',
              data: SERVIDORES_POR_AREA.map((a) => a.pesquisadores),
              backgroundColor: '#047857',
              borderRadius: 4,
            },
            {
              label: 'Técnico-administrativos (PAEPE)',
              data: SERVIDORES_POR_AREA.map((a) => a.tecnicos),
              backgroundColor: '#105e7b',
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
              ticks: { font: { weight: 'bold', size: 11 }, color: '#475569' },
            },
            y: {
              stacked: true,
              grid: { display: false },
              ticks: { font: { weight: 'bold', size: 12 }, color: '#0f172a' },
            },
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 14,
                boxHeight: 14,
                font: { weight: 'bold', size: 12 },
                color: '#1e293b',
              },
            },
            tooltip: {
              padding: 12,
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
    <div className="w-full h-[280px] sm:h-[320px]">
      <canvas ref={canvasRef} />
    </div>
  );
};

/* =========================================================================
   2. GÊNERO: Doughnut Chart Geral + Bar Chart por Carreira
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

      // Donut Chart
      if (donutRef.current) {
        const ctx1 = donutRef.current.getContext('2d');
        if (ctx1) {
          donutChart = new Chart(ctx1, {
            type: 'doughnut',
            data: {
              labels: ['Feminino', 'Masculino'],
              datasets: [
                {
                  data: [GENERO_DATA.total.feminino, GENERO_DATA.total.masculino],
                  backgroundColor: ['#ec4899', '#4338ca'],
                  hoverBackgroundColor: ['#db2777', '#3730a3'],
                  borderWidth: 3,
                  borderColor: '#ffffff',
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '70%',
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
                      return ` ${ctx.label}: ${val.toLocaleString('pt-BR')} (${pct}%)`;
                    },
                  },
                },
              },
            },
          });
        }
      }

      // Bar Chart by Career
      if (barRef.current) {
        const ctx2 = barRef.current.getContext('2d');
        if (ctx2) {
          barChart = new Chart(ctx2, {
            type: 'bar',
            data: {
              labels: GENERO_DATA.porCarreira.map((c) => c.carreira),
              datasets: [
                {
                  label: 'Feminino (%)',
                  data: GENERO_DATA.porCarreira.map((c) => c.pctFeminino),
                  backgroundColor: '#ec4899',
                  borderRadius: 6,
                },
                {
                  label: 'Masculino (%)',
                  data: GENERO_DATA.porCarreira.map((c) => c.pctMasculino),
                  backgroundColor: '#4338ca',
                  borderRadius: 6,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  max: 100,
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
                      return ` ${ctx.dataset.label}: ${ctx.raw}% (${count.toLocaleString('pt-BR')} servidores)`;
                    },
                  },
                },
              },
            },
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
            <span className="text-3xl font-black text-slate-950">55,9%</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-pink-600">Mulheres</span>
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
   3. FAIXA ETÁRIA: Histogram Bar Chart with Highlight
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

      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: FAIXA_ETARIA_DATA.map((f) => f.faixa),
          datasets: [
            {
              label: 'Docentes',
              data: FAIXA_ETARIA_DATA.map((f) => f.docentes),
              backgroundColor: '#b43a2b',
              borderRadius: 4,
            },
            {
              label: 'Pesquisadores (PQ)',
              data: FAIXA_ETARIA_DATA.map((f) => f.pesquisadores),
              backgroundColor: '#047857',
              borderRadius: 4,
            },
            {
              label: 'Técnicos-administrativos (PAEPE)',
              data: FAIXA_ETARIA_DATA.map((f) => f.tecnicos),
              backgroundColor: '#105e7b',
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: true,
              grid: { display: false },
              ticks: { font: { weight: 'bold', size: 11 }, color: '#0f172a' },
            },
            y: {
              stacked: true,
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
                  const pct = item.total > 0 ? ((val / item.total) * 100).toFixed(1) : '0';
                  return ` ${ctx.dataset.label}: ${val.toLocaleString('pt-BR')} (${pct}% da faixa)`;
                },
                footer: (items: any[]) => {
                  if (!items.length) return '';
                  const item = FAIXA_ETARIA_DATA[items[0].dataIndex];
                  return `Total da faixa: ${item.total.toLocaleString('pt-BR')} servidores (${item.pct.toFixed(1)}% do quadro)`;
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
    <div className="w-full h-[330px] sm:h-[360px]">
      <canvas ref={canvasRef} />
    </div>
  );
};

/* =========================================================================
   4. RAÇA / COR: Horizontal Bar Chart
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

      const colors = ['#0284c7', '#d97706', '#475569', '#ca8a04', '#94a3b8', '#16a34a'];

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
                  return ` ${item.total.toLocaleString('pt-BR')} (${item.pct.toFixed(1)}%)`;
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
   4. RAÇA / COR INTEGRADO: Pizza Geral (Esq) + Barras por Categoria (Dir)
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

      // 1. Pizza / Donut - Visão Geral
      if (pieRef.current) {
        const ctx1 = pieRef.current.getContext('2d');
        if (ctx1) {
          const colors = ['#0284c7', '#d97706', '#334155', '#ca8a04', '#94a3b8', '#16a34a'];
          pieChart = new Chart(ctx1, {
            type: 'doughnut',
            data: {
              labels: RACA_COR_DATA.map((r) => r.raca),
              datasets: [
                {
                  data: RACA_COR_DATA.map((r) => r.total),
                  backgroundColor: colors,
                  borderWidth: 2,
                  borderColor: '#ffffff',
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '55%',
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
                      return ` ${item.raca}: ${item.total.toLocaleString('pt-BR')} (${item.pct.toFixed(1)}%)`;
                    },
                  },
                },
              },
            },
          });
        }
      }

      // 2. Barras Empilhadas - Detalhamento por Carreira
      if (barRef.current) {
        const ctx2 = barRef.current.getContext('2d');
        if (ctx2) {
          barChart = new Chart(ctx2, {
            type: 'bar',
            data: {
              labels: RACA_COR_TABELA_2.map((r) => r.raca),
              datasets: [
                {
                  label: 'Docentes',
                  data: RACA_COR_TABELA_2.map((r) => r.docentes),
                  backgroundColor: '#b43a2b',
                  borderRadius: 3,
                },
                {
                  label: 'Pesquisadores',
                  data: RACA_COR_TABELA_2.map((r) => r.pesquisadores),
                  backgroundColor: '#047857',
                  borderRadius: 3,
                },
                {
                  label: 'PAEPE',
                  data: RACA_COR_TABELA_2.map((r) => r.tecnicos),
                  backgroundColor: '#105e7b',
                  borderRadius: 3,
                },
                {
                  label: 'Extra-quadro',
                  data: RACA_COR_TABELA_2.map((r) => r.extraQuadro),
                  backgroundColor: '#d97706',
                  borderRadius: 3,
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
                      const pct = item.total > 0 ? ((val / item.total) * 100).toFixed(1) : '0';
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
        <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1 text-center">
          Visão Geral (Autodeclaração)
        </div>
        <div className="w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] relative">
          <canvas ref={pieRef} />
        </div>
        <div className="text-center mt-1">
          <span className="text-[11px] font-bold text-slate-500">
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
   4b. RAÇA / COR: Tabela 2 (Detalhamento por Categoria)
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
              backgroundColor: '#b43a2b',
              borderRadius: 4,
            },
            {
              label: 'Pesquisadores (PQ)',
              data: RACA_COR_TABELA_2.map((r) => r.pesquisadores),
              backgroundColor: '#047857',
              borderRadius: 4,
            },
            {
              label: 'Técnicos-administrativos (PAEPE)',
              data: RACA_COR_TABELA_2.map((r) => r.tecnicos),
              backgroundColor: '#105e7b',
              borderRadius: 4,
            },
            {
              label: 'Extra-quadro',
              data: RACA_COR_TABELA_2.map((r) => r.extraQuadro),
              backgroundColor: '#d97706',
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
                  const pct = item.total > 0 ? ((val / item.total) * 100).toFixed(1) : '0';
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
   5a. ESCOLARIDADE: Evolução Completa em Linhas (Todas as Categorias)
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
    <div className="w-full h-[330px] sm:h-[360px]">
      <canvas ref={canvasRef} />
    </div>
  );
};

/* =========================================================================
   5b. ESCOLARIDADE: Zoom em Linha (Mestrado, Fundamental, Doutorado, Fund. Incompleto e Maior que Doutorado)
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
    <div className="w-full h-[330px] sm:h-[360px]">
      <canvas ref={canvasRef} />
    </div>
  );
};

/* =========================================================================
   5c. ESCOLARIDADE: Comparison Bar Chart (2016 vs 2026 - legado)
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
              backgroundColor: '#94a3b8',
              borderRadius: 6,
            },
            {
              label: 'Ano 2026',
              data: data2026,
              backgroundColor: '#105e7b',
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

      chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: SERVIDORES_POR_AREA.map((a) => `${a.tipoOrgao} (${a.percentual.toFixed(1)}%)`),
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
                  return ` ${area.tipoOrgao}: ${area.total.toLocaleString('pt-BR')} servidores (${area.percentual.toFixed(1)}%)`;
                },
                afterLabel: (ctx: any) => {
                  const area = SERVIDORES_POR_AREA[ctx.dataIndex];
                  return ` Docentes: ${area.docentes.toLocaleString('pt-BR')} | Pesquisadores: ${area.pesquisadores} | PAEPE: ${area.tecnicos.toLocaleString('pt-BR')}`;
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full h-full">
      {/* Left Column: Official Pie Chart */}
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
                {item.percentual.toFixed(1)}%
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
   7. TOP CARGOS: Ranked Horizontal Bar Chart
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

      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: top20.map((c, i) => `${i + 1}º ${c.cargo}`),
          datasets: [
            {
              label: 'Total de Profissionais',
              data: top20.map((c) => c.quantidade),
              backgroundColor: top20.map((c) => {
                if (c.categoria === 'Docente') return '#b43a2b';
                if (c.categoria === 'Saúde') return '#047857';
                if (c.categoria === 'Tecnologia') return '#0284c7';
                return '#105e7b';
              }),
              borderRadius: 3,
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
                  return ` ${cargo.quantidade.toLocaleString('pt-BR')} servidores (${cargo.categoria})`;
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
    <div className="w-full h-[370px] sm:h-[400px]">
      <canvas ref={canvasRef} />
    </div>
  );
};

/* =========================================================================
   8. NACIONALIDADES: Doughnut + Continental Bar Chart
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

      // Donut (Brasileiros vs Estrangeiros)
      if (donutRef.current) {
        const ctx1 = donutRef.current.getContext('2d');
        if (ctx1) {
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
                  backgroundColor: ['#047857', '#105e7b'],
                  hoverBackgroundColor: ['#065f46', '#0e4a60'],
                  borderWidth: 3,
                  borderColor: '#ffffff',
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '70%',
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
          });
        }
      }

      // Bar (Origem dos Estrangeiros)
      if (barRef.current) {
        const ctx2 = barRef.current.getContext('2d');
        if (ctx2) {
          barChart = new Chart(ctx2, {
            type: 'bar',
            data: {
              labels: NACIONALIDADES_DATA.regioesEstrangeiros.map((r) => r.regiao),
              datasets: [
                {
                  label: 'Estrangeiros por Continente',
                  data: NACIONALIDADES_DATA.regioesEstrangeiros.map((r) => r.total),
                  backgroundColor: '#105e7b',
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
                      return ` ${item.total} pesquisadores/docentes (${item.pct.toFixed(1)}%)`;
                    },
                  },
                },
              },
            },
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
            <span className="text-3xl font-black text-slate-950">94,9%</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Brasileiros</span>
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
