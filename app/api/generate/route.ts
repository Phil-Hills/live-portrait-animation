import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "HuggingFace API key not configured. Please add HUGGINGFACE_API_KEY to your environment variables." },
        { status: 500 },
      )
    }

    const formData = await request.formData()
    const sourceImage = formData.get("source_image") as File
    const drivingVideo = formData.get("driving_video") as File

    if (!sourceImage || !drivingVideo) {
      return NextResponse.json({ error: "Both source image and driving video are required" }, { status: 400 })
    }

    console.log("[v0] Calling HuggingFace LivePortrait API...")

    // Call HuggingFace Inference API for LivePortrait
    // Using the KwaiVGI/LivePortrait space
    const hfFormData = new FormData()
    hfFormData.append("source_image", sourceImage)
    hfFormData.append("driving_video", drivingVideo)

    const response = await fetch("https://api-inference.huggingface.co/models/KwaiVGI/LivePortrait", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: hfFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] HuggingFace API error:", errorText)
      return NextResponse.json(
        { error: `HuggingFace API error: ${response.status} - ${errorText}` },
        { status: response.status },
      )
    }

    // Get the video blob from the response
    const videoBlob = await response.blob()

    // Convert blob to base64 for client display
    const buffer = await videoBlob.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const videoUrl = `data:video/mp4;base64,${base64}`

    console.log("[v0] Successfully generated talking avatar")

    return NextResponse.json({ videoUrl })
  } catch (error) {
    console.error("[v0] Error in generate API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
