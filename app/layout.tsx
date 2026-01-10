import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SINDPLAST-AM | Sistema de Gestão",
    description: "Sistema de gestão para o Sindicato dos Trabalhadores nas Indústrias de Material Plástico de Manaus e do Estado do Amazonas",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: '#10B981',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            duration: 4000,
                            iconTheme: {
                                primary: '#EF4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
                <SpeedInsights />
            </body>
        </html>
    );
}
