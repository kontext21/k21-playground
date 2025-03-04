"use client"

import type React from "react"

import { useState } from "react"
import { FileUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadVideo } from "@/app/actions"

interface ApiResponse {
  base64_data: string;
  status: string;
  message?: string;
}

export default function VideoUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type !== "video/mp4") {
        setError("Please select an MP4 file")
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("video", file)

      const result = await uploadVideo(formData)
      setResponse(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during upload")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">MP4 Video Uploader</CardTitle>
          <CardDescription>Upload an MP4 video file and see the JSON response <a 
              href="https://github.com/kontext21/k21-playground" 
              target="_blank" 
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              View source code on GitHub
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="video">Select MP4 Video</Label>
              <div className="flex items-center gap-4">
                <Input id="video" type="file" accept="video/mp4" onChange={handleFileChange} className="flex-1" />
                <Button type="submit" disabled={!file || isUploading} className="min-w-[120px]">
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading
                    </>
                  ) : (
                    <>
                      <FileUp className="mr-2 h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </form>

          {response && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-medium">Response:</h3>
              <div className="rounded-md bg-muted p-4 overflow-auto max-h-[400px]">
                <pre className="text-sm">{JSON.stringify(response, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">Max file size: 50MB</p>
          {response && (
            <Button
              variant="outline"
              onClick={() => {
                setFile(null)
                setResponse(null)
              }}
            >
              Reset
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

