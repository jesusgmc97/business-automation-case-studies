import type { Metadata } from "next";
import "./globals.css";
const origin = "https://jesus-ia-automatizaciones.jesusgabriel16j.chatgpt.site";
export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: "Jesús · Automatizaciones y formación en IA para tu negocio",
  description: "Recupera tiempo con automatizaciones a medida, formación práctica en inteligencia artificial y consultoría. Power Automate, Microsoft 365 e integraciones. Cuéntame tu proyecto.",
  applicationName: "Jesús · IA & Automatización", alternates: { canonical: "/" },
  openGraph: { title: "Tu tiempo, para lo que importa.", description: "Automatizaciones y formación en IA. Jesús · IA & Automatización.", locale: "es_ES", type: "website", url: origin, siteName: "Jesús · IA & Automatización", images: [{ url: "/social-card.png", width: 1200, height: 630, alt: "Jesús · IA & Automatización. Tu tiempo, para lo que importa." }] },
  twitter: { card: "summary_large_image", title: "Tu tiempo, para lo que importa.", description: "Automatizaciones y formación práctica en IA para tu negocio." },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
