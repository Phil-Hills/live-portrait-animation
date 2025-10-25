"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Sparkles, Video, ImageIcon, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Home() {
  const [sourceImage, setSourceImage] = useState<string | null>(null)
  const [drivingVideo, setDrivingVideo] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setSourceImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setDrivingVideo(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!sourceImage || !drivingVideo) return

    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      // Convert base64 to File objects for API
      const imageBlob = await fetch(sourceImage).then((r) => r.blob())
      const videoBlob = await fetch(drivingVideo).then((r) => r.blob())

      const formData = new FormData()
      formData.append("source_image", imageBlob, "portrait.jpg")
      formData.append("driving_video", videoBlob, "driving.mp4")

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate avatar")
      }

      const data = await response.json()
      setResult(data.videoUrl)
    } catch (err) {
      console.error("[v0] Error generating avatar:", err)
      setError(err instanceof Error ? err.message : "An error occurred while generating the avatar")
    } finally {
      setIsProcessing(false)
    }
  }

  const examplePortraits = [
    { src: "/mona-lisa-portrait.jpg", label: "Mona Lisa" },
    { src: "/professional-woman-portrait.png", label: "Portrait 1" },
    { src: "/man-with-beard-portrait.jpg", label: "Portrait 2" },
    { src: "/young-woman-smiling-portrait.png", label: "Portrait 3" },
  ]

  const exampleVideos = [
    { src: "/person-talking-video-thumbnail.jpg", label: "Talking 1" },
    { src: "/person-speaking-video-thumbnail.jpg", label: "Talking 2" },
    { src: "/facial-expressions-video-thumbnail.jpg", label: "Expressions" },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">LivePortrait</h1>
              <p className="text-sm text-slate-400">AI-Powered Talking Avatar Generator</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">Bring Your Photos to Life</h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-300">
            Transform static portraits into realistic talking avatars. Upload a photo and a driving video to create
            stunning animated results with natural lip sync and facial expressions.
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-12 grid gap-8 lg:grid-cols-2">
          {/* Source Portrait Upload */}
          <Card className="border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-violet-400" />
              <h3 className="text-lg font-semibold text-white">Step 1: Source Portrait</h3>
            </div>
            <p className="mb-4 text-sm text-slate-400">Upload any portrait image (any aspect ratio)</p>

            <label className="group relative block cursor-pointer">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-950/50 transition-colors hover:border-violet-500 hover:bg-slate-900/50">
                {sourceImage ? (
                  <img
                    src={sourceImage || "/placeholder.svg"}
                    alt="Source portrait"
                    className="max-h-[300px] rounded-lg object-contain"
                  />
                ) : (
                  <>
                    <Upload className="mb-4 h-12 w-12 text-slate-600 transition-colors group-hover:text-violet-400" />
                    <p className="text-slate-400">Drop Image Here</p>
                    <p className="text-sm text-slate-500">or</p>
                    <p className="text-violet-400">Click to Upload</p>
                  </>
                )}
              </div>
            </label>

            {/* Example Portraits */}
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-slate-400">Examples</p>
              <div className="grid grid-cols-4 gap-2">
                {examplePortraits.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSourceImage(example.src)}
                    className="overflow-hidden rounded-lg border border-slate-800 transition-all hover:border-violet-500 hover:scale-105"
                  >
                    <img
                      src={example.src || "/placeholder.svg"}
                      alt={example.label}
                      className="h-20 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Driving Video Upload */}
          <Card className="border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <Video className="h-5 w-5 text-fuchsia-400" />
              <h3 className="text-lg font-semibold text-white">Step 2: Driving Video</h3>
            </div>
            <p className="mb-4 text-sm text-slate-400">
              Upload a video with facial movements (1:1 aspect ratio recommended)
            </p>

            <label className="group relative block cursor-pointer">
              <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-950/50 transition-colors hover:border-fuchsia-500 hover:bg-slate-900/50">
                {drivingVideo ? (
                  <video src={drivingVideo} controls className="max-h-[300px] rounded-lg" />
                ) : (
                  <>
                    <Upload className="mb-4 h-12 w-12 text-slate-600 transition-colors group-hover:text-fuchsia-400" />
                    <p className="text-slate-400">Drop Video Here</p>
                    <p className="text-sm text-slate-500">or</p>
                    <p className="text-fuchsia-400">Click to Upload</p>
                  </>
                )}
              </div>
            </label>

            {/* Example Videos */}
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-slate-400">Examples</p>
              <div className="grid grid-cols-3 gap-2">
                {exampleVideos.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setDrivingVideo(example.src)}
                    className="group relative overflow-hidden rounded-lg border border-slate-800 transition-all hover:border-fuchsia-500 hover:scale-105"
                  >
                    <img
                      src={example.src || "/placeholder.svg"}
                      alt={example.label}
                      className="h-20 w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="mb-8 border-slate-800 bg-gradient-to-r from-violet-950/30 to-fuchsia-950/30 p-6 backdrop-blur-sm">
          <h4 className="mb-3 font-semibold text-white">Tips for Best Results</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-violet-400">•</span>
              <span>Focus on the head in your driving video, minimize shoulder movement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400">•</span>
              <span>Use a neutral expression in the first frame of your driving video</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400">•</span>
              <span>Ensure good lighting in both the portrait and driving video</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400">•</span>
              <span>Square (1:1) aspect ratio works best for driving videos</span>
            </li>
          </ul>
        </Card>

        {/* Generate Button */}
        <div className="mb-12 text-center">
          <Button
            onClick={handleGenerate}
            disabled={!sourceImage || !drivingVideo || isProcessing}
            size="lg"
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-lg font-semibold hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Talking Avatar
              </>
            )}
          </Button>
          {!sourceImage || !drivingVideo ? (
            <p className="mt-3 text-sm text-slate-500">Upload both a portrait and driving video to continue</p>
          ) : null}
        </div>

        {error && (
          <Card className="mb-8 border-red-900/50 bg-red-950/20 p-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-red-500/20 p-2">
                <Sparkles className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-red-200">Error</h4>
                <p className="text-sm text-red-300/80">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Result Section */}
        {result && (
          <Card className="border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <h3 className="mb-4 text-xl font-semibold text-white">Your Talking Avatar</h3>
            <div className="flex justify-center">
              <video src={result} controls className="max-h-[500px] rounded-lg" />
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <Button
                onClick={() => {
                  const a = document.createElement("a")
                  a.href = result
                  a.download = "talking-avatar.mp4"
                  a.click()
                }}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
              >
                Download Video
              </Button>
              <Button
                onClick={() => {
                  setSourceImage(null)
                  setDrivingVideo(null)
                  setResult(null)
                  setError(null)
                }}
                className="bg-violet-600 hover:bg-violet-500"
              >
                Create Another
              </Button>
            </div>
          </Card>
        )}

        <Card className="mt-12 border-amber-900/50 bg-amber-950/20 p-6 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-amber-200">HuggingFace API Key Required</h4>
              <p className="text-sm text-amber-300/80">
                To enable video generation, add your HuggingFace API key as an environment variable named{" "}
                <code className="rounded bg-amber-900/30 px-1 py-0.5">HUGGINGFACE_API_KEY</code>. You can get a free API
                key from{" "}
                <a
                  href="https://huggingface.co/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-200"
                >
                  huggingface.co/settings/tokens
                </a>
                . Add it in the Vars section of the sidebar.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
