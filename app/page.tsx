"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Play, Pause } from "lucide-react"

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(true)
  const [audioDuration, setAudioDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])

  // 本地图片路径 - 这些文件应该放在 public 文件夹中
  const backgroundImages = ["/bg1.jpg", "/bg2.jpg", "/bg3.jpg", "/bg4.jpg"]

  // 欢迎图片路径 - 这个文件应该放在 public 文件夹中
  const welcomeImagePath = "/welcome.jpg"

  // 背景音乐路径 - 这个文件应该放在 public 文件夹中
  const audioPath = "/bg-music.mp3"

  // 设置 Intersection Observer 来检测当前可见的部分
  useEffect(() => {
    if (showWelcome) return // 如果欢迎界面显示，不初始化观察器

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
  }, [activeIndex, showWelcome])

  // 处理音频加载和进度
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration)
    }

    const updateProgress = () => {
      if (!isDragging && audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", updateProgress)

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", updateProgress)
    }
  }, [isDragging])

  // 处理进度条点击和拖动
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressBarRef.current
    const audio = audioRef.current
    if (!progressBar || !audio) return

    const rect = progressBar.getBoundingClientRect()
    const clickPosition = (e.clientX - rect.left) / rect.width
    const newTime = clickPosition * audio.duration

    audio.currentTime = newTime
    setProgress(clickPosition * 100)
  }

  const handleProgressBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    handleProgressBarClick(e)

    const handleMouseMove = (e: MouseEvent) => {
      const progressBar = progressBarRef.current
      const audio = audioRef.current
      if (!progressBar || !audio) return

      const rect = progressBar.getBoundingClientRect()
      const clickPosition = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const newTime = clickPosition * audio.duration

      audio.currentTime = newTime
      setProgress(clickPosition * 100)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

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
    if (showWelcome) return // 如果欢迎界面显示，不添加键盘事件

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
  }, [activeIndex, showWelcome])

  // 格式化时间（秒 -> MM:SS）
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // 如果显示欢迎界面，只渲染欢迎界面
  if (showWelcome) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-700">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-sm w-full mx-4">
          <div className="w-full">
            <Image
              src={welcomeImagePath || "/placeholder.svg"}
              alt="Welcome"
              width={400}
              height={200}
              className="w-full h-auto"
              priority
            />
          </div>
          <div className="p-5 flex flex-col items-center">
            <h1 className="text-black text-lg font-medium text-center mb-4">Welcome to my personal website!</h1>
            <button
              onClick={handleEnter}
              className="px-5 py-1.5 bg-black text-white rounded transition-all duration-200 hover:bg-gray-800 text-sm"
            >
              Let&apos;s go!!!
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 主页面内容
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

      {/* 改进的音频播放器 */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 z-40">
        <div className="max-w-screen-lg mx-auto flex items-center gap-4">
          <button onClick={toggleAudio} className="text-white transition-all duration-200 hover:text-gray-300">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          {/* 时间显示 */}
          <div className="text-white text-xs opacity-80 w-12">
            {audioRef.current ? formatTime(audioRef.current.currentTime) : "0:00"}
          </div>

          {/* 可拖动的进度条 */}
          <div
            ref={progressBarRef}
            className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden cursor-pointer group"
            onClick={handleProgressBarClick}
            onMouseDown={handleProgressBarMouseDown}
          >
            <div
              className="h-full bg-white transition-all duration-100 group-hover:bg-blue-400"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* 总时长 */}
          <div className="text-white text-xs opacity-80 w-12 text-right">{formatTime(audioDuration)}</div>

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
    </main>
  )
}
