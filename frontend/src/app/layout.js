import { Inter } from "next/font/google";
import Header from "@/components/Header";
import "@/styles/globals.css";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${montserrat.className} flex flex-row h-full`}>
        <Header />
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
