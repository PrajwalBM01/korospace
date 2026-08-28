"use client"

import ColorBends from "../ColorBends"

const ColorblendsBg = () => {
  return (
    <div className="fixed inset-0 bg-background">
        <ColorBends
          colors={["#7ccf00"]}
          rotation={90}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          noise={0.15}
          parallax={0.5}
          iterations={1}
          intensity={1.5}
          bandWidth={6}
          transparent
          autoRotate={0}
        />
      </div>
  )
}

export default ColorblendsBg
