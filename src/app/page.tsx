import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';

/**
 * Landing Page Component
 * Main entry point of the application
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
    </main>
  );
} 