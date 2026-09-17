import React from 'react';
import { X, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white border-3 border-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-left text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#105e7b] border-2 border-slate-900 text-[#e5a93a] flex flex-col items-center justify-center font-black shadow-md">
              <span className="text-sm leading-none font-black">60</span>
              <span className="text-[7px] text-white tracking-widest uppercase mt-0.5 font-bold">ANOS</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                A Gestão de Pessoas nos 60 Anos da Unicamp
              </h3>
              <p className="text-xs text-[#105e7b] font-bold">
                DGRH • Diretoria Geral de Recursos Humanos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          <p>
            Este hotsite comemorativo resgata e celebra mais de quatro décadas de dedicação à gestão de pessoas na Universidade Estadual de Campinas (Unicamp), no contexto das celebrações dos <strong>60 anos da universidade</strong>.
          </p>

          <p>
            Desde a estruturação pioneira nos anos 1980, passando pela informatização de processos, implantação das carreiras e programas educacionais, até as inovações em saúde ocupacional, trabalho híbrido e modernização digital contemporânea, a trajetória da DGRH reflete o compromisso com o bem-estar e o desenvolvimento contínuo dos servidores.
          </p>

          <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-slate-900 space-y-3">
            <div className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#e5a93a]" />
              <span>Duas Experiências Visuais de Alto Impacto</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-800">
              <li className="flex items-start gap-2">
                <span className="text-[#105e7b] font-black shrink-0">1. Linha do Tempo Contínua:</span>
                <span>Faixa cronológica horizontal onde os cards em destaque ficam maiores no centro, com transição suave para os períodos anteriores e posteriores. Permite arrasto, scroll, navegação por régua interativa e giro 3D para ver os marcos.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#d67b27] font-black shrink-0">2. Tabuleiro de Jogos ("Trilha dos 60 Anos"):</span>
                <span>Jornada gamificada com dado interativo (física e som via Web Audio API), peão animado DGRH e galeria de conquistas históricas.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-900 space-y-2">
            <div className="text-xs font-black text-[#105e7b] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#e5a93a]" />
              <span>Identidade Visual & Design System DGRH</span>
            </div>
            <p className="text-xs text-slate-700">
              Desenvolvido seguindo as diretrizes e tokens do <strong>Design System Oficial da DGRH</strong> (Azul DGRH <code className="text-[#105e7b] font-bold">#105E7B</code>, Dourado <code className="text-[#b8801a] font-bold">#E5A93A</code>, tipografia Montserrat e Amiko/Inter) em tema claro de alto impacto.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="https://central-de-design.vercel.app/design-system"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-black text-[#105e7b] hover:underline"
              >
                <span>Central de Design DGRH</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-slate-400">•</span>
              <a
                href="https://www.dgrh.unicamp.br/dgrh/historia/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-black text-[#e5a93a] hover:underline"
              >
                <span>Acervo Histórico DGRH</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center text-[11px] text-slate-500 font-bold">
          <span>Acervo Histórico: Portarias GR, Jornal Unicamp, DPD, DSO e DGRH</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
