"use server"

import { revalidatePath } from "next/cache"

export async function uploadVideo(formData: FormData) {
  try {
    // You can replace this URL with your actual API endpoint
    const response = await fetch("https://httpbin.org/post", {
      method: "POST",
      body: formData,
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

