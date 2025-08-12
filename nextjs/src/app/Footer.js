"use client";

import { useEffect, useState, useRef } from "react";

import { useGlobalContext } from "@/app/GlobalContext";

export default function Footer() {
    
    const {radio_data} = useGlobalContext();

    const [bitrateOptions, setBitrateOptions] = useState([]);
    const [currentUrl, setCurrentUrl] = useState("/ap1/v1/radio/mountpoints/tntr128.mp3");
    const audioRef = useRef(null);

    function updateRadioData() {
        
        if (radio_data && radio_data.station && Array.isArray(radio_data.station.mounts)) {
            const mounts = radio_data.station.mounts;
            const options = mounts.map((mount) => ({
                value: mount.url,
                label: mount.name || `${mount.bitrate} kbps`,
                bitrate: mount.bitrate,
                isDefault: radio_data.station.listen_url
            }));

            setBitrateOptions(options);
            const defaultMount = options.find(opt => opt.isDefault) || options[0];
            if (defaultMount) {
                setCurrentUrl(defaultMount.value);
            }

            const song_img=document.querySelector("#song-cover")
            song_img.src=radio_data.now_playing.song.art
        }
    }

    useEffect(() => {
        updateRadioData();
    }, [radio_data]);
    const handleBitrateChange = (event) => {
        const newUrl = event.target.value;
        setCurrentUrl(newUrl);

        if (audioRef.current) {
            audioRef.current.pause(); 
            audioRef.current.load(); 
            audioRef.current.play().catch(() => {});
        }
    };

    return (
        <footer>
            <div>
                <img
                    id="song-cover"
                    src="/DefaultIMG.png"
                    alt="Cover"
                />
                <p id="song-title"></p>
            </div>
            <audio controls ref={audioRef}>
                <source src={currentUrl} type="audio/mpeg" />
                Votre navigateur ne supporte pas l'audio HTML5.
            </audio>
            <select
                name="bitrate"
                id="src-bitrate-list"
                value={currentUrl}
                onChange={handleBitrateChange}
            >
                {bitrateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </footer>
    );
}
