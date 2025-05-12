"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Play, Pause } from "lucide-react"

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])

  // 本地图片路径 - 这些文件应该放在 public 文件夹中
  const backgroundImages = ["/bg1.jpg", "/bg2.jpg", "/bg3.jpg", "/bg4.jpg"]

  // 欢迎图片路径 - 这个文件应该放在 public 文件夹中
  const welcomeImagePath = "/welcome.jpg"

  // 背景音乐路径 - 这个文件应该放在 public 文件夹中
  const audioPath = "/bg-music.mp3"

  // 完全重写图片预加载逻辑，避免任何可能的解构错误
  useEffect(() => {
    // 跳过预加载，直接设置为已加载
    setImagesLoaded(true)

    // 注释掉原来的预加载逻辑，以避免错误
    /*
    let loadedCount = 0
    const totalImages = backgroundImages.length + 1 // +1 for welcome image

    const preloadImage = (src: string) => {
      const img = new Image()
      img.src = src
      img.onload = () => {
        loadedCount++
        if (loadedCount === totalImages) {
          setImagesLoaded(true)
        }
      }
      img.onerror = () => {
        loadedCount++
        console.error(`Failed to load image: ${src}`)
        if (loadedCount === totalImages) {
          setImagesLoaded(true)
        }
      }
    }

    // 预加载欢迎图片
    preloadImage(welcomeImagePath)

    // 预加载背景图片
    backgroundImages.forEach((src) => preloadImage(src))
    */
  }, [backgroundImages.length, welcomeImagePath])

  // 设置 Intersection Observer 来检测当前可见的部分
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.7, // 当 70% 的部分可见时触发
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute("data-index"))
          if (!isNaN(index) && index !== activeIndex) {
            setActiveIndex(index)
          }
        }
      })
    }, options)

    // 观察所有部分
    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => {
      sectionRefs.current.forEach((section) => {
        if (section) observer.unobserve(section)
      })
    }
  }, [activeIndex])

  // 处理音频进度
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

  // 切换音频播放/暂停
  const toggleAudio = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => {
        console.log("Auto-play prevented by browser")
      })
    }
    setIsPlaying(!isPlaying)
  }

  // 关闭欢迎模态框并开始播放音频
  const handleEnter = () => {
    setShowWelcome(false)
    // 进入网站时自动播放音频
    const audio = audioRef.current
    if (audio) {
      audio.play().catch(() => {
        console.log("Auto-play prevented by browser")
        setIsPlaying(false)
      })
      setIsPlaying(true)
    }
  }

  // 滚动到指定部分
  const scrollToSection = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth" })
  }

  // 滚动到下一部分
  const scrollToNext = () => {
    if (activeIndex < backgroundImages.length - 1) {
      scrollToSection(activeIndex + 1)
    }
  }

  // 滚动到上一部分
  const scrollToPrevious = () => {
    if (activeIndex > 0) {
      scrollToSection(activeIndex - 1)
    }
  }

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault()
        scrollToNext()
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault()
        scrollToPrevious()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeIndex])

  return (
    <main className="relative">
      {/* 使用 scroll-snap 的滚动容器 */}
      <div ref={scrollContainerRef} className="h-screen overflow-y-auto snap-y snap-mandatory">
        {backgroundImages.map((src, index) => (
          <section
            key={index}
            ref={(el) => (sectionRefs.current[index] = el)}
            data-index={index}
            className="relative h-screen w-full snap-start snap-always"
          >
            {/* 背景图片 */}
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={src || "/placeholder.svg"}
                alt={`Background ${index + 1}`}
                fill
                priority={index <= activeIndex + 1} // 预加载当前和下一张图片
                className="object-cover"
              />
            </div>

            {/* 可选：添加滚动指示器 */}
            {index < backgroundImages.length - 1 && (
              <div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer animate-bounce"
                onClick={scrollToNext}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white opacity-70 hover:opacity-100 transition-opacity"
                >
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </div>
            )}

            {/* 可选：添加向上滚动指示器（第一张图片除外） */}
            {index > 0 && (
              <div
                className="absolute top-8 left-1/2 transform -translate-x-1/2 cursor-pointer animate-bounce"
                onClick={scrollToPrevious}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white opacity-70 hover:opacity-100 transition-opacity rotate-180"
                >
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* 欢迎模态框 */}
      {showWelcome && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 flex flex-col items-center">
            <div className="w-full mb-4 relative h-48">
              <Image src={welcomeImagePath || "/placeholder.svg"} alt="Welcome" fill className="object-cover rounded" />
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

      {/* 音频播放器 */}
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
            src={audioPath}
            loop
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      </div>

      {/* 页面导航指示器 */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-30">
        <div className="flex flex-col gap-2">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeIndex === index ? "bg-white scale-125" : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 加载指示器 - 已移除，因为我们跳过了预加载 */}
    </main>
  )
}
