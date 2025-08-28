'use client'

import React from "react"
import Link from 'next/link'
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
	const [act_set_playing, setActSetPlaying]=useState(false)

	async function isArtistExist(){
		if (artists_list.length ===0){return}
		const found = artists_list.find(artist_obj=>{
			setActArtistObj(artist_obj);
			return artist_obj.title_min === decodeURIComponent(artist)
		})
		if (!found){router.push("/sets");return}
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
				router.push("/sets");
				return
			}
			
		}
	}

	const released_at = new Date(act_set_obj.release_date*1000);
	const releasedAtFormatted = released_at.toLocaleDateString('fr-FR');

	let durationSecondes = Math.floor(act_set_obj.duration);
		let durationMinutes = Math.floor(durationSecondes / 60);
		let durationHours   = Math.floor(durationMinutes / 60);

		let totalMinutes  = durationMinutes % 60;
		let totalSecondes = durationSecondes % 60;

		totalMinutes  = totalMinutes <= 9 ? "0" + totalMinutes : totalMinutes;
		totalSecondes = totalSecondes <= 9 ? "0" + totalSecondes : totalSecondes;

		let durationFormatted = durationHours > 0
		? `${durationHours}h${totalMinutes}min`
		: durationSecondes > 0
			? `${durationMinutes}min${totalSecondes}s`
			: `${durationMinutes}min`;

	async function isSetExist() {
		if (artist_sets.length === 0){return}
		const found = artist_sets.find(sets_obj=>{
			setActSetObj(sets_obj);
			return sets_obj.title_unique_name === decodeURIComponent(set)
		})
		if (!found){
		  router.push(`/sets/${artist}`);return
		} else {
			setPageLoaded(true)
			if (media_played==act_set_obj.media && !is_media_paused){
				console.log(media_played," | ",is_media_paused)
				setActSetPlaying(true)
			}
		}
	}

	useEffect(() => {
		isSetExist();
	}, [artist_sets]);

	function playMedia(){
		setRadioPlaying(false)
		setMediaPlayed(act_set_obj.media);
		setImgFromPlaying(act_set_obj.cover)
		if (act_set_playing){
			setMediaPaused(true)
			setActSetPlaying(false)
		} else {
			setMediaPaused(false)
			setActSetPlaying(true)
		}
	}

	useEffect(() => {
		if (media_played == act_set_obj.media){
			if (act_set_playing){
				setActSetPlaying(false)
			} else {
				setActSetPlaying(true)
			}
		}
	}, [is_media_paused,is_radio_playing])


	const play_btn = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/></svg>
	const pause_btn = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/></svg>
  

	return (
		<main>
			{act_set_obj && page_loaded ? (
			<>
			<h2><Link href={"/sets/"+artist}>{act_set_obj.artist}</Link>{" - "+act_set_obj.title}</h2>
			<article className="episode-page-comp">
				<hr/>
				<div className="episode-page-comp-internal">
					<img className="episode-page-img" src={act_set_obj.cover} alt={act_set_obj.title+' cover'}/>
					<div className="episode-page-text">
						<div id="episode-title-header">
							<button className="play_btn" data-playing={act_set_playing} onClick={playMedia}>{act_set_playing ? pause_btn : play_btn }</button>
							<h3 id="episode-page-title">{act_set_obj.title}</h3>
							<p>{durationFormatted}</p>
						</div>
						<hr/>
						<br/>
						<p className="episode-page-desc">{act_set_obj.desc}</p>
					</div>
				</div>
				<p>Publié le {releasedAtFormatted}</p>
				<hr/>
			</article>
			</>) : ""
			}
		</main>
	)
}
