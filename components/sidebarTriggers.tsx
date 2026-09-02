"use client"

import { Panel } from "@xyflow/react"
import { useSidebar } from "./ui/sidebar"
import { Settings } from "lucide-react"
import { GitHub } from "./ui/github"
import Link from "next/link"
import { githubUrl } from "@/lib/site"

export const LeftTrigger = () => {
  const { toggleSidebar } = useSidebar()
  return (
    <Panel position="top-left">
      <div
        className="cursor-pointer rounded-md bg-card p-1"
        onClick={toggleSidebar}
      >
        Roots
      </div>
    </Panel>
  )
}

export const RightTrigger = () => {
  const { toggleSidebar } = useSidebar()
  return (
    <Panel position="top-right" className="flex">
      <Link
        target="_blank"
        href={githubUrl}
        className="rounded-full bg-card p-1"
      >
        <GitHub />
      </Link>
      <div className="rounded-full bg-card p-1">
        {" "}
        <Settings
          className="cursor-pointer"
          size={20}
          strokeWidth={1.5}
          onClick={toggleSidebar}
        />
      </div>
    </Panel>
  )
}
