"use server"

import { revalidatePath } from "next/cache"

export async function uploadVideo(formData: FormData) {
  try {
    // Debug: Log form data contents
    console.log('FormData entries:', Array.from(formData.entries()))
    
    const file = formData.get('video') // Changed from 'file' to 'video' - this name should match your form input name
    if (!file) {
      throw new Error('No file provided')
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer()
    const base64Data = Buffer.from(buffer).toString('base64')

    const response = await fetch("https://k21-server-468449125003.europe-west10.run.app/process-video-base64", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base64_data: base64Data
      }),
      // Don't include the next line in production without proper CORS configuration
      // This is just for demo purposes
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`)
    }

    const data = await response.json()
    revalidatePath("/")
    return data
  } catch (error) {
    console.error("Error uploading video:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to upload video")
  }
}

