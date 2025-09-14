'use client'

import React from "react"

import Link from 'next/link'
import Image from 'next/image';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useGlobalContext } from "@/app/GlobalContext";
import Endpage from "@/app/Endpage";

export default function ArtistSetsPage({ params }) {
	const { artist, set } = React.use(params)
	const router = useRouter();

	const {artists_list, media_played, setMediaPlayed, is_radio_playing, setRadioPlaying, setImgFromPlaying, is_media_paused, setMediaPaused, setActSetMetadata, player_opened} = useGlobalContext();
	
	const [page_loaded , setPageLoaded] = useState(false)
	const [act_set_obj , setActSetObj] = useState({})
	const [artist_sets, setArtistSets]= useState([])
	const [act_set_playing, setActSetPlaying]=useState(false)

	async function isArtistExist(){
		if (artists_list.length ===0){return}
		const found = artists_list.find(artist_obj=>{
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

	const released_at = new Date(act_set_obj.release_date);
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
  
	
	const isPlaying = media_played === act_set_obj.media && !is_media_paused;
	const togglePlay = () => {
		if (isPlaying) {
			setMediaPaused(true);
		} else {
			setMediaPaused(false);
			setRadioPlaying(false);
			setMediaPlayed(act_set_obj.media);
			setImgFromPlaying(act_set_obj.cover);
        	setActSetMetadata({artist:act_set_obj.artist,title:act_set_obj.title,duration:act_set_obj.duration,artist_link:act_set_obj.artist_unique_name,set_link:act_set_obj.title_unique_name });
		}
	};

	return (
		<main data-footer-opened={player_opened}>
			<div id="main-comp">
				{act_set_obj && page_loaded ? (
				<>
				<h2 id="episodes-page-title"><Link href={"/sets/"+artist}>{act_set_obj.artist}</Link>{" - "+act_set_obj.title}</h2>
				<article key={act_set_obj.title_unique_name} className="episodes-comp">
					<hr/>
					<div className="episodes-comp-internal">
						<Image className={`episodes-img episode-${act_set_obj.title_unique_name}`} height={200} width={200} src={act_set_obj.cover} alt={`${act_set_obj.title} cover`}/>
						<div className="episodes-text">
							<div className="episode-title-header">
								<div className="episode-title-header-comp">
									<button className="play_btn" data-playing={isPlaying} onClick={togglePlay}>{isPlaying ? pause_btn : play_btn}</button>	
									<h3 className={`episode-${act_set_obj.title_unique_name} episode-title`}>{act_set_obj.title}</h3>
									<p className="episode-duration">{durationFormatted}</p>
								</div>
								<p className="episode-published-at">Publié le {releasedAtFormatted}</p>
							</div>
							<hr/>
							<br/>
							<p className={`episodes-desc episode-${act_set_obj.title_unique_name}`}>{act_set_obj.desc}</p>
						</div>
					</div>
					<hr/>
				</article>
				</>) : ("")
				}
				<Endpage/>
			</div>
		</main>
	)
}
