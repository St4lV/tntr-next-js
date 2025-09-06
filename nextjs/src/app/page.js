"use client"
import { useState, useEffect } from "react";

import Link from "next/link";
import Image from 'next/image';

import { useGlobalContext } from "@/app/GlobalContext";
import Endpage from "@/app/Endpage";

export default function Home() {
	const { schedule, setScheduleEntries, last_djs, last_sets, radio_data, one_second_time_signal, is_media_paused, setMediaPaused, setRadioPlaying, media_played, setMediaPlayed, radio_mountpoint_select, setImgFromPlaying, setActSetMetadata, player_opened, } = useGlobalContext();
	
    const [audio_player_current_time,setAudioPlayerCurrentTime] = useState(0);
    const [radio_current_time,setRadioCurrentTime] = useState(0);

	useEffect(() => {
		setRadioCurrentTime(radio_data?.now_playing?.elapsed)
	},[radio_data])

	useEffect(() => {
		setAudioPlayerCurrentTime(document.getElementById("audio-player").currentTime)
		setRadioCurrentTime(radio_current_time+1)
	}, [one_second_time_signal])

	function FormatTime(timeInSeconds) {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;

        const hh = String(hours).padStart(2, "0");
        const mm = String(minutes).padStart(2, "0");
        const ss = String(seconds.toFixed(0)).padStart(2, "0");

        return (hours > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`);
    }

	const play_btn = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/></svg>
	const pause_btn = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/></svg>

	const isPlaying = !is_media_paused && media_played === radio_mountpoint_select;
	const togglePlay = async () => {
		if (isPlaying) {
			setMediaPaused(true);
		} else {
			/*setMediaPlayed(radio_mountpoint_select);
			setImgFromPlaying(radio_data.now_playing?.song?.art || "/DefaultIMG.png");
			setRadioPlaying(true)
			setMediaPaused(false);*/

			await setMediaPlayed(radio_mountpoint_select)
			setImgFromPlaying(radio_data.now_playing?.song?.art || "/DefaultIMG.png");
			setRadioPlaying(true)
			setActSetMetadata({artist:"",title:"",duration:""})
			setMediaPaused(false)

			}
	};

	const [table_open, setTableOpen] = useState(false);

	function updateScheduleRows() {
		if (table_open) {
			setScheduleEntries(0);
			setTableOpen(false);
		} else {
			setScheduleEntries(1);
			setTableOpen(true);
		};
	};

	function renderSchedule() {
		if (!schedule?.log) return null;

		return schedule.log.map((i, idx) => {
			const date = new Date(i.start);
			return (
				<tr key={idx}>
					<td>{i.is_now ? "> " : ""} {i.name}</td>
					<td>
						{date.toLocaleTimeString("fr-FR", {
						hour12: false,
						hour: "2-digit",
						minute: "2-digit",
						})}
					</td>
				</tr>
			);
		});
	}

	function renderLastSets() {
		if (!last_sets) return null;

		return last_sets.map((i) => {
			const released_at = new Date(i.release_date);
			const releasedAtFormatted = released_at.toLocaleDateString("fr-FR");

			let durationSecondes = Math.floor(i.duration);
			let durationMinutes = Math.floor(durationSecondes / 60);
			let durationHours = Math.floor(durationMinutes / 60);

			let totalMinutes = durationMinutes % 60;
			let totalSecondes = durationSecondes % 60;

			totalMinutes = totalMinutes <= 9 ? "0" + totalMinutes : totalMinutes;
			totalSecondes = totalSecondes <= 9 ? "0" + totalSecondes : totalSecondes;

			let durationFormatted =
				durationHours > 0
				? `${durationHours}h${totalMinutes}min`
				: durationSecondes > 0
				? `${durationMinutes}min${totalSecondes}s`
				: `${durationMinutes}min`;

			return (
				<li key={`${i.artist_unique_name}-${i.title_unique_name}`}id={i.artist_unique_name + "-" + i.title_unique_name} className="home-last-release-comp">
					<Link href={`/sets/${i.artist_unique_name}/${i.title_unique_name}`}>
					<h2 className="home-last-release-title">{i.title}</h2>
					<center>
					<Image className="last-sets-img" src={i.cover} width={150} height={150}  alt={i.title}/>
					</center>
					<br />
					<h3 className="home-last-release-title">{i.artist}</h3>
					<p className="home-last-release-date-duration">
						{releasedAtFormatted} - {durationFormatted}
					</p>
					<br/>
					</Link>
				</li>
			);
		});
	}

	function renderLastDJs() {
		if (!last_djs) return null;

		return last_djs.map((i) => (
			<li key={i.title_min} data-artist={i.title_min} className="last-dj-released home-last-release-comp">
				<Link href={`/sets/${i.title_min}`}>
				<h2 className="home-last-release-artist-title">{i.title}</h2>
				<br/>
				<center>
				<Image src={i.cover} width={150} height={150} className="last-djs-img" alt={i.title} />
				</center>
				<br/>
				<p className="home-last-release-artist-desc">{i.desc_short}</p>
				</Link>
			</li>
		));
	}


  	return (
    	<main data-footer-opened={player_opened}>
			<div id="main-comp">
				<div id="main-page-player-holder">
					<h2>Actuellement en direct</h2>
					<hr/>
					<div id="main-page-player">
						<div id="main-page-player-metadata">
							<Image id="main-page-player-song-img" src={radio_data?.now_playing?.song?.art ||"/DefaultIMG.png"} alt="Couverture" width={100} height={100}/>
							<div id="main-page-player-song-data">
								<p id="song-title">{radio_data.now_playing?.song?.title ?? "Chargement .."}</p>
								<p id="song-title">{radio_data.now_playing?.song?.artist ?? "Chargement .."}</p>
								<p id="song-title">{
									radio_data.now_playing ? `${FormatTime(radio_current_time)} / ${FormatTime(radio_data.now_playing.duration)}`: "Chargement .."}</p>
							</div>
						</div>
						<button id="footer-play-button" className="main-page-player-play-button" onClick={togglePlay} aria-label="Jouer / Mettre en pause">{media_played === radio_mountpoint_select ? (is_media_paused ? play_btn : pause_btn ):play_btn}</button>
					</div>
					<h2>Planning de diffusion</h2>
					<hr/>
				</div>
				<div id="t-holder" onClick={updateScheduleRows} data-opened={table_open}>
					<table id="schedule-table">
					<thead>
						<tr>
						<th>Playlist</th>
						<th>Heure de diffusion</th>
						</tr>
					</thead>
					<tbody id="planning-list">{renderSchedule()}</tbody>
					</table>
				</div>

				<p id="schedule-tooltip">
					{table_open ? "Cliquez sur le tableau pour afficher moins d'entrées " : "Cliquez sur le tableau pour afficher plus d'entrées"}<br/>(Planning effectif jusqu'au lendemain, minuit.)
				</p>
				<div className="last-releases-holder">
					<h2>Derniers sets ajoutés</h2>
					<hr/>
					<br/>
					<ul id="last-dj-sets">{renderLastSets()}</ul>
				</div>
				<div className="last-releases-holder">

					<h2>Derniers djs ajoutés</h2>
					<hr/>
					<br/>
					<ul id="last-dj-list">{renderLastDJs()}</ul>
				</div>
				<Endpage/>
			</div>
		</main>
	);
}
