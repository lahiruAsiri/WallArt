"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import * as THREE from "three"

interface WallArtControls {
  size: number
  height: number
  rotationX: number
  rotationY: number
  rotationZ: number
}

interface WallArtContextType {
  // State
  wallArtPlaced: boolean
  wallArtPosition: [number, number, number]
  currentTexture: THREE.Texture | null
  controls: WallArtControls
  isSelected: boolean

  // Actions
  setWallArtPlaced: (placed: boolean) => void
  setWallArtPosition: (position: [number, number, number]) => void
  setCurrentTexture: (texture: THREE.Texture | null) => void
  updateControls: (updates: Partial<WallArtControls>) => void
  setIsSelected: (selected: boolean) => void
  resetWallArt: () => void
  removeWallArt: () => void
  loadTexture: (url: string) => void
}

const WallArtContext = createContext<WallArtContextType | undefined>(undefined)

const defaultControls: WallArtControls = {
  size: 0.5,
  height: 0,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
}

export function WallArtProvider({ children }: { children: ReactNode }) {
  const [wallArtPlaced, setWallArtPlaced] = useState(false)
  const [wallArtPosition, setWallArtPosition] = useState<[number, number, number]>([0, 0, -2])
  const [currentTexture, setCurrentTexture] = useState<THREE.Texture | null>(null)
  const [controls, setControls] = useState<WallArtControls>(defaultControls)
  const [isSelected, setIsSelected] = useState(false)

  const updateControls = (updates: Partial<WallArtControls>) => {
    setControls((prev) => ({ ...prev, ...updates }))
  }

  const resetWallArt = () => {
    setControls(defaultControls)
  }

  const removeWallArt = () => {
    setWallArtPlaced(false)
    setIsSelected(false)
    setControls(defaultControls)
  }

  const loadTexture = (url: string) => {
    const loader = new THREE.TextureLoader()
    loader.load(url, (texture) => {
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      texture.minFilter = THREE.LinearFilter
      setCurrentTexture(texture)
    })
  }

  const value: WallArtContextType = {
    wallArtPlaced,
    wallArtPosition,
    currentTexture,
    controls,
    isSelected,
    setWallArtPlaced,
    setWallArtPosition,
    setCurrentTexture,
    updateControls,
    setIsSelected,
    resetWallArt,
    removeWallArt,
    loadTexture,
  }

  return <WallArtContext.Provider value={value}>{children}</WallArtContext.Provider>
}

export function useWallArt() {
  const context = useContext(WallArtContext)
  if (context === undefined) {
    throw new Error("useWallArt must be used within a WallArtProvider")
  }
  return context
}
