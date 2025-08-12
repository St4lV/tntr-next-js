'use client'
import { use } from 'react'
import { useParams } from 'next/navigation'
 
export default function BlogPostPage({ params }) {
  const { slug } = use(params)
 
  return (
    <main>
      <h2>{slug}</h2>
    </main>
  )
}