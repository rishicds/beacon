import type { SVGProps } from "react";

export default function GuardianMailLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9.5 9 2.3 1.4a1 1 0 0 0 1.4 0L15.5 9" />
      <path d="M14.5 12.5v-3" />
      <path d="M9.5 12.5v-3" />
    </svg>
  );
}
