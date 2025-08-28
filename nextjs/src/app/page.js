"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/GlobalContext";


export default function Home() {

	const {schedule, setScheduleEntries, last_djs, last_sets, setRadioPlaying, setMediaPlayed, setImgFromPlaying} = useGlobalContext();
	const router = useRouter();
	const [table_open, setTableOpen] = useState(false);
	
	function updateScheduleRows(){
		
		if (table_open) {
		setScheduleEntries(0)
		setTableOpen(false)

		} else {
		setScheduleEntries(1)
		setTableOpen(true)
		}
	}

	function updateSchedule(){

		const planning_list = document.querySelector("#planning-list");
		let to_return="";
		if (!schedule.log){
		return
		}
		for (let i of schedule.log){
			const date = new Date(i.start);
			to_return+=`<tr><td>${i.is_now ? "> " : ""} ${i.name}</td><td>${date.toLocaleTimeString('fr-FR', { hour12: false, hour: '2-digit', minute: '2-digit' })}</td></tr>`;
		}
		planning_list.innerHTML=to_return
	}

	function updateLastSets(){
		const last_sets_list = document.querySelector("#last-dj-sets");
		let to_return="";
		if (!last_sets){
		return
		}
		let element_list=[]
		for (let i of last_sets) {
		const released_at = new Date(i.release_date*1000);
		const releasedAtFormatted = released_at.toLocaleDateString('fr-FR');

		let durationMinutes = Math.floor(i.duration / 60);
		let durationHours = Math.floor(durationMinutes / 60);
		let totalMinutes = durationMinutes % 60;
		totalMinutes = totalMinutes <= 9 ? "0" + totalMinutes : totalMinutes;

		let durationFormatted = durationHours > 0
			? `${durationHours}h${totalMinutes}`
			: `${durationMinutes}min`;

		element_list.push({id:i.artist_unique_name+"-"+i.title_unique_name,media:i.media,cover:i.cover});
		to_return += `<br/><li id="${i.artist_unique_name}-${i.title_unique_name}" class="home-last-release-comp"><img src=${i.cover} class="last-sets-img"/><br/>${i.artist} - ${i.title}<br/>${durationFormatted} - ${releasedAtFormatted}</li><br/>`;
		last_sets_list.innerHTML=to_return
		};
		for (let i of element_list){
		let element = document.getElementById(`${i.id}`)
		element.addEventListener("click",function(){
			setRadioPlaying(false)
			setMediaPlayed(i.media);
			setImgFromPlaying(i.cover)
		});
		}
	};

	function updateLastDJs(){
		const last_djs_list = document.querySelector("#last-dj-list");
		if (!last_djs){return}
		let result=""

		for (let i of last_djs){
		result+=`<br/><li data-artist="${i.title_min}" class="last-dj-released home-last-release-comp"><h2 class="home-last-release-artist-title">${i.title}</h2><br><img src=${i.cover} class="last-djs-img"/><br><p class="home-last-release-artist-desc">${i.desc_short}</p></li><br/>`;
		}
		last_djs_list.innerHTML=result
		const artist_elements_list=document.querySelectorAll(".last-dj-released")
		for (let i of artist_elements_list){
		i.addEventListener("click",function(){
			ArtistPage(i.dataset.artist)
		})
		}

		function ArtistPage(artist_name){
		router.push(`/sets/${artist_name}`)
		}
	};

	useEffect(() => {
		updateSchedule();
	}, [schedule]);

	useEffect(() => {
		updateLastSets();
	}, [last_sets]);

	useEffect(() => {
		updateLastDJs();
	}, [last_djs]);

	return (
	<main>
		<div id="t-holder" onClick={updateScheduleRows} data-opened={table_open}>
		<table id="schedule-table" >
			<caption>
				<h2>Planning de diffusion</h2>
				<h4>(Effectif jusqu'au lendemain, minuit.)</h4>
			</caption>
			<thead>
			<tr>
				<th>Playlist</th>
				<th>Heure de diffusion</th>
			</tr>
			</thead>
			<tbody id="planning-list">
			</tbody>
		</table>
		</div>
		<p id="schedule-tooltip">{table_open ? "Cliquez sur le tableau pour afficher moins d'entrées ":"Cliquez sur le tableau pour afficher plus d'entrées"}</p>
		<h2>Derniers sets ajoutés</h2>
		<ul id="last-dj-sets"></ul>
		<h2>Derniers djs ajoutés</h2>
		<ul id="last-dj-list"></ul>
	</main>);
}
