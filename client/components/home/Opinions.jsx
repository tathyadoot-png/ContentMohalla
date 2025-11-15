'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import api from '@/utils/api'
import MetaInfo from '@/common/MetaInfo' // ✅ Import MetaInfo

export default function Opinions() {
  const [opinionsList, setOpinionsList] = useState([])

  useEffect(() => {
    const fetchOpinions = async () => {
      try {
        const res = await api.get('/opinions')

        const mappedOpinions = res.data.map((op) => ({
          title: op.title,
          author: op.author || null,
          time: op.createdAt, // keep original Date object/string
          img: op.imageUrl || '/default-opinion.jpg',
          slug: op.slug,
          content: op.content,
        }))

        setOpinionsList(mappedOpinions)
      } catch (err) {
        console.error('Failed to fetch opinions', err)
      }
    }

    fetchOpinions()
  }, [])

  if (opinionsList.length === 0) {
    return <p className="text-center text-gray-500">No opinions available.</p>
  }

  const [topOpinion, ...otherOpinions] = opinionsList

  return (
    <div className="w-full">
      {/* Section Heading */}
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 border-b-2 border-accent pb-2">
        Opinions
      </h2>

      {/* Top Opinion Card */}
      <div className="flex flex-col bg-card rounded-xl shadow-md overflow-hidden mb-6 border border-custom">
        <div className="relative w-full h-48">
          <Image
            src={topOpinion.img}
            alt={topOpinion.title}
            fill
            className="object-fill"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-primary mb-2">
            {topOpinion.title}
          </h3>

          {/* ✅ MetaInfo Component */}
          <MetaInfo
            author={topOpinion.author}
            date={topOpinion.time}
          />
        </div>
      </div>

      {/* Other Opinions List */}
      <div className="flex flex-col gap-4">
        {otherOpinions.map((opinion, i) => (
          <div
            key={i}
            className="flex items-start gap-3 bg-card rounded-lg shadow-sm p-3 border border-custom hover:shadow-md transition cursor-pointer"
          >
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-primary mb-1">
                {opinion.title}
              </h4>

              {/* ✅ MetaInfo Component */}
              <MetaInfo
                author={opinion.author}
                date={opinion.time}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
