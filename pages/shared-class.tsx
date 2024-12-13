
import React from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Share2, Eye, BookOpen, ChevronRight } from 'lucide-react'
// ...other necessary imports...

export default function SharedClass() {
  const router = useRouter()
  
  const sharedClass = {
    name: 'Advanced Biology: Neurobiology',
    description: 'An in-depth class covering the fundamentals of neurobiology, including brain structure, neural pathways, and cognitive functions.',
    lectures: [
      {
        id: 1,
        title: "Introduction to Neurobiology",
        description: "Overview of the nervous system, neuron structure, and basic neural communication.",
      },
      {
        id: 2,
        title: "Synaptic Transmission",
        description: "Mechanisms of synaptic transmission, neurotransmitters, and synaptic plasticity.",
      },
      {
        id: 3,
        title: "Neuroanatomy",
        description: "Detailed study of brain regions, their functions, and interconnections.",
      },
      {
        id: 4,
        title: "Cognitive Functions",
        description: "Exploration of learning, memory, perception, and decision-making processes.",
      }
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{sharedClass.name}</h1>
              <p className="text-gray-600">Shared by Jane Smith</p>
            </div>
          </div>
          <p className="text-gray-700">{sharedClass.description}</p>
          <div className="flex gap-4 mt-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              500 views
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {sharedClass.lectures.length} lectures
            </span>
          </div>
        </div>

        {/* Lectures Preview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Lectures</h2>
          <div>
            {sharedClass.lectures.slice(0, 2).map((lecture) => (
              <div key={lecture.id} className="border border-gray-100 rounded-lg p-4 hover:border-primary/20 transition-colors">
                <h3 className="font-medium text-gray-900">{lecture.title}</h3>
                <p className="text-gray-600 mt-2">{lecture.description}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-4">
            + {sharedClass.lectures.length - 2} more lectures available
          </p>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Interested in this Class?</h2>
          <p className="text-gray-600 mb-6">Join this class to access all lectures and course materials.</p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="default"
              className="flex items-center gap-2"
              onClick={() => router.push('/sign-up')}
            >
              Join Class
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {/* Handle share */}}
            >
              Share <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}