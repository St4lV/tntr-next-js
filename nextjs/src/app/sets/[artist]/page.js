'use client'
import { use, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGlobalContext } from "@/app/GlobalContext";

export default function BlogPostPage({ params }) {
  const router = useRouter();

  const { artist} = use(params)
  const {artists_list, media_played, setMediaPlayed, setRadioPlaying, setImgFromPlaying, is_media_paused, setMediaPaused} = useGlobalContext();
  let act_artist_obj
  const [artist_sets, setArtistSets]= useState([])

  async function isArtistExist(){
    if (artists_list.length ===0){return}
    var found = artists_list.find(artist_obj=>{act_artist_obj=artist_obj;return artist_obj.title_min === decodeURIComponent(artist)})
    if (!found){router.push("/sets");return}
    document.querySelector("#artist-page-artist-name").innerText=act_artist_obj.title
    await fetchArtistSets();
  }

  const play_btn = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/></svg>`
  const pause_btn = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
  <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
</svg>`


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

  function displayArtistSets(){
    if (artist_sets.length>0){

      const artist_sets_div=document.getElementById("artist-sets-holder")
      artist_sets_div.innerHTML=""

      let element_list=[]

      for (let i of artist_sets){
        let el_id=i.artist_unique_name+"-"+i.title_unique_name
        artist_sets_div.innerHTML+=`<article class="episodes-comp"><hr><div class="episodes-comp-internal"><img class="episodes-img" src='${i.cover}' alt='${i.title} cover'/><div class="episodes-text"><div id="episode-title-header"><button id="${el_id}" class="play_btn" data-playing="false">${play_btn}</button><h3 id="episode-title">${i.title}</h3></div><hr><br><p class="episodes-desc">${i.desc}</p></div></div><hr></article>`
        element_list.push({id:el_id,media:i.media,cover:i.cover})
      }

      for (let i of element_list){
        const element = document.getElementById(`${i.id}`)
        if (media_played==i.media && !is_media_paused){
            element.dataset.playing="true"
            element.innerHTML=pause_btn
        }
        console.log(media_played," ",i.media)

        element.addEventListener("click",function(){
          for (let j of document.querySelectorAll(".play_btn")){
            if (j.id!=i.id)
            j.dataset.playing="false"
            j.innerHTML=play_btn
          }
          const is_playing = element.dataset.playing
          if (is_playing == 'true'){
            element.dataset.playing="false"
            element.innerHTML=play_btn
            setMediaPaused(true)
          } else {
            element.dataset.playing="true"
            element.innerHTML=pause_btn
            setMediaPaused(false)
          }
          setRadioPlaying(false)
          setMediaPlayed(i.media);
          setImgFromPlaying(i.cover)
          
        });
      };
    };
  };

  useEffect(() => {
    isArtistExist();
  }, [artists_list]);

  useEffect(() => {
    displayArtistSets();
  }, [artist_sets]);


  return (
    <main>
      <h2 id="artist-page-artist-name"></h2>
      <div id="artist-sets-holder"></div>
    </main>
  )
}