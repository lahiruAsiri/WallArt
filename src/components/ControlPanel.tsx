"use client"

import type React from "react"
import { useRef } from "react"
import { useWallArt } from "../context/WallArtContext"
import { ARInstructions } from "./ARInstructions"

export function ControlPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { controls, updateControls, wallArtPlaced, resetWallArt, removeWallArt, loadTexture, isSelected } = useWallArt()

  const handleSliderChange = (key: keyof typeof controls, value: number) => {
    updateControls({ [key]: value })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          loadTexture(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  if (!wallArtPlaced) {
    return (
      <>
        <ARInstructions />
        <div className="status-indicator">
          <div className="status-dot"></div>
          <span>Looking for surfaces...</span>
        </div>
      </>
    )
  }

  return (
    <div className={`control-panel ${isSelected ? "expanded" : ""}`}>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />

      {/* Size and Position Controls */}
      <div className="control-section">
        <div className="control-group">
          <label>Size: {controls.size.toFixed(1)}</label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={controls.size}
            onChange={(e) => handleSliderChange("size", Number.parseFloat(e.target.value))}
            className="slider"
          />
        </div>

        <div className="control-group">
          <label>Height: {controls.height.toFixed(1)}</label>
          <input
            type="range"
            min="-1"
            max="2"
            step="0.1"
            value={controls.height}
            onChange={(e) => handleSliderChange("height", Number.parseFloat(e.target.value))}
            className="slider"
          />
        </div>
      </div>

      {/* Rotation Controls */}
      <div className="control-section">
        <div className="control-group">
          <label>Rotate X: {controls.rotationX}°</label>
          <input
            type="range"
            min="-180"
            max="180"
            step="5"
            value={controls.rotationX}
            onChange={(e) => handleSliderChange("rotationX", Number.parseInt(e.target.value))}
            className="slider"
          />
        </div>

        <div className="control-group">
          <label>Rotate Y: {controls.rotationY}°</label>
          <input
            type="range"
            min="-180"
            max="180"
            step="5"
            value={controls.rotationY}
            onChange={(e) => handleSliderChange("rotationY", Number.parseInt(e.target.value))}
            className="slider"
          />
        </div>

        <div className="control-group">
          <label>Rotate Z: {controls.rotationZ}°</label>
          <input
            type="range"
            min="-180"
            max="180"
            step="5"
            value={controls.rotationZ}
            onChange={(e) => handleSliderChange("rotationZ", Number.parseInt(e.target.value))}
            className="slider"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="button-section">
        <button onClick={handleUploadClick} className="btn btn-primary">
          📁 Upload Art
        </button>
        <button onClick={resetWallArt} className="btn btn-secondary">
          🔄 Reset
        </button>
        <button onClick={removeWallArt} className="btn btn-danger">
          🗑️ Remove
        </button>
      </div>
    </div>
  )
}
