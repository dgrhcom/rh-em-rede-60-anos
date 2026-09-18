// Indicadores Oficiais de Gestão de Pessoas - 60 Anos da Unicamp

export interface AreaDistribution {
  tipoOrgao: string;
  docentes: number;
  pesquisadores: number;
  tecnicos: number;
  total: number;
  percentual: number;
  cor: string;
}

export const SERVIDORES_POR_AREA: AreaDistribution[] = [
  { tipoOrgao: 'Administração Central', docentes: 19, pesquisadores: 0, tecnicos: 2069, total: 2088, percentual: 22.2, cor: '#105e7b' },
  { tipoOrgao: 'Centros e Núcleos', docentes: 0, pesquisadores: 87, tecnicos: 350, total: 437, percentual: 4.6, cor: '#e5a93a' },
  { tipoOrgao: 'Colégios', docentes: 181, pesquisadores: 0, tecnicos: 62, total: 243, percentual: 2.6, cor: '#5e2a6b' },
  { tipoOrgao: 'Faculdades e Institutos', docentes: 1792, pesquisadores: 4, tecnicos: 1829, total: 3625, percentual: 38.5, cor: '#477b2f' },
  { tipoOrgao: 'Área da Saúde', docentes: 0, pesquisadores: 1, tecnicos: 3022, total: 3023, percentual: 32.1, cor: '#d67b27' },
];

export const TOTAL_SERVIDORES_ATIVOS = 9416;

export const GENERO_DATA = {
  total: {
    feminino: 5267,
    masculino: 4149,
    total: 9416,
    pctFeminino: 55.9,
    pctMasculino: 44.1,
  },
  porCarreira: [
    {
      carreira: 'Técnico-administrativos (PAEPE)',
      feminino: 4401,
      masculino: 2931,
      total: 7332,
      pctFeminino: 60.0,
      pctMasculino: 40.0,
    },
    {
      carreira: 'Docentes',
      feminino: 801,
      masculino: 1191,
      total: 1992,
      pctFeminino: 40.2,
      pctMasculino: 59.8,
    },
    {
      carreira: 'Pesquisadores (PQ)',
      feminino: 65,
      masculino: 90,
      total: 155,
      pctFeminino: 41.9,
      pctMasculino: 58.1,
    },
  ],
};

export const FAIXA_ETARIA_DATA = [
  { faixa: '< 30 anos', docentes: 10, pesquisadores: 2, tecnicos: 442, total: 454, pct: 4.8 },
  { faixa: '30 a 39 anos', docentes: 404, pesquisadores: 29, tecnicos: 1825, total: 2258, pct: 24.0 },
  { faixa: '40 a 49 anos', docentes: 641, pesquisadores: 65, tecnicos: 2350, total: 3056, pct: 32.5 },
  { faixa: '50 a 59 anos', docentes: 462, pesquisadores: 42, tecnicos: 1782, total: 2286, pct: 24.3 },
  { faixa: '60 a 69 anos', docentes: 377, pesquisadores: 16, tecnicos: 792, total: 1185, pct: 12.6 },
  { faixa: '70 anos ou mais', docentes: 98, pesquisadores: 1, tecnicos: 78, total: 177, pct: 1.9 },
];

export const DESTAQUE_FAIXA_ETARIA = {
  jovem: 'Servidor mais jovem com 18 anos',
  velho: 'Servidor com mais idade com 89 anos',
};

export const RACA_COR_DATA = [
  { raca: 'Branca', total: 10302, pct: 71.9 },
  { raca: 'Parda', total: 1870, pct: 18.3 },
  { raca: 'Preta', total: 794, pct: 5.6 },
  { raca: 'Amarela', total: 332, pct: 1.3 },
  { raca: 'Não Informado', total: 229, pct: 2.7 },
  { raca: 'Indígena', total: 27, pct: 0.3 },
];

// Dados completos da Tabela 2 da planilha oficial por categoria funcional
export const RACA_COR_TABELA_2 = [
  { raca: 'Branca', docentes: 1750, pesquisadores: 84, tecnicos: 5321, extraQuadro: 3102, total: 10302 },
  { raca: 'Parda', docentes: 107, pesquisadores: 1, tecnicos: 1151, extraQuadro: 604, total: 1870 },
  { raca: 'Preta', docentes: 39, pesquisadores: 0, tecnicos: 579, extraQuadro: 167, total: 794 },
  { raca: 'Amarela', docentes: 42, pesquisadores: 3, tecnicos: 172, extraQuadro: 114, total: 332 },
  { raca: 'Não Informado', docentes: 50, pesquisadores: 4, tecnicos: 41, extraQuadro: 134, total: 229 },
  { raca: 'Indígena', docentes: 4, pesquisadores: 0, tecnicos: 7, extraQuadro: 16, total: 27 },
];

