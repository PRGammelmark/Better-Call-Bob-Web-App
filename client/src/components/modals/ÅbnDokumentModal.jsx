import React, { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import Styles from './UploadDokument.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css'
import ModalStyles from '../Modal.module.css'
import PDFIcon from '../../assets/pdf-logo.svg'
import BarLoader from '../loaders/BarLoader.js'
import axios from 'axios'
import { useAuthContext } from '../../hooks/useAuthContext'
import { useNewDocument } from '../../context/NewDocumentContext'
import dayjs from 'dayjs'
const ÅbnDokumentModal = ({åbnDokumentModal, setÅbnDokumentModal, refetchDokumenter, setRefetchDokumenter}) => {

const { user } = useAuthContext();

const [titel, setTitel] = useState('');
const [beskrivelse, setBeskrivelse] = useState('');
const [kraevSamtykke, setKraevSamtykke] = useState(false);
const [begrænsBrugerAdgang, setBegrænsBrugerAdgang] = useState(false);
const [brugerAdgang, setBrugerAdgang] = useState([]);
const [underskrifter, setUnderskrifter] = useState([]);
const [underskriftNavn, setUnderskriftNavn] = useState('');
const [brugere, setBrugere] = useState([]);
const { refetchDocuments, setRefetchDocuments } = useNewDocument();

useEffect(() => {
  axios.get(`${import.meta.env.VITE_API_URL}/brugere`)
  .then(res => {
    setBrugere(res.data.filter(bruger => !bruger.isAdmin));
  })
  .catch(error => console.log(error))
}, [])

useEffect(() => {
    if(åbnDokumentModal){
        setTitel(åbnDokumentModal.titel);
        setBeskrivelse(åbnDokumentModal.beskrivelse);
        setKraevSamtykke(åbnDokumentModal.kraevSamtykke);
        setBegrænsBrugerAdgang(åbnDokumentModal.begraensAdgang);
        setBrugerAdgang(åbnDokumentModal.brugerAdgang);
        setUnderskrifter(åbnDokumentModal.samtykkeListe);
    }
}, [åbnDokumentModal])

function underskrivDokument(e){
  e.preventDefault()
  
  const brugerId = user._id;
  const samtykkeDato = new Date();
  const underskrift = {
    bruger: user,
    samtykkeDato: samtykkeDato
  }

  const samtykkeListe = [...underskrifter, underskrift];

  axios.patch(`${import.meta.env.VITE_API_URL}/dokumenter-uploads/${åbnDokumentModal._id}`, {samtykkeListe}, {
    headers: {
      'Authorization': `Bearer ${user.token}`
    }
  })
  .then(res => {
    setRefetchDocuments(!refetchDocuments)
    setÅbnDokumentModal(false)
  })
  .catch(error => console.log(error))
}

function sletDokument(){
    if (window.confirm('Er du sikker på, at du vil slette dette dokument? Dette får konsekvenser for de brugere, der har adgang til det.')) {
        axios.delete(`${import.meta.env.VITE_API_URL}/dokumenter-uploads/${åbnDokumentModal._id}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setRefetchDocuments(!refetchDocuments)
            setÅbnDokumentModal(false)
        })
        .catch(error => {
            console.log(error);
            setÅbnDokumentModal(false);
        })
    }
}

  return (
    <Modal trigger={åbnDokumentModal} setTrigger={setÅbnDokumentModal}>
        <h2 className={Styles.heading}>{åbnDokumentModal.titel}</h2>
        <p style={{marginBottom: '15px'}}>Klik herunder for at åbne filen.</p>
        {console.log(åbnDokumentModal)}
        {åbnDokumentModal && åbnDokumentModal.filSti.endsWith('.pdf') 
            ? 
            <img className={Styles.redigerDokumentPDFIcon} src={PDFIcon} alt={åbnDokumentModal.titel} onClick={() => window.open(`${import.meta.env.VITE_API_URL}${åbnDokumentModal.filSti}`, '_blank')}/>
            :
            <img className={Styles.redigerDokumentImage} src={`${import.meta.env.VITE_API_URL}${åbnDokumentModal.filSti}`} alt={åbnDokumentModal.titel} onClick={() => window.open(`${import.meta.env.VITE_API_URL}${åbnDokumentModal.filSti}`, '_blank')}/>}
        
        <div style={{marginBottom: '30px', marginTop: '30px'}}>
            <b style={{fontFamily: 'OmnesBold'}}>Beskrivelse:</b>
            <p style={{fontSize: 16, marginBottom: '15px'}}>{åbnDokumentModal.beskrivelse}</p>
        </div>
        {åbnDokumentModal.kraevSamtykke && åbnDokumentModal.samtykkeListe.some(samtykke => samtykke.brugerId === user._id) ? 
        <b className={Styles.dokumentSamtykkeText} style={{display: 'block', textAlign: 'center', marginBottom: '15px'}}>✔︎ Du har underskrevet dette dokument d. {dayjs(åbnDokumentModal.samtykkeListe.find(samtykke => samtykke.brugerId === user._id).samtykkeDato).format('D. MMMM YYYY')}.</b>
        : (
        <form onSubmit={(e) => underskrivDokument(e)} method="" encType="multipart/form-data">
          <p><b style={{fontFamily: 'OmnesBold'}}>Dette dokument kræver din underskrift.</b> <br />Du kan underskrive ved at indtaste dit navn som vi har registreret det i feltet herunder.</p><br />
          <p><b style={{fontFamily: 'OmnesBold'}}>VIGTIGT!</b> Din underskrift er bindende. Læs derfor dokumentet grundigt igennem inden du samtykker til dets indhold.</p><br />
          <input className={ModalStyles.modalInput} type="text" name="underskriv" placeholder="Skriv dit navn her for at underskrive" onChange={(e) => setUnderskriftNavn(e.target.value)} />
          {underskriftNavn && ((underskriftNavn.toLowerCase() === user.navn.toLowerCase()) ? <button style={{marginTop: '15px'}} className={Styles.fullWidthButton} type="submit">Underskriv som {user.navn}</button> : <p style={{fontSize: 12}}>Afventer indtastning af navn ...</p>)}
        </form>
        )}
    </Modal>
  )
}

export default ÅbnDokumentModal
