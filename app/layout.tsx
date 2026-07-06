import type { Metadata } from "next";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";
import Sidebar from "@/components/shell/Sidebar";
import MobileNav from "@/components/shell/MobileNav";
import MarketStrip from "@/components/shell/MarketStrip";

export const metadata: Metadata = {
  title: "HELIOS · Renewable Commercialization OS",
  description:
    "AI-driven energy commercialization platform for Tages Capital SGR. Engineered by First Boston Capital.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 min-w-0 flex flex-col">
            <MobileNav />
            <MarketStrip />
            <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 max-w-[1500px] w-full mx-auto">{children}</main>
            <footer className="px-4 sm:px-8 py-4 border-t border-linesoft text-[11px] font-mono text-dim flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <span>HELIOS v1.0 · demo environment · static data</span>
              <span>Engineered by FIRST BOSTON CAPITAL for Tages Capital SGR</span>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
