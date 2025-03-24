"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function ResultsPage() {
  const [analysis, setAnalysis] = useState<string>("");

  useEffect(() => {
    // Get the analysis result from localStorage
    const result = localStorage.getItem('analysisResult');
    if (result) {
      setAnalysis(result);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#1a1a1a] text-white p-5">
      <div className="flex items-center mb-6">
        <Link href="/analysis">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Analysis Results</h1>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="bg-[#333333] rounded-lg p-6">
          <div className="prose prose-invert max-w-none">
            {analysis ? (
              <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />
            ) : (
              <p className="text-gray-400">No analysis results found.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/">
          <Button className="w-full bg-[#a3b18a] text-black hover:bg-[#8a9a72]">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
} 