"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation'

import Image from 'next/image';

import { useGlobalContext } from "@/app/GlobalContext";

export default function Footer() {
    
    const router = useRouter();

    const { radio_data, media_played, setMediaPlayed, is_radio_playing, setRadioPlaying,img_from_playing, setImgFromPlaying, is_media_paused, setMediaPaused, act_set_metadata, setActSetMetadata, one_second_time_signal, header_menu_opened, radio_mountpoint_select, setRadioMountPoint, player_opened, openPlayer, radio_current_time,setRadioCurrentTime} = useGlobalContext();
    const [bitrateOptions, setBitrateOptions] = useState([]);
    const [act_volume,setVolume] = useState(50);
    const [muted_volume,muteVolume] = useState(false);
    const [audio_player_current_time,setAudioPlayerCurrentTime] = useState(0);

    const audioRef = useRef(null);

    useEffect(() => {
        const cached_volume=JSON.parse(localStorage.getItem("audioplayer-volume") !== null ? localStorage.getItem("audioplayer-volume") : act_volume)
        updateVolume(cached_volume);
        document.getElementById("footer-volume-range").value=cached_volume
        muteVolume(JSON.parse(localStorage.getItem("audioplayer-muted") !== null ? localStorage.getItem("audioplayer-muted") : false));
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
                audioRef.current.load();
            }
        };
    }, [])

    useEffect(() => {
        if (radio_data?.station?.mounts) {
            const mounts = radio_data.station.mounts;
            const options = mounts.map((mount) => ({
                value: mount.url,
                label: mount.name || `${mount.bitrate} kbps`,
                bitrate: mount.bitrate,
                isDefault: radio_data.station.listen_url === mount.url,
            }));

            setBitrateOptions(options);

            if (!media_played) {
                const defaultMount = options.find((opt) => opt.isDefault) || options[0];
                if (defaultMount) {
                setMediaPlayed(defaultMount.value);
                }
            }

            if (is_radio_playing){
                setImgFromPlaying(radio_data.now_playing?.song?.art || "/DefaultIMG.png");
            }
            
            const audio_player=document.getElementById("audio-player")
            audio_player.onpause = function(){
                setMediaPaused(true)
            }
            audio_player.onplay = function(){
                setMediaPaused(false)
            }
            
        }

        if (radio_data?.now_playing?.elapsed !== undefined) {
            setRadioCurrentTime(radio_data.now_playing.elapsed);
        }
    }, [radio_data]);

    async function returnToDirect(){
        await setMediaPlayed(radio_mountpoint_select)
        setImgFromPlaying(radio_data.now_playing?.song?.art || "/DefaultIMG.png");
        setRadioPlaying(true)
        setActSetMetadata({artist:"",title:"",duration:""})
    }

    useEffect(() => {
        if (!is_radio_playing){playMedia(media_played)};
    }, [media_played]);

    const handleBitrateChange = (event) => {
        setRadioPlaying(true)
        setMediaPlayed(event.target.value)
        setRadioMountPoint(event.target.value)
        setActSetMetadata({artist:"",title:"",duration:""})
        setImgFromPlaying(radio_data.now_playing?.song?.art || "/DefaultIMG.png");
        playMedia(event.target.value);
    };

    function playMedia(media_played) {
        if (audioRef.current && media_played) {
            const audio = audioRef.current;
            audio.pause();
            audio.removeAttribute("src");
            audio.src = "";
            const freshUrl = media_played + (media_played.includes("/ap1/v1/radio/mountpoints/tntr") ? (media_played.includes("?") ? "&" : "?") + "nocache=" + Date.now() : "");
            audio.src = freshUrl;
            audio.load();
            audio.play().catch((err) => {
                console.warn("Impossible de lire le flux :", err);
            });
            openPlayer(true)
        }
    }

    useEffect(() => {
        updateSongImg();
    }, [img_from_playing])

    useEffect(() => {
        const audio = audioRef.current;
        if(is_media_paused){
            audio.pause();
        } else {
            audio.play();
            openPlayer(true)
        }
    }, [is_media_paused])

    function updateSongImg(){
        const song_img = document.querySelector("#song-cover");
        song_img.src = img_from_playing
    }

    function FormatTime(timeInSeconds) {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;

        const hh = String(hours).padStart(2, "0");
        const mm = String(minutes).padStart(2, "0");
        const ss = String(seconds.toFixed(0)).padStart(2, "0");

        return (hours > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`);
    }

    const play_btn = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/></svg>;
	const pause_btn = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/></svg>;
    const volume_icon ={
        max:<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"/><path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z"/><path d="M8.707 11.182A4.5 4.5 0 0 0 10.025 8a4.5 4.5 0 0 0-1.318-3.182L8 5.525A3.5 3.5 0 0 1 9.025 8 3.5 3.5 0 0 1 8 10.475zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06"/></svg>,
        mid:<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12zm3.025 4a4.5 4.5 0 0 1-1.318 3.182L10 10.475A3.5 3.5 0 0 0 11.025 8 3.5 3.5 0 0 0 10 5.525l.707-.707A4.5 4.5 0 0 1 12.025 8"/></svg>,
        off:<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.717 3.55A.5.5 0 0 1 11 4v8a.5.5 0 0 1-.812.39L7.825 10.5H5.5A.5.5 0 0 1 5 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06"/></svg>,
        muted:<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06m7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0"/></svg>
    }
    const up_btn = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/></svg>;
    const down_btn = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/></svg>;
	
    const isPlaying = !is_media_paused;
    const togglePlay = () => {
				if (isPlaying) {
					setMediaPaused(true);
				} else {
					setMediaPaused(false);
				}
			};

    function updateVolume(value){
        const volume = (value * 0.02).toFixed(2)
        const audio_player = document.getElementById("audio-player");
        setVolume(value)
        muteVolume(false)
        audio_player.volume=volume
        localStorage.setItem("audioplayer-volume",value)
    }

    useEffect(() => {
        document.getElementById("audio-player").muted=muted_volume;
        localStorage.setItem("audioplayer-muted",muted_volume)
    }, [muted_volume])

    useEffect(() => {
        setAudioPlayerCurrentTime(document.getElementById("audio-player").currentTime)
        setRadioCurrentTime(radio_current_time+1)
    }, [one_second_time_signal])

    const progress_bar_value = (!is_radio_playing ? Math.min(1000, Number(((audio_player_current_time * 1000) / act_set_metadata.duration).toFixed(0))) : Math.min(1000,Number(((radio_current_time * 1000) / (radio_data?.now_playing?.duration ?? 1)).toFixed(0))));

    function togglePlayerOpened(){
        openPlayer(!player_opened)
    }

    useEffect(() => {
        if (isPlaying){
            if ("mediaSession" in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: (!is_radio_playing ? act_set_metadata.title : radio_data.now_playing?.song?.title ?? "Chargement ..") || "Tirnatek Radio",
                    artist: (!is_radio_playing ? act_set_metadata.artist : radio_data.now_playing?.song?.artist ?? "Chargement ..") || "Tirnatek Radio",
                    album: "Tirnatek Radio",
                    artwork: [
                        { src: img_from_playing || "/DefaultIMG.png",   sizes: "96x96",   type: "image/png" },
                        { src: img_from_playing || "/DefaultIMG.png",   sizes: "128x128", type: "image/png" },
                        { src: img_from_playing || "/DefaultIMG.png",   sizes: "192x192", type: "image/png" },
                        { src: img_from_playing || "/DefaultIMG.png",   sizes: "256x256", type: "image/png" },
                        { src: img_from_playing || "/DefaultIMG.png",   sizes: "512x512", type: "image/png" },
                    ],
                });
            }

            navigator.mediaSession.setPositionState({
                duration: !is_radio_playing ? act_set_metadata.duration : radio_data.now_playing ? radio_data.now_playing.duration : 0,
                position: !is_radio_playing ? Math.min(audio_player_current_time,act_set_metadata.duration) : radio_data.now_playing ? Math.min(radio_current_time,radio_data.now_playing.duration) : 0,
                playbackRate: 1,
            });
        }
        
    }, [radio_data,media_played,isPlaying,is_media_paused,img_from_playing])

    const [dj_set_player_opened,setDjSetPlayerOpened]=useState(false)

    function toggleDJsetPlayer(){
        if (!is_radio_playing){
            setDjSetPlayerOpened(!dj_set_player_opened)
        } else {
            router.push("/playing-list")
        }
    }

    function updateTimeProgression(val){
        setAudioPlayerCurrentTime(val*10)
        const audio_player = document.getElementById("audio-player");
        audio_player.currentTime=val*10
    }
    useEffect(() =>{
        if( is_radio_playing || header_menu_opened ){
            setDjSetPlayerOpened(false)
        }
    },[is_radio_playing, header_menu_opened])

    return (
        <footer data-opened={player_opened}>
            <button id="footer-open-player" data-opened={player_opened} onClick={togglePlayerOpened}>{player_opened ? down_btn : up_btn}</button>
            <div id="footer-progress-bar" data-player-opened={player_opened}>
                <div id="footer-progress-bar-internal" style={{ width: `${progress_bar_value * 0.1}%`}}>
            </div>
            </div>
            <div id="footer-data-container">
                <div id="footer-song-data-container" onClick={toggleDJsetPlayer}>
                    <Image height={120} width={120} id="song-cover" src={ img_from_playing ||"/DefaultIMG.png"} alt="Cover" />
                    <div id="footer-song-data">
                        <p id="song-title">{!is_radio_playing ? act_set_metadata.title : radio_data.now_playing?.song?.title ?? "Chargement .."}</p>
                        <p id="song-title">{!is_radio_playing ? act_set_metadata.artist : radio_data.now_playing?.song?.artist ?? "Chargement .."}</p>
                        <p id="song-title">{
                            !is_radio_playing ? `${FormatTime(audio_player_current_time)} / ${FormatTime(act_set_metadata.duration)}` : radio_data.now_playing ? `${FormatTime(radio_current_time)} / ${FormatTime(radio_data.now_playing.duration)}`: "Chargement .."}</p>
                    </div>
                    
                </div>
                <button id="footer-play-button" onClick={togglePlay} aria-label="Jouer / Mettre en pause">{is_media_paused ? play_btn : pause_btn}</button>
                <div id="footer-btn-select" data-opened={header_menu_opened}>
                        {is_radio_playing ? (
                            <select aria-label="Sélection de la source audio" name="bitrate" id="src-bitrate-list" value={media_played || ""} onChange={handleBitrateChange}>
                                {bitrateOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                                ))}
                            </select>
                        ) : (
                            <button aria-label="Retour au direct" id="return-to-direct-btn" onClick={returnToDirect}>
                                Retour au direct
                            </button>
                        )}
                        <hr/>
                        <div id="footer-volume-container">
                            <button id="footer-volume-icon" onClick={(()=>{muteVolume(!muted_volume)})} aria-label="Taire le volume">{muted_volume ? volume_icon.muted : act_volume >= 30 ? volume_icon.max : act_volume < 30 && act_volume >= 10 ? volume_icon.mid : volume_icon.off}</button>
                            <input id="footer-volume-range" type="range" min="0" max="50" aria-label="Définir le volume" defaultValue={act_volume} onChange={((e)=>{updateVolume(e.target.value)})}/>
                        </div>
                    </div>
            </div>
            <audio id="audio-player" controls ref={audioRef}>
                <source src={media_played} type="audio/mpeg" />
                Votre navigateur ne supporte pas l'audio HTML5.
            </audio>
            {!is_radio_playing ? 
            (dj_set_player_opened ? (
            <div id="footer-dj-set-player">
                <center id="footer-dj-set-player-container">
                <Image src={img_from_playing} width={500} height={500} alt="Image du set joué" id="footer-dj-set-player-img"/>
                <div>
                    <h2>{act_set_metadata.artist} - {act_set_metadata.title}</h2>
                    <p>{FormatTime(audio_player_current_time.toFixed(0))} / {FormatTime(act_set_metadata.duration.toFixed(0))}</p>
                </div>
                <input type="range" min={0} max={((act_set_metadata.duration+1)*0.1).toFixed(0)} value={audio_player_current_time*0.1} onChange={((e)=>{updateTimeProgression(e.target.value)})} id="set-range-progression"/>
                </center>
            </div>)
            :"")
            :""}
        </footer>
    );
}
