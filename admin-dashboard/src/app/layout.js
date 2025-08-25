// app/layout.js
import { GeistSans, GeistMono } from 'geist/font';
import './globals.css';

export const metadata = {
  title: 'RideHail Admin',
  description: 'Admin dashboard for ride-hailing app'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
} 
