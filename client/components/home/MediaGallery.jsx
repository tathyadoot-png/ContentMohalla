'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'

// Extract YouTube video ID
const getYouTubeId = (url) => {
  if (!url) return null
  const regex =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

// Clean URL for embed & thumbnail
const cleanYouTubeUrl = (url) => {
  const videoId = getYouTubeId(url)
  if (!videoId) return { playerUrl: url, thumbUrl: null }
  return {
    playerUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  }
}

export default function MediaGallery() {
  const [videos, setVideos] = useState([])
  const [audios, setAudios] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true)
      try {
        const res = await api.get('/news/media')
        const media = res.data || []
        setVideos(media.filter((m) => m.type === 'video'))
        setAudios(media.filter((m) => m.type === 'audio'))
      } catch (err) {
        console.error('Error fetching media:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMedia()
  }, [])

  if (loading) return <p className="text-center py-10">Loading media...</p>

  return (
    <section className="mx-auto px-4 py-10">
      {/* Video Section */}
      <h2 className="text-2xl font-bold mb-4 text-primary">Latest Videos</h2>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {videos.slice(0, 8).map((video, i) => {
          const { playerUrl, thumbUrl } = cleanYouTubeUrl(video.url)
          return (
            <div
              key={i}
              className="min-w-[250px] flex-shrink-0 bg-card rounded-xl shadow-lg overflow-hidden"
            >
              <img
                src={thumbUrl}
                alt={video.title}
                className="w-full h-[160px] object-cover"
              />
              <div className="p-2">
                <h3 className="text-lg font-semibold text-primary">
                  {video.title}
                </h3>
              </div>
            </div>
          )
        })}
      </div>
      {videos.length > 8 && (
        <div className="text-right mt-4">
          <button
            onClick={() => router.push('/all-videos')}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-dark"
          >
            View All Videos →
          </button>
        </div>
      )}

      {/* Audio Section */}
      <h2 className="text-2xl font-bold mt-12 mb-4 text-primary">Latest Audios</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {audios.slice(0, 8).map((audio, i) => (
          <div
            key={i}
            className="bg-card rounded-xl shadow-lg p-4 border border-custom"
          >
            <h3 className="text-lg font-semibold text-primary">{audio.title}</h3>
            <audio controls className="w-full mt-2">
              <source src={audio.url} type="audio/mpeg" />
              आपका ब्राउज़र ऑडियो को सपोर्ट नहीं करता।
            </audio>
          </div>
        ))}
      </div>
      {audios.length > 8 && (
        <div className="text-right mt-4">
          <button
            onClick={() => router.push('/all-audios')}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-dark"
          >
            View All Audios →
          </button>
        </div>
      )}
    </section>
  )
}
