"use client"
import { useState } from "react";

import Link from "next/link";
import Image from 'next/image';

import { useGlobalContext } from "@/app/GlobalContext";
import Endpage from "@/app/Endpage";

export default function Home() {
	const { schedule, setScheduleEntries, last_djs, last_sets} = useGlobalContext();

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
    	<main>
			<div id="main-comp">
				<div id="t-holder" onClick={updateScheduleRows} data-opened={table_open}>
					<table id="schedule-table">
					<caption>
						<h2>Planning de diffusion</h2>
						<h3>(Effectif jusqu'au lendemain, minuit.)</h3>
					</caption>
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
					{table_open ? "Cliquez sur le tableau pour afficher moins d'entrées " : "Cliquez sur le tableau pour afficher plus d'entrées"}
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
