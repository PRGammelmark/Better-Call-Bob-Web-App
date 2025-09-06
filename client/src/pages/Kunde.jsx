import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuthContext } from '../hooks/useAuthContext'
import { useParams } from 'react-router-dom'
import PageAnimation from '../components/PageAnimation'
import Styles from './Kunde.module.css'
import { Phone, MessageCircle, Mail, Navigation } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChartCandlestick, Tag } from 'lucide-react'
import CustomersTasks from '../components/tables/CustomersTasks.jsx'
import RedigerKundeModal from '../components/modals/RedigerKundeModal.jsx'
import RedigerKundesPriser from '../components/modals/RedigerKundesPriser.jsx'

const Kunde = () => {

    const { kundeID } = useParams()
    const { user } = useAuthContext()
    const userID = user?.id || user?._id;
    const navigate = useNavigate()

    const [kunde, setKunde] = useState({})
    const [kundensOpgaver, setKundensOpgaver] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [timer, setTimer] = useState(null)
    const [redigerKundeModal, setRedigerKundeModal] = useState(false)
    const [opdaterKunde, setOpdaterKunde] = useState(false)
    const [redigerKundesPriserModal, setRedigerKundesPriserModal] = useState(false)

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/kunder/${kundeID}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setKunde(res.data)
            setLoading(false)
        })
        .catch(err => {
            console.log(err)
            setLoading(false)
            setError(err.response.data.error)
        })
    }, [kundeID, opdaterKunde])

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/opgaver/kunde/${kundeID}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setKundensOpgaver(res.data)
            setLoading(false)
        })
        .catch(err => {
            console.log(err)
        })
    }, [kundeID])

    function åbnKortLink() {
        const appleMapsUrl = `maps://maps.apple.com/?q=${kunde.adresse}, ${kunde.postnummerOgBy}, Denmark`;
        const googleMapsUrl = `https://maps.google.com/?q=${kunde.adresse}, ${kunde.postnummerOgBy}, Denmark`;
        console.log("no")
      
        // Tjek om det er en iOS-enhed
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          window.location.href = appleMapsUrl;
        } else {
          window.location.href = googleMapsUrl;
        }
    }

    function opdaterNoter(e){
        e.preventDefault();
        const nyNoter = e.target.value;

        if (!kunde) return;
        setKunde(prev => ({ ...prev, noter: nyNoter }));

        // timer to prevent constant db calls
        if (timer) {
            clearTimeout(timer)
        }

        const newTimer = setTimeout(() => {
            indsendNoter(nyNoter);
        }, 500);

        setTimer(newTimer);
    }

    function indsendNoter (x) {    
        axios.patch(`${import.meta.env.VITE_API_URL}/kunder/${kundeID}`, {
            noter: x
        }, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            console.log(res.data)
            // setKunde(res.data)
        })
        .catch(error => console.log(error))
    }

    function sletKunde(){
        window.confirm("ADVARSEL: Du bør KUN slette kunder, der er oprettet i test-øjemed. Er kunden en virkelig kunde, og registreret på opgaver, posteringer, betalinger osv., så risikerer du at miste data på de øvrige objekter i systemet. Er du sikker på, at du vil slette kunden?") && window.confirm("Er du HELT SIKKER på, at du vil slette kunden? Du kan miste data.") && axios.delete(`${import.meta.env.VITE_API_URL}/kunder/${kundeID}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            console.log(res.data)
            navigate(-1)
        })
        .catch(error => console.log(error))
    }



  return (
    <>
        {loading ? "" : <>
        <div className={Styles.kundeContainer}>
            {kunde && (
                <div>
                    <b onClick={() => navigate(-1)} className={Styles.tilbageKnap}><ArrowLeft size="20px" /> Tilbage</b>
                    <div className={Styles.kundeHeader}>
                        <div>
                            <h1 className={Styles.kundeNavn}>{kunde.fornavn} {kunde.efternavn}</h1>
                            <p className={Styles.kundeType}>{(kunde.virksomhed || kunde.CVR) ? "Erhvervskunde" : "Privatkunde"}</p>
                        </div>
                    </div>
                    <div className={Styles.infoPillsDiv}>
                        {kunde.harStige ? <div className={Styles.harStige}>Har egen stige 🪜</div> : <div className={Styles.harIkkeStige}>Har ikke egen stige ❗️</div>}
                        {kunde.måKontaktesMedReklame ? <div className={Styles.vilGerneKontaktesMedReklame}>Vil gerne kontaktes med reklame</div> : <div className={Styles.vilIkkeKontaktesMedReklame}>Vil ikke kontaktes med reklame</div>}
                        {kunde.engelskKunde && <div className={Styles.infoPill}>Engelsk kunde</div>}
                        {kunde.satser && <div className={Styles.infoPill}><Tag size="12px" style={{marginRight: 5}}/> Tilpassede prissatser</div>}
                    </div>
                    <div className={Styles.kundeNoter}>
                        <b className={Styles.bold}>Noter:</b>
                        {kunde && (
                            <textarea
                                className={Styles.noterInput}
                                value={kunde.noter || ""}
                                onChange={opdaterNoter}
                            />
                        )}
                    </div>
                    {user.isAdmin && <button onClick={() => setRedigerKundesPriserModal(true)} className={Styles.redigerKundePriserKnap}><ChartCandlestick size="16px" /> Rediger kundens priser</button>}
                    <div className={Styles.kundeKontaktContainer}>
                        <h2>Kontaktinformationer</h2>
                        <p><b className={Styles.bold}>Adresse:</b> {kunde.adresse}, {kunde.postnummerOgBy}</p>
                        <p><b className={Styles.bold}>Tlf.:</b> {kunde.telefon}</p>
                        <p><b className={Styles.bold}>Email:</b> {kunde.email}</p>
                        {(kunde.virksomhed || kunde.CVR) && 
                        <div className={Styles.virksomhedInfo}>
                            <b className={`${Styles.bold} ${Styles.virksomhedHeading}`}>Virksomhed</b>
                            {kunde.virksomhed ? <p className={Styles.virksomhedTekst}>{kunde.virksomhed}</p> : null}
                            {kunde.CVR ? <p className={Styles.virksomhedTekst}>CVR: {kunde.CVR}</p> : null}
                        </div>}
                        <div className={Styles.kundeKontaktMobile}>
                            <a className={`${Styles.postfix} ${Styles.link}`} href={"tel:" + kunde.telefon}><Phone size="20px"/> {kunde.telefon}</a>
                            <a className={`${Styles.postfix} ${Styles.link}`} href={"sms:" + kunde.telefon + "&body=Hej%20" + kunde?.fornavn?.split(" ")[0] + ", "}><MessageCircle size="20px" /> SMS</a>
                            <a className={`${Styles.postfix} ${Styles.link}`} href={"mailto:" + kunde.email}><Mail size="20px" /> Mail</a>
                        </div>
                        <b onClick={åbnKortLink} className={Styles.kortLink}>Find vej <Navigation size="18"/></b>
                    </div>
                    <div className={Styles.kundeOpgaver}>
                        <div className={Styles.kundeOpgaverHeader}>
                            <h2>Opgavehistorik</h2>
                            <button className={Styles.opretOpgaveKnap} onClick={() => navigate(`/ny-opgave/kunde/${kundeID}`)}>+ Opret opgave</button>
                        </div>
                        <CustomersTasks kundeID={kundeID} userID={userID} kunde={kunde}/>
                    </div>
                    {/* <div className={Styles.kundeBetalinger}>
                        <h2>Økonomiske detaljer</h2>
                    </div> */}
                    {user.isAdmin && <div className={Styles.sletRedigerKundeDiv}>
                        <button onClick={() => setRedigerKundeModal(true)} className={Styles.redigerKundeKnap}>Rediger kunde</button>
                        <button onClick={sletKunde} className={Styles.sletKundeKnap}>Slet kunde</button>
                    </div>}
                </div>
            )}
            {error && <div>Ikke fundet: Der skete en fejl under indlæsningen af kunden.</div>}
        </div>
        <RedigerKundeModal redigerKundeModal={redigerKundeModal} setRedigerKundeModal={setRedigerKundeModal} kunde={kunde} opdaterKunde={opdaterKunde} setOpdaterKunde={setOpdaterKunde} />
        <RedigerKundesPriser trigger={redigerKundesPriserModal} setTrigger={setRedigerKundesPriserModal} kunde={kunde} opdaterKunde={opdaterKunde} setOpdaterKunde={setOpdaterKunde} />
        </>}
    </>
  )
}

export default Kunde