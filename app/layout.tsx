import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Learn Anything - Socratic Mentor',
  description: 'First principles learning with AI',
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
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-emerald-500/30 min-h-screen">
        {children}
      </body>
    </html>
  );
}
