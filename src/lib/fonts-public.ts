import { Fraunces, Source_Sans_3 } from "next/font/google";
// Rollback / alternative (decommenta un blocco, commenta Fraunces):
// import { Bodoni_Moda } from "next/font/google";
// import { Londrina_Sketch } from "next/font/google";
// import { Cabin_Sketch } from "next/font/google";
// import { Girassol } from "next/font/google";

export const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

/** Trial display (ex Bodoni Moda). Soft+Wonk ≈ tratto “a mano”. */
export const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK"],
});

/*
export const displayFont = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});
*/

/*
export const displayFont = Londrina_Sketch({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
*/

/*
export const displayFont = Cabin_Sketch({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});
*/

/*
export const displayFont = Girassol({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
*/
