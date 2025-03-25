import React, { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import Styles from './UploadDokument.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css'
import ModalStyles from '../Modal.module.css'
import PDFIcon from '../../assets/pdf-logo.svg'
import BarLoader from '../loaders/BarLoader.js'
import Tjek from '../../assets/tjek.svg'
import Mangler from '../../assets/mangler.svg'
import axios from 'axios'
import { useAuthContext } from '../../hooks/useAuthContext'
import { useNewDocument } from '../../context/NewDocumentContext'
import dayjs from 'dayjs'
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from '../../firebase.js'

const RedigerDokumentModal = ({redigerDokumentModal, setRedigerDokumentModal, refetchDokumenter, setRefetchDokumenter}) => {

const { user } = useAuthContext();

const [titel, setTitel] = useState('');
const [beskrivelse, setBeskrivelse] = useState('');
const [kraevSamtykke, setKraevSamtykke] = useState(false);
const [begrænsBrugerAdgang, setBegrænsBrugerAdgang] = useState(false);
const [brugerAdgang, setBrugerAdgang] = useState([]);
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
    if(redigerDokumentModal){
        setTitel(redigerDokumentModal.titel);
        setBeskrivelse(redigerDokumentModal.beskrivelse);
        setKraevSamtykke(redigerDokumentModal.kraevSamtykke);
        setBegrænsBrugerAdgang(redigerDokumentModal.begraensAdgang);
        setBrugerAdgang(redigerDokumentModal.brugerAdgang);
    }
}, [redigerDokumentModal])

useEffect(() => {
  if (!begrænsBrugerAdgang) {
    setBrugerAdgang(brugere.map(bruger => bruger._id)); // Sætter kun bruger-ID'er, uden at tilføje flere
  }
}, [begrænsBrugerAdgang, brugere]);


function opdaterDokument(e){
  e.preventDefault()
  
  const updatedDocument = {
    titel: titel || '',
    beskrivelse: beskrivelse || '',
    kraevSamtykke: kraevSamtykke,
    brugerAdgang: brugerAdgang || [],
    begraensAdgang: begrænsBrugerAdgang
  }

  axios.patch(`${import.meta.env.VITE_API_URL}/dokumenter-uploads/${redigerDokumentModal._id}`, updatedDocument, {
    headers: {
      'Authorization': `Bearer ${user.token}`
    }
  })
  .then(res => {
    setRefetchDocuments(!refetchDocuments)
    setRedigerDokumentModal(false)
  })
  .catch(error => console.log(error))
}

