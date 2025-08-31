import Link from 'next/link'
import Endpage from "@/app/Endpage";
 
export default function NotFound() {
  return (
    <main>
        <div id="main-comp">
            <div className='page-404'>
                <h2 id="title-404">Erreur 404</h2>
                <h2>Quelquechose s'est mal passé :( !</h2>
                <p className="text-404">La page que vous cherchez est introuvable, n'existes plus ou n'a jamais exister.
                <br/><br/>Vous pouvez retourner à la page d'acceuil <Link id ="link-404" href="/">en cliquant ici</Link> ou sur le titre de la page.
                </p>
            </div>
            <Endpage/>
        </div>
    </main>
  )
}