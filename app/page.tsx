import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Home, Mic, Clock } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#1a1a1a] text-white p-5">
      {/* Greeting Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-[#a3b18a] text-xl font-medium">Good morning,</p>
          <h1 className="text-2xl font-bold">Alex</h1>
        </div>
        <Avatar className="h-10 w-10 border-2 border-[#a3b18a]">
          <img src="/placeholder.svg?height=40&width=40" alt="Profile" />
        </Avatar>
      </div>

      {/* New Analysis Button */}
      <Link href="/analysis">
        <Button variant="outline" className="w-full bg-white text-black rounded-full py-6 mb-6 font-medium">
          New Analysis
        </Button>
      </Link>

      {/* Chat History Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Analysis history</h2>
          <Button variant="ghost" size="icon" className="rounded-full bg-[#333333]">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button variant="secondary" className="rounded-full bg-[#333333] text-white whitespace-nowrap">
            Friendship with Sarah
          </Button>
          <Button variant="secondary" className="rounded-full bg-[#333333] text-white whitespace-nowrap">
            Work relationship with Team
          </Button>
        </div>
      </div>

      {/* Explore More Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Explore more</h2>
          <Button variant="ghost" size="icon" className="rounded-full bg-[#333333]">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-[#333333] p-4 rounded-lg">
            <div className="flex flex-col h-full">
              <h3 className="text-lg font-semibold mb-1">Relationship</h3>
              <p className="text-sm text-gray-300 flex-grow">
                AI analysis of personal chats for improving relationships and communication.
              </p>
            </div>
          </Card>
          <Card className="bg-[#333333] p-4 rounded-lg">
            <div className="flex flex-col h-full">
              <h3 className="text-lg font-semibold mb-1">Communication</h3>
              <p className="text-sm text-gray-300 flex-grow">
                AI insights on communication patterns with personalized advice.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Analysis Types Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Analysis types</h2>
          <Button variant="ghost" size="icon" className="rounded-full bg-[#333333]">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Button variant="outline" className="rounded-full bg-[#1a1a1a] border-[#333333] text-white">
            Friendship
          </Button>
          <Button variant="outline" className="rounded-full bg-[#1a1a1a] border-[#333333] text-white">
            Romance
          </Button>
          <Button variant="outline" className="rounded-full bg-[#1a1a1a] border-[#333333] text-white">
            Family
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="rounded-full bg-[#1a1a1a] border-[#333333] text-white">
            Work
          </Button>
          <Button variant="outline" className="rounded-full bg-[#1a1a1a] border-[#333333] text-white">
            Social
          </Button>
          <Button variant="outline" className="rounded-full bg-[#1a1a1a] border-[#333333] text-white">
            Custom
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#333333] p-3">
        <div className="flex justify-around items-center">
          <Button variant="ghost" className="flex flex-col items-center text-white">
            <Home className="h-6 w-6 mb-1" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center text-white">
            <Mic className="h-6 w-6 mb-1" />
            <span className="text-xs">Voice</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center text-white">
            <Clock className="h-6 w-6 mb-1" />
            <span className="text-xs">History</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