async function sletDokument() {
  if (window.confirm('Er du sikker på, at du vil slette dette dokument? Dette får konsekvenser for de brugere, der har adgang til det.')) {
      const storage = getStorage();
      const fileRef = ref(storage, redigerDokumentModal.filURL); // Reference til filen i Firebase

      try {
          // Slet fil fra Firebase Storage
          await deleteObject(fileRef);
          console.log("Fil slettet fra Firebase Storage");

          // Slet dokumentet fra databasen
          await axios.delete(`${import.meta.env.VITE_API_URL}/dokumenter-uploads/${redigerDokumentModal._id}`, {
              headers: {
                  'Authorization': `Bearer ${user.token}`
              }
          });

          setRefetchDocuments(!refetchDocuments);
          setRedigerDokumentModal(false);
      } catch (error) {
          console.error("Fejl ved sletning af dokument:", error);
          setRedigerDokumentModal(false);
      }
  }
}

  return (
    <Modal trigger={redigerDokumentModal} setTrigger={setRedigerDokumentModal}>
        <h2 className={Styles.heading}>{redigerDokumentModal.titel}</h2>
        {redigerDokumentModal && redigerDokumentModal.filURL.includes('.pdf') && <p style={{marginBottom: '15px'}}>Klik herunder for at åbne filen.</p>}
        {redigerDokumentModal && !redigerDokumentModal.filURL.includes('.pdf') && <p style={{marginBottom: '15px'}}>Forhåndsvisningen kan være beskåret. Klik herunder for at åbne filen.</p>}
        <form onSubmit={(e) => opdaterDokument(e)} method="" encType="multipart/form-data">
            {redigerDokumentModal && redigerDokumentModal.filURL.includes('.pdf') 
            ? 
            <img className={Styles.redigerDokumentPDFIcon} src={PDFIcon} alt={redigerDokumentModal.titel} onClick={() => window.open(redigerDokumentModal.filURL, '_blank')}/>
            :
            <img className={Styles.redigerDokumentImage} src={redigerDokumentModal.filURL} alt={redigerDokumentModal.titel} onClick={() => window.open(redigerDokumentModal.filURL, '_blank')}/>}
          <input className={ModalStyles.modalInput} style={{fontFamily: 'OmnesBold'}} type="text" name="titel" value={titel} onChange={(e) => setTitel(e.target.value)} required/>
          <input className={ModalStyles.modalInput} type="text" name="beskrivelse" placeholder="Beskrivelse" value={beskrivelse} onChange={(e) => setBeskrivelse(e.target.value)} />
          <div className={SwitcherStyles.checkboxContainer}>
            <label className={SwitcherStyles.switch} htmlFor="begrænsBrugerAdgang">
              <input type="checkbox" id="begrænsBrugerAdgang" name="begrænsBrugerAdgang" className={SwitcherStyles.checkboxInput} checked={begrænsBrugerAdgang} onChange={(e) => {setBegrænsBrugerAdgang(e.target.checked)}} />
              <span className={SwitcherStyles.slider}></span>
            </label>
            <b>Begræns bruger-adgang</b>
          </div>
          {begrænsBrugerAdgang && <p style={{marginTop: 20, marginBottom: -10}}>Vælg hvilke medarbejdere der skal have adgang til dokumentet.</p>}
          {begrænsBrugerAdgang && (
          <div className={Styles.dropdownContainer}>
            <div id="brugerAdgang" className={`${Styles.dropdown}`}>
              {brugere && brugere.map((bruger) => (
                <div 
                  key={bruger._id} 
                  className={`${Styles.option} ${brugerAdgang.includes(bruger._id) ? Styles.selected : ''}`} 
                  onClick={() => {
                    if (brugerAdgang.includes(bruger._id)) {
                      if(redigerDokumentModal.samtykkeListe.some(samtykke => samtykke.bruger.id === bruger._id)){
                        window.alert("Brugeren har underskrevet dokumentet, og kan ikke få fjernet adgang.");
                      } else {
                        setBrugerAdgang(brugerAdgang.filter(id => id !== bruger._id));
                      }
                    } else {
                      setBrugerAdgang([...brugerAdgang, bruger._id]);
                    }
                  }}
                >
                  {bruger.navn && bruger.navn}
                </div>
              ))}
            </div>
          </div>
          )}
          
          <div className={SwitcherStyles.checkboxContainer} style={{marginBottom: '15px'}}>
            <label className={SwitcherStyles.switch} htmlFor="kraevSamtykke">
              <input type="checkbox" id="kraevSamtykke" name="kraevSamtykke" className={SwitcherStyles.checkboxInput} checked={kraevSamtykke} onChange={(e) => setKraevSamtykke(e.target.checked)} />
              <span className={SwitcherStyles.slider}></span>
            </label>
            <b>Kræv underskrift</b>
          </div>
          {kraevSamtykke && (begrænsBrugerAdgang ? <p style={{marginBottom: 15}}><b style={{fontFamily: "OmnesBold"}}>Udvalgte medarbejdere</b> vil blive bedt om samtykke (vælg ovenfor).</p> : <p style={{marginBottom: 15}}><b style={{fontFamily: "OmnesBold"}}>Alle medarbejdere</b> vil blive bedt om samtykke.</p>)}
          {kraevSamtykke && 
          <div className={Styles.samtykkeListe}>
            <b style={{fontFamily: 'OmnesBold', marginBottom: '10px', display: 'block'}}>Underskrift-status:</b>
            {redigerDokumentModal?.samtykkeListe?.length > 0 ? redigerDokumentModal.samtykkeListe.map((samtykke) => (
              <p className={Styles.samtykkeBrugereListe} key={samtykke._id}><img src={Tjek} alt="tjek" style={{width: '15px', height: '15px', marginRight: '5px'}}/>{samtykke.bruger.navn} (underskrevet {dayjs(samtykke.samtykkeDato).format('D. MMMM YYYY')})</p>
            )) 
            :
            <p style={{marginBottom: 10}}>Ingen samtykkeerklæringer endnu.</p>
            }
            {redigerDokumentModal && brugerAdgang?.length > 0 && brugerAdgang.filter(brugerId => !redigerDokumentModal.samtykkeListe.some(samtykke => samtykke.bruger.id === brugerId)).map(brugerId => (
              <p className={Styles.samtykkeBrugereListe} key={brugerId?.navn}><img src={Mangler} alt="mangler" style={{width: '15px', height: '15px', marginRight: '5px'}}/>{brugere && brugere.find(bruger => bruger._id === brugerId)?.navn}</p>
            ))}
          </div>}
          <button style={{marginTop: '15px'}} className={Styles.fullWidthButton} type="submit">Opdater dokument</button>
        </form>
        <div className={Styles.dokumenterButtons}>
            <button className={Styles.sletDokumentButton} onClick={() => sletDokument()}>Slet</button>
        </div>
    </Modal>
  )
}

export default RedigerDokumentModal
