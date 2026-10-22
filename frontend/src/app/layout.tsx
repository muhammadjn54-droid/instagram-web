import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Instagram",
  description: "Посмотрите, какими моментами из жизни поделились ваши близкие друзья.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="h-full antialiased bg-white">
      <body className="min-h-full flex flex-col font-sans text-neutral-900 bg-white">
        {children}
      </body>
    </html>
  );
}
