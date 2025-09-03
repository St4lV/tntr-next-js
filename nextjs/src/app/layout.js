import "./globals.css";
import Header from "./Header";
import Footer from "./Footer";


import Context from "@/app/GlobalContext";

export default function RootLayout({ children }) {
	return (
		<html lang="fr">
		<head>
			<meta charSet="UTF-8"/>
			<title>Tirnatek Radio</title>
			<meta
			name="description"
			content="Tekno Webradio basée en France, écoutez notre sélection de musiques tekno en direct, ainsi que les derniers DJ sets des artistes collaborant avec nous !"
			/>
			<link rel="preconnect" href="https://fonts.googleapis.com"/>
			<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
			<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap" rel="stylesheet"/>
			<meta name="viewport" content="width=device-width, initial-scale=1"></meta>
			
			<meta name="google-site-verification" content="cCnNinz1iS12t7Hg_AY0m9Zsl40wHLpis3uHDfrzH1Y" />
		</head>
		<body>
			<Context>
			<Header/>
			{children}
			<Footer/>
			</Context>
		</body>
		</html>
	);
}
