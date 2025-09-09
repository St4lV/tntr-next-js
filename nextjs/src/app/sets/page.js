"use client"

import { useState } from "react";

import Link from "next/link";

import Image from 'next/image';

import { useGlobalContext } from "@/app/GlobalContext";
import Endpage from "@/app/Endpage";

export default function Home() {
	const { artists_list, player_opened } = useGlobalContext();
	const [search, setSearch] = useState("");

	function renderDJsList() {
		if (!artists_list) return null;

		return artists_list
		.filter((i) =>
			i.title_min.toLowerCase().includes(search.toLowerCase()) || i.title.toLowerCase().includes(search.toLowerCase())
		)
		.map((i) => (
			<li key={i.title_min} data-artist={i.title_min} className="artist-comp">
				<Link href={`/sets/${i.title_min}`}>
				<h3 className="artist-comp-title">{i.title}</h3>
				<hr/>
				<center>
				<Image src={i.cover} className="available-djs-img" alt={i.title} height={150} width={150}/>
				</center>
				<p>{i.episodes_nb} sets</p>
				<hr/>
				<p className="artist-comp-desc">{i.desc_short}</p>
				</Link>
			</li>
		));
	}

	return (
		<main data-footer-opened={player_opened}>
		<div id="main-comp">
			<div>
				<h2>DJ sets</h2>
				<input type="search" placeholder="Artiste, Soundsystem .. " value={search} onChange={(e) => setSearch(e.target.value)}/>
			</div>
			<ul id="available-djs">{renderDJsList()}</ul>
			<Endpage/>
		</div>
		</main>
	);
	}
