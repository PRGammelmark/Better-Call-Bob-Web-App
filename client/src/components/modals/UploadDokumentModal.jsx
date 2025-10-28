import React, { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import Styles from './UploadDokument.module.css'
import SwitcherStyles from '../../pages/Switcher.module.css'
import ModalStyles from '../Modal.module.css'
import BarLoader from '../loaders/BarLoader.js'
import axios from 'axios'
import { useAuthContext } from '../../hooks/useAuthContext'
import { useNewDocument } from '../../context/NewDocumentContext'
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from '../../firebase.js'
import {v4} from 'uuid'
import MoonLoader from "react-spinners/MoonLoader";

const UploadDokumentModal = (props) => {

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
const [isUploading, setIsUploading] = useState(false)

useEffect(() => {
  axios.get(`${import.meta.env.VITE_API_URL}/brugere`)
  .then(res => {
    setBrugere(res.data.filter(bruger => !bruger.isAdmin));
  })
  .catch(error => console.log(error))
}, [])


async function uploadDokument(e) {
  e.preventDefault();
  if (!file) return alert("Vælg en fil først!");

  setIsUploading(true)

  const storageRef = ref(storage, `dokumenter/${file.name + v4()}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log(`Upload er ${progress}% færdig`);
    },
    (error) => {
      console.error("Fejl ved upload:", error);
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((filURL) => {
        console.log("Fil tilgængelig på:", filURL);

        axios.post(`${import.meta.env.VITE_API_URL}/dokumenter-uploads`, {
          titel,
          beskrivelse,
          filURL,
          kraevSamtykke,
          begraensAdgang: begrænsBrugerAdgang,
          brugerAdgang,
        }, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        })
        .then(() => {

          let brugereMedAdgang = brugere.filter(bruger => brugerAdgang.includes(bruger._id));
          let brugereMedAdgangUdenMig = brugereMedAdgang.filter(bruger => bruger._id !== user._id);
          nyNotifikation(user, brugereMedAdgangUdenMig, "Du har fået adgang til et nyt dokument", `Du har fået adgang til et nyt dokument på Better Call Bob. Gå ind på app'en for at se detaljerne.`, `/dokumenter`)
          
          setIsUploading(false)
          setRefetchDocuments(!refetchDocuments);
          setFile(null); 
          setTitel(""); 
          setBeskrivelse(""); 
          setKraevSamtykke(false)
          setBegrænsBrugerAdgang(false); 
          setBrugerAdgang([])
          setÅbnUploadDokumentModal(false);
        })
        .catch(error => console.log(error));
      });
    }
  );
}



  return (
    <Modal trigger={props.trigger} setTrigger={props.setTrigger} onClose={() => {setFile(null); setTitel(""); setBeskrivelse(""); setKraevSamtykke(false); setBegrænsBrugerAdgang(false); setBrugerAdgang([])}}>
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
          <div className={Styles.buttonLoadingDiv}>
            <button className={`${Styles.fullWidthButton} ${isUploading && Styles.disabledButton}`} type="submit" disabled={isUploading}>{isUploading ? <div className={Styles.buttonContent}>Uploader ... <MoonLoader color="#222222" loading={true} size={20} aria-label="Loading Spinner" data-testid="loader"/></div>: <div className={Styles.buttonContent}>Upload dokument</div>}</button>
          </div>
        </form>
    </Modal>
  )
}

export default UploadDokumentModal