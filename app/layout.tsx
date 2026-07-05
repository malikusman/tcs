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
            <MarketStrip />
            <main className="flex-1 px-6 py-6 lg:px-8 max-w-[1500px] w-full mx-auto">{children}</main>
            <footer className="px-8 py-4 border-t border-linesoft text-[11px] font-mono text-dim flex items-center justify-between">
              <span>HELIOS v1.0 · demo environment · static data</span>
              <span>Engineered by FIRST BOSTON CAPITAL for Tages Capital SGR</span>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
