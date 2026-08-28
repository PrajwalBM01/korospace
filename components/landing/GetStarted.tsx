"use client"
import React from "react"
import { Button } from "../ui/button"
import Link from "next/link"

const GetStarted = ({
  text,
  className,
}: {
  text: string
  className: string
}) => {
  return (
    <Link href={"/signup"}>
      <Button className={className}>{text}</Button>
    </Link>
  )
}

export default GetStarted
