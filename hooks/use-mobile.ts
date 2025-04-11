"use client"

import { useState, useEffect } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // İlk yüklemede kontrol et
    checkIfMobile()

    // Pencere boyutu değiştiğinde kontrol et
    window.addEventListener("resize", checkIfMobile)

    // Temizleme fonksiyonu
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  return isMobile
} 