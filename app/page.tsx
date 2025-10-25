"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, Sparkles, Video, ImageIcon, Play, Settings, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Home() {
  const [sourceImage, setSourceImage] = useState<string | null>(null)
  const [drivingVideo, setDrivingVideo] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string>("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const savedApiKey = localStorage.getItem("huggingface_api_key")
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    localStorage.setItem("huggingface_api_key", value)
  }

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

    if (!apiKey) {
      setError("Please enter your HuggingFace API key in the settings section below")
      setShowSettings(true)
      return
    }

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
      formData.append("api_key", apiKey)

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">LivePortrait</h1>
                <p className="text-sm text-slate-400">AI-Powered Talking Avatar Generator</p>
              </div>
            </div>
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
              className="border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
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

        {showSettings && (
          <Card className="mb-8 border-violet-900/50 bg-gradient-to-r from-violet-950/30 to-fuchsia-950/30 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-violet-400" />
              <h3 className="text-lg font-semibold text-white">API Configuration</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="api-key" className="text-slate-300">
                  HuggingFace API Key
                </Label>
                <div className="mt-2 flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      placeholder="hf_..."
                      className="border-slate-700 bg-slate-900/50 text-white placeholder:text-slate-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Get your free API key from{" "}
                  <a
                    href="https://huggingface.co/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 underline hover:text-violet-300"
                  >
                    huggingface.co/settings/tokens
                  </a>
                </p>
              </div>
              {apiKey && (
                <div className="flex items-center gap-2 rounded-lg bg-green-950/30 border border-green-900/50 p-3">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <p className="text-sm text-green-300">API key saved and ready to use</p>
                </div>
              )}
            </div>
          </Card>
        )}

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

        {!apiKey && (
          <Card className="mt-12 border-amber-900/50 bg-amber-950/20 p-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-500/20 p-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-amber-200">HuggingFace API Key Required</h4>
                <p className="text-sm text-amber-300/80">
                  Click the <strong>Settings</strong> button above to enter your HuggingFace API key. You can get a free
                  API key from{" "}
                  <a
                    href="https://huggingface.co/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-amber-200"
                  >
                    huggingface.co/settings/tokens
                  </a>
                  .
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}
