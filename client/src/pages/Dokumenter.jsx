import React, { useState, useEffect } from 'react'
import PageAnimation from '../components/PageAnimation'
import DokumenterCSS from './Dokumenter.module.css'
import PDFIcon from '../assets/pdf-logo.svg'
import dayjs from 'dayjs'
import RedigerDokumentModal from '../components/modals/RedigerDokumentModal'
import ÅbnDokumentModal from '../components/modals/ÅbnDokumentModal'
import Mangler from '../assets/mangler.svg'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'
import { useNewDocument } from '../context/NewDocumentContext'
import SwitcherStyles from '../pages/Switcher.module.css'
import UserSymbol from '../assets/user-symbol.svg'
import Modal from '../components/Modal'
import BarLoader from '../components/loaders/BarLoader.js'
import axios from 'axios'


const Dokumenter = () => {

  const navigate = useNavigate();
  const {user} = useAuthContext();
    
    if (!user) {
        return
    }

    const userID = user?.id || user?._id;

  // ===== STATE MANAGER =====
  const [dokumenter, setDokumenter] = useState([])
  const [mineDokumenter, setMineDokumenter] = useState([])
  const [redigerDokumentModal, setRedigerDokumentModal] = useState(false)
  const [åbnDokumentModal, setÅbnDokumentModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [afgivSamtykke, setAfgivSamtykke] = useState(false)
  const { refetchDocuments, setRefetchDocuments } = useNewDocument();

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/dokumenter-uploads`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
    .then(res => {
        setDokumenter(res.data)
        setLoading(false)
    })
    .catch(error => console.log(error))
  }, [refetchDocuments])

  useEffect(() => {
    setMineDokumenter(dokumenter.filter(dokument => dokument.brugerAdgang.includes(userID)))
  }, [dokumenter, user])

  return (
    <PageAnimation>
      <div className={DokumenterCSS.dokumenterPage}>
        <h1 className={DokumenterCSS.heading}>Dokumenter</h1>
        {user.isAdmin ? <p>Her finder du et overblik over alle uploadede dokumenter.</p> : <p>Her finder du et overblik over dokumenter tilknyttet dig.</p>}
        
        {/* DOKUMENTER FOR ADMINISTRATORER */}
        {user.isAdmin && (
          <div className={DokumenterCSS.dokumenterContainer}>
            {dokumenter.map((dokument) => (
              
              <div className={DokumenterCSS.dokumentContainer} key={dokument._id}>
                {console.log(dokument)}
                <div className={DokumenterCSS.dokument} key={dokument._id} onClick={() => setRedigerDokumentModal(dokument)}>
                  <div className={DokumenterCSS.dokumentUpperHalf}>
                    {!dokument.filURL.includes('.pdf') && <img className={DokumenterCSS.dokumentImage} src={dokument.filURL} alt={dokument.titel} />}
                    {dokument.filURL.includes('.pdf') && <img className={DokumenterCSS.dokumentImage} src={PDFIcon} alt="pdf icon" />}
                    <p className={DokumenterCSS.dokumentTitel}>{dokument.titel}</p>
                    <p className={DokumenterCSS.dokumentBeskrivelse}>{dokument.beskrivelse}</p>
                  </div>
                  <div className={DokumenterCSS.dokumentLowerHalf}>
                    <div className={DokumenterCSS.dokumentBrugerAdgangContainer}>
                      <img className={DokumenterCSS.dokumentBrugerAdgangIcon} src={UserSymbol} alt="user symbol" />
                      <p className={DokumenterCSS.dokumentBrugerAdgang}>{dokument.begraensAdgang ? (dokument.brugerAdgang.length > 0 ? dokument.brugerAdgang.length : 'Admins') : 'Alle'}</p>
                    </div>
                    {dokument.kraevSamtykke && dokument.samtykkeListe.length < dokument.brugerAdgang.length &&
                    <div className={DokumenterCSS.dokumentBrugerAdgangContainer}>
                      <img className={DokumenterCSS.dokumentBrugerAdgangIcon} src={Mangler} alt="user symbol" />
                      <p className={DokumenterCSS.dokumentBrugerAdgang}>{dokument.begraensAdgang ? (dokument.brugerAdgang.length > 0 ? (dokument.brugerAdgang.length - dokument.samtykkeListe.length) : 'Admins') : 'Alle'}</p>
                    </div>}
                  </div>
                </div>
                <p className={DokumenterCSS.dokumentTimestamp}>{dayjs(dokument.createdAt).format('D. MMMM YYYY')}</p>
              </div>
            ))}
            <RedigerDokumentModal redigerDokumentModal={redigerDokumentModal} setRedigerDokumentModal={setRedigerDokumentModal} />
          </div>
        )}

        {/* DOKUMENTER FOR MEDARBEJDERE */}
        {!user.isAdmin && (
          <div className={DokumenterCSS.dokumenterContainer}>
            {mineDokumenter && mineDokumenter.map((dokument) => (
              <div className={DokumenterCSS.dokumentContainer} key={dokument._id}>
                <div className={DokumenterCSS.dokument} key={dokument._id} onClick={() => setÅbnDokumentModal(dokument)}>
                  <div className={DokumenterCSS.dokumentUpperHalf}>
                    {!dokument.filURL.includes('.pdf') && <img className={DokumenterCSS.dokumentImage} src={dokument.filURL} alt={dokument.titel} />}
                    {dokument.filURL.includes('.pdf') && <img className={DokumenterCSS.dokumentImage} src={PDFIcon} alt="pdf icon" />}
                    <p className={DokumenterCSS.dokumentTitel}>{dokument.titel}</p>
                    <p className={DokumenterCSS.dokumentBeskrivelse}>{dokument.beskrivelse}</p>
                  </div>
                  {dokument.kraevSamtykke && 
                    (dokument.samtykkeListe.some(samtykke => samtykke.brugerId === userID) 
                    ? 
                    <b className={DokumenterCSS.dokumentSamtykkeText} style={{color: '#59bf1a'}}>Underskrevet d. {dayjs(dokument.samtykkeListe.find(samtykke => samtykke.brugerId === userID).samtykkeDato).format('D/M-YY')}</b>
                    :
                    <b className={DokumenterCSS.dokumentSamtykkeText} style={{color: 'red'}}>Mangler din underskrift</b>)
                  }
                </div>
                <p className={DokumenterCSS.dokumentTimestamp}>{dayjs(dokument.createdAt).format('D. MMMM YYYY')}</p>
              </div>
            ))}
            <ÅbnDokumentModal åbnDokumentModal={åbnDokumentModal} setÅbnDokumentModal={setÅbnDokumentModal} />
          </div>
        )}


      </div>
    </PageAnimation>
  )
}

export default Dokumenter
