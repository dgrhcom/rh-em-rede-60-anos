import React from 'react';

interface HeaderProps {
  isCentered?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isCentered = true }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-transparent pointer-events-none">
      <div
        className={`fixed z-40 pointer-events-none transition-all duration-700 ease-in-out ${
          isCentered
            ? 'top-6 sm:top-8 md:top-10 left-1/2 -translate-x-1/2'
            : 'top-0 left-0 translate-x-0'
        }`}
        style={{
          padding: isCentered ? '0px' : '48px',
        }}
      >
        <img
          src="/logo_dgrh.svg"
          alt="DGRH - Diretoria Geral de Recursos Humanos"
          className={`w-auto object-contain select-none pointer-events-auto transition-all duration-700 ease-in-out ${
            isCentered
              ? 'h-9 sm:h-12 md:h-14 max-w-[85vw] drop-shadow-md'
              : 'h-8 sm:h-10 md:h-12 max-w-[calc(100vw-96px)] drop-shadow-xs'
          }`}
        />
      </div>
    </header>
  );
};
