'use client'
        
let menu_opened=false
import Link from 'next/link'

function BurgerMenu(){
if (menu_opened){
    console.log("closing menu")
    menu_opened=false
} else {
    console.log("opening menu")
    menu_opened=true
}
}
export default function Header(){

    return(
        <header>
            <div className="header-bar">
            <h1>Tirnatek Radio</h1>
            </div>
            <nav className="burger-menu">
            <svg id="burger-menu-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" onClick={BurgerMenu}>
                <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
            </svg>
            <ul>
                <li>
                <Link href="/">Diffusion en direct</Link>
                </li>
                <li>
                <Link href="/sets">DJ sets</Link>
                </li>
            </ul>
            </nav>
        </header>
    )
}