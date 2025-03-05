"use client"

import type React from "react"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function VideoUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [wordFrequencies, setWordFrequencies] = useState<[string, number][] | null>(null)
  const [selectedSource, setSelectedSource] = useState<string>("excel")
  const [pendingExample, setPendingExample] = useState<ApiResponse | null>(null)

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

    setError(null)

    try {
      const formData = new FormData()
      formData.append("video", file)

      const result = await uploadVideo(formData)
      setResponse(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during upload")
    }
  }

  const exampleResponse1 = exampleResponse1Json as ApiResponse;
  const exampleResponse2 = exampleResponse2Json as ApiResponse;

  const loadExampleVideo = (exampleNumber: number) => {
    setFile(null);
    setError(null);
    setWordFrequencies(null);
    setResponse(null);

    if (exampleNumber === 1) {
      setPendingExample(exampleResponse1);
    } else if (exampleNumber === 2) {
      setPendingExample(exampleResponse2);
    }
  };

  const processVideo = async () => {
    setIsProcessing(true);
    setResponse(null);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (pendingExample) {
        // If we have a pending example, use that as the response
        setResponse(pendingExample);
        setPendingExample(null);
      } else if (file) {
        // Handle file upload and processing
        const formData = new FormData()
        formData.append("video", file)

        const result = await uploadVideo(formData)
        setResponse(result)
      } else {
        // If no file and no pending example, show error
        setError("No content to process");
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during processing");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container max-w-full px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Kontext21 Playground</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto">
        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle className="text-2xl">Capture</CardTitle>
            <CardDescription>Select source material to capture from. 
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="preset" className="mb-2 block">Choose your source</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="excel"
                        name="source"
                        value="excel"
                        defaultChecked
                        onChange={() => {
                          setSelectedSource("excel");
                          loadExampleVideo(1);
                        }}
                        className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="excel">Excel Spreadsheet</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="powerpoint"
                        name="source"
                        value="powerpoint"
                        onChange={() => {
                          setSelectedSource("powerpoint");
                          loadExampleVideo(2);
                        }}
                        className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="powerpoint">PowerPoint Slide</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="screen"
                        name="source"
                        value="screen"
                        disabled
                        onChange={() => setSelectedSource("screen")}
                        className="h-4 w-4 border-gray-300 text-muted-foreground focus:ring-primary"
                      />
                      <Label htmlFor="screen" className="text-muted-foreground">Share your screen (coming soon)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="upload"
                        name="source"
                        value="upload"
                        onChange={() => {
                          setSelectedSource("upload");
                          setFile(null);
                          setResponse(null);
                        }}
                        className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="upload">Upload your own</Label>
                    </div>
                  </div>
                </div>
                
                {selectedSource === "upload" && (
                  <div className="space-y-2">
                    <Label htmlFor="video">Select MP4 Video</Label>
                    <Input 
                      id="video" 
                      type="file" 
                      accept="video/mp4" 
                      onChange={handleFileChange} 
                      className="flex-1"
                    />
                    {file && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    )}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <p className="text-sm text-muted-foreground">Max file size: 50MB</p>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle className="text-2xl">Process</CardTitle>
            <CardDescription>
              Extract text from your video frames
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full overflow-auto">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <Button 
                  onClick={processVideo}
                  disabled={isProcessing || (!file && !pendingExample)}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Process Video"
                  )}
                </Button>
              </div>
              
              {response && (
                <div className="mt-4 space-y-4 flex-grow">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Output:</h3>
                  </div>
                  <div className="rounded-md bg-muted p-4 overflow-auto max-h-[400px]">
                    <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle className="text-2xl">Consume</CardTitle>
            <CardDescription>
  {response && (
              <div className="mt-8 space-y-4">
                {response.result && (
                  <div className="flex">
                    <Button
                      onClick={calculateWordFrequencies}
                      className="mb-2 "
                    >
                      Analyze Word Frequency
                    </Button>
                  </div>
                )}
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Analysis:</h3>
                </div>
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
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full">
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end mt-6 space-x-4">
      {response && (
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setResponse(null)
                  setWordFrequencies(null)
                }}
              >
                Reset
              </Button>
            )}
        <Button variant="outline" >
            <a 
              href="https://github.com/kontext21/k21-playground"
              target="_blank"
              rel="noreferrer"
            >
              View source code on GitHub
            </a>
          </Button>
      </div>
    </div>
  )
}

