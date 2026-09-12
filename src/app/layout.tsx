import type { ReactNode } from "react";

/** Root pass-through: html/body vivono in `[locale]/layout` (e in futuro route group admin). */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
