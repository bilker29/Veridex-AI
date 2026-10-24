import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClientProviders from '@/components/ClientProviders';

export const metadata: Metadata = {
  title: 'VERIDEX RWA | Tokenisasi & Verifikasi Sertifikat Tanah On-Chain Monad',
  description:
    'Protokol Sertifikat Tanah Real World Asset (RWA) anti-pemalsuan dan anti-mafia tanah berbasis Merkle Tree di blockchain Monad Testnet 10.000 TPS.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body className="bg-[#080A11] text-gray-100 flex flex-col min-h-screen selection:bg-emerald-500 selection:text-white" suppressHydrationWarning>
        {/* Ambient lighting */}
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-monad-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <ClientProviders>
          <Navbar />
          <main className="flex-1 bg-grid-pattern relative">
            {children}
          </main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
