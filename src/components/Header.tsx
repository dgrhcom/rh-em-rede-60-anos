import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-transparent px-4 sm:px-6 py-3 transition-all pointer-events-none">
      <div className="flex items-center justify-start pointer-events-auto">
        <img
          src="/logo_dgrh.svg"
          alt="DGRH - Diretoria Geral de Recursos Humanos"
          className="h-10 sm:h-12 md:h-14 w-auto object-contain drop-shadow-xs select-none"
        />
      </div>
    </header>
  );
};
