'use client'

import Link from 'next/link'
import { useState } from 'react';

export default function Header(){

    const [menu_opened, setMenuOpened] = useState(false);
    function burgerMenu(){
        setMenuOpened(!menu_opened)
        console.log(menu_opened)
        console.log(document.getElementById("header-side-menu").dataset.opened)
    }
    
    function closeMenu(){
        setMenuOpened(false)
    }

    return(
        <header>
            <div className="header-bar">
            <h1>Tirnatek Radio</h1>
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