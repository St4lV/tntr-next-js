"use client"

import { useGlobalContext } from "@/app/GlobalContext";
import Endpage from "@/app/Endpage";

import Image from 'next/image';

export default function PlayingList(){
    const { radio_data, player_opened } = useGlobalContext();

    function getTime(timestamp){
        const date = new Date(timestamp)
        const hours = date.getHours().toString();
        const minutes = date.getMinutes().toString();
        const seconds = date.getSeconds().toString();
        return `${hours.length == 2 ? hours : "0"+hours}:${minutes.length == 2 ? minutes : "0"+minutes}:${seconds.length == 2 ? seconds : "0"+seconds}`
    }

    let song_nb=0;

    return(
        <main data-footer-opened={player_opened}>
            <div id="main-comp">
                <hr/>
                <div id='playing-list-top-comp'>
                     {/* ///// TITRE EN COURS ///// */}

                    <div className="playing-list-top-container">
                        <h2>En cours</h2>
                        <hr/>
                        <div className="playing-list-song-container">
                            <div className="playing-list-song-comp">
                                <Image src={radio_data?.now_playing?.song.art || "/DefaultIMG.png"} width={130} height={130} alt="Couverture musique actuellement jouée" className="playing-list-song-cover"/>
                                <div className="playing-list-song-data">
                                    <p>{radio_data?.now_playing?.song.title}</p>
                                    <p>{radio_data?.now_playing?.song.artist}</p>
                                    <p>De {getTime(radio_data?.now_playing?.played_at*1000)} à {getTime((radio_data?.now_playing?.played_at+radio_data?.now_playing?.duration)*1000)}</p>
                                </div>
                            </div>
                        </div>
                        <hr/>
                    </div>

                    {/* ///// PROCHAIN TITRE ///// */}

                    <div className="playing-list-top-container">
                        <h2>Prochain titre</h2>
                        <hr/>
                        <div className="playing-list-song-container">
                            <div className="playing-list-song-comp">
                                <Image src={radio_data?.playing_next?.song.art || "/DefaultIMG.png"} width={130} height={130} alt="Couverture prochaine musique jouée" className="playing-list-song-cover"/>
                                <div className="playing-list-song-data">
                                    <p>{radio_data?.playing_next?.song.title}</p>
                                    <p>{radio_data?.playing_next?.song.artist}</p>
                                    <p>De {getTime(radio_data?.playing_next?.played_at*1000)} à {getTime((radio_data?.playing_next?.played_at+radio_data?.playing_next?.duration)*1000)}</p>
                                </div>
                            </div>
                        </div>
                        <hr/>
                    </div>
                </div>
                
                {/* ///// HISTORIQUE ///// */}
                <h2>Historique</h2>
                <hr/>
                <div id="playing-list-history">
                {radio_data?.song_history?.map((s)=> {
                    song_nb++;
                    return (
                    <div key={s.song.id} className="playing-list-history-container">
                        <h2>{song_nb}</h2>
                        <hr/>
                        <div className="playing-list-song-container">
                            <div className="playing-list-song-comp">
                                <Image src={s.song.art || "/DefaultIMG.png"} width={130} height={130} alt="Couverture musique jouée précedemment" className="playing-list-song-cover"/>
                                <div className="playing-list-song-data">
                                    <p>{s.song.title}</p>
                                    <p>{s.song.artist}</p>
                                    <p>De {getTime(s.played_at*1000)} à {getTime((s.played_at+s.duration)*1000)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    )
                })}
                </div>
            <Endpage/>
            </div>
        </main>
    )
}