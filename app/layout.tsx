import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Zingarito Kids - Mayorista de Ropa Infantil",
  description: "Tienda mayorista de ropa para niños y bebés. Compra mínima 5 productos. Villa Ramallo, Buenos Aires, Argentina.",
  keywords: ["ropa infantil", "mayorista", "ropa niños", "bebés", "Argentina", "Villa Ramallo"],
  authors: [{ name: "Zingarito Kids" }],
  openGraph: {
    title: "Zingarito Kids - Mayorista de Ropa Infantil",
    description: "Tienda mayorista de ropa para niños y bebés. Compra mínima 5 productos.",
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col bg-gray-50">
        {/* Notificaciones Toast */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#7B3FBD',
                secondary: '#fff',
              },
            },
          }}
        />
        
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
        
        {/* Footer */}
        <Footer />
        
        {/* WhatsApp Flotante */}
        <WhatsAppButton />
      </body>
    </html>
  );
}