export const ESCOLARIDADE_EVOLUCAO = {
  anos: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
  series: [
    { nivel: 'Superior', valores: [2775, 2676, 2564, 2433, 2376, 2325, 2283, 2322, 2425, 2520, 2479], cor: '#105e7b' }, // Primária
    { nivel: 'Médio', valores: [2807, 2624, 2443, 2290, 2226, 2129, 2065, 2059, 2176, 2269, 2179], cor: '#e5a93a' },    // Secundária
    { nivel: 'Especialização', valores: [1139, 1105, 1120, 1119, 1107, 1120, 1263, 1330, 1441, 1599, 1697], cor: '#477b2f' }, // Aux 1
    { nivel: 'Mestrado', valores: [396, 374, 382, 382, 388, 390, 407, 429, 430, 446, 463], cor: '#d67b27' },              // Aux 3
    { nivel: 'Doutorado', valores: [221, 219, 230, 225, 232, 242, 262, 263, 276, 302, 325], cor: '#5e2a6b' },              // Aux 2
    { nivel: 'Fundamental', valores: [312, 270, 246, 218, 195, 185, 164, 144, 122, 114, 110], cor: '#475569' },            // Slate
    { nivel: 'Fundamental Incompleto', valores: [152, 134, 125, 107, 96, 87, 77, 66, 60, 53, 52], cor: '#6b213b' },       // Vinho
    { nivel: 'Maior que Doutorado', valores: [9, 8, 9, 10, 10, 14, 20, 25, 23, 26, 28], cor: '#1a508b' },                  // Cobalto
  ],
};

// Séries com zoom específico: Mestrado, Fundamental, Doutorado, Fundamental Incompleto e Maior que Doutorado
export const ESCOLARIDADE_ZOOM_SERIES = [
  { nivel: 'Mestrado', valores: [396, 374, 382, 382, 388, 390, 407, 429, 430, 446, 463], cor: '#d67b27' },              // Aux 3
  { nivel: 'Doutorado', valores: [221, 219, 230, 225, 232, 242, 262, 263, 276, 302, 325], cor: '#5e2a6b' },              // Aux 2
  { nivel: 'Fundamental', valores: [312, 270, 246, 218, 195, 185, 164, 144, 122, 114, 110], cor: '#475569' },            // Slate
  { nivel: 'Fundamental Incompleto', valores: [152, 134, 125, 107, 96, 87, 77, 66, 60, 53, 52], cor: '#6b213b' },       // Vinho
  { nivel: 'Maior que Doutorado', valores: [9, 8, 9, 10, 10, 14, 20, 25, 23, 26, 28], cor: '#105e7b' },                  // Primária
];

export const TOP_CARGOS_2026 = [
  { cargo: 'Técnico em Administração (PAEPE)', quantidade: 1430, categoria: 'Técnico-Administrativo' },
  { cargo: 'Técnico de Enfermagem (PAEPE)', quantidade: 1322, categoria: 'Saúde' },
  { cargo: 'Professor Associado', quantidade: 818, categoria: 'Docente' },
  { cargo: 'Professor Doutor', quantidade: 563, categoria: 'Docente' },
  { cargo: 'Enfermeiro (PAEPE)', quantidade: 554, categoria: 'Saúde' },
  { cargo: 'Médico (PAEPE)', quantidade: 432, categoria: 'Saúde' },
  { cargo: 'Professor Titular', quantidade: 394, categoria: 'Docente' },
  { cargo: 'Profissional de Administração (PAEPE)', quantidade: 330, categoria: 'Técnico-Administrativo' },
  { cargo: 'Analista de Desenv. de Sistemas (PAEPE)', quantidade: 228, categoria: 'Tecnologia' },
  { cargo: 'Prof. Magistério Secundário Técnico', quantidade: 181, categoria: 'Docente' },
  { cargo: 'Técnico de Laboratório (PAEPE)', quantidade: 162, categoria: 'Técnico-Administrativo' },
  { cargo: 'Biologista (PAEPE)', quantidade: 132, categoria: 'Saúde' },
  { cargo: 'Prof. Educação Infantil e Fundamental', quantidade: 129, categoria: 'Educação' },
  { cargo: 'Analista de Suporte Computacional', quantidade: 103, categoria: 'Tecnologia' },
  { cargo: 'Bibliotecário (PAEPE)', quantidade: 97, categoria: 'Educação' },
  { cargo: 'Pesquisador (PQ)', quantidade: 92, categoria: 'Pesquisa' },
  { cargo: 'Profissional de Pesquisa', quantidade: 79, categoria: 'Pesquisa' },
  { cargo: 'Técnico em Biblioteconomia', quantidade: 72, categoria: 'Educação' },
  { cargo: 'Biólogo (PAEPE)', quantidade: 65, categoria: 'Saúde' },
  { cargo: 'Assistente Social (PAEPE)', quantidade: 63, categoria: 'Saúde' },
];

export const NACIONALIDADES_DATA = {
  totalNatoOuNaturalizado: 1978,
  totalEstrangeiro: 106,
  pctEstrangeiros: 5.1,
  regioesEstrangeiros: [
    { regiao: 'América Latina', docentes: 45, pesquisadores: 3, total: 48, pct: 45.3 },
    { regiao: 'Europa', docentes: 40, pesquisadores: 5, total: 45, pct: 42.5 },
    { regiao: 'América do Norte', docentes: 5, pesquisadores: 0, total: 5, pct: 4.7 },
    { regiao: 'Ásia', docentes: 5, pesquisadores: 0, total: 5, pct: 4.7 },
    { regiao: 'Outros', docentes: 3, pesquisadores: 0, total: 3, pct: 2.8 },
  ],
};
