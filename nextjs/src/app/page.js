"use client"

import { useEffect, useState } from "react";

import { useGlobalContext } from "@/app/GlobalContext";


export default function Home() {

  const {schedule, setScheduleEntries, last_djs, last_sets} = useGlobalContext();

  const [table_open, setTableOpen] = useState(false);
  
  function updateScheduleRows(){
    
    if (table_open) {
      setScheduleEntries(9)
      setTableOpen(false)
    } else {
      setScheduleEntries(48)
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

      to_return += `<br/><li><img src=${i.cover} class="last-sets-img"/><br/>${i.artist} - ${i.title}<br/>${durationFormatted} - ${releasedAtFormatted}</li><br/>`;
      last_sets_list.innerHTML=to_return
    };
  };

  function updateLastDJs(){
    const last_djs_list = document.querySelector("#last-dj-list");
    let to_return="";
    if (!last_djs){
      return
    }
    for (let i of last_djs) {
      console.log(i)
      to_return += `<br/><li><img src=${i.cover} class="last-djs-img"/><br/>${i.title}<br>${i.desc_short}</li><br/>`;
      last_djs_list.innerHTML=to_return
    };
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
    <table onClick={updateScheduleRows} id="schedule-table" data-opened={table_open}>
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
    <h2>Derniers sets ajoutés</h2>
    <ul id="last-dj-sets"></ul>
    <h2>Derniers djs ajoutés</h2>
    <ul id="last-dj-list"></ul>
  </main>);
}
