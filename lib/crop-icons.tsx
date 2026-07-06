import React from 'react';

interface CropIconProps {
  className?: string;
  size?: number;
}

function Mais({ className, size = 24 }: CropIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3v14" />
      <path d="M8 17c0 2 1.8 4 4 4s4-2 4-4" />
      <path d="M6 8c0-2 1.8-4 4-4h4c2.2 0 4 2 4 4" />
      <path d="M8 12c-1.5 0-3 1-3 3" />
      <path d="M16 12c1.5 0 3 1 3 3" />
      <path d="M10 7l-4-2" />
      <path d="M14 7l4-2" />
      <path d="M10 10l-4 1" />
      <path d="M14 10l4 1" />
    </svg>
  );
}

function Arachide({ className, size = 24 }: CropIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="10" r="3" />
      <path d="M12 7V3" />
      <path d="M12 13v3" />
      <path d="M7.5 8.5l-3-2" />
      <path d="M16.5 8.5l3-2" />
      <path d="M7.5 11.5l-3 2" />
      <path d="M16.5 11.5l3 2" />
      <path d="M12 16c-2 0-4 1.5-4 4h8c0-2.5-2-4-4-4z" />
      <path d="M9 20c-.5 1-1.5 2-3 2" />
      <path d="M15 20c.5 1 1.5 2 3 2" />
    </svg>
  );
}

function Manioc({ className, size = 24 }: CropIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 4v12" />
      <path d="M8 5c-2 1-4 3-4 6 0 2 2 3 4 3" />
      <path d="M16 5c2 1 4 3 4 6 0 2-2 3-4 3" />
      <path d="M8 14c-2 0-5 2-5 5" />
      <path d="M16 14c2 0 5 2 5 5" />
      <path d="M10 10h4" />
      <path d="M12 14v6" />
      <path d="M9 20c-1 .5-2 1.5-3 2" />
      <path d="M15 20c1 .5 2 1.5 3 2" />
      <path d="M6 9l-3-1" />
      <path d="M18 9l3-1" />
    </svg>
  );
}

function Cacao({ className, size = 24 }: CropIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3v8" />
      <path d="M8 7c-3 1-5 3.5-5 7 0 1.5.5 3 1.5 4" />
      <path d="M16 7c3 1 5 3.5 5 7 0 1.5-.5 3-1.5 4" />
      <ellipse cx="12" cy="17" rx="6" ry="3" />
      <ellipse cx="12" cy="17" rx="3" ry="1.5" />
      <path d="M8 14c0 2 2 3.5 4 3.5s4-1.5 4-3.5" />
      <path d="M10 5c-1 1-2 3-2 5" />
      <path d="M14 5c1 1 2 3 2 5" />
      <path d="M12 11v3" />
    </svg>
  );
}

function Coton({ className, size = 24 }: CropIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="10" r="4" />
      <path d="M12 6V3" />
      <path d="M12 14v4" />
      <path d="M7 8l-3-1" />
      <path d="M17 8l3-1" />
      <path d="M7 12l-3 1" />
      <path d="M17 12l3 1" />
      <path d="M8 16c-1 1-2 2.5-2 4 0 1.5 1 3 2.5 3" />
      <path d="M16 16c1 1 2 2.5 2 4 0 1.5-1 3-2.5 3" />
      <path d="M10.5 18c-.5 1-.5 2 0 3" />
      <path d="M13.5 18c.5 1 .5 2 0 3" />
      <path d="M12 18v5" />
    </svg>
  );
}

function Sorgho({ className, size = 24 }: CropIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3v14" />
      <path d="M8 17c0 2 1.8 4 4 4s4-2 4-4" />
      <path d="M10 7l-4 1" />
      <path d="M14 7l4 1" />
      <path d="M10 10l-5 2" />
      <path d="M14 10l5 2" />
      <path d="M11 13l-6 1" />
      <path d="M13 13l6 1" />
      <path d="M12 7V4" />
      <path d="M7 3c-1 1-2 2.5-2 4" />
      <path d="M17 3c1 1 2 2.5 2 4" />
    </svg>
  );
}

function Mil({ className, size = 24 }: CropIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3v15" />
      <path d="M8 13c0 2.5 1.8 6 4 6s4-3.5 4-6" />
      <path d="M6 6l-3 2" />
      <path d="M18 6l3 2" />
      <path d="M8 8l-4 3" />
      <path d="M16 8l4 3" />
      <path d="M9 11l-5 1" />
      <path d="M15 11l5 1" />
      <path d="M12 6V4" />
      <path d="M5 18c-.5 1-1.5 2-3 2" />
      <path d="M19 18c.5 1 1.5 2 3 2" />
    </svg>
  );
}

function Riz({ className, size = 24 }: CropIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3v14" />
      <path d="M8 17c0 2 1.8 4 4 4s4-2 4-4" />
      <path d="M7 7l-3-1" />
      <path d="M17 7l3-1" />
      <path d="M6 10l-4 1" />
      <path d="M18 10l4 1" />
      <path d="M7 13l-4-1" />
      <path d="M17 13l4-1" />
      <path d="M12 7V4" />
      <path d="M6 20c-1 1-2 2-3 2" />
      <path d="M18 20c1 1 2 2 3 2" />
      <path d="M8.5 21c-.5 1-.5 2 0 2" />
      <path d="M15.5 21c.5 1 .5 2 0 2" />
    </svg>
  );
}

export const cropIcons: Record<string, React.ComponentType<CropIconProps>> = {
  mais: Mais,
  arachide: Arachide,
  manioc: Manioc,
  cacao: Cacao,
  coton: Coton,
  sorgho: Sorgho,
  mil: Mil,
  riz: Riz,
};

export {
  Mais,
  Arachide,
  Manioc,
  Cacao,
  Coton,
  Sorgho,
  Mil,
  Riz,
};
export type { CropIconProps };
