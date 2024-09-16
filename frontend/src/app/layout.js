"use client";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import "@/styles/globals.css";
import "@/styles/katex-tailwind.css";

import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const router = useRouter();

  const onNavigate = (path) => {
    router.push(path);
  };

  return (
    <html lang="en" className="h-full">
      <body className={`${montserrat.className} flex flex-row h-full`}>
        <Header onNavigate={onNavigate} />
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
