"use client"

import { useEffect, useState } from "react";
import { useGlobalContext } from "@/app/GlobalContext";

import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();
  const {artists_list} = useGlobalContext();
  
  function updateDJsList(){

    let result="<ul>"

    for (let i of artists_list){
      result+=`<br/><li data-artist="${i.title_min}" class="artist-comp">${i.title}<br><img src=${i.cover} class="available-djs-img"/><br/>${i.episodes_nb} sets<br/>${i.desc_short}</li><br/>`;
    }
    result+="</ul>"
    document.querySelector("#available-djs").innerHTML=result
    const artist_elements_list=document.querySelectorAll(".artist-comp")
    for (let i of artist_elements_list){
      i.addEventListener("click",function(){
        ArtistPage(i.dataset.artist)
      })
    }
  }

  function ArtistPage(artist_name){
    router.push(`/sets/${artist_name}`)
  }

  useEffect(() => {
      updateDJsList();
    }, [artists_list]);
  
  return (
    <main>
      <div>
      <h2>DJ sets</h2>
      <input type="search" placeholder="Artiste, Soundsystem .. "/>
      </div>
      <article id="available-djs"></article>
    </main>
  );
  
}
