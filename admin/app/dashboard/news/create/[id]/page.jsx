'use client'

import NewsForm from '@/components/NewsForm'

export default function EditNewsPage({ params }) {
  const { id } = params
  console.log('Editing news item with id:', id)
  return <NewsForm id={id} />
}
