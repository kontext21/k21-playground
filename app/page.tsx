"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
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
import exampleResponse1Json from "@/test/example-ouput-LI.json";
import exampleResponse2Json from "@/test/example-output-github.json";
import ScreenRecorder from "@/components/ScreenRecorder";
import { filterText } from "@/lib/utils";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import dynamic from "next/dynamic";

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
  type: "github" | "linkedin" | "screen";
  example?: ApiResponse | null;
};

const DynamicHeader = dynamic(() => import("@/components/Header"), {
  ssr: true,
  loading: () => (
    <header className="py-2">
      <div className="container flex flex-col mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-[90px] h-[30px] bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-6 w-full bg-muted animate-pulse rounded" />
      </div>
    </header>
  ),
});

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
    type: "github",
    example: exampleResponse1Json as ApiResponse,
  });
  const [step, setStep] = useState<"select" | "process" | "consume">("select");
  const [exampleVideoUrl, setExampleVideoUrl] = useState<string | null>(null);
  const [isInIframe, setIsInIframe] = useState(false);

  // Ref to the element you want to record
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if we're in an iframe
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      console.log("Error checking if in iframe", e);
      setIsInIframe(true);
    }
  }, []);

  useEffect(() => {
    // Set the example video URL for the first sample on mount
    setExampleVideoUrl("/videos/example-ouput-LI.mp4");
  }, []); // Empty dependency array means this runs once on mount

  const calculateWordFrequencies = () => {
    if (!response?.result) return;

    // Combine all OCR text and split into words
    const allText = response.result
      .map((frame) => frame.ocr_text || "")
      .join(" ")
      .toLowerCase();

    const words = allText.match(/\b\w+\b/g) || [];
    const filteredWords = words
      .filter((word) => {
        const filteredWord = filterText(word);
        return filteredWord.length > 0;
      })
      .map((word) => word.toLowerCase());

    // Count word frequencies
    const frequencies = filteredWords.reduce(
      (acc: { [key: string]: number }, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      },
      {}
    );

    // Convert to array and sort by frequency
    const sortedFrequencies = Object.entries(frequencies)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    setWordFrequencies(sortedFrequencies);
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     const selectedFile = e.target.files[0];
  //     if (selectedFile.type !== "video/mp4") {
  //       setError("Please select an MP4 file");
  //       setFile(null);
  //       return;
  //     }
  //     setFile(selectedFile);
  //     setError(null);
  //   }
  // };

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
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (source.example) {
        setResponse(source.example);
        setStep("process");
      } else if (source.type === "screen" && videoBase64) {
        const result = await uploadBase64(videoBase64);
        setResponse(result);
        setStep("process");
      } else {
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
    <div ref={appRef} className="container max-w-full px-4 py-2">
      {!isInIframe && <DynamicHeader />}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto">
        <Card className="min-h-[600px] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-2xl">Capture</CardTitle>
            <CardDescription className="text-base">
              <p className="text-primary">
                Context needs to be captured from the users screen first. Below
                are several sample screen captures.
              </p>{" "}
              <a
                href="https://docs.kontext21.com/concepts/capture"
                className="text-primary hover:underline"
              >
                Learn More about capture.
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {step === "select" ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="preset" className="text-base mb-2 block">
                      Choose a sample source:
                    </Label>
                    <div className="h-[100px] space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="github"
                          name="source"
                          value="github"
                          checked={source.type === "github"}
                          onChange={() => {
                            setSource({
                              type: "github",
                              example: exampleResponse1Json as ApiResponse,
                            });
                            setFile(null);
                            setResponse(null);
                            setExampleVideoUrl("/videos/example-ouput-LI.mp4");
                          }}
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="github" className="text-base">
                          Sample 1: GitHub repository{" "}
                          <FaGithub className="w-5 h-5 inline-block" />{" "}
                          navigation
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="linkedin"
                          name="source"
                          value="LinkedIn"
                          checked={source.type === "linkedin"}
                          onChange={() => {
                            setSource({
                              type: "linkedin",
                              example: exampleResponse2Json as ApiResponse,
                            });
                            setFile(null);
                            setResponse(null);
                            setExampleVideoUrl(
                              "/videos/example-output-github.mp4"
                            );
                          }}
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="linkedin" className="text-base">
                          Sample 2: LinkedIn profile{" "}
                          <FaLinkedin className="w-5 h-5 inline-block" />{" "}
                          browsing
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="screen"
                          name="source"
                          value="screen"
                          checked={source.type === "screen"}
                          onChange={() => {
                            setSource({ type: "screen", example: null });
                            setFile(null);
                            setResponse(null);
                          }}
                          disabled
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="screen" className="text-base">
                          Share your screen (coming soon)
                        </Label>
                      </div>
                    </div>
                  </div>

                  {(file || exampleVideoUrl) && (
                    <div className="flex-1 bg-muted rounded-md overflow-hidden">
                      <div className="h-[300px] flex flex-col">
                        <div className="flex-1 p-4">
                          <div className="relative w-full h-full bg-black rounded-md overflow-hidden">
                            <video
                              controls
                              className="absolute inset-0 w-full h-full object-contain"
                              src={
                                file
                                  ? URL.createObjectURL(file)
                                  : exampleVideoUrl || undefined
                              }
                              onError={(e) => {
                                const video = e.target as HTMLVideoElement;
                                video.style.display = "none";
                                const errorMessage =
                                  document.createElement("div");
                                errorMessage.className =
                                  "absolute inset-0 flex items-center justify-center text-muted-foreground";
                                errorMessage.textContent =
                                  "Video cannot be played. Please try a different format.";
                                video.parentElement?.appendChild(errorMessage);
                              }}
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {source.type === "screen" && (
                    <ScreenRecorder
                      onFileRecorded={handleRecordedFile}
                      onBase64Generated={handleBase64Generated}
                    />
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => setStep("process")}
                  disabled={source.type === "screen" && !file}
                >
                  Submit Capture
                </Button>
              </form>
            ) : (
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex-1 bg-muted rounded-md overflow-hidden">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 p-4">
                      <div className="relative w-full h-full bg-black rounded-md overflow-hidden">
                        <video
                          controls
                          className="absolute inset-0 w-full h-full object-contain"
                          src={
                            file
                              ? URL.createObjectURL(file)
                              : exampleVideoUrl || undefined
                          }
                          onError={(e) => {
                            const video = e.target as HTMLVideoElement;
                            video.style.display = "none";
                            const errorMessage = document.createElement("div");
                            errorMessage.className =
                              "absolute inset-0 flex items-center justify-center text-muted-foreground";
                            errorMessage.textContent =
                              "Video cannot be played. Please try a different format.";
                            video.parentElement?.appendChild(errorMessage);
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  </div>
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
            <CardTitle
              className={`text-2xl ${
                step !== "process" ? "text-muted-foreground/20" : ""
              }`}
            >
              Process
            </CardTitle>
            <CardDescription
              className={
                step !== "process"
                  ? "text-muted-foreground/20 text-base"
                  : "text-base"
              }
            >
              <p>
                Extracts text from the screen capture frames. Now that
                you&apos;ve selected a source for your context, run it through
                K21 cloud processor to analyze it and extract OCR data.
              </p>{" "}
              <a
                href="https://kontext21.com/docs/processing"
                className="hover:underline"
              >
                Learn more about processing.
              </a>
            </CardDescription>
          </CardHeader>
          {step === "process" && (
            <CardContent className="h-full overflow-auto">
              <div className="flex flex-col h-full">
                <div className="mb-4 flex flex-col">
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
                    <div className="rounded-md bg-muted p-4 h-[300px] overflow-auto">
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
            <CardTitle
              className={`text-2xl ${
                step !== "consume" && !response
                  ? "text-muted-foreground/20"
                  : ""
              }`}
            >
              Consume
            </CardTitle>
            <CardDescription
              className={
                step !== "consume" && !response
                  ? "text-muted-foreground/20 text-base"
                  : "text-base"
              }
            >
              <div className="flex flex-col">
                <p className="mb-2">
                  Great! You&apos;ve gathered some data, but making sense of it
                  can be challenging. Let&apos;s dive deeper, analyze it, and
                  uncover powerful, actionable insights!{" "}
                  <a href="https://kontext21.com" className="hover:underline">
                    Check out some Use Cases!
                  </a>
                </p>
                {response && (
                  <div>
                    <Button
                      onClick={calculateWordFrequencies}
                      disabled={!response?.result}
                    >
                      Analyze Word Frequency
                    </Button>
                  </div>
                )}
              </div>
            </CardDescription>
          </CardHeader>
          {response && wordFrequencies && (
            <CardContent className="h-full">
              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Analysis:</h3>
                </div>
                {wordFrequencies && (
                  <div className="rounded-md bg-muted p-4 h-[300px] overflow-auto">
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
            </CardContent>
          )}
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
            href="https://github.com/kontext21/k21-node"
            target="_blank"
            rel="noreferrer"
          >
            K21 SDK on GitHub
          </a>
        </Button>
        <Button variant="outline">
          <a href="https://kontext21.com/contact">Contact Us</a>
        </Button>
        <Button variant="default">
          <a href="https://docs.kontext21.com/quickstart">
            Try to build your own
          </a>
        </Button>
      </div>
    </div>
  );
}
