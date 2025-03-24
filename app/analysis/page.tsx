"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"

export default function AnalysisPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setSelectedFile(file);
      setError(null);
    }
  };

  // Function to calculate optimal chunk size based on rate limit
  const calculateOptimalChunkSize = (totalLength: number): number => {
    const tokensPerMinute = 6000; // Rate limit for deepseek-r1-distill-llama-70b
    const tokensPerSecond = tokensPerMinute / 60;
    const maxTokensPerChunk = Math.floor(tokensPerSecond * 30); // Use 30 seconds worth of tokens
    const maxCharsPerChunk = maxTokensPerChunk * 4; // Convert tokens to chars (1 token ≈ 4 chars)
    
    // If total length is less than max chunk size, use total length
    if (totalLength <= maxCharsPerChunk) {
      return totalLength;
    }
    
    // Otherwise, use max chunk size
    return maxCharsPerChunk;
  };

  // Function to split text into optimal chunks
  const splitIntoChunks = (text: string): string[] => {
    const optimalChunkSize = calculateOptimalChunkSize(text.length);
    console.log(`Optimal chunk size calculated: ${optimalChunkSize} characters`);
    
    // Split by newlines first to maintain conversation structure
    const lines = text.split('\n');
    const chunks: string[] = [];
    let currentChunk = '';

    for (const line of lines) {
      if ((currentChunk + line).length > optimalChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = line;
      } else {
        currentChunk += (currentChunk ? '\n' : '') + line;
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    return chunks;
  };

  // Function to delay execution
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Function to estimate tokens from characters (rough estimate)
  const estimateTokens = (charCount: number): number => {
    return Math.ceil(charCount * 0.25); // Rough estimate: 1 token ≈ 4 characters
  };

  // Function to calculate required delay based on token count
  const calculateDelay = (tokenCount: number): number => {
    const tokensPerMinute = 6000; // Rate limit for deepseek-r1-distill-llama-70b
    const tokensPerSecond = tokensPerMinute / 60;
    const requiredDelay = (tokenCount / tokensPerSecond) * 1000; // Convert to milliseconds
    return Math.ceil(requiredDelay + 2000); // Add 2 second buffer
  };

  const analyzeChunk = async (chunk: string, isFirst: boolean = false, isLast: boolean = false, retryCount = 0) => {
    console.log(`Analyzing chunk of length: ${chunk.length}`);
    const estimatedTokens = estimateTokens(chunk.length);
    console.log(`Estimated tokens for this chunk: ${estimatedTokens}`);
    
    const prompt = `As a relationship analysis expert, analyze this chat content and provide a detailed, structured analysis. Your analysis should be comprehensive and include specific examples from the conversation.

Required sections for your analysis:
1. Overall Relationship Dynamics
   - Key patterns and themes
   - Power dynamics
   - Level of engagement

2. Communication Patterns
   - Communication style
   - Active listening
   - Response patterns
   - Specific examples from the chat

3. Emotional Expression
   - Emotional awareness
   - Supportiveness
   - Empathy levels
   - Specific examples

4. Areas for Improvement
   - Communication gaps
   - Potential misunderstandings
   - Growth opportunities
   - Specific suggestions

5. Specific Recommendations
   - Actionable steps
   - Communication strategies
   - Relationship building activities

${isFirst ? 'This is the beginning of the conversation.' : ''}
${isLast ? 'This is the end of the conversation.' : 'This is a part of the conversation.'}

Chat content to analyze:
${chunk}

Please provide a detailed analysis with specific examples and actionable insights.`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-r1-distill-llama-70b",
          messages: [
            {
              role: "system",
              content: "You are a relationship analysis expert. Provide detailed, structured analysis with specific examples and actionable insights. Your analysis should be comprehensive and include concrete examples from the conversation."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 512, // Reduced to stay within limits
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        // Handle rate limit error
        if (response.status === 429 && retryCount < 3) {
          const errorJson = JSON.parse(errorText);
          const waitTime = parseInt(errorJson.error.message.match(/try again in (\d+)\./)?.[1] || '10') * 1000;
          console.log(`Rate limit hit, waiting ${waitTime}ms before retry...`);
          await delay(waitTime + 5000); // Add 5 second buffer
          return analyzeChunk(chunk, isFirst, isLast, retryCount + 1);
        }
        
        throw new Error(`API Error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const analysis = data.choices[0].message.content;
      
      // Validate the analysis
      if (!analysis || analysis.toLowerCase().includes('safe') || analysis.length < 100) {
        console.error('Invalid analysis received:', analysis);
        throw new Error('Received invalid analysis from the model. Please try again.');
      }

      console.log('Chunk analysis completed successfully');
      return analysis;
    } catch (error) {
      console.error('Error analyzing chunk:', error);
      throw error;
    }
  };

  const analyzeFile = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setProgress(0);
    
    try {
      const fileContent = await selectedFile.text();
      console.log('File content loaded, length:', fileContent.length);
      
      // Split the content into optimal chunks
      const chunks = splitIntoChunks(fileContent);
      console.log(`Split into ${chunks.length} chunks`);
      console.log('Chunk sizes:', chunks.map(chunk => chunk.length));

      // Analyze each chunk
      const analyses: string[] = [];
      for (let i = 0; i < chunks.length; i++) {
        console.log(`Starting analysis of chunk ${i + 1} of ${chunks.length}`);
        try {
          const analysis = await analyzeChunk(
            chunks[i],
            i === 0,
            i === chunks.length - 1
          );
          
          // Validate the analysis before adding it
          if (analysis && analysis.length >= 100) {
            analyses.push(analysis);
            const newProgress = Math.round(((i + 1) / chunks.length) * 100);
            console.log(`Progress updated to: ${newProgress}%`);
            setProgress(newProgress);
          } else {
            throw new Error(`Invalid analysis received for chunk ${i + 1}`);
          }
          
          // Calculate and apply dynamic delay between chunks
          if (i < chunks.length - 1) {
            const nextChunkTokens = estimateTokens(chunks[i + 1].length);
            const delayTime = calculateDelay(nextChunkTokens);
            console.log(`Estimated tokens for next chunk: ${nextChunkTokens}`);
            console.log(`Waiting ${(delayTime/1000).toFixed(1)} seconds before next chunk...`);
            await delay(delayTime);
          }
        } catch (error) {
          console.error(`Error analyzing chunk ${i + 1}:`, error);
          throw error;
        }
      }

      if (analyses.length === 0) {
        throw new Error('No valid analyses were generated. Please try again.');
      }

      // Combine all analyses with better formatting
      const combinedAnalysis = `# Complete Relationship Analysis\n\n${analyses.join('\n\n---\n\n')}`;
      
      // Save the result to localStorage
      localStorage.setItem('analysisResult', combinedAnalysis);
      // Navigate to the results page
      router.push('/analysis/results');
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Error analyzing the file. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1a1a1a] text-white p-5">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">New Analysis</h1>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-[#333333] rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-3">Upload Chat Export</h2>
          <p className="text-sm text-gray-300 mb-4">
            Upload your chat export file to analyze your relationship and get personalized advice.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.json,.csv"
          />
          <Button 
            className="w-full bg-[#a3b18a] text-black hover:bg-[#8a9a72]"
            onClick={handleFileSelect}
          >
            Select File
          </Button>
          {selectedFileName && (
            <p className="text-sm text-[#a3b18a] mt-2">
              Selected file: {selectedFileName}
            </p>
          )}
        </div>

        <div className="bg-[#333333] rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-3">Relationship Type</h2>
          <p className="text-sm text-gray-300 mb-4">Select the type of relationship you want to analyze.</p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="bg-[#1a1a1a] border-[#444444]">
              Friendship
            </Button>
            <Button variant="outline" className="bg-[#1a1a1a] border-[#444444]">
              Romance
            </Button>
            <Button variant="outline" className="bg-[#1a1a1a] border-[#444444]">
              Family
            </Button>
            <Button variant="outline" className="bg-[#1a1a1a] border-[#444444]">
              Work
            </Button>
          </div>
        </div>

        <div className="bg-[#333333] rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-3">Analysis Goal</h2>
          <p className="text-sm text-gray-300 mb-4">What would you like to improve in this relationship?</p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="bg-[#1a1a1a] border-[#444444]">
              Communication
            </Button>
            <Button variant="outline" className="bg-[#1a1a1a] border-[#444444]">
              Trust
            </Button>
            <Button variant="outline" className="bg-[#1a1a1a] border-[#444444]">
              Boundaries
            </Button>
            <Button variant="outline" className="bg-[#1a1a1a] border-[#444444]">
              Conflict
            </Button>
          </div>
        </div>

        <Button 
          className="w-full bg-[#a3b18a] text-black hover:bg-[#8a9a72] py-6 mt-4"
          onClick={analyzeFile}
          disabled={isAnalyzing || !selectedFile}
        >
          {isAnalyzing ? `Analyzing... ${progress}%` : 'Start Analysis'}
        </Button>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mt-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

