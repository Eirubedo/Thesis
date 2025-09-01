"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, Maximize2 } from "lucide-react"

interface DiagramStep {
  id: string
  title: string
  description: string
  highlight?: boolean
}

interface InteractiveDiagramProps {
  title: string
  description?: string
  imageUrl: string
  steps?: DiagramStep[]
  className?: string
}

export function InteractiveDiagram({
  title,
  description,
  imageUrl,
  steps = [],
  className = "",
}: InteractiveDiagramProps) {
  const [selectedStep, setSelectedStep] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleStepClick = (stepId: string) => {
    setSelectedStep(selectedStep === stepId ? null : stepId)
  }

  const selectedStepData = steps.find((step) => step.id === selectedStep)

  return (
    <Card className={`border-sky-100 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Eye className="w-5 h-5 mr-2 text-sky-600" />
            {title}
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setIsFullscreen(true)} variant="outline" size="sm" className="bg-transparent">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => window.open(imageUrl, "_blank")}
              variant="outline"
              size="sm"
              className="bg-transparent"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative bg-gray-50 rounded-lg overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            className="w-full h-auto max-h-96 object-contain"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=400&width=600"
            }}
          />
        </div>

        {steps.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Interactive Steps:</h4>
            <div className="grid gap-2">
              {steps.map((step, index) => (
                <Button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  variant={selectedStep === step.id ? "default" : "outline"}
                  className={`justify-start h-auto p-3 ${
                    selectedStep === step.id ? "bg-sky-500 text-white" : "bg-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-sky-100 text-sky-700">
                      {index + 1}
                    </Badge>
                    <span className="text-left">{step.title}</span>
                  </div>
                </Button>
              ))}
            </div>

            {selectedStepData && (
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                <h5 className="font-semibold text-sky-900 mb-2">{selectedStepData.title}</h5>
                <p className="text-sm text-sky-800">{selectedStepData.description}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <Button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 bg-white text-black hover:bg-gray-100"
              size="sm"
            >
              ✕
            </Button>
            <img src={imageUrl || "/placeholder.svg"} alt={title} className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      )}
    </Card>
  )
}
