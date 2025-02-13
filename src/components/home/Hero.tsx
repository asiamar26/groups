import React from 'react'
import Link from 'next/link'

/**
 * Hero Component
 * Main landing section with call-to-action
 */
export const Hero = () => {
  return (
    <section className="relative bg-white pt-32 pb-16 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight">
            Connect with Your Community
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Join groups, share interests, and build meaningful connections with people who share your passions.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/signup"
              className="btn-primary text-lg"
            >
              Get Started →
            </Link>
            <Link
              href="#features"
              className="btn-secondary text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#4070F4] to-[#3060E0] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
      </div>
    </section>
  )
} 