import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 22) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IconPaw = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <circle cx="5" cy="9" r="1.8" fill="currentColor" stroke="none" />
    <circle cx="9" cy="5" r="1.8" fill="currentColor" stroke="none" />
    <circle cx="15" cy="5" r="1.8" fill="currentColor" stroke="none" />
    <circle cx="19" cy="9" r="1.8" fill="currentColor" stroke="none" />
    <path
      d="M7 16c0-3 2-5 5-5s5 2 5 5c0 2-1.5 3-3 3h-4c-1.5 0-3-1-3-3z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

export const IconSearch = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

export const IconPin = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M12 22s7-7.58 7-13a7 7 0 10-14 0c0 5.42 7 13 7 13z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

export const IconBell = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M6 8a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7z" />
    <path d="M10 19a2 2 0 004 0" />
  </svg>
);

export const IconHeart = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M12 20s-7-4.5-9-10a5 5 0 019-3 5 5 0 019 3c-2 5.5-9 10-9 10z" />
  </svg>
);

export const IconHome = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M3 10l9-7 9 7v10a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1V10z" />
  </svg>
);

export const IconShield = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const IconSpark = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.5 2.5M16 16l2.5 2.5M5.5 18.5L8 16M16 8l2.5-2.5" />
  </svg>
);

export const IconCheck = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);

export const IconArrow = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

export const IconWhats = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M4 20l1.5-4A8 8 0 1 0 8 18.5L4 20z" />
    <path d="M9 10c.5 2 2.5 4 4.5 4.5l1.3-1.3c.3-.3.7-.4 1-.2l2 1c.3.1.4.5.2.8A3.5 3.5 0 0 1 15 16a8 8 0 0 1-7-7 3.5 3.5 0 0 1 1.2-3c.3-.2.7 0 .8.3l1 2c.2.3 0 .7-.2 1L9.5 10.5z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconStar = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M12 3l2.8 5.7 6.3.9-4.6 4.5 1.1 6.3L12 17.8 6.4 20.4l1.1-6.3L2.9 9.6l6.3-.9L12 3z" />
  </svg>
);

export const IconChat = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M21 12a8 8 0 1 0-15.5 2.9L4 20l5-1.5A8 8 0 0 0 21 12z" />
  </svg>
);

export const IconMoney = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M6 10v4M18 10v4" />
  </svg>
);

export const IconStethoscope = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M6 3v6a4 4 0 0 0 8 0V3" />
    <path d="M10 13c0 4 3 6 6 6a4 4 0 0 0 4-4" />
    <circle cx="20" cy="15" r="2" />
  </svg>
);

export const IconMenu = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IconX = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M6 6l12 12M6 18L18 6" />
  </svg>
);

export const IconInstagram = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconTiktok = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M14 4v9a4 4 0 1 1-4-4" />
    <path d="M14 4c0 3 2 5 5 5" />
  </svg>
);

export const IconFacebook = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M15 3h-3a4 4 0 0 0-4 4v3H5v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3V3z" />
  </svg>
);
