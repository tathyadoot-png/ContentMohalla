import Link from 'next/link'
import { FaClock, FaUser, FaMapMarkerAlt } from 'react-icons/fa'

const formatDate = (dateStr, withTime = false) => {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleString(withTime ? 'en-IN' : 'hi-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...(withTime && {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  })
}

export default function MetaInfo({ author, location, date, withTime = false }) {
  const formattedDate = formatDate(date, withTime)

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-meta mt-2">
      {author && (
        <span className="flex items-center gap-1.5 text-meta">
          <FaUser className="text-accent" />
          {author._id ? (
            <Link href={`/author/${author._id}`} className="hover:underline hover:text-accent">
              {author.name}
            </Link>
          ) : (
            author.name || 'By Admin'
          )}
        </span>
      )}
      {location && (
        <span className="flex items-center gap-1.5 text-meta">
          <FaMapMarkerAlt className="text-accent" />
          {location}
        </span>
      )}
      {formattedDate && (
        <span className="flex items-center gap-1.5 text-meta">
          <FaClock className="text-accent" />
          {formattedDate}
        </span>
      )}
    </div>
  )
}
