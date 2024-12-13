'use client'

// ...other necessary imports...
// import { useRouter } from 'next/router'
// import { useState, useEffect } from 'react'

export default function SharedLecture() {
  // const router = useRouter()
  // const { lectureId, sharedBy } = router.query

  // const [lecture, setLecture] = useState(null)
  // const [loading, setLoading] = useState(true)

  // useEffect(() => {
  //   if (lectureId) {
  //     // Fetch the shared lecture details based on lectureId
  //     fetch(`/api/shared-lecture/${lectureId}`)
  //       .then(response => response.json())
  //       .then(data => {
  //         setLecture(data)
  //         setLoading(false)
  //       })
  //       .catch(error => {
  //         console.error(error)
  //         setLoading(false)
  //       })
  //   }
  // }, [lectureId])

  const lecture = {
    title: 'Placeholder Lecture Title',
    sharedBy: 'John Doe',
    description: 'This is a placeholder description for the lecture.',
    sections: [
      {
        id: 1,
        heading: 'Introduction',
        content: 'This is the introduction section.',
      },
      {
        id: 2,
        heading: 'Main Content',
        content: 'This is the main content section.',
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center">
              {/* Add an appropriate icon here */}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{lecture.title}</h1>
              <p className="text-gray-600">Shared by {lecture.sharedBy}</p>
            </div>
          </div>
          <p className="text-gray-700">{lecture.description}</p>
          <div className="flex gap-4 mt-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              {/* Add view icon */}
              100 views
            </span>
            <span className="flex items-center gap-1">
              {/* Add lecture icon */}
              {lecture.sections.length} sections
            </span>
          </div>
        </div>

        {/* Lecture Sections */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Lecture Sections</h2>
          {lecture.sections.map(section => (
            <div key={section.id} className="mb-4">
              <h3 className="text-2xl font-semibold">{section.heading}</h3>
              <p className="mt-2">{section.content}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Enjoying the Lecture?</h2>
          <p className="text-gray-600 mb-6">Join our platform to access more lectures and resources.</p>
          <div className="flex gap-4 justify-center">
            <button className="btn btn-primary">Join Now</button>
            <button className="btn btn-outline">Share Lecture</button>
          </div>
        </div>
      </div>
    </div>
  )
}