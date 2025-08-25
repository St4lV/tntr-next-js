'use client'
import { use, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGlobalContext } from "@/app/GlobalContext";

export default function BlogPostPage({ params }) {
  const router = useRouter();

  const { artist} = use(params)
  const {artists_list,setMediaPlayed,setRadioPlaying,setImgFromPlaying} = useGlobalContext();
  let act_artist_obj
  const [artist_sets, setArtistSets]= useState([])

  async function isArtistExist(){
    if (artists_list.length ===0){return}
    var found = artists_list.find(artist_obj=>{act_artist_obj=artist_obj;return artist_obj.title_min === decodeURIComponent(artist)})
    if (!found){router.push("/sets");return}
    document.querySelector("#artist-page-artist-name").innerText=act_artist_obj.title
    await fetchArtistSets();
  }

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
        artist_sets_div.innerHTML+=`<article class="episodes-comp" id="${el_id}"><hr><div class="episodes-comp-internal"><img class="episodes-img" src='${i.cover}' alt='${i.title} cover'/><div class="episodes-text"><h3>${i.title}</h3><hr><br><p class="episodes-desc">${i.desc}</p></div></div><hr></article>`
        element_list.push({id:el_id,media:i.media,cover:i.cover})
      }
      for (let i of element_list){
        const element = document.getElementById(`${i.id}`)
        element.addEventListener("click",function(){
          setRadioPlaying(false)
          setMediaPlayed(i.media);
          setImgFromPlaying(i.cover)
          console.log("click")
        })
      }
    }
    
  }
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