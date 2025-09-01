"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, ExternalLink, Volume2 } from "lucide-react"

interface EmbeddedVideoProps {
  title: string
  description?: string
  videoId: string // YouTube video ID
  thumbnail?: string
  duration?: string
  className?: string
}

export function EmbeddedVideo({
  title,
  description,
  videoId,
  thumbnail,
  duration,
  className = "",
}: EmbeddedVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const thumbnailUrl = thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const openInNewTab = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")
  }

  return (
    <Card className={`border-sky-100 overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Play className="w-5 h-5 mr-2 text-sky-600" />
            <span className="text-lg">{title}</span>
          </div>
          {duration && <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded">{duration}</span>}
        </CardTitle>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-video bg-gray-100">
          {!isPlaying ? (
            <div className="relative w-full h-full">
              <img
                src={thumbnailUrl || "/placeholder.svg"}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=360&width=640"
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <Button
                  onClick={handlePlay}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16 p-0"
                >
                  <Play className="w-8 h-8 ml-1" />
                </Button>
              </div>
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button
                  onClick={openInNewTab}
                  size="sm"
                  variant="secondary"
                  className="bg-white bg-opacity-90 hover:bg-opacity-100"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Volume2 className="w-4 h-4 mr-1" />
                Audio available
              </span>
              {duration && (
                <span className="flex items-center">
                  <Play className="w-4 h-4 mr-1" />
                  {duration}
                </span>
              )}
            </div>
            <Button onClick={openInNewTab} variant="ghost" size="sm" className="text-sky-600 hover:text-sky-800">
              Watch on YouTube
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
