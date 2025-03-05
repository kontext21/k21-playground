"use client"

import type React from "react"

import { useState } from "react"
import { FileUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadVideo } from "@/app/actions"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import exampleResponse1Json from "@/test/example-ouput-small.json"
import exampleResponse2Json from "@/test/example-output-mid.json"

interface ApiResponse {
  base64_data?: string;
  status?: string;
  message?: string;
  success?: boolean;
  result?: Array<{ 
    ocr_text: string;
    time_id?: string;
  }>;
}

const exampleResponse1 = exampleResponse1Json as ApiResponse;
const exampleResponse2 = exampleResponse2Json as ApiResponse;

export default function VideoUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>({
    message: "Successfully processed 1 video frames",
    success: true,
    result: [
      {
        ocr_text: "a Ome: A®@ 'Fcomments File File File File Home Insert Page Layout Formulas Data Review View Developer Help @® vrtoap rae signin | x Fa ve few) =VLOoKUP(F3,B1:C4, 2, FALSE) y A 8 c D E F H A k L M N ° e a R s T u v w x y ZA BCD 1 2 id name age 3 1 Karl 43 id 32 4 2 Martha 56 name N/A 5 3 Sally 13 6 jon 7 8 9 1 1 1 1 1 1 1 1 1 i > Ed @) -—_+_+ 10 0930 a 9 MO rpgi212 Sheet! | @ Ready EB FY Accessibity Good to go",
        time_id: "2025-03-05 12:35:19"
      }
    ]
  })
  const [error, setError] = useState<string | null>(null)
  const [wordFrequencies, setWordFrequencies] = useState<[string, number][] | null>(null)

  const calculateWordFrequencies = () => {
    if (!response?.result) return;
    
    // Combine all OCR text and split into words
    const allText = response.result
      .map(frame => frame.ocr_text || '')
      .join(' ')
      .toLowerCase();
    
    const words = allText.match(/\b\w+\b/g) || [];
    
    // Count word frequencies
    const frequencies = words.reduce((acc: { [key: string]: number }, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
    
    // Convert to array and sort by frequency
    const sortedFrequencies = Object.entries(frequencies)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    
    setWordFrequencies(sortedFrequencies);
  };

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

  const loadExampleVideo = (exampleNumber: number) => {
    setFile(null);
    setIsUploading(false);
    setError(null);
    
    if (exampleNumber === 1) {
      setResponse(exampleResponse1);
    } else if (exampleNumber === 2) {
      setResponse(exampleResponse2);
    }
  };

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Kontext21 Playground</CardTitle>
          <CardDescription>Upload an MP4 video file and see the JSON response of OCR of each frame. <a
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
              <p className="text-sm text-muted-foreground">Max file size: 50MB</p>
              
              <div className="mt-4 flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => loadExampleVideo(1)}
                >
                  Example Video 1
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => loadExampleVideo(2)}
                >
                  Example Video 2
                </Button>
              </div>
            </div>
          </form>

          {response && (
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Response:</h3>
              </div>
              <div className="rounded-md bg-muted p-4 overflow-auto max-h-[400px]">
                <pre className="text-sm">{JSON.stringify(response, null, 2)}</pre>
              </div>
              {response.result && (
                <div className="flex justify-end">
                  <Button
                    onClick={calculateWordFrequencies}
                    className="mb-2"
                  >
                    Analyze Word Frequency
                  </Button>
                </div>
              )}
              {wordFrequencies && (
                <div className="mb-4 p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-4">Top 10 Most Frequent Words:</h4>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={wordFrequencies.map(([word, count]) => ({
                          word,
                          count
                        }))}
                        layout="vertical"
                      >
                        <XAxis type="number" />
                        <YAxis 
                          type="category" 
                          dataKey="word" 
                          width={100}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Bar 
                          dataKey="count" 
                          fill="hsl(var(--primary))"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
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

