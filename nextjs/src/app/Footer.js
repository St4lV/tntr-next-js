"use client";

import { useEffect, useRef, useState } from "react";
import { useGlobalContext } from "@/app/GlobalContext";

export default function Footer() {
    const { radio_data, media_played, setMediaPlayed, is_radio_playing, setRadioPlaying,img_from_playing, setImgFromPlaying } = useGlobalContext();

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
    }, [radio_data, media_played, setMediaPlayed]);

    useEffect(() => {
        if (!is_radio_playing){playMedia()};
    }, [media_played]);

    const handleBitrateChange = (event) => {
        setRadioPlaying(true)
        setMediaPlayed(event.target.value)
        playMedia();
    };

    function playMedia() {
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
        updateSongImg()
    }

    useEffect(() => {
        updateSongImg();
    }, [img_from_playing])

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
        </footer>
    );
}
