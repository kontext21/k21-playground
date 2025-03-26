"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PiMicrosoftExcelLogo, PiMicrosoftPowerpointLogo } from "react-icons/pi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadVideo, uploadBase64 } from "@/app/actions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import exampleResponse1Json from "@/test/example-ouput-small.json";
import exampleResponse2Json from "@/test/example-output-mid.json";
import ScreenRecorder from "@/components/ScreenRecorder";

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

type VideoSource = {
  type: "excel" | "powerpoint" | "screen" | "upload";
  example?: ApiResponse | null;
};

export default function VideoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wordFrequencies, setWordFrequencies] = useState<
    [string, number][] | null
  >(null);
  const [videoBase64, setVideoBase64] = useState<string | null>(null);
  const [source, setSource] = useState<VideoSource>({
    type: "excel",
    example: exampleResponse1Json as ApiResponse,
  });
  const [step, setStep] = useState<"select" | "process">("select");

  // Ref to the element you want to record
  const appRef = useRef<HTMLDivElement>(null);

  const calculateWordFrequencies = () => {
    if (!response?.result) return;

    // Combine all OCR text and split into words
    const allText = response.result
      .map((frame) => frame.ocr_text || "")
      .join(" ")
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
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "video/mp4") {
        setError("Please select an MP4 file");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setError(null);

    try {
      const formData = new FormData();
      formData.append("video", file);

      const result = await uploadVideo(formData);
      setResponse(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during upload"
      );
    }
  };

  const processVideo = async () => {
    setIsProcessing(true);
    setResponse(null);
    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (source.example) {
        // If we have an example, use that as the response
        setResponse(source.example);
      } else if (source.type === "screen" && videoBase64) {
        // For screen recordings, use the base64 data if available
        const result = await uploadBase64(videoBase64);
        setResponse(result);
      } else if (file) {
        // Handle file upload and processing
        const formData = new FormData();
        formData.append("video", file);

        const result = await uploadVideo(formData);
        setResponse(result);
      } else {
        // If no file and no example, show error
        setError("No content to process");
        return;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during processing"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Add a handler for when a recording is completed
  const handleRecordedFile = (recordedFile: File) => {
    setFile(recordedFile);
    // You can also automatically process the file if needed
    // e.g., automatically submit it for processing
  };

  // Add a handler for when base64 is generated
  const handleBase64Generated = (base64: string) => {
    setVideoBase64(base64);
    console.log("Video base64 generated, length:", base64.length);
    // You can use this base64 string for API calls or other purposes
  };

  return (
    <div ref={appRef} className="container max-w-full px-4 py-10">
      <Header />
      {/* <h1 className="text-4xl font-bold text-center mb-8">
        Kontext21 Playground
      </h1> */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto">
        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle className="text-2xl">Capture</CardTitle>
            <CardDescription>
            Context is gathered from a variety of sources. Below are several sample sources you can explore. Choose one that interests you, experiment with it, and enjoy analyzing the results!
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "select" ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="preset" className="mb-2 block">
                      Choose your source:
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="excel"
                          name="source"
                          value="excel"
                          defaultChecked
                          onChange={() => {
                            setSource({
                              type: "excel",
                              example: exampleResponse1Json as ApiResponse,
                            });
                            setResponse(null);
                          }}
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="excel">
                          Sample 1: User session with{" "}
                          <PiMicrosoftExcelLogo className="w-5 h-5 inline-block" />{" "}
                          spreadsheet
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="powerpoint"
                          name="source"
                          value="powerpoint"
                          onChange={() => {
                            setSource({
                              type: "powerpoint",
                              example: exampleResponse2Json as ApiResponse,
                            });
                            setResponse(null);
                          }}
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="powerpoint">
                          Sample 2: User session with{" "} <PiMicrosoftPowerpointLogo className="w-5 h-5 inline-block"/> slide
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="upload"
                          name="source"
                          value="upload"
                          onChange={() => {
                            setSource({ type: "upload", example: null });
                            setFile(null);
                            setResponse(null);
                          }}
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="upload">Upload your own</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="screen"
                          name="source"
                          value="screen"
                          onChange={() => {
                            setSource({ type: "screen", example: null });
                            setResponse(null);
                          }}
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="screen">
                          Share your screen (coming soon)
                        </Label>
                      </div>
                    </div>
                  </div>

                  {source.type === "screen" && (
                    <ScreenRecorder
                      onFileRecorded={handleRecordedFile}
                      onBase64Generated={handleBase64Generated}
                    />
                  )}

                  {source.type === "upload" && (
                    <div className="space-y-2">
                      <Label htmlFor="video">Select MP4 Video</Label>
                      <div className="flex gap-2">
                        <Input
                          id="video"
                          type="file"
                          accept="video/mp4"
                          onChange={handleFileChange}
                          className="flex-1"
                        />
                        {file && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setFile(null);
                              setError(null);
                            }}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      {file && (
                        <>
                          <p className="text-sm text-muted-foreground">
                            Selected: {file.name} (
                            {(file.size / (1024 * 1024)).toFixed(2)} MB)
                          </p>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">
                              Preview:
                            </h4>
                            <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
                              <video
                                controls
                                className="absolute inset-0 w-full h-full object-contain"
                                src={URL.createObjectURL(file)}
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          </div>
                        </>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Max file size: 50MB
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => setStep("process")}
                  disabled={source.type === "upload" && !file}
                >
                  Confirm Selection
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <h3 className="font-medium mb-2">Selected Source:</h3>
                  {source.type === "excel" && (
                    <p>Sample 1: Excel Spreadsheet Session</p>
                  )}
                  {source.type === "powerpoint" && (
                    <p>Sample 2: PowerPoint Slide Session</p>
                  )}
                  {source.type === "upload" && file && (
                    <p>Uploaded File: {file.name}</p>
                  )}
                  {source.type === "screen" && <p>Screen Recording</p>}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep("select");
                    setResponse(null);
                    setWordFrequencies(null);
                  }}
                >
                  Change Selection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle className="text-2xl">Process</CardTitle>
            <CardDescription>
              Extract text from your video frames.
              Now that you&apos;ve selected a source for your context, choose one of our cloud processors to analyze it and extract meaningful data.
            </CardDescription>
          </CardHeader>
          {step === "process" && (
            <CardContent className="h-full overflow-auto">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <Button
                    onClick={processVideo}
                    disabled={
                      isProcessing ||
                      (!file && !source.example && !videoBase64) ||
                      step !== "process"
                    }
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
                {error && <p className="text-sm text-destructive">{error}</p>}

                {response && (
                  <div className="mt-4 space-y-4 flex-grow">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Output:</h3>
                    </div>
                    <div className="rounded-md bg-muted p-4 overflow-auto max-h-[400px]">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(response, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle className="text-2xl">Consume</CardTitle>
            <CardDescription>
              <div className="mt-8 space-y-4">
                <div className="flex flex-col">
                  <p className="mb-5">Great! You&apos;ve gathered some data, but making sense of it can be challenging. Let&apos;s dive deeper, analyze it, and uncover powerful, actionable insights!</p>
                  <Button
                    onClick={calculateWordFrequencies}
                    className="mb-2"
                    disabled={!response?.result}
                  >
                    Analyze Word Frequency
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Analysis:</h3>
                </div>
                {wordFrequencies && (
                  <div className="mb-4 p-4 bg-muted rounded-md">
                    <h4 className="font-medium mb-4">
                      Top 10 Most Frequent Words:
                    </h4>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={wordFrequencies.map(([word, count]) => ({
                            word,
                            count,
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
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full"></CardContent>
        </Card>
      </div>
      <div className="flex justify-end mt-6 space-x-4">
        {response && (
          <Button
            variant="outline"
            onClick={() => {
              setFile(null);
              setResponse(null);
              setWordFrequencies(null);
              setStep("select");
            }}
          >
            Reset
          </Button>
        )}
        <Button variant="outline">
          <a
            href="https://github.com/kontext21/k21-playground"
            target="_blank"
            rel="noreferrer"
          >
            View source code on GitHub
          </a>
        </Button>
      </div>
      <Footer />
    </div>
  );
}
