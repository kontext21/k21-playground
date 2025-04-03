"use client"

import { useState, useRef, useEffect } from "react"
import { Video, StopCircle, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface ScreenRecorderProps {
  onFileRecorded?: (file: File) => void
  onBase64Generated?: (base64: string) => void
}

export default function ScreenRecorder({ onFileRecorded, onBase64Generated }: ScreenRecorderProps) {
  // States for recording
  const [isRecording, setIsRecording] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [recordingTime, setRecordingTime] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null)
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up function for recording
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [stream])
  
  // Clean up URLs
  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl)
      }
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl)
      }
    }
  }, [downloadUrl, recordedVideoUrl])

  // Convert Blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:video/mp4;base64,")
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const startRecording = async () => {
    setRecordedChunks([])
    setError(null)
    setDownloadUrl(null)
    setRecordedVideoUrl(null)
    
    try {
      // Request screen capture, preferring the current tab
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: {
          cursor: "always",
          displaySurface: 'browser',
          logicalSurface: true,
          preferCurrentTab: true
        } as MediaTrackConstraints & { preferCurrentTab?: boolean },
        audio: true 
      })
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      
      const mediaRecorder = new MediaRecorder(mediaStream)
      mediaRecorderRef.current = mediaRecorder
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data])
        }
      }
      
      // Listen for the user canceling the screen share
      mediaStream.getVideoTracks()[0].onended = () => {
        stopRecording()
      }
      
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setRecordingTime(0)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not access screen capture")
    }
  }
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        setStream(null)
      }
      
      // Wait for all chunks to be processed
      setTimeout(async () => {
        if (recordedChunks.length === 0) {
          setError("No recording data available")
          return
        }
        
        try {
          // Create a blob from the recorded chunks
          const blob = new Blob(recordedChunks, { type: 'video/mp4' })
          const recordedFile = new File([blob], `recording-${new Date().toISOString()}.mp4`, { type: 'video/mp4' })
          
          // Call the callback if provided
          if (onFileRecorded) {
            onFileRecorded(recordedFile)
          }
          
          // Create URLs for both download and playback
          const url = URL.createObjectURL(blob)
          setDownloadUrl(url)
          setRecordedVideoUrl(url)
          
          // Convert to base64
          try {
            const base64 = await blobToBase64(blob);
            
            // Call the callback if provided
            if (onBase64Generated) {
              onBase64Generated(base64);
            }
          } catch (err) {
            console.error("Failed to convert video to base64:", err);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to save recording")
        }
      }, 500) // Wait for MediaRecorder to finish processing
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const downloadRecording = () => {
    if (downloadUrl) {
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `recording-${new Date().toISOString()}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <div className="space-y-4">
      <Label className="mb-2 block">Record your screen</Label>
      <div className="rounded-md border overflow-hidden bg-muted aspect-video relative">
        {stream ? (
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            className="w-full h-full object-cover"
          />
        ) : recordedVideoUrl ? (
          <video 
            src={recordedVideoUrl}
            controls
            className="w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Screen preview will appear here</p>
          </div>
        )}
        
        {isRecording && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs flex items-center">
            <span className="animate-pulse mr-1">●</span> 
            {formatTime(recordingTime)}
          </div>
        )}
      </div>
      
      <div className="flex gap-2 flex-wrap">
        {!isRecording ? (
          <Button 
            type="button"
            onClick={startRecording}
            className="bg-black text-white hover:bg-gray-800"
            disabled={isRecording}
          >
            <Video className="mr-2 h-4 w-4" />
            Start Recording
          </Button>
        ) : (
          <Button 
            type="button"
            onClick={stopRecording}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            <StopCircle className="mr-2 h-4 w-4" />
            Stop Recording
          </Button>
        )}

        {downloadUrl && (
          <Button 
            type="button"
            variant="outline"
            onClick={downloadRecording}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Download Recording
          </Button>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}

    </div>
  )
} 