import React, { useState, useEffect, useReducer, useRef } from 'react'
import ÅbenOpgaveCSS from './ÅbenOpgave.module.css'
import PageAnimation from '../components/PageAnimation'
import { useParams, useNavigate } from 'react-router-dom'
import BackIcon from "../assets/back.svg"
import axios from "axios"
import dayjs from 'dayjs'
import { useAuthContext } from '../hooks/useAuthContext'
import Modal from '../components/Modal.jsx'
import OpgaveStatus from '../components/OpgaveStatus.jsx'
import ÅbenOpgaveCalendar from '../components/traditionalCalendars/ÅbenOpgaveCalendar.jsx'
import { useTaskAndDate } from '../context/TaskAndDateContext.jsx'
import { useBesøg } from '../context/BesøgContext.jsx'
import ModalCSS from '../components/Modal.module.css'
import OpretRegningModal from '../components/modals/OpretRegningModal.jsx'
import OpretFakturaModal from '../components/modals/OpretFakturaModal.jsx'
import BetalViaMobilePayAnmodningModal from '../components/modals/betalingsflows/BetalViaMobilePayAnmodningModal.jsx'
import BetalViaMobilePayQRModal from '../components/modals/betalingsflows/BetalViaMobilePayQRModal.jsx'
import BetalViaFakturaModal from '../components/modals/betalingsflows/BetalViaFakturaModal.jsx'
import VælgMobilePayBetalingsmetode from '../components/modals/VælgMobilePayBetalingsmetode.jsx'
import useBetalMedFaktura from '../hooks/useBetalMedFaktura.js'
import CloseIcon from "../assets/closeIcon.svg"
import AddPostering from '../components/modals/AddPostering.jsx'
import AfslutUdenBetaling from '../components/modals/AfslutUdenBetaling.jsx'
import Postering from '../components/Postering.jsx'
import SwitcherStyles from './Switcher.module.css'
import { ImagePlus, RotateCcw, Trash2, Edit, ArrowRightToLine, Navigation, Mail, Phone, MessageCircle, Handshake, CircleCheck, ArrowLeftRight, Clock5, UserRoundPlus, Send, CircleAlert, Archive, CalendarClock, ChevronDown, BotOff } from 'lucide-react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from '../firebase.js'
import imageCompression from 'browser-image-compression';
import {v4} from 'uuid'
import MoonLoader from "react-spinners/MoonLoader";
import VisBilledeModal from '../components/modals/VisBillede.jsx'
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import RedigerKundeModal from '../components/modals/RedigerKundeModal.jsx'
import PDFIcon from '../assets/pdf-logo.svg'
import * as beregn from '../utils/beregninger.js'
import PopUpMenu from '../components/basicComponents/PopUpMenu.jsx'
import { useOpgave } from '../context/OpgaveContext.jsx'
import SaetReminderModal from '../components/modals/SaetReminderModal.jsx'

