import React, { useEffect, useState } from 'react'
import Modal from '../Modal.jsx'
import Styles from './ÅbnIAppen.module.css'
import DelSafariIcon from '../../assets/delSafariIcon.png'
import SafariIcon from '../../assets/safariIcon.png'
import InstallerSafariIcon from '../../assets/installerSafariIcon.png'
import AppIcon from '../../../public/apple-icon-180.png'

const ÅbnIAppen = (props) => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

    useEffect(() => {
        const handler = (event) => {
            event.preventDefault();
            setDeferredPrompt(event);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    function installApp() {
        if (!deferredPrompt) {
            console.log("No install prompt available");
            return;
        }
        if (deferredPrompt) {
            console.log("clicked")
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                setDeferredPrompt(null);
            });
        }
    }

    return (
        <Modal trigger={props.trigger} setTrigger={props.setTrigger} >
            <h2 className={Styles.modalHeading}>Du får en bedre oplevelse i app'en!</h2>
            <p className={Styles.modalText}>Bruger du din telefon til at tilgå Better Call Bob? Brug et par sekunder på at installere app'en – så får du en bedre oplevelse.</p>
            {isIos 
                ? 
                <div className={Styles.installInstructions}>
                    <h3>Sådan installerer du app'en:</h3>
                    <ol>
                        <li className={Styles.installStep}>1. Åbn denne side i Safari<img src={SafariIcon} alt="Safari icon" /></li>
                        <li className={Styles.installStep}>2. Tryk på "Del"-knappen ...<img src={DelSafariIcon} alt="Del Safari icon" /></li>
                        <li className={Styles.installStep}>3. Tryk på "Føj til hjemmeskærm"<img src={InstallerSafariIcon} alt="Installere icon" /></li>
                        <li className={Styles.installStep}>4. App'en er nu installeret!<img src={AppIcon} alt="Installere icon" /></li>
                    </ol>
                </div>
                : 
                <button className={Styles.modalButton} onClick={installApp} disabled={!deferredPrompt}>
                    Installer app
                </button>}
        </Modal>
    );
};

export default ÅbnIAppen;
