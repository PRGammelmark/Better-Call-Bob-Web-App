import React from 'react'
import ÅbenOpgaveCSS from './ÅbenOpgave.module.css'
import PageAnimation from '../components/PageAnimation'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useReducer } from 'react'
import BackIcon from "../assets/back.svg"
import axios from "axios"
import dayjs from 'dayjs'
import { useAuthContext } from '../hooks/useAuthContext'
import Modal from '../components/Modal.jsx'
import ÅbenOpgaveCalendar from '../components/traditionalCalendars/ÅbenOpgaveCalendar.jsx'
import { useTaskAndDate } from '../context/TaskAndDateContext.jsx'
import { useBesøg } from '../context/BesøgContext.jsx'
import ModalCSS from '../components/Modal.module.css'
import OpretRegningModal from '../components/modals/OpretRegningModal.jsx'
import OpretFakturaModal from '../components/modals/OpretFakturaModal.jsx'
import useBetalMedFaktura from '../hooks/useBetalMedFaktura.js'
import PhoneIcon from "../assets/phone.svg"
import MailIcon from "../assets/mail.svg"
import SmsIcon from "../assets/smsIcon.svg"
import CloseIcon from "../assets/closeIcon.svg"
import satser from '../variables'
import AddPostering from '../components/modals/AddPostering.jsx'
import AfslutUdenBetaling from '../components/modals/AfslutUdenBetaling.jsx'
import Postering from '../components/Postering.jsx'
import SwitcherStyles from './Switcher.module.css'
import { ImagePlus, Trash2, Navigation, CirclePlay } from 'lucide-react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from '../firebase.js'
import imageCompression from 'browser-image-compression';
import {v4} from 'uuid'
import MoonLoader from "react-spinners/MoonLoader";
import VisBilledeModal from '../components/modals/VisBillede.jsx'
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ÅbenOpgave = () => {
    
    const navigate = useNavigate();
    const { opgaveID } = useParams();
    const {user} = useAuthContext();
    
    if (!user) {
        return
    }

    // state managers
    const { egneLedigeTider, alleLedigeTider, egneBesøg, alleBesøg, setEgneLedigeTider, setEgneBesøg, refetchLedigeTider, refetchBesøg, setRefetchLedigeTider, setRefetchBesøg, setAlleLedigeTider, setAlleBesøg, userID } = useBesøg();
    const [opgave, setOpgave] = useState(null);
    const [loading, setLoading] = useState(true);
    const [opgaveBeskrivelse, setOpgaveBeskrivelse] = useState(null);
    const [updateOpgave, setUpdateOpgave] = useState(false);
    const [status, setStatus] = useState("");
    const [brugere, setBrugere] = useState(null);
    const [nuværendeAnsvarlige, setNuværendeAnsvarlige] = useState(null);
    const [navn, setNavn] = useState("");
    const [adresse, setAdresse] = useState("");
    const [harStige, setHarStige] = useState(false);
    const [telefon, setTelefon] = useState("");
    const [email, setEmail] = useState("");
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
    const [selectedOpgaveDate, setSelectedOpgaveDate] = useState(null)
    const [planlægBesøgFraTidspunkt, setPlanlægBesøgFraTidspunkt] = useState("08:00")
    const [planlægBesøgTilTidspunkt, setPlanlægBesøgTilTidspunkt] = useState("12:00")
    const [planlagteBesøg, setPlanlagteBesøg] = useState(null)
    const [triggerPlanlagteBesøg, setTriggerPlanlagteBesøg] = useState(false)
    const [smsSendtTilKundenOmPåVej, setSmsSendtTilKundenOmPåVej] = useState("")
    const [sætPåmindelseSMS, setSætPåmindelseSMS] = useState(false)
    const [smsPåmindelseIndstillet, setSmsPåmindelseIndstillet] = useState("")
    const [visKalender, setVisKalender] = useState(false)
    const [opretBesøgError, setOpretBesøgError] = useState("")
    const [triggerLedigeTiderRefetch, setTriggerLedigeTiderRefetch] = useState(false)
    const [kvitteringBillede, setKvitteringBillede] = useState(null)
    const [opgaveLøstTilfredsstillende, setOpgaveLøstTilfredsstillende] = useState(false)
    const [allePosteringerUdfyldt, setAllePosteringerUdfyldt] = useState(false)
    const [vilBetaleMedMobilePay, setVilBetaleMedMobilePay] = useState(false)
    const [invoiceImage, setInvoiceImage] = useState(null)
    const [åbnBetalFakturaModal, setÅbnBetalFakturaModal] = useState(false)
    const { chosenTask, setChosenTask } = useTaskAndDate();
    const initialDate = opgave && opgave.onsketDato ? dayjs(opgave.onsketDato) : null;
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [openDialog, setOpenDialog] = useState(false)
    const [eventData, setEventData] = useState(null)
    const [tilknyttetOpgave, setTilknyttetOpgave] = useState(null)
    const [aktueltBesøg, setAktueltBesøg] = useState(null)
    const [sletOpgaveModal, setSletOpgaveModal] = useState(false)
    const [genåbnOpgaveModal, setGenåbnOpgaveModal] = useState(false)
    const [sletOpgaveInput, setSletOpgaveInput] = useState("")
    const [redigerKundeModal, setRedigerKundeModal] = useState(false) 
    const [isEnglish, setIsEnglish] = useState(false)
    const [nyeKundeinformationer, setNyeKundeinformationer] = useState(null)
    const [openPosteringSatser, setOpenPosteringSatser] = useState(null)
    const [tvingAfslutOpgaveModal, setTvingAfslutOpgaveModal] = useState(false)
    const [registrerBetalingsModal, setRegistrerBetalingsModal] = useState(false)
    const [dragging, setDragging] = useState(false)
    const [opgaveBilleder, setOpgaveBilleder] = useState([])
    const [uploadingImages, setUploadingImages] = useState([])
    const [åbnBillede, setÅbnBillede] = useState("")
    const [imageIndex, setImageIndex] = useState(null)
    const [errorIndexes, setErrorIndexes] = useState(new Set());
    const [isCompressingVideo, setIsCompressingVideo] = useState(false)

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

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            setOpgave(res.data);
            setNyeKundeinformationer(res.data);
            setOpgaveBeskrivelse(res.data.opgaveBeskrivelse);
            setStatus(res.data.status);
            setNavn(res.data.navn);
            setNuværendeAnsvarlige(res.data.ansvarlig)
            setAdresse(res.data.adresse);
            setHarStige(res.data.harStige);
            setTelefon(res.data.telefon);
            setEmail(res.data.email);
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
        const bruger = brugere && brugere.find(user => user._id === brugerID);
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
    }, [openModal, openPosteringModalID])

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
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
            opgaveBeskrivelse: x
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

        const syncOpgavestatus = e.target.value;
        
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
            status: syncOpgavestatus
        },{
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => console.log(res.data))
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
        
            axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                ansvarlig: opdateretAnsvarlige,
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
                    body: "Du har fået tildelt en ny opgave hos Better Call Bob.\n\nOpgaveinformationer:\n\nKundens navn: " + opgave.navn + "\n\nAdresse: " + opgave.adresse + "\n\nOpgavebeskrivelse: " + opgave.opgaveBeskrivelse + "\n\nGå ind på app'en for at se opgaven.\n\n//Better Call Bob",
                    html: "<p>Du har fået tildelt en ny opgave hos Better Call Bob.</p><b>Opgaveinformationer:</b><br />Kundens navn: " + opgave.navn + "<br />Adresse: " + opgave.adresse + "<br />Opgavebeskrivelse: " + opgave.opgaveBeskrivelse + "</p><p>Gå ind på <a href='https://app.bettercallbob.dk'>app'en</a> for at se opgaven.</p><p>//Better Call Bob</p>"
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
            axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                ansvarlig: opdateredeAnsvarlige,
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
            const planlagteBesøgForOpgave = res.data.filter(opgave => opgave.opgaveID === opgaveID);

            const fremtidigeBesøg = planlagteBesøgForOpgave.some((opgave) => 
                dayjs(opgave.datoTidFra).isAfter(dayjs())
            );
            
            if(fremtidigeBesøg){
                window.alert("Der er planlagt fremtidige besøg for denne opgave, og du kan derfor ikke færdiggøre den. Vent med at færdiggøre opgaven, eller fjern de fremtidige besøg hvis opgaven allerede er løst.")
            } else {
                axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, færdiggør, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                .then(response => {
                    setFærdiggjort(true);
                })
                .catch(error => console.log(error))
            }
        })
        .catch(error => console.log(error))
    }

    function åbnForÆndringer () {
        const genåbnOpgaveOgSletFaktura = {
            markeretSomFærdig: false,
            opgaveAfsluttet: null,
            fakturaSendt: null,
            fakturaPDF: null,
            fakturaPDFUrl: null,
            fakturaBetalt: null
        }


        if (window.confirm(opgave.fakturaSendt ? "En faktura for denne opgave er allerede oprettet og sendt til kunden. Betaling for fakturaen er endnu ikke registreret. Hvis du genåbner opgaven for at foretage ændringer i posteringerne slettes den gamle faktura fra app'en her, men ikke fra dit regnskabssystem. Du skal huske manuelt at kreditere den tidligere faktura i dit regnskabssystem, og gøre kunden opmærksom på, at den gamle faktura ikke skal betales." : "Der er endnu ikke oprettet en faktura eller modtaget betaling for denne opgave. Du kan frit genåbne og ændre.")) {
            axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, genåbnOpgaveOgSletFaktura, {
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

    // konstater til regnskabsopstillingen -- HONORARER --
    const fasteHonorarerTotal = posteringer && posteringer.reduce((akk, nuv) => akk + (!nuv.dynamiskHonorarBeregning ? nuv.fastHonorar : 0), 0);
    const opstartTotalHonorar = posteringer && posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.opstart * nuv.satser.opstartsgebyrHonorar) : 0), 0);
    const handymanTotalHonorar = posteringer && (posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.handymanTimer * nuv.satser.handymanTimerHonorar) : 0), 0));
    const tømrerTotalHonorar = posteringer && (posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.tømrerTimer * nuv.satser.tømrerTimerHonorar) : 0), 0));
    const rådgivningOpmålingVejledningTotalHonorar = posteringer && (posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.rådgivningOpmålingVejledning * nuv.satser.rådgivningOpmålingVejledningHonorar) : 0), 0));
    const trailerTotalHonorar = posteringer && (posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.trailer * nuv.satser.trailerHonorar) : 0), 0));
    const aftenTillægTotalHonorar = posteringer && (posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.aftenTillæg ? ((((nuv.handymanTimer * nuv.satser.handymanTimerHonorar) + (nuv.tømrerTimer * nuv.satser.tømrerTimerHonorar) + (nuv.rådgivningOpmålingVejledning * nuv.satser.rådgivningOpmålingVejledningHonorar)) * nuv.satser.aftenTillægHonorar / 100)) : 0) : 0), 0));
    const natTillægTotalHonorar = posteringer && (posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskHonorarBeregning ? (nuv.natTillæg ? ((((nuv.handymanTimer * nuv.satser.handymanTimerHonorar) + (nuv.tømrerTimer * nuv.satser.tømrerTimerHonorar) + (nuv.rådgivningOpmålingVejledning * nuv.satser.rådgivningOpmålingVejledningHonorar)) * nuv.satser.natTillægHonorar / 100)) : 0) : 0), 0));
    const udlægTotalHonorar = posteringer && posteringer.length > 0 && posteringer.reduce((akk, nuv) => {
        const udlægSum = nuv.udlæg.reduce((sum, udlæg) => sum + (parseFloat(udlæg.beløb) || 0), 0);
        return akk + (nuv.dynamiskHonorarBeregning ? udlægSum : 0);
    }, 0);
    const rabatterTotalHonorar = posteringer && posteringer.length > 0 && posteringer.reduce((akk, nuv) => {
        const rabatProcent = nuv.rabatProcent || 0;
        const totalHonorarEksklUdlæg = (nuv.totalHonorar - nuv.udlæg.reduce((sum, udlæg) => sum + (parseFloat(udlæg.beløb) || 0), 0));
        return akk + (nuv.dynamiskHonorarBeregning ? ((totalHonorarEksklUdlæg / (100 - rabatProcent) * 100) * (rabatProcent / 100)) : 0);
    }, 0);
    const totalHonorar = Number(fasteHonorarerTotal) + Number(opstartTotalHonorar) + Number(handymanTotalHonorar) + Number(tømrerTotalHonorar) + Number(rådgivningOpmålingVejledningTotalHonorar) + Number(trailerTotalHonorar) + Number(aftenTillægTotalHonorar) + Number(natTillægTotalHonorar) + Number(udlægTotalHonorar) - Number(rabatterTotalHonorar);

    // konstanter til regnskabsopstillingen -- FAKTURA --
    const fastPrisTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (!nuv.dynamiskPrisBeregning ? nuv.fastPris : 0), 0)));
    const opstartTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.opstart * nuv.satser.opstartsgebyrPris) : 0), 0)));
    const handymanTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.handymanTimer * nuv.satser.handymanTimerPris) : 0), 0)));
    const tømrerTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.tømrerTimer * nuv.satser.tømrerTimerPris) : 0), 0)));
    const rådgivningOpmålingVejledningTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.rådgivningOpmålingVejledning * nuv.satser.rådgivningOpmålingVejledningPris) : 0), 0)));
    const trailerTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.trailer * nuv.satser.trailerPris) : 0), 0)));
    const aftenTillægTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.aftenTillæg ? ((nuv.handymanTimer * (nuv.satser.handymanTimerPrisInklAftenTillæg - nuv.satser.handymanTimerPris) + ((nuv.tømrerTimer + nuv.rådgivningOpmålingVejledning) * (nuv.satser.tømrerTimerPrisInklAftenTillæg - nuv.satser.tømrerTimerPris)))) : 0) : 0), 0)));
    const natTillægTotalFaktura = posteringer && Math.round((posteringer.reduce((akk, nuv) => akk + (nuv.dynamiskPrisBeregning ? (nuv.natTillæg ? ((nuv.handymanTimer * (nuv.satser.handymanTimerPrisInklNatTillæg - nuv.satser.handymanTimerPris) + ((nuv.tømrerTimer + nuv.rådgivningOpmålingVejledning) * (nuv.satser.tømrerTimerPrisInklNatTillæg - nuv.satser.tømrerTimerPris)))) : 0) : 0), 0)));
    const udlægTotalFaktura = posteringer && posteringer.length > 0 && posteringer.reduce((akk, nuv) => {
        const udlægSum = nuv.udlæg.reduce((sum, udlæg) => sum + (parseFloat(udlæg.beløb) || 0), 0);
        return akk + (nuv.dynamiskPrisBeregning ? udlægSum : 0);
    }, 0);
    const rabatterTotalFaktura = posteringer && posteringer.length > 0 && posteringer.reduce((akk, nuv, index) => {
        const rabatProcent = nuv.rabatProcent || 0;
        const totalPrisEksklUdlæg = nuv.totalPris - nuv.udlæg.reduce((sum, udlæg) => sum + (parseFloat(udlæg.beløb) || 0), 0);
        const rabatBeregning = (nuv.dynamiskPrisBeregning ? ((totalPrisEksklUdlæg / (100 - rabatProcent) * 100) * (rabatProcent / 100)) : 0);
        return akk + rabatBeregning;
    }, 0);
    const totalFaktura = Number(fastPrisTotalFaktura) + Number(opstartTotalFaktura) + Number(handymanTotalFaktura) + Number(tømrerTotalFaktura) + Number(rådgivningOpmålingVejledningTotalFaktura) + Number(trailerTotalFaktura) + Number(aftenTillægTotalFaktura) + Number(natTillægTotalFaktura) + Number(udlægTotalFaktura) - Number(rabatterTotalFaktura);

    function openPDFFromDatabase(base64PDF, fileName = 'faktura.pdf') {
        if (opgave && opgave.fakturaPDFUrl) {
            const baseURL = import.meta.env.VITE_API_URL;
            window.open(`${baseURL}${opgave.fakturaPDFUrl}`, '_blank');
        }
    }

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

            navigate(-1)
        })
        .catch(error => {
            console.error('Error deleting opgave:', error);
        });
    }

    function genåbnOpgave() {
        axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgave._id}`, {
            isDeleted: null,
            markeretSomFærdig: false
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

    function informerKundenOmPåVej() {
        const smsData = {
            "messages": [
                {
                    "to": `${opgave.telefon}`,
                    "countryHint": "45",
                    "respectBlacklist": true,
                    "text": `${isEnglish ? `Dear ${opgave.navn},\n\nWe would like to inform you that our employee, ${getBrugerName(userID)}, is now on their way to you in order to help you with your task. We will be at your place in a moment.\n\nWe look forward to helping you! \n\nBest regards,\nBetter Call Bob}` : `Kære ${opgave.navn},\n\nVi vil blot informere dig om, at vores medarbejder ${getBrugerName(userID)} nu er på vej ud til dig for at løse din opgave. Vi er hos dig inden længe.\n\nVi glæder os til at hjælpe dig! \n\nDbh.,\nBetter Call Bob`}`,
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
                    "text": `Automatisk ${timer} timers reminder: Følg op på kontakt til kunde ${opgave.navn}.\n\nKontaktinfo:\n\nTelefon: ${opgave.telefon}\nE-mail: ${opgave.email}${opgave.virksomhed && "\nVirksomhed: " + opgave.virksomhed}\n\nDbh.,\nBetter Call Bob`,
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
        const appleMapsUrl = `maps://maps.apple.com/?q=${opgave.adresse}, Denmark`;
        const googleMapsUrl = `https://maps.google.com/?q=${opgave.adresse}, Denmark`;
        console.log("no")
      
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
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
    
        const validFiles = Array.from(droppedFiles).filter(file =>
            allowedTypes.includes(file.type)
        );

        if(opgaveBilleder.length + validFiles.length > 5){
            window.alert("Du må højst uploade fem billeder.")
            return
        }

        if (validFiles.length > 0) {
            let compressedFiles = [];
            for (let file of validFiles) {
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
        const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'];

        const validFiles = Array.from(selectedFiles).filter(file => 
            allowedImageTypes.includes(file.type) || allowedVideoTypes.includes(file.type)
        );

        if(opgaveBilleder.length + validFiles.length > 10){
            window.alert("Du må højst uploade 10 billede- eller videofiler til opgaven.")
            return
        }
        
        if (validFiles.length > 0) {
            setUploadingImages(prevUploadingImages => [...prevUploadingImages, ...validFiles]);
            let filesToUpload = [];
        
            // Separate image and video files
            const imageFiles = validFiles.filter(file => allowedImageTypes.includes(file.type));
            const videoFiles = validFiles.filter(file => allowedVideoTypes.includes(file.type));
            
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
                        const videoData = await fetchFile(file); // Fetch the video data
                        // Write the video file to the FFmpeg virtual file system
                        await ffmpeg.writeFile(fileName, videoData);
                        console.log("Compressing file ...")
                        
                        // Compress the video (e.g., reducing the resolution and bitrate)
                        await ffmpeg.exec([
                            '-i', fileName,
                            '-vcodec', 'libx264', 
                            '-crf', '30', 
                            '-b:v', '1000k', 
                            '-preset', 'ultrafast', 
                            '-acodec', 'copy',
                            'output.mp4'
                        ]);

                        console.log("Reading the compressed file ...")
                        // Read the compressed video from FFmpeg's virtual file system
                        const compressedVideo = await ffmpeg.readFile('output.mp4');
                        console.log("Creating blot ...")
                        // Create a Blob from the compressed video data
                        const videoBlob = new Blob([compressedVideo.buffer], { type: 'video/mp4' });
                        console.log("Pushing the file to compressed videos array ...")
                        // Push the compressed video file to the upload array
                        compressedVideos.push(videoBlob);
                        setIsCompressingVideo(false)
                    } catch (error) {
                        console.error("Video compression failed", error);
                        setIsCompressingVideo(false)
                    }
                }
            }

            // Combine compressed images and videos for upload
            filesToUpload = [...compressedFiles, ...compressedVideos];
            
            try {
                // Prepare to upload all files
                const uploadedFilesPromises = filesToUpload.map((file) => {
                    const storageRef = ref(storage, `opgaver/${file.name + v4()}`);
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

    const handleError = (index) => {
        setErrorIndexes(prev => new Set(prev.add(index)));
      };
    

    return (
    
        <div className={ÅbenOpgaveCSS.primærContainer}>
            <PageAnimation>
            <div className={ÅbenOpgaveCSS.tilbageOpgaveSektion}>
                <img src={BackIcon} alt="" onClick={() => navigate(-1)} className={ÅbenOpgaveCSS.tilbageKnap} />
                <div className={ÅbenOpgaveCSS.headerContainer}>
                    <b className={`${ÅbenOpgaveCSS.opgaveIDHeader} ${opgave.isDeleted ? ÅbenOpgaveCSS.slettetOverstregning : null}`}>Opgave #{opgave._id.slice(opgave._id.length - 3, opgave._id.length)} på</b>
                    <h2 className={`${ÅbenOpgaveCSS.adresseHeading} ${opgave.isDeleted ? ÅbenOpgaveCSS.slettetOverstregning : null}`}>{opgave.adresse}</h2>
                    <div className={ÅbenOpgaveCSS.kortLinkContainer}>
                        {egneBesøg && egneBesøg.some(besøg => besøg.opgaveID === opgaveID && Math.abs(dayjs(besøg.datoTidFra).diff(dayjs(), 'hour')) <= 1) && opgave.telefon && (smsSendtTilKundenOmPåVej || (opgave.sidsteSMSSendtTilKundenOmPåVej && Math.abs(dayjs(opgave.sidsteSMSSendtTilKundenOmPåVej).diff(dayjs(), 'hour')) <= 1 )) && 
                        <p className={ÅbenOpgaveCSS.smsSendtTekst}>✔︎ {smsSendtTilKundenOmPåVej ? smsSendtTilKundenOmPåVej : "SMS sendt kl. " + dayjs(opgave.sidsteSMSSendtTilKundenOmPåVej).format("HH:mm") + " om, at du er på vej."}</p>}
                        {egneBesøg && egneBesøg.some(besøg => besøg.opgaveID === opgaveID && Math.abs(dayjs(besøg.datoTidFra).diff(dayjs(), 'hour')) <= 1) && opgave.telefon && !(smsSendtTilKundenOmPåVej || (opgave.sidsteSMSSendtTilKundenOmPåVej && Math.abs(dayjs(opgave.sidsteSMSSendtTilKundenOmPåVej).diff(dayjs(), 'hour')) <= 1 )) &&
                        <button className={ÅbenOpgaveCSS.informerKundenOmPåVej} onClick={() => {informerKundenOmPåVej()}}>Fortæl kunden du er på vej 💬 </button>}
                    </div>
                </div>
                {user.isAdmin && (
                    <>
                        <div className={ÅbenOpgaveCSS.sletOpgaveKnap}>
                            {!opgave.isDeleted && !opgave.markeretSomFærdig && <button className={ÅbenOpgaveCSS.sletOpgave} onClick={() => setSletOpgaveModal(true)}>Slet</button>}
                            {opgave.isDeleted && <button className={ÅbenOpgaveCSS.genåbnOpgave} onClick={() => setGenåbnOpgaveModal(true)}>Genåbn opgave</button>}
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
                    </>
                )}

            </div>
            
            <div className={ÅbenOpgaveCSS.opgaveContainer}>
                {færdiggjort ? <div><b className={ÅbenOpgaveCSS.prefix}>Opgavebeskrivelse</b><p className={ÅbenOpgaveCSS.færdiggjortOpgavebeskrivelse}>{opgaveBeskrivelse}</p></div> : <form>
                    <label className={ÅbenOpgaveCSS.label} htmlFor="opgavebeskrivelse">Opgavebeskrivelse</label>
                    <textarea name="opgavebeskrivelse" className={ÅbenOpgaveCSS.opgavebeskrivelse} value={opgaveBeskrivelse} onChange={opdaterOpgavebeskrivelse} ></textarea>
                    <div className={ÅbenOpgaveCSS.infoPillsDiv}>
                        {(opgave.CVR || opgave.virksomhed) ? <div className={ÅbenOpgaveCSS.infoPill}>Erhvervskunde</div> : <div className={ÅbenOpgaveCSS.infoPill}>Privatkunde</div>}
                        {opgave.harStige ? <div className={ÅbenOpgaveCSS.harStige}>Har egen stige 🪜</div> : <div className={ÅbenOpgaveCSS.harIkkeStige}>Har ikke egen stige ❗️</div>}
                        {opgave?.onsketDato && <div className={ÅbenOpgaveCSS.infoPill}>Ønsket start: {dayjs(opgave?.onsketDato).format("DD. MMMM [kl.] HH:mm")}</div>}
                    </div>
                    <div className={ÅbenOpgaveCSS.billederDiv}>
                        {opgaveBilleder?.length > 0 && opgaveBilleder.map((medie, index) => {

                            return (
                            <div key={index} className={ÅbenOpgaveCSS.uploadetBillede} >
                                {errorIndexes.has(index) ? 
                                    <a href={medie} target='_blank'>
                                        <div className={ÅbenOpgaveCSS.playVideoPlaceholder}>
                                            <CirclePlay />
                                        </div>
                                    </a>
                                    : 
                                    <img 
                                        src={medie} 
                                        alt={`Preview ${index + 1}`} 
                                        className={ÅbenOpgaveCSS.imagePreview}
                                        onClick={() => {setÅbnBillede(medie); setImageIndex(index)}}
                                        onError={() => handleError(index)}
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
                        {!((uploadingImages?.length + opgaveBilleder?.length) > 10) && <div 
                            className={`${ÅbenOpgaveCSS.fileInput} ${dragging ? ÅbenOpgaveCSS.dragover : ''}`} 
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }} 
                            onDragLeave={() => setDragging(false)} 
                            onDrop={handleFileDrop}
                        >
                            <ImagePlus />
                            <input 
                                type="file" 
                                name="file" 
                                accept=".jpg, .jpeg, .png, .heic, .mp4, .mov, .avi, .hevc" 
                                onChange={handleFileChange} 
                                multiple 
                                style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', padding: 0 }} 
                            />
                        </div>}
                    </div>
                    <VisBilledeModal trigger={åbnBillede} setTrigger={setÅbnBillede} handleDeleteFile={handleDeleteFile} index={imageIndex} />
                </form>}
                {!færdiggjort && <p onClick={åbnKortLink} className={ÅbenOpgaveCSS.kortLink}>Find vej <Navigation size="18"/></p>}            

                <div className={ÅbenOpgaveCSS.kundeinformationer}>
                    <div className={ÅbenOpgaveCSS.kolonner}>
                        <div className={ÅbenOpgaveCSS.kundeInformationerContainer}>
                            <div className={ÅbenOpgaveCSS.kundeHeadingContainer}>
                                <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.kundeHeading}`}>{opgave.navn}</b>
                                {(!opgave.CVR && !opgave.virksomhed) ? <p className={ÅbenOpgaveCSS.privatEllerErhvervskunde}>Privatkunde</p> : <p className={ÅbenOpgaveCSS.privatEllerErhvervskunde}>Erhvervskunde</p>}
                                <button className={ÅbenOpgaveCSS.redigerKundeButtonMobile} onClick={() => setRedigerKundeModal(true)}>Rediger</button>
                            </div>
                            <Modal trigger={redigerKundeModal} setTrigger={setRedigerKundeModal}>
                                <h2 className={ÅbenOpgaveCSS.modalHeading}>Rediger kundeinformationer</h2>
                                <form className={ÅbenOpgaveCSS.redigerKundeForm} onSubmit={redigerKunde}>
                                    <label className={ÅbenOpgaveCSS.label} htmlFor="navn">Navn</label>
                                    <input type="text" name="navn" required className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.navn} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, navn: e.target.value})} />
                                    <label className={ÅbenOpgaveCSS.label} htmlFor="navn">Adresse</label>
                                    <input type="text" name="adresse" required className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.adresse} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, adresse: e.target.value})} />
                                    <label className={ÅbenOpgaveCSS.label} htmlFor="telefon">Telefon</label>
                                    <input type="text" name="telefon" required className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.telefon} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, telefon: e.target.value})} />
                                    <label className={ÅbenOpgaveCSS.label} htmlFor="email">E-mail</label>
                                    <input type="text" name="email" required className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.email} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, email: e.target.value})} />
                                    <label className={ÅbenOpgaveCSS.label} htmlFor="virksomhed">Virksomhed</label>
                                    <input type="text" name="virksomhed" className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.virksomhed} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, virksomhed: e.target.value})} />
                                    <label className={ÅbenOpgaveCSS.label} htmlFor="cvr">CVR-nummer</label>
                                    <input type="text" name="cvr" className={ÅbenOpgaveCSS.modalInput} value={nyeKundeinformationer.CVR} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, CVR: e.target.value})} />
                                    <div className={SwitcherStyles.checkboxContainer}>
                                        <label className={SwitcherStyles.switch} htmlFor="isEnglish">
                                            <input type="checkbox" id="isEnglish" name="isEnglish" className={SwitcherStyles.checkboxInput} checked={nyeKundeinformationer.isEnglish} onChange={(e) => setNyeKundeinformationer({...nyeKundeinformationer, isEnglish: e.target.checked})} />
                                            <span className={SwitcherStyles.slider}></span>
                                        </label>
                                        <b>Engelsk kunde</b>
                                    </div>
                                    <p style={{marginTop: 10, fontSize: 13}}>(Automatiske e-mails, SMS'er og regninger til kunden vil være på engelsk.)</p>
                                    <button className={ModalCSS.buttonFullWidth} type="submit">Opdater kunde</button>
                                </form>
                            </Modal>
                            <p className={ÅbenOpgaveCSS.adresseTekst}>{opgave.adresse}, {opgave.postnummerOgBy}</p>
                            {(opgave.virksomhed || opgave.CVR) && 
                            <div className={ÅbenOpgaveCSS.virksomhedInfo}>
                                <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.virksomhedHeading}`}>Virksomhed</b>
                                {opgave.virksomhed ? <p className={ÅbenOpgaveCSS.virksomhedTekst}>{opgave.virksomhed}</p> : null}
                                {opgave.CVR ? <p className={ÅbenOpgaveCSS.virksomhedTekst}>CVR: {opgave.CVR}</p> : null}
                            </div>}
                            <div className={ÅbenOpgaveCSS.kundeKontaktDesktop}>
                                <p className={`${ÅbenOpgaveCSS.marginTop10}`}>📞 <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"tel:" + opgave.telefon}>{opgave.telefon}</a></p>
                                <p>✉️ <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"mailto:" + opgave.email}>{opgave.email}</a></p>
                            </div>
                            <div className={ÅbenOpgaveCSS.kundeKontaktMobile}>
                                <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"tel:" + opgave.telefon}><img src={PhoneIcon} alt="Phone Icon" /> {opgave.telefon}</a>
                                <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"sms:" + opgave.telefon + "&body=Hej%20" + opgave.navn.split(" ")[0] + ", "}><img src={SmsIcon} alt="SMS Icon" /> SMS</a>
                                <a className={`${ÅbenOpgaveCSS.postfix} ${ÅbenOpgaveCSS.link}`} href={"mailto:" + opgave.email}><img src={MailIcon} alt="Mail Icon" /> Mail</a>
                            </div>
                            <br /><button className={ÅbenOpgaveCSS.redigerKundeButtonDesktop} onClick={() => setRedigerKundeModal(true)}>Rediger kundeinformationer</button>
                        </div>
                        <div className={ÅbenOpgaveCSS.opgavestatusContainerDesktop}>
                            <b className={ÅbenOpgaveCSS.prefix}>Opgavestatus{færdiggjort ? ": " : null}</b>{færdiggjort ? <span className={ÅbenOpgaveCSS.statusTekstVedFærdiggjort}>{status}</span> : null}
                            {færdiggjort ? null : <form className={`${ÅbenOpgaveCSS.opgavestatusForm} ${ÅbenOpgaveCSS.marginTop10}`}>
                                <select style={conditionalStyles} name="opgavestatus" className={ÅbenOpgaveCSS.opgavestatus} onChange={opdaterOpgavestatus} value={status}>
                                    <option value="Modtaget">Opgave modtaget</option>
                                    <option value="Afventer svar">Kunde kontaktet – afventer</option>
                                    <option value="Dato aftalt">Dato aftalt</option>
                                </select>
                            </form>}
                            {sætPåmindelseSMS && 
                            <div className={ÅbenOpgaveCSS.påmindOmOpgave}>
                                {smsPåmindelseIndstillet ? 
                                <div className={ÅbenOpgaveCSS.påmindOmOpgaveKnapper}>
                                    <p className={ÅbenOpgaveCSS.smsPåmindelseIndstillet}>{smsPåmindelseIndstillet}</p>
                                </div>
                                :
                                <PageAnimation>
                                    <>
                                        <b style={{fontSize: "0.9rem"}}>- indstil SMS-påmindelse?</b>
                                        <div className={ÅbenOpgaveCSS.påmindOmOpgaveKnapper}>
                                            <button className={ÅbenOpgaveCSS.påmindOmOpgaveKnap} onClick={() => indstilPåmindelseSMS(24)}>24 timer</button>
                                            <button className={ÅbenOpgaveCSS.påmindOmOpgaveKnap} onClick={() => indstilPåmindelseSMS(48)}>48 timer</button>
                                        </div>
                                    </>
                                </PageAnimation>
                                }
                            </div>}
                        </div>  
                        <div className={ÅbenOpgaveCSS.opgavestatusContainerMobile}>
                            {færdiggjort ? null : <form className={`${ÅbenOpgaveCSS.opgavestatusForm} ${ÅbenOpgaveCSS.marginTop10}`}>
                                <select style={conditionalStyles} name="opgavestatus" className={ÅbenOpgaveCSS.opgavestatus} onChange={opdaterOpgavestatus} value={status}>
                                    <option value="Modtaget">Status: Opgave modtaget</option>
                                    <option value="Afventer svar">Status: Kunde kontaktet – afventer</option>
                                    <option value="Dato aftalt">Status: Dato aftalt</option>
                                </select>
                            </form>}
                            
                        </div>
                        
                    </div>
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

                            <select className={ÅbenOpgaveCSS.tildelAnsvarlige} defaultValue="Tildel ansvarlige til opgaven ..." name="vælgBob" onChange={tildelAnsvar}>
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
                                    <div key={ansvarlig._id} className={ÅbenOpgaveCSS.ansvarligDiv}>
                                        <p>{ansvarlig.navn}</p>
                                        {user.isAdmin && (færdiggjort ? null : <button className={ÅbenOpgaveCSS.fjernAnsvarlig} onClick={() => {fjernAnsvarlig(ansvarlig)}}><img src={CloseIcon} alt="Close Icon" className={ÅbenOpgaveCSS.closeIcon} /></button>)}
                                    </div>
                                )
                            }) : <p>Der er ikke udpeget en ansvarlig til opgaven.</p>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={ÅbenOpgaveCSS.planDiv}>
                    <ÅbenOpgaveCalendar 
                        user={user} 
                        tilknyttetOpgave={tilknyttetOpgave}
                        setTilknyttetOpgave={setTilknyttetOpgave}
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
                <div className={ÅbenOpgaveCSS.posteringer}>
                    <Modal trigger={kvitteringBillede} setTrigger={setKvitteringBillede}>
                        <h2 className={ÅbenOpgaveCSS.modalHeading}>Billede fra postering</h2>
                        <img src={`${import.meta.env.VITE_API_URL}${kvitteringBillede}`} alt="Kvittering" className={ÅbenOpgaveCSS.kvitteringBilledeStort} />
                    </Modal>
                    <b className={ÅbenOpgaveCSS.prefix}>Posteringer</b>
                    {opgave.fakturaOprettesManuelt && <p style={{color: "grey", fontSize: 12}}>(Dette er en tilbudsopgave, så afregning sker senere. Du skal blot registrere dine timer i posteringerne som du plejer.)</p>}
                    <div className={ÅbenOpgaveCSS.aktuellePosteringer}>
                        {posteringer && posteringer.map((postering) => {
                            return <Postering key={postering._id} postering={postering} brugere={brugere} user={user} posteringer={posteringer} setPosteringer={setPosteringer} færdiggjort={færdiggjort} openPosteringModalID={openPosteringModalID} setOpenPosteringModalID={setOpenPosteringModalID} editedPostering={editedPostering} setEditedPostering={setEditedPostering}/>
                        })}
                    </div>
                    {færdiggjort ? null : <button onClick={() => setOpenModal(true)} className={ÅbenOpgaveCSS.tilføjPosteringButton}>+ Ny postering</button>}
                    <AddPostering trigger={openModal} setTrigger={setOpenModal} opgaveID={opgaveID} userID={userID} user={user} nuværendeAnsvarlige={nuværendeAnsvarlige} setNuværendeAnsvarlige={setNuværendeAnsvarlige} opgave={opgave}/>
                    <div>
                    {!opgave.isDeleted && opgave.fakturaOprettesManuelt && (færdiggjort ? 
                        <div className={ÅbenOpgaveCSS.færdigOpgaveDiv}>
                            <p className={ÅbenOpgaveCSS.prefix}><span style={{fontSize: '1.2rem', marginRight: 10}}>🔒</span> Opgaven er markeret som færdig og låst.</p>
                            {!user.isAdmin && <p className={ÅbenOpgaveCSS.prefix}><span style={{fontSize: '1.2rem', marginRight: 10}}>🧾</span> Faktura oprettes og administreres separat. Du skal ikke foretage dig yderligere.</p>}
                            {user.isAdmin && <p className={ÅbenOpgaveCSS.prefix}><span style={{fontSize: '1.2rem', marginRight: 10}}>🧾</span> Faktura oprettes og administreres separat. {opgave.tilbudAfgivet ? ` Oprindeligt tilbud afgivet: ${opgave.tilbudAfgivet} kr.` : "Intet konkret tilbud afgivet."}</p>}
                            {user.isAdmin && !opgave.opgaveAfsluttet && <button className={ÅbenOpgaveCSS.genåbnButton} onClick={() => åbnForÆndringer()}>Genåbn for ændringer</button>}
                            {user.isAdmin && !opgave.opgaveAfsluttet && <button className={ÅbenOpgaveCSS.afslutButton} onClick={() => afslutOpgave()}>Afslut opgave</button>}
                            {user.isAdmin && opgave.opgaveAfsluttet && <p className={ÅbenOpgaveCSS.prefix}><span style={{fontSize: '1.2rem', marginRight: 10}}>✅</span> Opgaven er afsluttet d. {new Date(opgave.opgaveAfsluttet).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>}
                        </div>
                        :
                        posteringer.length > 0 && 
                                <button className={ÅbenOpgaveCSS.markerSomFærdigKnap} onClick={() => færdiggørOpgave()}>Markér opgave som færdig</button>
                    )}
                    {!opgave.isDeleted && !opgave.fakturaOprettesManuelt && 
                        (færdiggjort
                            ? 
                            <div className={ÅbenOpgaveCSS.færdigOpgaveDiv}>
                                
                                {/* InfoLines */}
                                {!opgave.opgaveAfsluttet && <p className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>🔒</span> Opgaven er markeret som færdig og låst.</p>}
                                {opgave.fakturaSendt && ((opgave.virksomhed || opgave.CVR) ? <div className={ÅbenOpgaveCSS.infoLineFaktura} style={{display: "flex", justifyContent: "space-between"}}><p style={{marginTop: -3}}><span style={{fontSize: '1rem', marginRight: 10}}>📨</span> Fakturakladde oprettet d. {new Date(opgave.fakturaSendt).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p></div> : <div className={ÅbenOpgaveCSS.infoLineFaktura} style={{display: "flex", justifyContent: "space-between"}}><p><span style={{fontSize: '1rem', marginRight: 10}}>📨</span> Faktura sendt til kunden d. {new Date(opgave.fakturaSendt).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p><a href={opgave.fakturaPDFUrl} target="_blank" rel="noopener noreferrer" className={ÅbenOpgaveCSS.åbnFakturaATag}><button className={ÅbenOpgaveCSS.åbnFakturaButton}>Åbn</button></a></div>)}
                                {opgave.opgaveAfsluttet && ((typeof opgave.opgaveAfsluttet === 'boolean') ? <p style={{marginTop: 10}}className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>✔︎</span> Opgaven er afsluttet.</p> : <p style={{marginTop: 10}}className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>✔︎</span> Opgaven er afsluttet d. {new Date(opgave.opgaveAfsluttet).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>)}
                                {opgave.opgaveBetaltMedMobilePay && <p style={{marginTop: 10}} className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>💵</span> Mobile Pay-betaling registreret d. {new Date(opgave.opgaveBetaltMedMobilePay).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>}
                                {opgave.fakturaBetalt && <p style={{marginTop: 10}} className={ÅbenOpgaveCSS.infoLine}><span style={{fontSize: '1rem', marginRight: 10}}>💵</span> Faktura betalt d. {new Date(opgave.fakturaBetalt).toLocaleDateString('da-DK', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>}
                                
                                
                                {/* Erhvervskunde -> send faktura || !Erhvervskunde -> Opret regning*/}
                                {(opgave.virksomhed || opgave.CVR) ? (!opgave.fakturaSendt 
                                    && <button className={ÅbenOpgaveCSS.startBetalingButton} onClick={() => setÅbnOpretFakturaModal(true)}>Opret faktura<br /><span>Kunden er registreret som erhvervskunde</span></button> 
                                ) : (!opgave.fakturaSendt && !opgave.opgaveAfsluttet) && <button className={ÅbenOpgaveCSS.startBetalingButton} onClick={() => setÅbnOpretRegningModal(true)}>Opret regning<br /><span>Kunden er registreret som privatkunde</span></button>
                                }

                                {/* <RegistrerBetalingsModal trigger={registrerBetalingsModal} setTrigger={setRegistrerBetalingsModal} opgave={opgave} setUpdateOpgave={setUpdateOpgave} updateOpgave={updateOpgave}/> */}
                                {!opgave.opgaveAfsluttet 
                                    && 
                                    <div className={ÅbenOpgaveCSS.ikkeAfsluttetButtonsDiv}>
                                        <button className={ÅbenOpgaveCSS.genåbnButton} onClick={() => setTvingAfslutOpgaveModal(true)}>Afslut uden betaling</button>
                                        <button className={ÅbenOpgaveCSS.genåbnButton} onClick={() => åbnForÆndringer()}>Genåbn opgave</button>
                                    </div>
                                }

                            </div> 
                            : 
                            posteringer.length > 0 && 
                                <button className={ÅbenOpgaveCSS.markerSomFærdigKnap} onClick={() => færdiggørOpgave()}>Markér opgave som færdig</button>
                        )
                    }
                    {!opgave.virksomhed && !opgave.CVR && <OpretRegningModal user={user} opgave={opgave} setOpgave={setOpgave} opgaveID={opgaveID} posteringer={posteringer} setOpgaveAfsluttet={setOpgaveAfsluttet} åbnOpretRegningModal={åbnOpretRegningModal} setÅbnOpretRegningModal={setÅbnOpretRegningModal} vilBetaleMedMobilePay={vilBetaleMedMobilePay} setVilBetaleMedMobilePay={setVilBetaleMedMobilePay} opgaveLøstTilfredsstillende={opgaveLøstTilfredsstillende} setOpgaveLøstTilfredsstillende={setOpgaveLøstTilfredsstillende} allePosteringerUdfyldt={allePosteringerUdfyldt} setAllePosteringerUdfyldt={setAllePosteringerUdfyldt} useBetalMedFaktura={useBetalMedFaktura} totalFaktura={totalFaktura} isEnglish={isEnglish} />}
                    {(opgave.virksomhed || opgave.CVR) && <OpretFakturaModal user={user} opgave={opgave} setOpgave={setOpgave} opgaveID={opgaveID} posteringer={posteringer} setOpgaveAfsluttet={setOpgaveAfsluttet} åbnOpretFakturaModal={åbnOpretFakturaModal} setÅbnOpretFakturaModal={setÅbnOpretFakturaModal} vilBetaleMedMobilePay={vilBetaleMedMobilePay} setVilBetaleMedMobilePay={setVilBetaleMedMobilePay} opgaveLøstTilfredsstillende={opgaveLøstTilfredsstillende} setOpgaveLøstTilfredsstillende={setOpgaveLøstTilfredsstillende} allePosteringerUdfyldt={allePosteringerUdfyldt} setAllePosteringerUdfyldt={setAllePosteringerUdfyldt} useBetalMedFaktura={useBetalMedFaktura} totalFaktura={totalFaktura} setRedigerKundeModal={setRedigerKundeModal} redigerKundeModal={redigerKundeModal} isEnglish={isEnglish} />}
                    </div>
                </div>
                <AfslutUdenBetaling trigger={tvingAfslutOpgaveModal} setTrigger={setTvingAfslutOpgaveModal} opgave={opgave} updateOpgave={updateOpgave} setUpdateOpgave={setUpdateOpgave} />
                {posteringer.length > 0 && user.isAdmin && <div className={ÅbenOpgaveCSS.økonomiDiv}>
                    <b className={ÅbenOpgaveCSS.prefix}>Opgavens økonomi</b>
                    <div className={ÅbenOpgaveCSS.regnskabContainer}>
                        <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.bottomMargin10}`}>Indtægter</b>
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
                            {fastPrisTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Faste priser (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{fastPrisTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {opstartTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Opstartsgebyrer (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{opstartTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {handymanTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Handymantimer (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{handymanTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {tømrerTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Tømrertimer (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{tømrerTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {rådgivningOpmålingVejledningTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Rådgivning, opmåling og vejledning (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{rådgivningOpmålingVejledningTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {aftenTillægTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Aftentillæg (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{aftenTillægTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {natTillægTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Nattilæg (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{natTillægTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {trailerTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Trailer (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{trailerTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {udlægTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Udlæg (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{udlægTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            {rabatterTotalFaktura > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Rabat (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>- {rabatterTotalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>}
                            <div className={`${ÅbenOpgaveCSS.subtotalRække} ${ÅbenOpgaveCSS.totalFakturaRække}`}>
                                <span className={ÅbenOpgaveCSS.subtotalFaktura}>Indtægter, i alt:</span>
                                <span className={ÅbenOpgaveCSS.subtotalFaktura}>{totalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>
                        </>}
                        <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.bottomMargin10}`}>Udgifter</b>
                        <p className={ÅbenOpgaveCSS.opgaveØkonomiRedSubheading}>{opgave && opgave.ansvarlig.length > 1 ? "(medarbejderne skal have)" : "(medarbejderen skal have)"}</p>
                        {fasteHonorarerTotal > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>Faste honorarer (i alt):</span>
                                <span className={ÅbenOpgaveCSS.regnskabTekst}>{fasteHonorarerTotal.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {opstartTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Opstartsgebyrer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{opstartTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {handymanTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Handymantimer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{handymanTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {tømrerTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Tømrertimer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{tømrerTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {rådgivningOpmålingVejledningTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Rådgivning, opmåling og vejledning (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{rådgivningOpmålingVejledningTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {aftenTillægTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Aftentillæg (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{aftenTillægTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {natTillægTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Nattilæg (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{natTillægTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {trailerTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Trailer (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{trailerTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {udlægTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Udlæg (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>{udlægTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        {rabatterTotalHonorar > 0 && <div className={ÅbenOpgaveCSS.regnskabRække}>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>Rabat (i alt):</span>
                            <span className={ÅbenOpgaveCSS.regnskabTekst}>- {rabatterTotalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>}
                        <div className={`${ÅbenOpgaveCSS.subtotalRække} ${ÅbenOpgaveCSS.totalHonorarRække}`}>
                            <span className={ÅbenOpgaveCSS.subtotalHonorar}>Udgifter, i alt:</span>
                            <span className={ÅbenOpgaveCSS.subtotalHonorar}>{totalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                        {user.isAdmin && <>
                            <b className={`${ÅbenOpgaveCSS.prefix} ${ÅbenOpgaveCSS.bottomMargin10}`}>Total</b>
                            {opgave.fakturaOprettesManuelt ? 
                            <>
                                <div className={ÅbenOpgaveCSS.regnskabRække}>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.grønTekst}`}>Indtægter:</span>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.grønTekst}`}>{opgave.tilbudAfgivet ? opgave.tilbudAfgivet.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "Intet tilbud afgivet."} kr.</span>
                                </div>
                                <div className={ÅbenOpgaveCSS.regnskabRække}>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.rødTekst}`}>Udgifter:</span>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.rødTekst}`}>{totalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className={ÅbenOpgaveCSS.dækningsbidragRække}>
                                    <span className={`${ÅbenOpgaveCSS.subtotalFaktura} ${ÅbenOpgaveCSS.sortTekst}`}>Dækningsbidrag:</span>
                                    <span className={`${ÅbenOpgaveCSS.subtotalFaktura} ${ÅbenOpgaveCSS.sortTekst}`}>{opgave.tilbudAfgivet ? (opgave.tilbudAfgivet - totalHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : (0 - totalHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                            </>
                            :
                            <>
                                <div className={ÅbenOpgaveCSS.regnskabRække}>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.grønTekst}`}>Fakturabeløb:</span>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.grønTekst}`}>{totalFaktura.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className={ÅbenOpgaveCSS.regnskabRække}>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.rødTekst}`}>Honorarbeløb:</span>
                                    <span className={`${ÅbenOpgaveCSS.regnskabTekst} ${ÅbenOpgaveCSS.rødTekst}`}>{totalHonorar.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className={ÅbenOpgaveCSS.dækningsbidragRække}>
                                    <span className={`${ÅbenOpgaveCSS.subtotalFaktura} ${ÅbenOpgaveCSS.sortTekst}`}>Dækningsbidrag:</span>
                                    <span className={`${ÅbenOpgaveCSS.subtotalFaktura} ${ÅbenOpgaveCSS.sortTekst}`}>{(totalFaktura - totalHonorar).toLocaleString('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
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
                            <button disabled={!kommentar} onClick={(e) => {e.preventDefault(); submitKommentar();}}>Indsend</button>
                        </div>
                    </form>
                </div>

            </div>
            </PageAnimation>
        </div>
  )
}

export default ÅbenOpgave