const ÅbenOpgave = () => {
    
    const navigate = useNavigate();
    const { opgaveID } = useParams();
    const {user} = useAuthContext();
    
    if (!user) {
        return
    }

    const selectRef = useRef(null);

    // state managers
    const { egneLedigeTider, alleLedigeTider, egneBesøg, alleBesøg, setEgneLedigeTider, setEgneBesøg, refetchLedigeTider, refetchBesøg, setRefetchLedigeTider, setRefetchBesøg, setAlleLedigeTider, setAlleBesøg, userID } = useBesøg();
    const { opgave, setOpgave, refetchPosteringer } = useOpgave();
    const [kunde, setKunde] = useState({});
    const [opdaterKunde, setOpdaterKunde] = useState(false);
    const [loading, setLoading] = useState(true);
    const [opgaveBeskrivelse, setOpgaveBeskrivelse] = useState(null);
    const [updateOpgave, setUpdateOpgave] = useState(false);
    const [status, setStatus] = useState("");
    const [brugere, setBrugere] = useState(null);
    const [nuværendeAnsvarlige, setNuværendeAnsvarlige] = useState(null);
    const [timer, setTimer] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openCommentModalID, setOpenCommentModalID] = useState(null);
    const [openPosteringModalID, setOpenPosteringModalID] = useState(null);
    const [editedComment, setEditedComment] = useState("");
    const [editedPostering, setEditedPostering] = useState("");
    const [posteringer, setPosteringer] = useState("");
    const [kommentar, setKommentar] = useState("");
    const [kommentarer, setKommentarer] = useState([]);
    const [færdiggjort, setFærdiggjort] = useState(false);
    const [opgaveAfsluttet, setOpgaveAfsluttet] = useState(opgave && opgave.opgaveAfsluttet)
    const [åbnOpretRegningModal, setÅbnOpretRegningModal] = useState(false);
    const [åbnOpretFakturaModal, setÅbnOpretFakturaModal] = useState(false);
    const [ledigeTider, setLedigeTider] = useState(null)
    const [planlagteBesøg, setPlanlagteBesøg] = useState(null)
    const [triggerPlanlagteBesøg, setTriggerPlanlagteBesøg] = useState(false)
    const [smsSendtTilKundenOmPåVej, setSmsSendtTilKundenOmPåVej] = useState("")
    const [sætPåmindelseSMS, setSætPåmindelseSMS] = useState(false)
    const [smsPåmindelseIndstillet, setSmsPåmindelseIndstillet] = useState("")
    const [triggerLedigeTiderRefetch, setTriggerLedigeTiderRefetch] = useState(false)
    const [opgaveLøstTilfredsstillende, setOpgaveLøstTilfredsstillende] = useState(false)
    const [allePosteringerUdfyldt, setAllePosteringerUdfyldt] = useState(false)
    const [vilBetaleMedMobilePay, setVilBetaleMedMobilePay] = useState(false)
    const { chosenTask, setChosenTask } = useTaskAndDate();
    const initialDate = opgave && opgave.onsketDato ? dayjs(opgave.onsketDato) : null;
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [openDialog, setOpenDialog] = useState(false)
    const [eventData, setEventData] = useState(null)
    const [opgaveTilknyttetBesøg, setOpgaveTilknyttetBesøg] = useState(null)
    const [aktueltBesøg, setAktueltBesøg] = useState(null)
    const [sletOpgaveModal, setSletOpgaveModal] = useState(false)
    const [genåbnOpgaveModal, setGenåbnOpgaveModal] = useState(false)
    const [sletOpgaveInput, setSletOpgaveInput] = useState("")
    const [redigerKundeModal, setRedigerKundeModal] = useState(false) 
    const [isEnglish, setIsEnglish] = useState(false)
    const [nyeKundeinformationer, setNyeKundeinformationer] = useState(null)
    const [tvingAfslutOpgaveModal, setTvingAfslutOpgaveModal] = useState(false)
    const [visInklMoms, setVisInklMoms] = useState(true)
    const [dragging, setDragging] = useState(false)
    const [opgaveBilleder, setOpgaveBilleder] = useState([])
    const [uploadingImages, setUploadingImages] = useState([])
    const [åbnBillede, setÅbnBillede] = useState("")
    const [openReminderModal, setOpenReminderModal] = useState(false)
    const [existingReminder, setExistingReminder] = useState(null)
    const [imageIndex, setImageIndex] = useState(null)
    const [isCompressingVideo, setIsCompressingVideo] = useState(false)
    const [openBetalViaMobilePayAnmodningModal, setOpenBetalViaMobilePayAnmodningModal] = useState(false)
    const [openBetalViaMobilePayScanQRModal, setOpenBetalViaMobilePayScanQRModal] = useState(false)
    const [openBetalViaFakturaModal, setOpenBetalViaFakturaModal] = useState(false)
    const [openVælgMobilePayBetalingsmetodeModal, setOpenVælgMobilePayBetalingsmetodeModal] = useState(false)

    useEffect(() => {
        if(kunde?.CVR || kunde?.virksomhed){
            setVisInklMoms(false)
        } else {
            setVisInklMoms(true)
        }
    }, [kunde])
    
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/brugere`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setBrugere(res.data)
        })
        .catch(error => console.log(error))
    }, [])
    
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/ledige-tider`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                setLedigeTider(res.data)
                const filterEgneLedigeTider = res.data.filter((ledigTid) => ledigTid.brugerID === userID)
                setEgneLedigeTider(filterEgneLedigeTider)
            })
            .catch(error => console.log(error))
    }, [triggerLedigeTiderRefetch])

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                setAlleBesøg(res.data)
                const filterEgneBesøg = res.data.filter(opgave => opgave.brugerID === userID)
                setEgneBesøg(filterEgneBesøg)
                const filterOpgaveBesøg = res.data.filter(opgave => opgave.opgaveID === opgaveID);
                setPlanlagteBesøg(filterOpgaveBesøg);
            })
            .catch(error => console.log(error))
    }, [triggerPlanlagteBesøg])

    const submitKommentar = () => {
        
        const kommentarObject = {
            kommentarIndhold: kommentar,
            brugerID: userID,
            opgaveID: opgaveID
        }

        axios.post(`${import.meta.env.VITE_API_URL}/kommentarer/`, kommentarObject, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            } 
        })
        .then(res => {
            setKommentar("");
            axios.get(`${import.meta.env.VITE_API_URL}/kommentarer`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                const filteredKommentarer = res.data.filter(kommentar => kommentar.opgaveID === opgaveID);
                setKommentarer(filteredKommentarer);
            })
            .catch(error => console.log(error))
            })
            .catch(error => console.log(error))
    }

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/kommentarer`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            const filteredKommentarer = res.data.filter(kommentar => kommentar.opgaveID === opgaveID);
            setKommentarer(filteredKommentarer);
        })
        .catch(error => console.log(error))
    }, [])

    useEffect(() => {
        if (opgave && opgave.onsketDato) {
          setSelectedDate(dayjs(opgave.onsketDato));
        }
      }, [opgave]);

    // Fetch reminders for this opgave
    useEffect(() => {
        const fetchReminder = async () => {
            try {
                const brugerID = user.id || user._id;
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/reminders/bruger/${brugerID}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const reminder = res.data.find(r => r.opgaveID === opgaveID && r.status === 'pending');
                setExistingReminder(reminder || null);
            } catch (e) {
                // ignore
            }
        };
        if (user?.token && opgaveID) fetchReminder();
    }, [user, opgaveID]);

    // useEffect(() => {
    //     if(opgave?.kundeID){
    //         axios.get(`${import.meta.env.VITE_API_URL}/kunder/${opgave?.kundeID}`, {
    //             headers: {
    //                 'Authorization': `Bearer ${user.token}`
    //             }
    //         })
    //         .then(res => {
    //             setKunde(res.data)
    //         })
    //         .catch(error => console.log(error))
    //     }
    // }, [opgave, opdaterKunde])
    
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setOpgave(res.data);
            setKunde(res.data.kunde)
            setNyeKundeinformationer(res.data);
            setOpgaveBeskrivelse(res.data.opgaveBeskrivelse);
            setStatus(res.data.status);
            setNuværendeAnsvarlige(res.data.ansvarlig)
            setFærdiggjort(res.data.markeretSomFærdig);
            setOpgaveAfsluttet(res.data.opgaveAfsluttet);
            setIsEnglish(res.data.isEnglish)
            setOpgaveBilleder(res.data.opgaveBilleder)
            setLoading(false);
        })
        .catch(error => console.log(error))
    }, [updateOpgave])

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setChosenTask(res.data);
        })
        .catch(error => console.log(error))
    }, [nuværendeAnsvarlige])

    const getBrugerName = (brugerID) => {
        const bruger = brugere && brugere.find(user => (user?._id || user?.id) === brugerID);
        return bruger ? bruger.navn : 'Unknown User';
    };

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/posteringer`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            const filteredPosteringer = res.data.filter(postering => postering.opgaveID === opgaveID);
            setPosteringer(filteredPosteringer);
        })
        .catch(error => console.log(error))
    }, [openModal, openPosteringModalID, kunde, refetchPosteringer])

    const refetchLocalPosteringer = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/posteringer/${postering._id}`, {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          const filteredPosteringer = res.data.filter(postering => postering.opgaveID === opgaveID);
          setPosteringer(filteredPosteringer);
        } catch (err) {
          console.error("Kunne ikke refetche postering:", err);
        }
    };

    if (loading) {
        return (
            null
        );
    }

    function opdaterOpgavebeskrivelse(e){
        e.preventDefault();
        setOpgaveBeskrivelse(e.target.value);
        const syncOpgaveBeskrivelse = e.target.value;

        // timer to prevent constant db calls
        if (timer) {
            clearTimeout(timer)
        }

        const newTimer = setTimeout(() => {
            indsendOpgavebeskrivelse(syncOpgaveBeskrivelse);
        }, 500);

        setTimer(newTimer);
    }

    function indsendOpgavebeskrivelse (x) {    
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}/opdaterOpgavebeskrivelse`, {
            opgaveBeskrivelse: x,
            ansvarlige: nuværendeAnsvarlige
        }, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => console.log(res.data))
        .catch(error => console.log(error))
    }

    function opdaterOpgavestatus (e) {
        e.preventDefault();
        setStatus(e.target.value);
        if(e.target.value === "Afventer svar"){
            setSætPåmindelseSMS(true);
        } else {
            setSætPåmindelseSMS(false);
        }
        
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
            status: e.target.value
        },{
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            console.log(res.data)
        })
        .catch(error => console.log(error))
    }

    const conditionalStyles = {
        backgroundColor: status === "Dato aftalt" ? 'rgba(89, 191, 26, 0.20)' : status === "Afventer svar" ? 'rgba(224, 227, 50, 0.25)' : status === "afvist" ? 'rgba(193, 26, 57, 0.25)' : 'white',
        color: status === "Dato aftalt" ? 'rgba(89, 191, 26, 1)' : status === "Afventer svar" ? 'rgba(179, 116, 0, 0.85)' : status === "afvist" ? 'rgba(193, 26, 57, 1)' : '#59bf1a',
        boxShadow: status === "Dato aftalt" ? 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(89, 191, 26, 0.6) 0px 0px 0px 1px' : status === "Afventer svar" ? 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(179, 116, 0, 0.26) 0px 0px 0px 1px' : status === "afvist" ? 'rgba(193, 26, 57, 0.16) 0px 10px 36px 0px, rgba(193, 26, 57, 0.46) 0px 0px 0px 1px' : 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(89, 191, 26, 0.6) 0px 0px 0px 1px'
    }

    function tildelAnsvar(e){
        e.preventDefault();

        const nyAnsvarligId = e.target.value;
        const nyAnsvarlig = brugere && brugere.find(ansvarlig => ansvarlig._id === nyAnsvarligId);
    
        if (nyAnsvarlig) {
            
            const isAlreadyResponsible = nuværendeAnsvarlige.some(ansvarlig => ansvarlig._id === nyAnsvarlig._id);
        
            if (isAlreadyResponsible) {
                console.log("Denne person er allerede ansvarlig.");
                return; // Exit the function if already responsible
            }

            const opdateretAnsvarlige = [...nuværendeAnsvarlige, nyAnsvarlig];
        
            axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}/tilfoejAnsvarlig`, {
                ansvarlig: nyAnsvarlig,
            }, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                setNuværendeAnsvarlige(opdateretAnsvarlige);
                axios.post(`${import.meta.env.VITE_API_URL}/send-email`, {
                    to: nyAnsvarlig.email,
                    subject: "Du har fået tildelt en ny opgave",
                    body: "Du har fået tildelt en ny opgave hos Better Call Bob.\n\nOpgaveinformationer:\n\nKundens navn: " + kunde?.navn + "\n\nAdresse: " + kunde?.adresse + "\n\nOpgavebeskrivelse: " + opgave.opgaveBeskrivelse + "\n\nGå ind på app'en for at se opgaven.\n\n//Better Call Bob",
                    html: "<p>Du har fået tildelt en ny opgave hos Better Call Bob.</p><b>Opgaveinformationer:</b><br />Kundens navn: " + kunde?.navn + "<br />Adresse: " + kunde?.adresse + "<br />Opgavebeskrivelse: " + opgave.opgaveBeskrivelse + "</p><p>Gå ind på <a href='https://app.bettercallbob.dk'>app'en</a> for at se opgaven.</p><p>//Better Call Bob</p>"
                })
                .then(res => console.log(res.data))
                .catch(error => console.log(error))
            })
            .catch(error => console.log(error));
        }
    }

    function fjernAnsvarlig(ansvarligDerSkalFjernes){
        const opdateredeAnsvarlige = nuværendeAnsvarlige.filter(ansvarlig => ansvarlig !== ansvarligDerSkalFjernes);

        if (window.confirm("Er du sikker på, at du vil fjerne " + ansvarligDerSkalFjernes.navn + " fra opgaven?")) {
            axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}/fjernAnsvarlig`, {
                ansvarlig: ansvarligDerSkalFjernes,
            }, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                setNuværendeAnsvarlige(opdateredeAnsvarlige);
            })
            .catch(error => console.log(error));
        }
    }

    function sletKommentar(kommentarID){
        axios.delete(`${import.meta.env.VITE_API_URL}/kommentarer/${kommentarID}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            setKommentarer(prevKommentarer => 
                prevKommentarer.filter(kommentar => kommentar._id !== kommentarID)
            );
        })
        .catch(error => {
            console.error("Der opstod en fejl ved sletning af kommentaren:", error);
        });
    }

    function editKommentar(kommentarID) {

        const opdateretKommentar = {
            kommentarIndhold: editedComment
        }

        axios.patch(`${import.meta.env.VITE_API_URL}/kommentarer/${kommentarID}`, opdateretKommentar, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            console.log("Kommentar opdateret:", response.data);
            setOpenCommentModalID(null)
            setEditedComment("");
        })
        .catch(error => {
            console.error("Der opstod en fejl ved opdatering af kommentaren:", error);
        });
    }

    function færdiggørOpgave () {

        const færdiggør = {
            markeretSomFærdig: true
        }

        axios.get(`${import.meta.env.VITE_API_URL}/besoeg`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            const planlagteBesøgForOpgave = res.data.filter(besøg => besøg.opgaveID === opgaveID);

            const fremtidigeBesøg = planlagteBesøgForOpgave.some((besøg) => 
                dayjs(besøg.datoTidFra).isAfter(dayjs())
            );
            
            const proceed = !fremtidigeBesøg || window.confirm(
                "Du eller andre har planlagt fremtidige besøg på denne opgave. Er du sikker på, at du vil færdiggøre den alligevel?"
            );
            
            if (proceed) {
                axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, færdiggør, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                .then(response => {
                    setFærdiggjort(true);
                })
                .catch(error => console.log(error));
            }
            
        })
        .catch(error => console.log(error))
    }

    function åbnAfsluttetOpgave () {
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
            markeretSomFærdig: false,
            opgaveAfsluttet: false
        }, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            console.log('Opgave genåbnet:', response.data);
            setUpdateOpgave(!updateOpgave);
        })
        .catch(error => console.log(error))
    }

    function åbnForÆndringer () {
        const genåbnOpgave = {
            markeretSomFærdig: false,
            opgaveAfsluttet: null,
            // fakturaSendt: null,
            // fakturaPDF: null,
            // fakturaPDFUrl: null,
            // fakturaBetalt: null
        }


        if (window.confirm("Opgaven er allerede blevet markeret som afsluttet. Er du sikker på, at du vil genåbne opgaven?")) {
            axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, genåbnOpgave, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(response => {
                setFærdiggjort(false);
                setOpgaveAfsluttet(null);

                axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                .then(res => {
                    setOpgave(res.data);
                })
                .catch(error => console.log(error))
            })
            .catch(error => console.log(error))
        }
    }

    // function openPDFFromDatabase(base64PDF, fileName = 'faktura.pdf') {
    //     if (opgave && opgave.fakturaPDFUrl) {
    //         const baseURL = import.meta.env.VITE_API_URL;
    //         window.open(`${baseURL}${opgave.fakturaPDFUrl}`, '_blank');
    //     }
    // }

    function sletOpgave() {
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgave._id}`, {
            isDeleted: dayjs().toISOString(),
            markeretSomFærdig: true,
            ansvarlig: []
        }, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            console.log('Opgave slettet:', response.data);
            const posteringerPåDenneOpgave = posteringer && posteringer.filter(postering => postering.opgaveID === opgave._id);
            const besøgPåDenneOpgave = alleBesøg && alleBesøg.filter(besøg => besøg.opgaveID === opgave._id)
            const kommentarerPåDenneOpgave = kommentarer && kommentarer.filter(kommentar => kommentar.opgaveID === opgave._id)
            
            // Slet posteringer
            if(posteringerPåDenneOpgave.length > 0) {
                posteringerPåDenneOpgave.forEach(postering => {
                axios.delete(`${import.meta.env.VITE_API_URL}/posteringer/${postering._id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                .then(response => {
                    console.log('Postering slettet:', response.data);
                })
                .catch(error => {
                        console.error('Error deleting postering:', error);
                    });
                })
            }

            // Slet besøg
            if(besøgPåDenneOpgave.length > 0) {
                besøgPåDenneOpgave.forEach(besøg => {
                    axios.delete(`${import.meta.env.VITE_API_URL}/besoeg/${besøg._id}`, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    })
                    .then(response => {
                        console.log('Besøg slettet:', response.data);
                    })
                    .catch(error => {
                            console.error('Error deleting besøg:', error);
                    });
                })
            }

            // Slet kommentarer
            if(kommentarerPåDenneOpgave.length > 0) {
                kommentarerPåDenneOpgave.forEach(kommentar => {
                    axios.delete(`${import.meta.env.VITE_API_URL}/kommentarer/${kommentar._id}`, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    })
                    .then(response => {
                        console.log('Kommentar slettet:', response.data);
                    })
                    .catch(error => {
                        console.error('Error deleting kommentar:', error);
                    });
                })
            }

            navigate(-1)
        })
        .catch(error => {
            console.error('Error deleting opgave:', error);
        });
    }

    function arkiverOpgave() {
        const confirmed = window.confirm("Er du sikker på, at du vil arkivere denne opgave?");
        if (!confirmed) return;

        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgave._id}`, {
            isArchived: new Date().toISOString()
        }, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            console.log('Opgave arkiveret:', response.data);
            navigate(-1);
        })
        .catch(error => {
            console.error('Error archiving opgave:', error);
            alert("Kunne ikke arkivere opgave.");
        });
    }

    function genåbnOpgave() {
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgave._id}`, {
            isDeleted: null,
            markeretSomFærdig: false,
            opgaveAfsluttet: null
        }, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            console.log('Opgave genåbnet:', response.data);
            navigate(-1)
        })
        .catch(error => {
            console.error('Error reopening opgave:', error);
        });
    }

    function fjernAIMarkering() {
        const confirmed = window.confirm("Er du sikker på, at du vil fjerne AI-markeringen fra opgaven og tilknyttede besøg?");
        if (!confirmed) return;

        // Update opgave
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgave._id}`, {
            aiCreated: false
        }, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            console.log('Opgave AI-markering fjernet:', response.data);
            
            // Find all AI-created besøg for this opgave from alleBesøg
            const aiCreatedBesøg = alleBesøg?.filter(besøg => {
                const besøgOpgaveID = typeof besøg.opgaveID === 'object' 
                    ? (besøg.opgaveID?._id || besøg.opgaveID?.id) 
                    : besøg.opgaveID;
                return String(besøgOpgaveID) === String(opgaveID) && besøg.aiCreated === true;
            }) || [];
            
            // Update all AI-created besøg
            if (aiCreatedBesøg.length > 0) {
                const updatePromises = aiCreatedBesøg.map(besøg => 
                    axios.patch(`${import.meta.env.VITE_API_URL}/besoeg/${besøg._id}`, {
                        aiCreated: false
                    }, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    })
                );
                
                Promise.all(updatePromises)
                    .then(() => {
                        console.log('Alle besøg AI-markeringer fjernet');
                        setUpdateOpgave(!updateOpgave);
                        setTriggerPlanlagteBesøg(!triggerPlanlagteBesøg);
                    })
                    .catch(error => {
                        console.error('Error removing AI marking from besøg:', error);
                        alert("Kunne ikke fjerne AI-markering fra alle besøg.");
                    });
            } else {
                setUpdateOpgave(!updateOpgave);
            }
        })
        .catch(error => {
            console.error('Error removing AI marking from opgave:', error);
            alert("Kunne ikke fjerne AI-markering fra opgaven.");
        });
    }

    function redigerKunde(e) {
        e.preventDefault()

        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgave._id}`, {
            navn: nyeKundeinformationer.navn,
            adresse: nyeKundeinformationer.adresse,
            telefon: nyeKundeinformationer.telefon,
            email: nyeKundeinformationer.email,
            virksomhed: nyeKundeinformationer.virksomhed,
            CVR: nyeKundeinformationer.CVR,
            isEnglish: nyeKundeinformationer.isEnglish
        }, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            console.log('Kunde opdateret.');
            setOpgave({...opgave, ...nyeKundeinformationer})
            setRedigerKundeModal(false)
        })
        .catch(error => {
            console.error('Error updating customer:', error);
        });
    }

    function afslutOpgave() {
        if (window.confirm("Du er ved at afslutte opgaven. Har du oprettet fakturaen for denne opgave, og modtaget betaling?")) {
            axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgave._id}`, {
                opgaveAfsluttet: dayjs().toISOString()
            }, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(response => {
                console.log('Opgave afsluttet:', response.data);
                navigate(-1)
            })
            .catch(error => {
                console.error('Fejl ved afslutning af opgave:', error);
            });
        }
    }

    function refetchOpgave() {
        setUpdateOpgave(!updateOpgave)
        refetchLocalPosteringer();
    }

    function informerKundenOmPåVej() {
        const smsData = {
            "messages": [
                {
                    "to": `${kunde?.telefon}`,
                    "countryHint": "45",
                    "respectBlacklist": true,
                    "text": `${kunde.engelskKunde ? `Dear ${kunde.navn},\n\nWe would like to inform you that our employee, ${getBrugerName(userID)}, is now on their way to you in order to help you with your task. We will be at your place in a moment.\n\nWe look forward to helping you! \n\nBest regards,\nBetter Call Bob}` : `Kære ${kunde.navn},\n\nVi vil blot informere dig om, at vores medarbejder ${getBrugerName(userID)} nu er på vej ud til dig for at løse din opgave. Vi er hos dig inden længe.\n\nVi glæder os til at hjælpe dig! \n\nDbh.,\nBetter Call Bob`}`,
                    "from": "Bob",
                    "flash": false,
                    "encoding": "gsm7"
                }
            ]
        }

        // REGISTRER HVORNÅR SIDSTE SMS ER SENDT
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgave._id}`, {
            sidsteSMSSendtTilKundenOmPåVej: dayjs().toISOString()
        }, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })

        // SEND SMS
        axios.post(`${import.meta.env.VITE_API_URL}/sms/send-sms`, { smsData }, {
            headers: {
                'Authorization': `Bearer ${user.token}` // If needed for your server authentication
            }
        })
        .then(response => {
            setSmsSendtTilKundenOmPåVej("SMS sendt kl. " + dayjs().format("HH:mm"))
        })
        .catch(error => {
            setSmsSendtTilKundenOmPåVej("Fejl: Kunne ikke sende SMS til kunden.");
            console.log(error);
        });
    }

    function indstilPåmindelseSMS(timer) {
        const smsData = {
            "messages": [
                {
                    "to": `${user.telefon}`,
                    "countryHint": "45",
                    "respectBlacklist": true,
                    "text": `Automatisk ${timer} timers reminder: Følg op på kontakt til kunde ${kunde?.navn}.\n\nKontaktinfo:\n\nTelefon: ${kunde?.telefon}\nE-mail: ${kunde?.email}${kunde?.virksomhed && "\nVirksomhed: " + kunde?.virksomhed}\n\nDbh.,\nBetter Call Bob`,
                    "from": "BobReminders",
                    "sendTime": `${dayjs().add(timer - 1, 'hour').format('YYYY-MM-DDTHH:mm:ss') + "Z"}`,
                    "flash": false,
                    "encoding": "gsm7"
                }
            ]
        }

        // SEND SMS
        axios.post(`${import.meta.env.VITE_API_URL}/sms/send-sms`, { smsData }, {
            headers: {
                'Authorization': `Bearer ${user.token}` // If needed for your server authentication
            }
        })
        .then(response => {
            setSmsPåmindelseIndstillet("Du får en påmindelse om " + timer + " timer ⏱️")
        })
        .catch(error => {
            setSmsPåmindelseIndstillet("Fejl: Kunne ikke indstille påmindelsen. Prøv igen.");
            console.log(error);
        });
    }

    function åbnKortLink() {
        const appleMapsUrl = `maps://maps.apple.com/?q=${kunde?.adresse}, Denmark`;
        const googleMapsUrl = `https://maps.google.com/?q=${kunde?.adresse}, Denmark`;
      
        // Tjek om det er en iOS-enhed
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          window.location.href = appleMapsUrl;
        } else {
          window.location.href = googleMapsUrl;
        }
    }

    const handleFileDrop = async (e) => {
        e.preventDefault();
        setDragging(false);
    
        const droppedFiles = e.dataTransfer.files;
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'application/pdf'];
    
        const validFiles = Array.from(droppedFiles).filter(file =>
            allowedTypes.includes(file.type)
        );

        if(opgaveBilleder.length + validFiles.length > 10){
            window.alert("Du må højst uploade 10 billeder.")
            return
        }

        if (validFiles.length > 0) {
            let compressedFiles = [];
            const imageFiles = validFiles.filter(file => ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'].includes(file.type));
            const pdfFiles = validFiles.filter(file => file.type === 'application/pdf');
            
            for (let file of imageFiles) {
              try {
                // Compress image
                const compressedFile = await imageCompression(file, {
                  maxSizeMB: 1, // Adjust as needed (1MB is a good starting point)
                  maxWidthOrHeight: 1000, // You can change this to a specific size you want
                  useWebWorker: true,
                });
                compressedFiles.push(compressedFile);
              } catch (error) {
                console.error("Image compression failed", error);
              }
            }
            
            // Add PDF files without compression
            compressedFiles.push(...pdfFiles);
            
            try {
                // Prepare to upload all files
                const uploadedFilesPromises = compressedFiles.map((file) => {
                    const storageRef = ref(storage, `opgaver/${file.name + v4()}`);
                    const uploadTask = uploadBytesResumable(storageRef, file);

                    setUploadingImages(prevUploadingImages => [...prevUploadingImages, file]);
            
                    return new Promise((resolve, reject) => {
                        uploadTask.on(
                            "state_changed",
                            (snapshot) => {
                                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            },
                            (error) => {
                                reject(error); // Reject if there's an error uploading
                            },
                            () => {
                                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                    resolve(downloadURL); // Resolve with the download URL
                                });
                                // Remove the last element from the uploadingImages array
                                setUploadingImages(prevUploadingImages => prevUploadingImages.slice(0, -1));
                            }
                        );
                    });
                });
            
                // Wait for all files to upload and get their download URLs
                const downloadURLs = await Promise.all(uploadedFilesPromises);
                let newFileArray = [...opgaveBilleder, ...downloadURLs];
            
                axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                    opgaveBilleder: newFileArray
                }, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                .then(res => {
                    setOpgaveBilleder(newFileArray)
                })
                .catch(error => console.log(error))

            } catch (err) {
                console.log(err);
            }
        }
    }

    const handleFileChange = async (e) => {        
        const selectedFiles = e.target.files;
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
        const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime', 'video/hevc'];
        const allowedPDFTypes = ['application/pdf'];

        const validFiles = Array.from(selectedFiles).filter(file => 
            allowedImageTypes.includes(file.type) || allowedVideoTypes.includes(file.type) || allowedPDFTypes.includes(file.type)
        );

        if(opgaveBilleder.length + validFiles.length > 10){
            window.alert("Du må højst uploade 10 filer til opgaven.")
            return
        }
        
        if (validFiles.length > 0) {
            setUploadingImages(prevUploadingImages => [...prevUploadingImages, ...validFiles]);
            let filesToUpload = [];
        
            // Separate image, video, and PDF files
            const imageFiles = validFiles.filter(file => allowedImageTypes.includes(file.type));
            const videoFiles = validFiles.filter(file => allowedVideoTypes.includes(file.type));
            const pdfFiles = validFiles.filter(file => allowedPDFTypes.includes(file.type));
            
            // Compress image files (if any)
            let compressedFiles = [];
            if(imageFiles.length > 0) {
                for (let file of imageFiles) {
                    try {
                      const compressedFile = await imageCompression(file, {
                        maxSizeMB: 1, // Adjust as needed (1MB is a good starting point)
                        maxWidthOrHeight: 1000, // You can change this to a specific size you want
                        useWebWorker: true,
                      });
                      compressedFiles.push(compressedFile);
                    } catch (error) {
                      console.error("Image compression failed", error);
                    }
                  }
            }

            // Compress video files (if any)
            let compressedVideos = [];
            if (videoFiles.length > 0) {
                setIsCompressingVideo(true)
                console.log("Video file detected.")
                const ffmpeg = new FFmpeg({ log: true }); // Create an FFmpeg instance
                console.log("Created FFMPEG.")
                await ffmpeg.load(); // Load FFmpeg (this may take a moment)
                console.log("FFMPEG loaded.")

                for (let file of videoFiles) {
                    try {
                        const fileName = file.name;
                        console.log(fileName)
                        const videoData = await fetchFile(file); // Fetch the video data
                        // Write the video file to the FFmpeg virtual file system
                        await ffmpeg.writeFile(fileName, videoData);
                        console.log("Compressing file ...")

                        const outputFileName = fileName.replace(/\.[^/.]+$/, '') + '_compressed_video.mp4';
                        
                        // Compress the video (e.g., reducing the resolution and bitrate)
                        await ffmpeg.exec([
                            '-i', fileName,
                            '-vcodec', 'libx264', 
                            '-crf', '30', 
                            '-b:v', '1000k', 
                            '-preset', 'ultrafast', 
                            '-acodec', 'copy',
                            outputFileName
                        ]);

                        const compressedVideo = await ffmpeg.readFile(outputFileName);
                        const compressedFile = new Blob([compressedVideo.buffer], { type: 'video/mp4', name: outputFileName });
                        compressedVideos.push(compressedFile);
                    } catch (error) {
                        console.error("Video compression failed", error);
                        window.alert(`Noget gik galt under behandling af "${file.name}". 
                            Prøv igen – du kan evt. også prøve at gemme videoen i et andet filformat.`);
                    } finally {
                        setIsCompressingVideo(false)
                    }
                }
            }

            // Combine compressed images, videos, and PDFs for upload
            filesToUpload = [...compressedFiles, ...compressedVideos, ...pdfFiles];
            console.log(filesToUpload)
            
            try {
                // Prepare to upload all files
                const uploadedFilesPromises = filesToUpload.map((file) => {
                    const storageRef = ref(storage, `opgaver/${file.type + v4()}`);
                    const uploadTask = uploadBytesResumable(storageRef, file);
            
                    return new Promise((resolve, reject) => {
                        uploadTask.on(
                            "state_changed",
                            (snapshot) => {
                                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            },
                            (error) => {
                                reject(error); // Reject if there's an error uploading
                            },
                            () => {
                                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                    resolve(downloadURL); // Resolve with the download URL
                                });
                            }
                        );
                    });
                });
            
                // Wait for all files to upload and get their download URLs
                const downloadURLs = await Promise.all(uploadedFilesPromises);
                
                // Update database with most recent information
                axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                .then(res => {
                    let nuværendeOpgaveMedier = res.data.opgaveBilleder;
                    let nyeOpgaveMedier = [...nuværendeOpgaveMedier, ...downloadURLs];

                    axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                        opgaveBilleder: nyeOpgaveMedier
                    }, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    })
                    .then(res => {
                        setUploadingImages(prevUploadingImages => 
                            prevUploadingImages.slice(0, prevUploadingImages.length - validFiles.length)
                        );
                        setOpgaveBilleder(nyeOpgaveMedier)
                    })
                    .catch(error => console.log(error))
                })
                .catch(error => console.log(error))
            } catch (err) {
                console.log(err);
            }
        }
    }

    const handleDeleteFile = async (medie, index) => {
        if(!window.confirm("Er du sikker på, at du vil slette dette medie?")){
            return
        }
        
        const storage = getStorage();
        const fileRef = ref(storage, medie); // Reference til filen i Firebase
    
        // Find the index of the image URL in the opgaveBilleder array
        // const index = opgaveBilleder.indexOf(billede); 
        let nyeOpgaveBilleder = [...opgaveBilleder];
    
        // If the image exists in the array, remove it using splice
        if (index !== -1) {
            nyeOpgaveBilleder.splice(index, 1);
        } else {
            console.log("Medie ikke fundet i opgaveBilleder array");
            return;
        }
    
        try {
            
            // Patch the array of URL's in the database
            axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                opgaveBilleder: nyeOpgaveBilleder
            }, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => {
                setOpgaveBilleder(nyeOpgaveBilleder)
            })
            .catch(error => console.log(error))
            
            // Slet fil fra Firebase Storage
            await deleteObject(fileRef);
            console.log("Medie slettet fra Firebase Storage");
            if(åbnBillede){
                setÅbnBillede(null)
            }
        } catch (error) {
            console.error("Fejl ved sletning af medie:", error);
        }
    }

    const handleTildelAnsvarKlik = () => {
        if (selectRef.current) {
          selectRef.current.focus();
          selectRef.current.click();
        }
    };

    return (
        <div className={ÅbenOpgaveCSS.primærContainer}>
            <PageAnimation>
            <div className={ÅbenOpgaveCSS.tilbageOpgaveSektion}>
                <img src={BackIcon} alt="" onClick={() => navigate(-1)} className={ÅbenOpgaveCSS.tilbageKnap} />
                <div className={ÅbenOpgaveCSS.headerContainer}>
                    <b className={`${ÅbenOpgaveCSS.opgaveIDHeader} ${opgave.isDeleted ? ÅbenOpgaveCSS.slettetOverstregning : null}`}>Opgave #{opgave._id.slice(opgave._id.length - 3, opgave._id.length)} på</b>
                    <h2 className={`${ÅbenOpgaveCSS.adresseHeading} ${opgave.isDeleted ? ÅbenOpgaveCSS.slettetOverstregning : null}`}>{kunde?.adresse}</h2>
                    <div className={ÅbenOpgaveCSS.kortLinkContainer}>
                        {egneBesøg && egneBesøg.some(besøg => besøg.opgaveID === opgaveID && Math.abs(dayjs(besøg.datoTidFra).diff(dayjs(), 'hour')) <= 1) && kunde?.telefon && (smsSendtTilKundenOmPåVej || (opgave.sidsteSMSSendtTilKundenOmPåVej && Math.abs(dayjs(opgave.sidsteSMSSendtTilKundenOmPåVej).diff(dayjs(), 'hour')) <= 1 )) && 
                        <p className={ÅbenOpgaveCSS.smsSendtTekst}>✔︎ {smsSendtTilKundenOmPåVej ? smsSendtTilKundenOmPåVej : "SMS sendt kl. " + dayjs(opgave.sidsteSMSSendtTilKundenOmPåVej).format("HH:mm") + " om, at du er på vej."}</p>}
                        {egneBesøg && egneBesøg.some(besøg => besøg.opgaveID === opgaveID && Math.abs(dayjs(besøg.datoTidFra).diff(dayjs(), 'hour')) <= 1) && kunde?.telefon && !(smsSendtTilKundenOmPåVej || (opgave.sidsteSMSSendtTilKundenOmPåVej && Math.abs(dayjs(opgave.sidsteSMSSendtTilKundenOmPåVej).diff(dayjs(), 'hour')) <= 1 )) &&
                        <button className={ÅbenOpgaveCSS.informerKundenOmPåVej} onClick={() => {informerKundenOmPåVej()}}>Fortæl kunden du er på vej 💬 </button>}
                    </div>
                </div>
                {user.isAdmin && (
                    <>
                        <div className={ÅbenOpgaveCSS.sletOpgaveKnap}>
                            <div className={ÅbenOpgaveCSS.topActionsContainer}>
                                {!færdiggjort && (
                                    <div className={ÅbenOpgaveCSS.statusSelectWrapperDesktop}>
                                        <select
                                            value={status}
                                            onChange={opdaterOpgavestatus}
                                            className={ÅbenOpgaveCSS.opgaveStatusSelect}
                                        >
                                            <option value="Modtaget">Opgave modtaget</option>
                                            <option value="Afventer svar">Afventer svar</option>
                                            <option value="Dato aftalt">Dato aftalt</option>
                                        </select>
                                        <ChevronDown className={ÅbenOpgaveCSS.chevronDownIcon} />
                                    </div>
                                )}
                                {user.isAdmin && (
                                    <PopUpMenu
                                        actions={[
                                        // Fjern AI-markering - vis hvis opgaven er AI-oprettet
                                        opgave.aiCreated && {
                                            icon: <BotOff />,
                                            label: "Fjern AI-markering",
                                            onClick: fjernAIMarkering,
                                        },
                                        // Sæt påmindelse - vis hvis opgaven ikke er slettet og ikke arkiveret
                                        !opgave.isDeleted && !opgave.isArchived && {
                                            icon: <CalendarClock />,
                                            label: existingReminder ? "Rediger påmindelse" : "Opret påmindelse",
                                            onClick: () => setOpenReminderModal(true),
                                        },
                                        // Arkivér opgave - vis hvis ikke slettet, ikke markeret færdig og ikke arkiveret
                                        !opgave.isDeleted && !opgave.markeretSomFærdig && !opgave.opgaveAfsluttet && !opgave.isArchived && {
                                            icon: <Archive />,
                                            label: "Arkivér opgave",
                                            onClick: arkiverOpgave,
                                        },
                                        // Kun vis "Slet" hvis opgaven ikke er slettet og ikke markeret færdig
                                        !opgave.isDeleted && !opgave.markeretSomFærdig && !opgave.opgaveAfsluttet && {
                                            icon: <Trash2 />,
                                            label: "Slet opgave",
                                            onClick: () => setSletOpgaveModal(true),
                                        },
                                        // Kun vis "Genåbn" hvis opgaven er slettet
                                        opgave.isDeleted && {
                                            icon: <RotateCcw />,
                                            label: "Genåbn opgave",
                                            onClick: () => setGenåbnOpgaveModal(true),
                                        },
                                        opgave.opgaveAfsluttet && {
                                            icon: <RotateCcw />,
                                            label: "Genåbn opgave",
                                            onClick: () => setGenåbnOpgaveModal(true),
                                        },
                                        ].filter(Boolean)} // fjerner "false" entries
                                    />
                                )}
                            </div>
                        </div>
                        <Modal trigger={sletOpgaveModal} setTrigger={setSletOpgaveModal}>
                            <h2 className={ÅbenOpgaveCSS.modalHeading}>ADVARSEL!</h2>
                            <p className={ÅbenOpgaveCSS.modalTekst}>
                                <b className={ÅbenOpgaveCSS.bold}>Du er ved at slette denne opgave.</b><br /><br />
                                Alle posteringer, besøg og kommentarer, som er tilknyttet denne opgave, vil blive permanent slettet i processen. Dette kan have konsekvenser for dem, der er tilknyttet som ansvarlige for opgaven.
                                <br />
                                <br />
                                Vil du fortsætte?
                                <br />
                                <br />
                                <b className={ÅbenOpgaveCSS.prefix}>Skriv "SLET" i feltet herunder for at bekræfte handlingen.</b>
                            </p>
                            <input type="text" className={ÅbenOpgaveCSS.modalInput} onChange={(e) => setSletOpgaveInput(e.target.value)}/>
                            {sletOpgaveInput === "SLET" ? <button className={ModalCSS.buttonFullWidth} onClick={sletOpgave}>Slet opgave</button> : null}
                        </Modal>
                        <Modal trigger={genåbnOpgaveModal} setTrigger={setGenåbnOpgaveModal}>
                            <h2 className={ÅbenOpgaveCSS.modalHeading}>Vil du genåbne opgaven?</h2>
                            <p className={ÅbenOpgaveCSS.modalTekst}>
                                Genåbning af opgaven vil gendanne opgaven til den status, den havde, før den blev slettet.
                            </p>
                            <button className={ModalCSS.buttonFullWidth} onClick={genåbnOpgave}>Genåbn opgave</button>
                        </Modal>
                        <SaetReminderModal
                            trigger={openReminderModal}
                            setTrigger={setOpenReminderModal}
                            opgaveID={opgaveID}
                            kundeID={opgave?.kunde?._id || opgave?.kundeID}
                            existingReminder={existingReminder}
                            onSuccess={async () => {
                                try {
                                    const brugerID = user.id || user._id;
                                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/reminders/bruger/${brugerID}`, {
                                        headers: { Authorization: `Bearer ${user.token}` }
                                    });
                                    const reminder = res.data.find(r => r.opgaveID === opgaveID && r.status === 'pending');
                                    setExistingReminder(reminder || null);
                                } catch (e) {
                                    // ignore
                                }
                            }}
                        />
                    </>
                )}

            </div>
            
            <div className={ÅbenOpgaveCSS.opgaveContainer}>
                {færdiggjort ? 
                <div><b className={ÅbenOpgaveCSS.prefix}>Opgavebeskrivelse</b><p className={ÅbenOpgaveCSS.færdiggjortOpgavebeskrivelse}>{opgaveBeskrivelse}</p></div> 
                : 
                <form>
                    <label className={ÅbenOpgaveCSS.label} htmlFor="opgavebeskrivelse">Opgavebeskrivelse</label>
                    <textarea name="opgavebeskrivelse" className={`${ÅbenOpgaveCSS.opgavebeskrivelse} ${opgave?.aiCreated ? ÅbenOpgaveCSS.aiCreatedOpgaveBeskrivelse : ''}`} value={opgaveBeskrivelse} onChange={opdaterOpgavebeskrivelse} ></textarea>
                    <div className={ÅbenOpgaveCSS.infoPillsDiv}>
                        {opgave?.aiCreated && <div className={ÅbenOpgaveCSS.aiCreatedPill}>AI-oprettet</div>}
                        {(kunde?.CVR || kunde?.virksomhed) ? <div className={ÅbenOpgaveCSS.infoPill}>Erhvervskunde</div> : <div className={ÅbenOpgaveCSS.infoPill}>Privatkunde</div>}
                        {kunde?.harStige ? <div className={ÅbenOpgaveCSS.harStige}>Har egen stige 🪜</div> : <div className={ÅbenOpgaveCSS.harIkkeStige}>Har ikke egen stige ❗️</div>}
                        {opgave?.onsketDato && <div className={ÅbenOpgaveCSS.infoPill}>Ønsket start: {dayjs(opgave?.onsketDato).format("DD. MMMM [kl.] HH:mm")}</div>}
                        {opgave.createdAt && <div className={ÅbenOpgaveCSS.infoPill}>Oprettet d. {dayjs(opgave.createdAt).format("DD. MMMM [kl.] HH:mm")}</div>}
                        {opgave.kilde && <div className={ÅbenOpgaveCSS.infoPill}>Kilde: {opgave.kilde}</div>}
                    </div>
                    <div className={ÅbenOpgaveCSS.billederDiv}>
                        {opgaveBilleder?.length > 0 && opgaveBilleder.map((medie, index) => {
                            const isPDF = medie.includes('.pdf') || medie.includes('application/pdf');
                            return (
                                <div key={index} className={ÅbenOpgaveCSS.uploadetBillede} >
                                    {medie.includes("video%") 
                                    ?
                                        <video 
                                            className={ÅbenOpgaveCSS.playVideoPlaceholder} 
                                            src={medie}
                                            autoPlay
                                            muted
                                            playsInline
                                            loop
                                            onClick={() => {setÅbnBillede(medie); setImageIndex(index)}}
                                        />
                                    : isPDF
                                    ?
                                        <img 
                                            src={PDFIcon} 
                                            alt={`PDF ${index + 1}`} 
                                            className={ÅbenOpgaveCSS.imagePreview}
                                            onClick={() => {setÅbnBillede(medie); setImageIndex(index)}}
                                        />
                                    :
                                        <img 
                                            src={medie} 
                                            alt={`Preview ${index + 1}`} 
                                            className={ÅbenOpgaveCSS.imagePreview}
                                            onClick={() => {setÅbnBillede(medie); setImageIndex(index)}}
                                        />
                                    }
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteFile(medie, index)}
                                        className={ÅbenOpgaveCSS.deleteButton}
                                    >
                                        <Trash2 />
                                    </button>
                                </div>
                            )
                        })}

                        {uploadingImages?.length > 0 && uploadingImages.map(image => (
                            <div className={ÅbenOpgaveCSS.spinnerDiv}>
                                <MoonLoader size="20px"/>
                                {isCompressingVideo && <p style={{fontSize: 8, textAlign: "center"}}>Behandler video <br />– vent venligst ...</p>}
                            </div>
                        ))}
                        {!((uploadingImages?.length + opgaveBilleder?.length) > 9) && <div 
                            className={`${ÅbenOpgaveCSS.fileInput} ${dragging ? ÅbenOpgaveCSS.dragover : ''}`} 
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }} 
                            onDragLeave={() => setDragging(false)} 
                            onDrop={handleFileDrop}
                        >
                            <ImagePlus />
                            <input 
                                type="file" 
                                name="file" 
                                accept=".jpg, .jpeg, .png, .heic, .mp4, .mov, .avi, .hevc, .pdf" 
                                onChange={handleFileChange} 
                                multiple 
                                style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', padding: 0 }} 
                            />
                        </div>}
                    </div>
                    <VisBilledeModal trigger={åbnBillede} setTrigger={setÅbnBillede} handleDeleteFile={handleDeleteFile} index={imageIndex} />
                </form>}            
                <div className={ÅbenOpgaveCSS.opgavestatusContainerMobile}>
                    {færdiggjort ? null : (
                        <div className={ÅbenOpgaveCSS.statusSelectWrapperMobile}>
                            <select name="opgavestatus" className={ÅbenOpgaveCSS.opgaveStatusSelectMobile} onChange={opdaterOpgavestatus} value={status}>
                                <option value="Modtaget">Opgave modtaget</option>
                                <option value="Afventer svar">Afventer svar</option>
                                <option value="Dato aftalt">Dato aftalt</option>
                            </select>
                            <ChevronDown className={ÅbenOpgaveCSS.chevronDownIconMobile} />
                        </div>
                    )}  
                </div>
                <div className={ÅbenOpgaveCSS.kundeinformationer}>
                    <div className={ÅbenOpgaveCSS.kolonner}>
                        <div className={ÅbenOpgaveCSS.kundeInformationerContainer}>
                            <div className={ÅbenOpgaveCSS.kundeHeadingContainer}>
                                <b className={ÅbenOpgaveCSS.kundeHeading} onClick={() => navigate(`/kunde/${kunde?._id}`)}>{kunde?.virksomhed ? kunde?.virksomhed : kunde?.navn}</b>
                                {(!kunde?.CVR && !kunde?.virksomhed) ? <p className={ÅbenOpgaveCSS.privatEllerErhvervskunde}>Privatkunde</p> : <p className={ÅbenOpgaveCSS.privatEllerErhvervskunde}>{kunde?.CVR && "CVR.: " + kunde?.CVR || <span style={{color: "#ff0000cc", display: "flex", alignItems: "center", gap: "2px"}}><CircleAlert size="12px" color="#ff0000cc" /> CVR-nummer ikke oplyst</span>} • Erhvervskunde</p>}
                                {user.isAdmin && <button className={ÅbenOpgaveCSS.redigerKundeButtonMobile} onClick={() => setRedigerKundeModal(true)}>Rediger</button>}
                            </div>
                            
                            <p className={ÅbenOpgaveCSS.adresseTekst}>{kunde?.adresse}, {kunde?.postnummerOgBy}</p>
                            {(kunde?.virksomhed || kunde?.CVR) && 
                            <div className={ÅbenOpgaveCSS.virksomhedInfo}>
                                <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.virksomhedHeading}`}>Kontaktperson</b>
                                {kunde?.navn ? <p className={ÅbenOpgaveCSS.virksomhedTekst}>{kunde?.navn}</p> : null}
                                <div className={ÅbenOpgaveCSS.kundeKontaktDesktop}>
                                    {kunde?.telefon && <a href={"tel:" + kunde?.telefon}><Phone size="16px" />{kunde?.telefon}</a>}
                                    {kunde?.email && <a href={"mailto:" + kunde?.email}><Mail size="16px" />{kunde?.email}</a>}
                                </div>
                            </div>}
                            {!(kunde?.virksomhed || kunde?.CVR) && <div className={ÅbenOpgaveCSS.privatKundeKontaktDesktop}>
                                <a href={"tel:" + kunde?.telefon}><Phone size="16px" />{kunde?.telefon}</a>
                                <a href={"mailto:" + kunde?.email}><Mail size="16px" />{kunde?.email}</a>
                            </div>}
                            {/* {user.isAdmin && <button className={ÅbenOpgaveCSS.redigerKundeButtonDesktop} onClick={() => setRedigerKundeModal(true)}>Rediger kundeinformationer</button>} */}
                            <div className={ÅbenOpgaveCSS.kundeKontaktMobile}>
                                <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"tel:" + kunde?.telefon}><Phone size="20px"/> {kunde?.telefon}</a>
                                <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"sms:" + kunde?.telefon + "&body=Hej%20" + kunde?.fornavn + ", "}><MessageCircle size="20px" /> SMS</a>
                                <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"mailto:" + kunde?.email}><Mail size="20px" /> Mail</a>
                            </div>
                        </div>
                        <RedigerKundeModal redigerKundeModal={redigerKundeModal} setRedigerKundeModal={setRedigerKundeModal} kunde={kunde} opdaterKunde={opdaterKunde} setOpdaterKunde={setOpdaterKunde}/>
                        <div className={ÅbenOpgaveCSS.opgavestatusContainerDesktop}>
                        {user.isAdmin && <PopUpMenu actions={[
                            { icon: <Edit />, label: 'Rediger kundeinfo', onClick: () => setRedigerKundeModal(true) },
                            { icon: <ArrowRightToLine />, label: 'Gå til kunde', onClick: () => navigate(`/kunde/${kunde?._id}`) }
                        ]} />}
                        </div>                         
                    </div>
                    {!færdiggjort && <b onClick={åbnKortLink} className={ÅbenOpgaveCSS.kortLink}>Find vej <Navigation size="18"/></b>}
                </div>

                <div className={ÅbenOpgaveCSS.praktisk}>
                    <div className={`${ÅbenOpgaveCSS.uddelegeringDesktop}`}>
                        {user.isAdmin && (færdiggjort ? null : <form className={ÅbenOpgaveCSS.tildelAnsvarligeForm} action="">
                            <b className={ÅbenOpgaveCSS.prefix}>Tildel ansvarlige:</b>
                            <select className={ÅbenOpgaveCSS.tildelAnsvarlige} defaultValue="Vælg Bob ..." name="vælgBob" onChange={tildelAnsvar}>
                                <option disabled>Vælg Bob ...</option>
                                {brugere && brugere.map((ledigAnsvarlig) => {
                                    return(
                                        <option key={ledigAnsvarlig._id} value={ledigAnsvarlig._id}>{ledigAnsvarlig.navn}</option>
                                    )
                                })}
                            </select>
                        </form>)}
                        
                        <div className={ÅbenOpgaveCSS.ansvarshavendeListe}>
                            <b className={ÅbenOpgaveCSS.prefix}>Nuv. ansvarlige:</b>
                            <div className={ÅbenOpgaveCSS.ansvarlige}>
                            {nuværendeAnsvarlige && nuværendeAnsvarlige.map((ansvarlig) => {
                                return (
                                    <div key={ansvarlig._id} className={ÅbenOpgaveCSS.ansvarligDiv}>
                                        <p>{ansvarlig.navn}</p>
                                        {user.isAdmin && (færdiggjort ? null : <button className={ÅbenOpgaveCSS.fjernAnsvarlig} onClick={() => {fjernAnsvarlig(ansvarlig)}}><img src={CloseIcon} alt="Close Icon" className={ÅbenOpgaveCSS.closeIcon} /></button>)}
                                    </div>
                                )
                            })}
                            </div>
                        </div>
                    </div>
                    <div className={`${ÅbenOpgaveCSS.uddelegeringMobile}`}>
                        {user.isAdmin && (færdiggjort ? null : <form className={ÅbenOpgaveCSS.tildelAnsvarligeForm} action="">
                                <select ref={selectRef} className={`${ÅbenOpgaveCSS.tildelAnsvarlige} ${ÅbenOpgaveCSS.hiddenSelect}`} defaultValue="Tildel ansvarlige til opgaven ..." name="vælgBob" onChange={tildelAnsvar}>
                                    <option disabled>Tildel ansvarlige til opgaven ...</option>
                                    {brugere && brugere.map((ledigAnsvarlig) => {
                                        return(
                                            <option key={ledigAnsvarlig._id} value={ledigAnsvarlig._id}>{ledigAnsvarlig.navn}</option>
                                        )
                                    })}
                                </select>
                        </form>)}
                        
                        <div className={ÅbenOpgaveCSS.ansvarshavendeListe}>
                            <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.ansvarshavendeHeading}`}>Ansvarshavende</b>
                            <div className={ÅbenOpgaveCSS.ansvarlige}>
                            {nuværendeAnsvarlige && nuværendeAnsvarlige.length > 0 ? nuværendeAnsvarlige.map((ansvarlig) => {
                                return (
                                    <div key={ansvarlig._id} className={`${ÅbenOpgaveCSS.ansvarligDiv} ${(user.isAdmin && !færdiggjort) && ÅbenOpgaveCSS.ansvarligDivEkstraBottomMargin}`}>
                                        <p>{ansvarlig.navn}</p>
                                        {user.isAdmin && (færdiggjort ? null : <button className={ÅbenOpgaveCSS.fjernAnsvarlig} onClick={() => {fjernAnsvarlig(ansvarlig)}}><img src={CloseIcon} alt="Close Icon" className={ÅbenOpgaveCSS.closeIcon} /></button>)}
                                    </div>
                                )
                            }) : <p>Der er ikke udpeget en ansvarlig til opgaven.</p>}
                            </div>
                            {user.isAdmin && (færdiggjort ? null : <button 
                                type="button" 
                                onClick={handleTildelAnsvarKlik} 
                                className={ÅbenOpgaveCSS.customSelectAnsvarligKnap}
                            >
                                <UserRoundPlus size="20px" />
                            </button>)}
                        </div>
                    </div>
                </div>
                <div className={ÅbenOpgaveCSS.planDiv}>
                    <ÅbenOpgaveCalendar 
                        user={user} 
                        opgaveTilknyttetBesøg={opgaveTilknyttetBesøg}
                        setOpgaveTilknyttetBesøg={setOpgaveTilknyttetBesøg}
                        openDialog={openDialog}
                        setOpenDialog={setOpenDialog}
                        eventData={eventData}
                        setEventData={setEventData} 
                        aktueltBesøg={aktueltBesøg} 
                        opgaveID={opgaveID}
                        getBrugerName={getBrugerName}
                        brugere={brugere}
                        egneLedigeTider={egneLedigeTider}
                        alleLedigeTider={alleLedigeTider}
                        egneBesøg={egneBesøg}
                        alleBesøg={alleBesøg}
                        setEgneLedigeTider={setEgneLedigeTider}
                        setEgneBesøg={setEgneBesøg}
                        refetchLedigeTider={refetchLedigeTider}
                        refetchBesøg={refetchBesøg}
                        setRefetchLedigeTider={setRefetchLedigeTider}
                        setRefetchBesøg={setRefetchBesøg}
                        setAlleLedigeTider={setAlleLedigeTider}
                        setAlleBesøg={setAlleBesøg}
                        userID={userID}
                        updateOpgave={updateOpgave}
                        setUpdateOpgave={setUpdateOpgave}
                        />
                </div>
                {user.isAdmin && console.log(opgave)}
                <div className={ÅbenOpgaveCSS.posteringer}>
                    <div className={ÅbenOpgaveCSS.headerSwitcherDiv}>
                        <b className={ÅbenOpgaveCSS.prefix}>Posteringer</b>
                        <div className={`${SwitcherStyles.checkboxContainer} ${ÅbenOpgaveCSS.checkboxContainer}`}>
                            <label className={SwitcherStyles.switch} htmlFor="isEnglish">
                                <input type="checkbox" id="isEnglish" name="isEnglish" className={SwitcherStyles.checkboxInput} checked={visInklMoms} onChange={(e) => {setVisInklMoms(e.target.checked); console.log(visInklMoms)}} />
                                <span className={SwitcherStyles.slider}></span>
                            </label>
                            <b className={ÅbenOpgaveCSS.prefix}>Inkl. moms</b>
                        </div>
                    </div>
                    {opgave.fakturaOprettesManuelt && <p style={{color: "grey", fontSize: 12}}>(Kunden har fået et fast tilbud på denne opgave, så afregning sker senere via faktura. Du skal blot registrere dine timer i posteringerne som du plejer.)</p>}
                    <div className={ÅbenOpgaveCSS.aktuellePosteringer}>
                        {posteringer && posteringer.map((postering) => {
                            return <Postering key={postering._id} postering={postering} brugere={brugere} user={user} posteringer={posteringer} setPosteringer={setPosteringer} færdiggjort={færdiggjort} openPosteringModalID={openPosteringModalID} setOpenPosteringModalID={setOpenPosteringModalID} editedPostering={editedPostering} setEditedPostering={setEditedPostering} visInklMoms={visInklMoms}/>
                        })}
                    </div>
                    {(færdiggjort || opgave.opgaveAfsluttet) ? null : <button onClick={() => setOpenModal(true)} className={ÅbenOpgaveCSS.tilføjPosteringButton}>+ Ny postering</button>}
                    <AddPostering trigger={openModal} setTrigger={setOpenModal} opgaveID={opgaveID} nuværendeAnsvarlige={nuværendeAnsvarlige} setNuværendeAnsvarlige={setNuværendeAnsvarlige} opgave={opgave} posteringer={posteringer}/>
                    <OpgaveStatus user={user} opgave={opgave} posteringer={posteringer} kunde={kunde} færdiggjort={færdiggjort} opgaveAfsluttet={opgaveAfsluttet} visInklMoms={visInklMoms} setTvingAfslutOpgaveModal={setTvingAfslutOpgaveModal} åbnForÆndringer={åbnForÆndringer} setUpdateOpgave={setUpdateOpgave} updateOpgave={updateOpgave} setOpenVælgMobilePayBetalingsmetodeModal={setOpenVælgMobilePayBetalingsmetodeModal} setOpenBetalViaFakturaModal={setOpenBetalViaFakturaModal} setOpenBetalViaMobilePayAnmodningModal={setOpenBetalViaMobilePayAnmodningModal} setOpenBetalViaMobilePayScanQRModal={setOpenBetalViaMobilePayScanQRModal}/>
                    {!kunde.virksomhed && !kunde.CVR && <OpretRegningModal user={user} opgave={opgave} setOpgave={setOpgave} opgaveID={opgaveID} kunde={kunde} posteringer={posteringer} setOpgaveAfsluttet={setOpgaveAfsluttet} åbnOpretRegningModal={åbnOpretRegningModal} setÅbnOpretRegningModal={setÅbnOpretRegningModal} vilBetaleMedMobilePay={vilBetaleMedMobilePay} setVilBetaleMedMobilePay={setVilBetaleMedMobilePay} opgaveLøstTilfredsstillende={opgaveLøstTilfredsstillende} setOpgaveLøstTilfredsstillende={setOpgaveLøstTilfredsstillende} allePosteringerUdfyldt={allePosteringerUdfyldt} setAllePosteringerUdfyldt={setAllePosteringerUdfyldt} useBetalMedFaktura={useBetalMedFaktura} totalFaktura={beregn.totalPris(posteringer, 2, false)?.beløb} isEnglish={isEnglish} />}
                    {(kunde.virksomhed || kunde.CVR) && <OpretFakturaModal user={user} opgave={opgave} setOpgave={setOpgave} opgaveID={opgaveID} kunde={kunde} posteringer={posteringer} setOpgaveAfsluttet={setOpgaveAfsluttet} åbnOpretFakturaModal={åbnOpretFakturaModal} setÅbnOpretFakturaModal={setÅbnOpretFakturaModal} vilBetaleMedMobilePay={vilBetaleMedMobilePay} setVilBetaleMedMobilePay={setVilBetaleMedMobilePay} opgaveLøstTilfredsstillende={opgaveLøstTilfredsstillende} setOpgaveLøstTilfredsstillende={setOpgaveLøstTilfredsstillende} allePosteringerUdfyldt={allePosteringerUdfyldt} setAllePosteringerUdfyldt={setAllePosteringerUdfyldt} useBetalMedFaktura={useBetalMedFaktura} totalFaktura={beregn.totalPris(posteringer, 2, false)?.beløb} setRedigerKundeModal={setRedigerKundeModal} redigerKundeModal={redigerKundeModal} isEnglish={isEnglish} />}
                </div>
                <AfslutUdenBetaling trigger={tvingAfslutOpgaveModal} setTrigger={setTvingAfslutOpgaveModal} opgave={opgave} updateOpgave={updateOpgave} setUpdateOpgave={setUpdateOpgave} />
                <BetalViaMobilePayAnmodningModal trigger={openBetalViaMobilePayAnmodningModal} setTrigger={setOpenBetalViaMobilePayAnmodningModal} postering={posteringer} refetchPostering={refetchOpgave}/>
                <BetalViaMobilePayQRModal trigger={openBetalViaMobilePayScanQRModal} setTrigger={setOpenBetalViaMobilePayScanQRModal} postering={posteringer} refetchPostering={refetchOpgave}/>
                <BetalViaFakturaModal trigger={openBetalViaFakturaModal} setTrigger={setOpenBetalViaFakturaModal} postering={posteringer} refetchPostering={refetchOpgave} setRedigerKundeModal={setRedigerKundeModal} />
                <VælgMobilePayBetalingsmetode trigger={openVælgMobilePayBetalingsmetodeModal} setTrigger={setOpenVælgMobilePayBetalingsmetodeModal} postering={posteringer} setOpenBetalViaMobilePayAnmodningModal={setOpenBetalViaMobilePayAnmodningModal} setOpenBetalViaMobilePayScanQRModal={setOpenBetalViaMobilePayScanQRModal} />
                {posteringer.length > 0 && user.isAdmin && <div className={ÅbenOpgaveCSS.økonomiDiv}>
                <div className={ÅbenOpgaveCSS.headerSwitcherDiv}>
                        <b className={ÅbenOpgaveCSS.prefix}>Opgavens økonomi</b>
                        <div className={`${SwitcherStyles.checkboxContainer} ${ÅbenOpgaveCSS.checkboxContainer}`}>
                            <label className={SwitcherStyles.switch} htmlFor="isEnglish">
                                <input type="checkbox" id="isEnglish" name="isEnglish" className={SwitcherStyles.checkboxInput} checked={visInklMoms} onChange={(e) => {setVisInklMoms(e.target.checked); console.log(visInklMoms)}} />
                                <span className={SwitcherStyles.slider}></span>
                            </label>
                            <b className={ÅbenOpgaveCSS.prefix}>Inkl. moms</b>
                        </div>
                    </div>
                    <div className={ÅbenOpgaveCSS.regnskabContainer}>
                        <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.bottomMargin10}`}>Indtægter ({visInklMoms ? "inkl." : "ekskl."} moms)</b>
                        <p className={ÅbenOpgaveCSS.opgaveØkonomiGreenSubheading}>(kunden skal betale)</p>
                        {opgave.fakturaOprettesManuelt ? 
                        <>
                            {opgave.tilbudAfgivet 
                            ? 
                            <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Oprindeligt tilbud afgivet:</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{opgave.tilbudAfgivet.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>
                            :
                            <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Intet oprindeligt tilbud afgivet</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>0 kr.</span>
                            </div>}
                            <div className={`${ÅbenOpgaveCSS.subtotalRække} ${ÅbenOpgaveCSS.totalFakturaRække}`}>
                                <span className={ÅbenOpgaveCSS.subtotalFaktura}>Indtægter, i alt:</span>
                                <span className={ÅbenOpgaveCSS.subtotalFaktura}>{opgave.tilbudAfgivet ? opgave.tilbudAfgivet.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : 0} kr.</span>
                            </div>
                        </>
                        :
                        <>
                            {beregn.fastPris(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Faste priser (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.fastPris(posteringer, 2, visInklMoms).formateret}</span>
                            </div>}
                            {beregn.opstartPris(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Opstartsgebyrer (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.opstartPris(posteringer, 2, visInklMoms).formateret}</span>
                            </div>}
                            {beregn.handymanPris(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Handymantimer (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.handymanPris(posteringer, 2, visInklMoms).formateret}</span>
                            </div>}
                            {beregn.tømrerPris(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Tømrertimer (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.tømrerPris(posteringer, 2, visInklMoms).formateret}</span>
                            </div>}
                            {beregn.rådgivningPris(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Rådgivning, opmåling og vejledning (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.rådgivningPris(posteringer, 2, visInklMoms).formateret}</span>
                            </div>}
                            {beregn.aftenTillægPris(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Aftentillæg (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.aftenTillægPris(posteringer, 2, visInklMoms).formateret}</span>
                            </div>}
                            {beregn.natTillægPris(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Nattilæg (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.natTillægPris(posteringer, 2, visInklMoms).formateret}</span>
                            </div>}
                            {beregn.trailerPris(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Trailer (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.trailerPris(posteringer, 2, visInklMoms).formateret}</span>
                            </div>}
                            {beregn.udlægPris(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Udlæg (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.udlægPris(posteringer, 2, visInklMoms).formateret}</span>
                            </div>}
                            {beregn.rabatPris(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Rabat (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>- {beregn.rabatPris(posteringer, 2, visInklMoms).formateret}</span>
                            </div>}
                            <div className={`${ÅbenOpgaveCSS.subtotalRække} ${ÅbenOpgaveCSS.totalFakturaRække}`}>
                                <span className={ÅbenOpgaveCSS.subtotalFaktura}>Indtægter, i alt:</span>
                                <span className={ÅbenOpgaveCSS.subtotalFaktura}>{beregn.totalPris(posteringer, 2, visInklMoms).formateret}</span>
                            </div>
                        </>}
                        <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.bottomMargin10}`}>Udgifter</b>
                        <p className={ÅbenOpgaveCSS.opgaveØkonomiRedSubheading}>{opgave && opgave.ansvarlig.length > 1 ? "(medarbejderne skal have)" : "(medarbejderen skal have)"}</p>
                        {beregn.fastHonorar(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Faste honorarer (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.fastHonorar(posteringer).formateret}</span>
                        </div>}
                        {beregn.opstartHonorar(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Opstartsgebyrer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.opstartHonorar(posteringer).formateret}</span>
                        </div>}
                        {beregn.handymanHonorar(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Handymantimer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.handymanHonorar(posteringer).formateret}</span>
                        </div>}
                        {beregn.tømrerHonorar(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Tømrertimer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.tømrerHonorar(posteringer).formateret}</span>
                        </div>}
                        {beregn.rådgivningHonorar(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Rådgivning, opmåling og vejledning (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.rådgivningHonorar(posteringer).formateret}</span>
                        </div>}
                        {beregn.aftenTillægHonorar(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Aftentillæg (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.aftenTillægHonorar(posteringer).formateret}</span>
                        </div>}
                        {beregn.natTillægHonorar(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Nattilæg (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.natTillægHonorar(posteringer).formateret}</span>
                        </div>}
                        {beregn.trailerHonorar(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Trailer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.trailerHonorar(posteringer).formateret}</span>
                        </div>}
                        {beregn.udlægHonorar(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Udlæg (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{beregn.udlægHonorar(posteringer).formateret}</span>
                        </div>}
                        {beregn.rabatHonorar(posteringer).beløb > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Rabat (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>-{beregn.rabatHonorar(posteringer).formateret}</span>
                        </div>}
                        <div className={`${ÅbenOpgaveCSS.subtotalRække} ${ÅbenOpgaveCSS.totalHonorarRække}`}>
                            <span className={ÅbenOpgaveCSS.subtotalHonorar}>Udgifter, i alt:</span>
                            <span className={ÅbenOpgaveCSS.subtotalHonorar}>{beregn.totalHonorar(posteringer).formateret}</span>
                        </div>
                        {user.isAdmin && <>
                            <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.bottomMargin10}`}>Total (ekskl. moms)</b>
                            {opgave.fakturaOprettesManuelt ? 
                            <>
                                <div className={ÅbenOpgaveCSS.regnskabRække}>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.grønTekst}`}>Indtægter:</span>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.grønTekst}`}>{opgave.tilbudAfgivet ? opgave.tilbudAfgivet.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "Intet tilbud afgivet."} kr.</span>
                                </div>
                                <div className={ÅbenOpgaveCSS.regnskabRække}>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.rødTekst}`}>Udgifter:</span>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.rødTekst}`}>{beregn.totalHonorar(posteringer).formateret}</span>
                                </div>
                                <div className={ÅbenOpgaveCSS.dækningsbidragRække}>
                                    <span className={`${ÅbenOpgaveCSS.subtotalFaktura} ${ÅbenOpgaveCSS.sortTekst}`}>Dækningsbidrag:</span>
                                    <span className={`${ÅbenOpgaveCSS.subtotalFaktura} ${ÅbenOpgaveCSS.sortTekst}`}>{opgave.tilbudAfgivet ? (opgave.tilbudAfgivet - beregn.totalHonorar(posteringer).beløb).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (0 - beregn.totalHonorar(posteringer).beløb).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </>
                            :
                            <>
                                <div className={ÅbenOpgaveCSS.regnskabRække}>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.grønTekst}`}>Fakturabeløb:</span>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.grønTekst}`}>{beregn.totalPris(posteringer, 2, false).formateret}</span>
                                </div>
                                <div className={ÅbenOpgaveCSS.regnskabRække}>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.rødTekst}`}>Honorarbeløb:</span>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.rødTekst}`}>{beregn.totalHonorar(posteringer).formateret}</span>
                                </div>
                                <div className={ÅbenOpgaveCSS.dækningsbidragRække}>
                                    <span className={`${ÅbenOpgaveCSS.subtotalFaktura} ${ÅbenOpgaveCSS.sortTekst}`}>Dækningsbidrag:</span>
                                    <span className={`${ÅbenOpgaveCSS.subtotalFaktura} ${ÅbenOpgaveCSS.sortTekst}`}>{(beregn.totalPris(posteringer, 2, false).beløb - beregn.totalHonorar(posteringer).beløb).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </>}
                        </>}
                    </div>
                </div>}
                <div className={ÅbenOpgaveCSS.kommentarer}>
                    {kommentarer.length > 0 ? <b className={ÅbenOpgaveCSS.prefix}>Kommentarer</b> : <b className={ÅbenOpgaveCSS.prefix}>Ingen kommentarer på denne opgave</b>}
                    <div className={ÅbenOpgaveCSS.kommentarListe}>
                        {kommentarer && kommentarer.map((kommentar) => {
                            return (
                                <div key={kommentar._id} className={ÅbenOpgaveCSS.kommentarContainer}>
                                    <div className={ÅbenOpgaveCSS.kommentar}>
                                        <div className={ÅbenOpgaveCSS.kommentarHeader}>
                                            <span className={ÅbenOpgaveCSS.kommentarForfatter}>{getBrugerName(kommentar.brugerID)}</span>
                                            <span className={ÅbenOpgaveCSS.kommentarDato}>{kommentar.createdAt.slice(0,10)}</span>
                                        </div>
                                        <p className={ÅbenOpgaveCSS.kommentarIndhold}>{kommentar.kommentarIndhold}</p>
                                    </div>
                                    <div className={ÅbenOpgaveCSS.kommentarKnapper}>   
                                        {userID === kommentar.brugerID && <button className={ÅbenOpgaveCSS.kommentarKnap} onClick={() => {setOpenCommentModalID(kommentar._id), setEditedComment(kommentar.kommentarIndhold)}}>Rediger</button>}
                                        <Modal trigger={openCommentModalID === kommentar._id} setTrigger={setOpenCommentModalID}>
                                                <h2 className={ÅbenOpgaveCSS.modalHeading}>Rediger kommentar</h2>
                                                <form className={ÅbenOpgaveCSS.editKommentarForm} onSubmit={(e) => {
                                                    e.preventDefault();
                                                    editKommentar(kommentar._id);
                                                }}>
                                                    <textarea className={ÅbenOpgaveCSS.redigerKommentarInput} type="text" value={editedComment} onChange={(e) => setEditedComment(e.target.value)} />
                                                    <button className={ÅbenOpgaveCSS.registrerPosteringButton} type="submit">Opdater kommentar</button>
                                                </form>
                                        </Modal>
                                        {(userID === kommentar.brugerID || user.isAdmin) && <button className={ÅbenOpgaveCSS.kommentarKnap} onClick={() => {sletKommentar(kommentar._id)}}>Slet</button>}
                                        <span className={ÅbenOpgaveCSS.kommentarRegigeretMarkør}>{kommentar.createdAt === kommentar.updatedAt ? null : "Redigeret"}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <form>
                        <div className={ÅbenOpgaveCSS.kommentarFlexDiv}>
                            <textarea 
                                type="text" 
                                enterKeyHint="Send"
                                className={ÅbenOpgaveCSS.nyKommentar} 
                                placeholder='Skriv en kommentar til opgaven ...' 
                                value={kommentar} 
                                onChange={(e) => setKommentar(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    submitKommentar();
                                    }
                                }}
                            />
                            <button disabled={!kommentar} onClick={(e) => {e.preventDefault(); submitKommentar();}}><Send size="20px"/></button>
                        </div>
                    </form>
                </div>

            </div>
            </PageAnimation>
        </div>
  )
}

export default ÅbenOpgave
