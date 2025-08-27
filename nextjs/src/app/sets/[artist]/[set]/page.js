'use client'

import React from "react"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from "@/app/GlobalContext";

export default function ArtistSetsPage({ params }) {
  const { artist, set } = React.use(params)
  const router = useRouter();

  const {artists_list, media_played, setMediaPlayed, is_radio_playing, setRadioPlaying, setImgFromPlaying, is_media_paused, setMediaPaused} = useGlobalContext();
  
  const [act_artist_obj , setActArtistObj] = useState({})
  const [act_set_obj , setActSetObj] = useState({})
  const [artist_sets, setArtistSets]= useState([])

  async function isArtistExist(){
    if (artists_list.length ===0){return}
    const found = artists_list.find(artist_obj=>{
      setActArtistObj(artist_obj);
      return artist_obj.title_min === decodeURIComponent(artist)
    })
    if (!found){router.push("/sets");return}
    
    //document.querySelector("#artist-page-artist-name").innerText=act_artist_obj.title
    await fetchArtistSets();
  }

  useEffect(() => {
    isArtistExist();
  }, [artists_list]);

  async function isSetExist() {
    if (artist_sets.length === 0){return}
    const found = artist_sets.find(sets_obj=>{
      setActSetObj(sets_obj);
      return sets_obj.title_unique_name === decodeURIComponent(set)
    })
    if (!found){router.push(`/sets/${artist}`);return}
  }

  useEffect(() => {
    isSetExist();
  }, [artist_sets]);

  async function fetchArtistSets(){
    let result;
    const url = `/ap1/v1/radio/artists/${artist}/sets`
    try {
        const response = await fetch(url, {
        method: "GET", 
        headers: { "Content-Type": "application/json" }
    });
        const data = await response.json();
        result = data
        
    } finally {
        if (result){
          setArtistSets(result.log)
        } else {
          router.push("/sets");return
        }
        
    }
  }
  return (
    <main>
      <h2>
        {act_set_obj ? act_set_obj.artist+" - "+act_set_obj.title : ""}
      </h2>
    </main>
  )
}
