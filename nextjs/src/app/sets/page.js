"use client"

import { useState } from "react";
import Link from "next/link";

import { useGlobalContext } from "@/app/GlobalContext";
import Endpage from "@/app/Endpage";

export default function Home() {
  const { artists_list } = useGlobalContext();
  const [search, setSearch] = useState("");

  function renderDJsList() {
    if (!artists_list) return null;

    return artists_list
      .filter((i) =>
        i.title_min.toLowerCase().includes(search.toLowerCase()) || i.title.toLowerCase().includes(search.toLowerCase())
      )
      .map((i) => (
        <div key={i.title_min}>
          <li
            data-artist={i.title_min}
            className="artist-comp"
          >
            <Link href={`/sets/${i.title_min}`}>
              <h3 className="artist-comp-title">{i.title}</h3>
			        <hr/>
              <img src={i.cover} className="available-djs-img" alt={i.title}/>
              {i.episodes_nb} sets
              <hr/>
              <p className="artist-comp-desc">{i.desc_short}</p>
            </Link>
          </li>
        </div>
      ));
  }

  return (
    <main>
      <div>
        <h2>DJ sets</h2>
        <input type="search" placeholder="Artiste, Soundsystem .. " value={search} onChange={(e) => setSearch(e.target.value)}/>
      </div>
      <ul id="available-djs">{renderDJsList()}</ul>
      <Endpage/>
    </main>
  );
}
