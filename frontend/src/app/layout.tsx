import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Xplover | Web3 Collaborative Research & Knowledge Protocol",
  description:
    "Next-generation decentralized research platform with peer review consensus, dynamic carousel generation, XCR token ledger, and Arbitrum attestations.",
  keywords: ["DeSci", "Web3", "Research", "Peer Review", "XCR", "Arbitrum"],
  authors: [{ name: "Xplover Protocol" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AuthProvider>
          <UIProvider>
            <div className="xplover-root">
              <Navbar />
              <div className="xplover-body">
                <Sidebar />
                <main className="xplover-main">
                  {children}
                </main>
              </div>
            </div>
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
