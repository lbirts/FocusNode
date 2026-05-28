import Header from "@/components/Header";
import SideNav from "@/components/SideNav";
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FocusNode",
  description: "Keep track of your tasks and projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col bg-primary-100">
          <Header />
          <div className="flex min-h-0 flex-1">
            <SideNav />
            <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
