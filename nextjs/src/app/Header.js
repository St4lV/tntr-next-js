'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react';
import { useGlobalContext } from "@/app/GlobalContext";

export default function Header(){

    
    const [menu_opened, setMenuOpened] = useState(false);
    const [act_time, updateTime] = useState(0);

    const { radio_data, one_second_time_signal, setOneSecondTimeSignal } = useGlobalContext();

    function burgerMenu(){
        setMenuOpened(!menu_opened);
    }
    
    function closeMenu(){
        setMenuOpened(false);
    }

    function FormatTime(time) {
        const date = new Date(time);
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        return `${hours}:${minutes}:${seconds}`;
    }


    useEffect(() => {
        updateTime(Date.now())
        const act_time_fetch = setInterval(() => {
            updateTime(Date.now());
        }, 1_000);
         return () => {clearInterval(act_time_fetch);}
    },[])

    useEffect(() => {
        setOneSecondTimeSignal(!one_second_time_signal)
    },[act_time])
    return(
        <header>
            <div className="header-bar">
            <Link href="/"><h1>Tirnatek Radio</h1></Link>
            <p>Playlist : {radio_data.now_playing ? radio_data.now_playing.playlist : ""}</p>
            <p>{FormatTime(act_time)}</p>
            </div>
            
            <nav className="burger-menu">
                <svg onClick={burgerMenu} id="burger-menu-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
                </svg>
                <ul id="header-side-menu" data-opened={menu_opened}>
                
                <li>
                    <Link href="/" className='header-side-menu-element' onClick={closeMenu}>Diffusion en direct</Link>
                    <hr/>
                </li>
                
                <li>
                    <Link href="/sets" className='header-side-menu-element' onClick={closeMenu}>DJ sets</Link>
                    <hr/>
                </li>
                
            </ul>
            </nav>
        </header>
    )
}