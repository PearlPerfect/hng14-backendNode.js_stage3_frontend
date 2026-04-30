import { ThemeProvider } from '@/context/ThemeContext';
import ThemeInitializer from '@/components/ThemeInitializer';
import './globals.css';

export const metadata = {
  title: 'Insighta Labs',
  description: 'Demographic intelligence platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <ThemeInitializer />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}