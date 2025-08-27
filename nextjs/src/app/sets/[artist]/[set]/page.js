'use client'

import React from "react"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from "@/app/GlobalContext";

export default function ArtistSetsPage({ params }) {
  const { artist, set } = React.use(params)
  const router = useRouter();

  const {artists_list, media_played, setMediaPlayed, is_radio_playing, setRadioPlaying, setImgFromPlaying, is_media_paused, setMediaPaused} = useGlobalContext();
  
  const [page_loaded , setPageLoaded] = useState(false)
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

  async function isSetExist() {
    if (artist_sets.length === 0){return}
    const found = artist_sets.find(sets_obj=>{
      setActSetObj(sets_obj);
      return sets_obj.title_unique_name === decodeURIComponent(set)
    })
    if (!found){router.push(`/sets/${artist}`);return
    } else {
      setPageLoaded(true)
    }
  }

  useEffect(() => {
    isSetExist();
  }, [artist_sets]);

  const play_btn = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/></svg>
  const pause_btn = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/></svg>
  

  return (
    <main>
      {act_set_obj && page_loaded ? (
      <>
        <h2>{act_set_obj.artist+" - "+act_set_obj.title}</h2>
        <article className="episode-page-comp">
          <hr/>
          <div className="episode-page-comp-internal">
            <img className="episode-page-img" src={act_set_obj.cover} alt={act_set_obj.title+' cover'}/>
            <div className="episode-page-text">
              <div id="episode-title-header">
                <button className="play_btn" data-playing="false">{play_btn}</button>
                <h3 id="episode-title">{act_set_obj.title}</h3>
              </div>
              <hr/>
              <br/>
              <p className="episode-page-desc">{act_set_obj.desc}</p>
            </div>
          </div>
          <hr/>
        </article>
      </>) : ""
      }
    </main>
  )
}
