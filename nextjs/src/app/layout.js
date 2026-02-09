import "./globals.css";
import Header from "./Header";
import Footer from "./Footer";
import { headers } from 'next/headers';
import Context from "@/app/GlobalContext";

export default async function RootLayout({ children }) {
   
    const nonce = (await headers()).get('x-nonce');
    
    return (
        <html lang="fr">
        <head>
            <title>Tirnatek Radio</title>
            <meta
                name="description"
                content="Tekno Webradio basée en France, écoutez notre sélection de musiques tekno en direct, ainsi que les derniers DJ sets des artistes collaborant avec nous !"
            />
			<link rel="manifest" href="/manifest.json" />
			<meta name="theme-color" content="#1a1a2e" />
			<meta name="apple-mobile-web-app-capable" content="yes" />
			<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
			<meta name="apple-mobile-web-app-title" content="Tirnatek Radio" />
			<link rel="apple-touch-icon" href="/icons/icon-192.png" />

			<link rel="preconnect" href="https://fonts.googleapis.com" nonce={nonce} />
            <link rel="preconnect" href="https://fonts.googleapis.com" nonce={nonce}/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" nonce={nonce}/>
            <link 
                href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap" 
                rel="stylesheet"
                nonce={nonce}
            />
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <meta name="google-site-verification" content="cCnNinz1iS12t7Hg_AY0m9Zsl40wHLpis3uHDfrzH1Y" />
        </head>
        <body nonce={nonce}>
            <Context>
                <Header/>
                {children}
                <Footer/>
            </Context>
        </body>
        </html>
    );
}