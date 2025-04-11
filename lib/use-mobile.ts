import { useEffect, useState } from "react"

// Breakpoint değerleri (Tailwind CSS ile uyumlu)
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({ width, height })
      setIsMobile(width < BREAKPOINTS.md) // 768px altı mobil olarak kabul edilir
    }

    // İlk yüklemede kontrol et
    handleResize()

    // Ekran boyutu değiştiğinde kontrol et
    window.addEventListener("resize", handleResize)
    
    // Cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Ekran boyutuna göre breakpoint kontrolü yapan yardımcı fonksiyonlar
  const isBreakpoint = {
    sm: screenSize.width < BREAKPOINTS.sm,
    md: screenSize.width < BREAKPOINTS.md,
    lg: screenSize.width < BREAKPOINTS.lg,
    xl: screenSize.width < BREAKPOINTS.xl,
    "2xl": screenSize.width < BREAKPOINTS["2xl"],
  }

  return {
    isMobile,          // Genel mobil kontrolü (md breakpoint'i altı)
    screenSize,        // Anlık ekran boyutları
    isBreakpoint,     // Tüm breakpoint kontrolleri
  }
} 