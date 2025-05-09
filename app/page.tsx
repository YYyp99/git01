"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Play, Pause } from "lucide-react"

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())

  const audioRef = useRef<HTMLAudioElement>(null)
  const sectionsRef = useRef<(HTMLElement | null)[]>([])

  const backgroundImages = ["https://imgur.com/UQAIsmX", "https://imgur.com/GZpIqoE", "https://imgur.com/FmEAoqy", "https://imgur.com/1JaX9wo"]

  // Set up intersection observer for sections
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5, // When 50% of the section is visible
    }

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id

        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set(prev).add(id))

          // Add animation class to the background container
          const bgContainer = entry.target.querySelector(".bg-image-container")
          if (bgContainer) {
            bgContainer.classList.add("animate-slide-up")
          }
        } else {
          setVisibleSections((prev) => {
            const updated = new Set(prev)
            updated.delete(id)
            return updated
          })
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observe all sections
    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) observer.unobserve(section)
      })
    }
  }, [])

  // Handle audio progress
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    audio.addEventListener("timeupdate", updateProgress)
    return () => audio.removeEventListener("timeupdate", updateProgress)
  }, [])

  // Toggle audio play/pause
  const toggleAudio = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Close welcome modal and start audio
  const handleEnter = () => {
    setShowWelcome(false)
    // Auto play audio when entering the site
    const audio = audioRef.current
    if (audio) {
      audio.play().catch((e) => console.log("Auto-play prevented:", e))
      setIsPlaying(true)
    }
  }

  return (
    <main className="relative">
      {/* Background image sections */}
      <div className="h-screen overflow-y-auto">
        {backgroundImages.map((src, index) => (
          <section
            key={index}
            id={`section-${index}`}
            ref={(el) => (sectionsRef.current[index] = el)}
            className="relative h-screen w-full overflow-hidden"
          >
            <div
              className={`absolute inset-0 w-full h-full bg-image-container ${
                visibleSections.has(`section-${index}`) ? "animate-slide-up" : ""
              }`}
            >
              <Image
                src={src || "/placeholder.svg"}
                alt={`Background ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover"
              />
            </div>
          </section>
        ))}
      </div>

      {/* Welcome modal */}
      {showWelcome && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 flex flex-col items-center">
            <div className="w-full mb-4">
              <Image src="/welcome.jpg" alt="Welcome" width={600} height={300} className="w-full h-auto rounded" />
            </div>
            <h1 className="text-black text-xl font-medium text-center mb-6">Welcome to my personal website!</h1>
            <button
              onClick={handleEnter}
              className="px-6 py-2 bg-black text-white rounded transition-all duration-200 hover:bg-gray-800"
            >
              Let&apos;s go!!!
            </button>
          </div>
        </div>
      )}

      {/* Audio player */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 z-40">
        <div className="max-w-screen-lg mx-auto flex items-center gap-4">
          <button onClick={toggleAudio} className="text-white transition-all duration-200 hover:text-gray-300">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <audio
            ref={audioRef}
            src="http://music.163.com/song/media/outer/url?id=2053703797.mp3"
            loop
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      </div>
    </main>
  )
}
