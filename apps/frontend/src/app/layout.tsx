import type { Metadata } from "next";
import "./globals.css";

import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Axiovital",
  description: "Axiovital Provider Operating Environment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans h-full w-full overflow-hidden")} suppressHydrationWarning>
      <body className="h-full w-full overflow-hidden" suppressHydrationWarning>{children}</body>
    </html>
  );
}
