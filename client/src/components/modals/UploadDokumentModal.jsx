import React, { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import Styles from './UploadDokument.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css'
import ModalStyles from '../Modal.module.css'
import BarLoader from '../loaders/BarLoader.js'
import axios from 'axios'
import { useAuthContext } from '../../hooks/useAuthContext'
import { useNewDocument } from '../../context/NewDocumentContext'

const UploadDokumentModal = ({åbnUploadDokumentModal, setÅbnUploadDokumentModal}) => {

const { user } = useAuthContext();
const { refetchDocuments, setRefetchDocuments } = useNewDocument();
const [titel, setTitel] = useState('');
const [beskrivelse, setBeskrivelse] = useState('');
const [kraevSamtykke, setKraevSamtykke] = useState(false);
const [begrænsBrugerAdgang, setBegrænsBrugerAdgang] = useState(false);
const [brugerAdgang, setBrugerAdgang] = useState([]);
const [dragging, setDragging] = useState(false);
const [file, setFile] = useState(null);
const [brugere, setBrugere] = useState([]);

useEffect(() => {
  axios.get(`${import.meta.env.VITE_API_URL}/brugere`)
  .then(res => {
    setBrugere(res.data.filter(bruger => !bruger.isAdmin));
  })
  .catch(error => console.log(error))
}, [])

function uploadDokument(e){
  e.preventDefault()
  
  const formData = new FormData();
  formData.append('fil', file); 
  formData.append('titel', titel || '');
  formData.append('beskrivelse', beskrivelse || '');
  formData.append('kraevSamtykke', kraevSamtykke);
  formData.append('begraensAdgang', begrænsBrugerAdgang);
  brugerAdgang.forEach(id => {
    formData.append('brugerAdgang[]', id);
  });

  console.log(brugerAdgang)

  axios.post(`${import.meta.env.VITE_API_URL}/dokumenter-uploads`, formData, {
    headers: {
      'Authorization': `Bearer ${user.token}`
    }
  })
  .then(res => {
    setRefetchDocuments(!refetchDocuments)
    setÅbnUploadDokumentModal(false)
  })
  .catch(error => console.log(error))
}



  return (
    <Modal trigger={åbnUploadDokumentModal} setTrigger={setÅbnUploadDokumentModal}>
        <h2 className={Styles.heading}>Upload dokument</h2>
        <p style={{marginBottom: '15px'}}>Billeder og PDF-filer er tilladte.</p>
        <form onSubmit={(e) => uploadDokument(e)} method="" encType="multipart/form-data">
          <div 
            className={`${Styles.fileInput} ${dragging ? Styles.dragover : ''}`} 
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }} 
            onDragLeave={() => setDragging(false)} 
            onDrop={(e) => { 
              e.preventDefault(); 
              setDragging(false);
              
              const droppedFile = e.dataTransfer.files[0];
              const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
              if (allowedTypes.includes(droppedFile.type)) {
                setFile(droppedFile);
              } else {
                alert('Only PDF, JPG, JPEG, PNG, and HEIC files are allowed.');
              }
            }}
          >
            {file ? (
              <div>
                {file.name}
                <button 
                  type="button" 
                  onClick={() => setFile(null)} 
                  style={{ marginLeft: '10px', cursor: 'pointer', background: 'red', color: 'white', border: 'none', borderRadius: '5px', padding: '2px 5px', zIndex: 100 }}
                >
                  Fjern
                </button>
              </div>
            ) : 'Træk og slip en fil her eller klik for at vælge'}
            {!file && <input 
              type="file" 
              name="file" 
              accept=".pdf, .jpg, .jpeg, .png, .heic" 
              onChange={(e) => setFile(e.target.files[0])} 
              required 
              style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }} 
            />}
          </div>
          <input className={ModalStyles.modalInput} style={{fontFamily: 'OmnesBold'}} type="text" name="titel" placeholder="Titel" value={titel} onChange={(e) => setTitel(e.target.value)} required/>
          <input className={ModalStyles.modalInput} type="text" name="beskrivelse" placeholder="Beskrivelse" value={beskrivelse} onChange={(e) => setBeskrivelse(e.target.value)} />
          <div className={SwitcherStyles.checkboxContainer}>
            <label className={SwitcherStyles.switch} htmlFor="begrænsBrugerAdgang">
              <input type="checkbox" id="begrænsBrugerAdgang" name="begrænsBrugerAdgang" className={SwitcherStyles.checkboxInput} checked={begrænsBrugerAdgang} onChange={(e) => setBegrænsBrugerAdgang(e.target.checked)} />
              <span className={SwitcherStyles.slider}></span>
            </label>
            <b>Begræns bruger-adgang</b>
          </div>
          {begrænsBrugerAdgang && (
          <div className={Styles.dropdownContainer}>
            <div id="brugerAdgang" className={`${Styles.dropdown}`}>
              {brugere.map((bruger) => (
                <div 
                  key={bruger._id} 
                  className={`${Styles.option} ${brugerAdgang.includes(bruger._id) ? Styles.selected : ''}`} 
                  onClick={() => {
                    if (brugerAdgang.includes(bruger._id)) {
                      setBrugerAdgang(brugerAdgang.filter(id => id !== bruger._id));
                    } else {
                      setBrugerAdgang([...brugerAdgang, bruger._id]);
                    }
                  }}
                >
                  {bruger.navn}
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
            <b>Kræv samtykke</b>
          </div>
          {kraevSamtykke && <p style={{marginBottom: '15px'}}>Brugere vil blive bedt om samtykke til dokumentets indhold.</p>}
          <button style={{marginTop: '15px'}} className={Styles.fullWidthButton} type="submit">Upload dokument</button>
        </form>
    </Modal>
  )
}

export default UploadDokumentModal