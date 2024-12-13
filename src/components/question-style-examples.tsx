import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const statementOfInformation = "Gas exchange in the alveoli, facilitated by hemoglobin and influenced by factors like pH, temperature, and pressure, is impaired by conditions such as emphysema."

const questionStyleExamples = {
  basic: {
    question: "What is the primary function of the human respiratory system?",
    answerChoices: [
      { value: "To facilitate the exchange of oxygen and carbon dioxide in the body", correct: true },
      { value: "To transport nutrients from the digestive tract to body tissues", correct: false },
      { value: "To filter waste from the blood and produce urine", correct: false },
      { value: "To maintain posture and generate voluntary movements", correct: false },
      { value: "To break down carbohydrates into simple sugars", correct: false }
    ],
    explanation: "The primary role of the human respiratory system is to bring oxygen into the body and remove carbon dioxide, ensuring that cells receive the oxygen needed for energy production."
  },
  intermediate: {
    question: "Within the human lungs, where does the majority of oxygen and carbon dioxide exchange take place?",
    answerChoices: [
      { value: "In the alveoli", correct: true },
      { value: "Inside the trachea", correct: false },
      { value: "Within the bronchi", correct: false },
      { value: "On the surface of the nasal cavity", correct: false },
      { value: "In the diaphragm muscle fibers", correct: false }
    ],
    explanation: "Gas exchange in humans primarily occurs in the alveoli, the tiny air sacs in the lungs. Their thin walls and extensive capillary networks allow oxygen to diffuse into the blood while carbon dioxide diffuses out."
  },
  advanced: {
    question: "How does hemoglobin within red blood cells facilitate oxygen transport, and what factors influence its affinity for oxygen in human tissues?",
    answerChoices: [
      { value: "Hemoglobin binds oxygen reversibly, and its affinity changes with partial pressures of oxygen, pH, and temperature", correct: true },
      { value: "Hemoglobin permanently binds oxygen, unaffected by environmental conditions", correct: false },
      { value: "Hemoglobin stores carbon dioxide and never releases it", correct: false },
      { value: "Hemoglobin only transports nutrients, not gases", correct: false },
      { value: "Hemoglobin's function is solely to maintain blood pressure, not carry oxygen", correct: false }
    ],
    explanation: "Hemoglobin, a protein in red blood cells, binds oxygen in the lungs where oxygen concentration is high and releases it in tissues where oxygen levels are lower. Changes in pH (Bohr effect), temperature, and the partial pressure of oxygen influence hemoglobin's affinity for oxygen, optimizing oxygen delivery to cells based on their metabolic needs."
  },
  vignette: {
    question: "A 55-year-old patient with a history of smoking presents with persistent shortness of breath and reduced exercise tolerance. Pulmonary function tests reveal damage to the alveolar walls (emphysema). Which critical aspect of respiratory physiology is most directly compromised by this alveolar damage?",
    answerChoices: [
      { value: "Efficient exchange of oxygen and carbon dioxide at the alveolar-capillary interface", correct: true },
      { value: "Voluntary contraction of the diaphragm and intercostal muscles", correct: false },
      { value: "Sensation of airflow through the upper respiratory tract", correct: false },
      { value: "Production of surfactant within the nasal cavity", correct: false },
      { value: "Control of breathing rate by the medulla oblongata", correct: false }
    ],
    explanation: "Emphysema leads to the destruction of alveolar walls, which reduces the surface area available for gas exchange. This impairs the lungs' ability to efficiently transfer oxygen into the blood and remove carbon dioxide, directly affecting the patient's respiratory function."
  }
}

export function QuestionStyleExamples() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Examples
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Question Style Examples</DialogTitle>
          <DialogDescription>
            Examples of different question styles and their characteristics.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-4 h-[500px] pr-4">
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Statement of Information:</h3>
            <p className="text-sm">{statementOfInformation}</p>
          </div>
          <Tabs defaultValue="basic">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="vignette">Vignette</TabsTrigger>
            </TabsList>
            {Object.entries(questionStyleExamples).map(([style, example]) => (
              <TabsContent key={style} value={style} className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Question:</h3>
                  <p>{example.question}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Answer Choices:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {example.answerChoices.map((choice, index) => (
                      <li key={index} className={choice.correct ? "text-green-600 font-medium" : ""}>
                        {choice.value} {choice.correct && "(Correct)"}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Explanation:</h3>
                  <p>{example.explanation}</p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 