'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react';
import { useGlobalContext } from "@/app/GlobalContext";

export default function Header(){

    
    const [menu_opened, setMenuOpened] = useState(false);
    /*const [login_opened, setLoginOpened] = useState(false);
    const [connected, setConnected] = useState(false);*/
    const [act_time, updateTime] = useState(0);

    const { radio_data, one_second_time_signal, setOneSecondTimeSignal, setHeaderMenuOpened } = useGlobalContext();

    function burgerMenu(){
        setMenuOpened(!menu_opened);
        setHeaderMenuOpened(!menu_opened)
    }
    
    function closeMenu(){
        setMenuOpened(false);
        setHeaderMenuOpened(false)
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

    const user_icon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/><path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/></svg>

    /*function displayLogin(){
        setLoginOpened(!login_opened)
    }*/

   // const [selected_value, selectValue] = useState("default");

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
                
                <li>
                    <Link href="/playing-list" className='header-side-menu-element' onClick={closeMenu}>Liste de diffusion</Link>
                    <hr/>
                </li>
            </ul>
            </nav>
            {/*<button id="header-connect" onClick={displayLogin}>{user_icon}</button>
            {login_opened ? (
                <div id="connection-comp">
                <div id="connection-comp-bg" onClick={displayLogin}></div>
                    { connected ? (""

                    ) : (
                    <div id="connection-comp-pages">
                        <center id="connection-comp-page-1" className='connection-comp-page'>
                            <h2>Connexion</h2>
                            <p>Identifiants</p>
                            <input type='text' placeholder="Nom d'utilisateur "/><br/>
                            <input type='password' placeholder="Mot de passe"/>
                            <p>Méthode de validation</p>
                            <select defaultValue="default" onChange={((e)=>{selectValue(e.target.value)})}>
                                <option value="default" disabled={true}>Moyen de vérification</option>
                                <option value="email">Email</option>
                                <option value="discord">Discord</option>
                            </select>
                            {selected_value=="discord" ? (
                                <div>
                                    <p>Vérification avec discord</p>
                                    <input type="text" placeholder='Votre id discord'/>
                                </div>
                            ) : selected_value =="email" ? (
                                <div>
                                    <p>Vérification par email</p>
                                    <input type="email" placeholder='Votre email'/>
                                </div>
                            ) : ""}
                            {(selected_value=="discord" || selected_value =="email") ? (<button>Se connecter</button>) : ("")}
                        </center>
                    </div>
                    )}
                </div>
            ):("")}*/}
        </header>
    )
}