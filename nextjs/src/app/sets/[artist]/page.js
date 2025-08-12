'use client'
import { use, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGlobalContext } from "@/app/GlobalContext";

export default function BlogPostPage({ params }) {
  const router = useRouter();

  const { artist } = use(params)
  const {artists_list} = useGlobalContext();
  let act_artist_obj
  function isArtistExist(artist_val){
    if (artists_list.length ===0){return}
    var found = artists_list.find(artist_obj=>{act_artist_obj=artist_obj;return artist_obj.title_min === decodeURIComponent(artist)})
    if (!found){router.push("/sets");return}
    document.querySelector("#artist-page-artist-name").innerText=act_artist_obj.title
  }
  useEffect(() => {
    isArtistExist(artist);
  }, [artists_list]);

  return (
    <main>
      <h2 id="artist-page-artist-name"></h2>
    </main>
  )
}