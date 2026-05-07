import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 20): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export function Check({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function X({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function Lock({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <rect height="11" rx="2" width="18" x="3" y="11" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function Bell({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export function Compass({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="12" cy="12" r="10" />
      <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    </svg>
  );
}

export function ChevronDown({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ArrowRight({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

export function Moon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
