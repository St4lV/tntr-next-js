import "./globals.css";
import Header from "./Header";
import Footer from "./Footer";


import Context from "@/app/GlobalContext";

export default function RootLayout({ children }) {
	return (
		<html lang="fr">
		<head>
			<meta charSet="UTF-8"/>
			
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
