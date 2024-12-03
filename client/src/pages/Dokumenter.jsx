import React, { useState, useEffect } from 'react'
import PageAnimation from '../components/PageAnimation'
import DokumenterCSS from './Dokumenter.module.css'
import PDFIcon from '../assets/pdf-logo.svg'
import dayjs from 'dayjs'
import RedigerDokumentModal from '../components/modals/RedigerDokumentModal'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'
import { useNewDocument } from '../context/NewDocumentContext'
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

  // ===== STATE MANAGER =====
  const [dokumenter, setDokumenter] = useState([])
  const [mineDokumenter, setMineDokumenter] = useState([])
  const [redigerDokumentModal, setRedigerDokumentModal] = useState(false)
  const [loading, setLoading] = useState(true)
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

  return (
    <PageAnimation>
      <div>
        <h1 className={DokumenterCSS.heading}>Dokumenter</h1>
        {user.isAdmin ? <p>Her finder du et overblik over alle uploadede dokumenter.</p> : <p>Her finder du et overblik over dokumenter tilknyttet dig.</p>}
        {user.isAdmin && (
          <div className={DokumenterCSS.dokumenterContainer}>
            {dokumenter.map((dokument) => (
              <div className={DokumenterCSS.dokumentContainer} key={dokument._id}>
                <div className={DokumenterCSS.dokument} key={dokument._id} onClick={() => setRedigerDokumentModal(dokument)}>
                  <div className={DokumenterCSS.dokumentUpperHalf}>
                    {!dokument.filSti.endsWith('.pdf') && <img className={DokumenterCSS.dokumentImage} src={`${import.meta.env.VITE_API_URL}${dokument.filSti}`} alt={dokument.titel} />}
                    {dokument.filSti.endsWith('.pdf') && <img className={DokumenterCSS.dokumentImage} src={PDFIcon} alt="pdf icon" />}
                    <p className={DokumenterCSS.dokumentTitel}>{dokument.titel}</p>
                    <p className={DokumenterCSS.dokumentBeskrivelse}>{dokument.beskrivelse}</p>
                  </div>
                  <div className={DokumenterCSS.dokumentLowerHalf}>
                    <img className={DokumenterCSS.dokumentBrugerAdgangIcon} src={UserSymbol} alt="user symbol" />
                    <p className={DokumenterCSS.dokumentBrugerAdgang}>{dokument.begraensAdgang ? (dokument.brugerAdgang.length > 1 ? dokument.brugerAdgang.length - 1 : 'Admins') : 'Alle'}</p>
                  </div>
                </div>
                <p className={DokumenterCSS.dokumentTimestamp}>{dayjs(dokument.createdAt).format('D. MMMM YYYY')}</p>
              </div>
            ))}
            <RedigerDokumentModal redigerDokumentModal={redigerDokumentModal} setRedigerDokumentModal={setRedigerDokumentModal} />
          </div>
        )}
      </div>
    </PageAnimation>
  )
}

export default Dokumenter
