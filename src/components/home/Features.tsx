import React from 'react'
import { Users, BookOpen, TrendingUp } from 'lucide-react'

/**
 * Feature Card Props
 */
interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

/**
 * Feature Card Component
 */
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-blue-100 text-[#4070F4] rounded-lg flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
)

/**
 * Features Section Component
 * Displays the main features of GroupConnect
 */
export const Features = () => {
  const features = [
    {
      name: 'Professional Groups',
      description: 'Join industry-specific communities and grow your network with like-minded professionals.',
      icon: Users,
    },
    {
      name: 'Knowledge Sharing',
      description: 'Learn from experts and share your expertise with others in your field.',
      icon: BookOpen,
    },
    {
      name: 'Career Growth',
      description: 'Discover opportunities and advance your professional journey through meaningful connections.',
      icon: TrendingUp,
    },
  ]

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Why Join GroupConnect?
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative flex flex-col bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-[#4070F4]">
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                {feature.name}
              </h3>
              <p className="mt-2 text-base text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 