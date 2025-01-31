import React, { useEffect, useState } from 'react'
import Modal from '../Modal.jsx'
import Styles from './ÅbnIAppen.module.css'

const ÅbnIAppen = (props) => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);

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
            <button className={Styles.modalButton} onClick={installApp} disabled={!deferredPrompt}>
                Installer app
            </button>
        </Modal>
    );
};

export default ÅbnIAppen;
