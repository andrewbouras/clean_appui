import React from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Share2, Eye, BookOpen, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
// ...other necessary imports...

export default function SharedQuestionBank() {
  const router = useRouter()
  const { bankId, sharedBy } = router.query

  const [questionBank, setQuestionBank] = useState(null)

  useEffect(() => {
    if (bankId) {
      // Fetch the shared question bank details based on bankId
      fetch(`/api/shared-question-bank/${bankId}`)
        .then(response => response.json())
        .then(data => setQuestionBank(data))
        .catch(error => console.error(error))
    }
  }, [bankId])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {questionBank ? (
          <>
            <h1 className="text-3xl font-bold mb-4">{questionBank.name}</h1>
            <p className="mb-6">Shared by {sharedBy}</p>
            <p className="mb-6">{questionBank.description}</p>
            <div className="bg-white rounded-lg shadow-sm p-6">
              {questionBank.questions.map((question) => (
                <div key={question.id} className="mb-4">
                  <h2 className="text-2xl font-semibold">{question.question}</h2>
                  <ul className="mt-2 list-disc list-inside">
                    {question.choices.map((choice, index) => (
                      <li key={index}>{choice}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm text-gray-600">{question.explanation}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Loading shared question bank...</p>
        )}
      </div>
    </div>
  )
}