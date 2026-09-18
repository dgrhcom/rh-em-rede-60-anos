import React, { useEffect, useRef } from 'react';
import {
  SERVIDORES_POR_AREA,
  GENERO_DATA,
  FAIXA_ETARIA_DATA,
  RACA_COR_DATA,
  ESCOLARIDADE_EVOLUCAO,
  GRANDES_AREAS_EVOLUCAO,
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
        <div className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] relative">
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

      <div className="md:col-span-7 h-[260px]">
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
              label: 'Total de Servidores',
              data: FAIXA_ETARIA_DATA.map((f) => f.total),
              backgroundColor: FAIXA_ETARIA_DATA.map((f) =>
                f.faixa === '40 a 49 anos' ? '#105e7b' : '#334155'
              ),
              borderRadius: 8,
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
              ticks: { font: { weight: 'bold', size: 11 }, color: '#0f172a' },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              padding: 12,
              callbacks: {
                label: (ctx: any) => {
                  const item = FAIXA_ETARIA_DATA[ctx.dataIndex];
                  return ` ${item.total.toLocaleString('pt-BR')} servidores (${item.pct.toFixed(1)}% do quadro)`;
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
    <div className="w-full h-[300px]">
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
   5. ESCOLARIDADE: Comparison Bar Chart (2016 vs 2026)
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
   6. GRANDES ÁREAS: Multi-Line Evolution Chart (2022 - 2026)
   ========================================================================= */
export const GrandesAreasLineChart: React.FC = () => {
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
          labels: GRANDES_AREAS_EVOLUCAO.anos,
          datasets: GRANDES_AREAS_EVOLUCAO.areas.map((area) => ({
            label: area.area,
            data: area.valores,
            borderColor: area.cor,
            backgroundColor: area.cor,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
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
              ticks: { font: { weight: 'bold', size: 12 }, color: '#0f172a' },
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
                label: (ctx: any) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString('pt-BR')}`,
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
    <div className="w-full h-[310px]">
      <canvas ref={canvasRef} />
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

      const top10 = TOP_CARGOS_2026.slice(0, 10).reverse();

      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: top10.map((c) => c.cargo),
          datasets: [
            {
              label: 'Total de Profissionais',
              data: top10.map((c) => c.quantidade),
              backgroundColor: top10.map((c) => (c.categoria === 'Docente' ? '#b43a2b' : '#105e7b')),
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
                  const cargo = top10[ctx.dataIndex];
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
    <div className="w-full h-[320px]">
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
        <div className="w-[190px] h-[190px] sm:w-[210px] sm:h-[210px] relative">
          <canvas ref={donutRef} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
            <span className="text-3xl font-black text-slate-950">94,9%</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Brasileiros</span>
          </div>
        </div>
      </div>

      <div className="md:col-span-7 h-[250px]">
        <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 text-center md:text-left">
          Distribuição dos 110 Estrangeiros por Região
        </h4>
        <canvas ref={barRef} />
      </div>
    </div>
  );
};
