"use client";

import { useEffect, useRef, useState } from "react";
import { useGlobalContext } from "@/app/GlobalContext";

export default function Footer() {
    const { radio_data, media_played, setMediaPlayed, is_radio_playing, setRadioPlaying,img_from_playing, setImgFromPlaying, is_media_paused } = useGlobalContext();

    const [bitrateOptions, setBitrateOptions] = useState([]);
    const audioRef = useRef(null);

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

            
            
        }
    }, [radio_data]);

    function returnToDirect(){
        setMediaPlayed(bitrateOptions[0].value)
        setImgFromPlaying(radio_data.now_playing?.song?.art || "/DefaultIMG.png");
    }

    useEffect(() => {
        if (!is_radio_playing){playMedia(media_played)};
    }, [media_played]);

    const handleBitrateChange = (event) => {
        setRadioPlaying(true)
        setMediaPlayed(event.target.value)
        setImgFromPlaying(radio_data.now_playing?.song?.art || "/DefaultIMG.png");
        playMedia(event.target.value);

    };

    function playMedia(media_played) {
        if (audioRef.current && media_played) {
            const audio = audioRef.current;
            audio.pause();
            audio.removeAttribute("src");
            audio.load();

            const freshUrl = media_played + (media_played.includes("?") ? "&" : "?") + "nocache=" + Date.now();
            audio.src = freshUrl;
            audio.load();
            audio.play().catch((err) => {
                console.warn("Impossible de lire le flux :", err);
            });
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
        }
    }, [is_media_paused])

    function updateSongImg(){
        const song_img = document.querySelector("#song-cover");
        song_img.src = img_from_playing
    }

    return (
        <footer>
            <div>
                <img id="song-cover" src="/DefaultIMG.png" alt="Cover" />
                <p id="song-title"></p>
            </div>
            <audio controls ref={audioRef}>
                <source src={media_played} type="audio/mpeg" />
                Votre navigateur ne supporte pas l'audio HTML5.
            </audio>
            {is_radio_playing ? (
                <select
                    name="bitrate"
                    id="src-bitrate-list"
                    value={media_played || ""}
                    onChange={handleBitrateChange}>
                    {bitrateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                    ))}
                </select>
            ) : (
                <button id="return-to-direct-btn" onClick={returnToDirect}>
                    Retour au direct
                </button>
            )}
        </footer>
    );
}
