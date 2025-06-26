"use client"

import { useState, useEffect } from "react"
import { useXR } from "@react-three/xr"

export function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState({
    hitTestSupported: false,
    sessionActive: false,
    referenceSpace: "unknown",
  })

  const { session } = useXR()

  useEffect(() => {
    if (session) {
      setDebugInfo({
        hitTestSupported: !!session.requestHitTestSource,
        sessionActive: true,
        referenceSpace: "local",
      })
    } else {
      setDebugInfo({
        hitTestSupported: false,
        sessionActive: false,
        referenceSpace: "none",
      })
    }
  }, [session])

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="debug-panel">
      <h4>🔧 Debug Info</h4>
      <div className="debug-item">
        <span>Session Active:</span>
        <span className={debugInfo.sessionActive ? "status-good" : "status-bad"}>
          {debugInfo.sessionActive ? "✅" : "❌"}
        </span>
      </div>
      <div className="debug-item">
        <span>Hit Test Support:</span>
        <span className={debugInfo.hitTestSupported ? "status-good" : "status-bad"}>
          {debugInfo.hitTestSupported ? "✅" : "❌"}
        </span>
      </div>
      <div className="debug-item">
        <span>Reference Space:</span>
        <span>{debugInfo.referenceSpace}</span>
      </div>
    </div>
  )
}
