import { Inter } from "next/font/google";
import "./globals.css";
import { RouteGuard } from "@/components/RouteGuard";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RouteGuard>{children}</RouteGuard>
        <Toaster />
      </body>
    </html>
  );
}

