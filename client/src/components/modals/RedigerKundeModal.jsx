import React, { useState, useEffect } from 'react'
import Modal from '../Modal'
import ModalCSS from '../Modal.module.css'
import Styles from './RedigerKundeModal.module.css'
import ÅbenOpgaveCSS from '../../pages/ÅbenOpgave.module.css'
import axios from 'axios'
import { useAuthContext } from '../../hooks/useAuthContext'
import SettingsButtons from '../basicComponents/buttons/SettingsButtons'
import { User, MapPin, Mail, Phone, Building, Hash, Wrench, Megaphone, Globe } from 'lucide-react'

const RedigerKundeModal = ({redigerKundeModal, setRedigerKundeModal, kunde, opdaterKunde, setOpdaterKunde}) => {

    const { user } = useAuthContext()
    
    const [nyeKundeinformationer, setNyeKundeinformationer] = useState({
        fornavn: kunde?.fornavn,
        efternavn: kunde?.efternavn,
        navn: kunde?.fornavn + " " + kunde?.efternavn,
        adresse: kunde?.adresse,
        postnummerOgBy: kunde?.postnummerOgBy,
        telefon: kunde?.telefon,
        email: kunde?.email,
                virksomhed: kunde?.virksomhed,
                CVR: kunde?.CVR,
                fakturerbarAdresse: kunde?.fakturerbarAdresse,
                engelskKunde: kunde?.engelskKunde,
        harStige: kunde?.harStige,
        måKontaktesMedReklame: kunde?.måKontaktesMedReklame
    })
    const [error, setError] = useState("")

    // Sætter friske kundeinformationer i modalen, når kunden er initialiseret i parent-komponenten
    useEffect(() => {
        if (kunde) {
            setNyeKundeinformationer({
                fornavn: kunde.fornavn || "",
                efternavn: kunde.efternavn || "",
                navn: (kunde.fornavn || "") + " " + (kunde.efternavn || ""),
                adresse: kunde.adresse || "",
                postnummerOgBy: kunde.postnummerOgBy || "",
                telefon: kunde.telefon || "",
                email: kunde.email || "",
                virksomhed: kunde.virksomhed || "",
                CVR: kunde.CVR || "",
                fakturerbarAdresse: kunde.fakturerbarAdresse || "",
                engelskKunde: kunde.engelskKunde || false,
                harStige: kunde.harStige || false,
                måKontaktesMedReklame: kunde.måKontaktesMedReklame || false
            })
        }
    }, [kunde])

    // Sikrer, at navn opdateres korrekt, når fornavn eller efternavn ændres
    useEffect(() => {
        setNyeKundeinformationer(prev => ({
            ...prev,
            navn: `${prev.fornavn} ${prev.efternavn}`.trim()
        }))
    }, [nyeKundeinformationer.fornavn, nyeKundeinformationer.efternavn])

    function redigerKunde(e) {
        e.preventDefault()
        
        axios.patch(`${import.meta.env.VITE_API_URL}/kunder/${kunde._id}`, nyeKundeinformationer, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(res => {
            console.log(res)
            setOpdaterKunde(!opdaterKunde)
            setRedigerKundeModal(false)
        })
        .catch(err => {
            console.log(err)
            setError(err.response.data.error)
        })
    }

  return (
    <Modal trigger={redigerKundeModal} setTrigger={setRedigerKundeModal}>
            <h2 className={ÅbenOpgaveCSS.modalHeading}>Rediger kundeinformationer</h2>
            <form className={ÅbenOpgaveCSS.redigerKundeForm} onSubmit={redigerKunde}>
                <SettingsButtons
                    items={[
                        {
                            title: "Fornavn",
                            icon: <User />,
                            input: true,
                            type: "text",
                            value: nyeKundeinformationer.fornavn || "",
                            onChange: (v) => setNyeKundeinformationer({...nyeKundeinformationer, fornavn: v}),
                            onBlur: (e) => setNyeKundeinformationer({...nyeKundeinformationer, fornavn: e.target.value.trim()})
                        },
                        {
                            title: "Efternavn",
                            icon: <User />,
                            input: true,
                            type: "text",
                            value: nyeKundeinformationer.efternavn || "",
                            onChange: (v) => setNyeKundeinformationer({...nyeKundeinformationer, efternavn: v}),
                            onBlur: (e) => setNyeKundeinformationer({...nyeKundeinformationer, efternavn: e.target.value.trim()})
                        },
                        {
                            title: "Adresse",
                            icon: <MapPin />,
                            input: true,
                            type: "text",
                            value: nyeKundeinformationer.adresse || "",
                            onChange: (v) => setNyeKundeinformationer({...nyeKundeinformationer, adresse: v}),
                            onBlur: (e) => setNyeKundeinformationer({...nyeKundeinformationer, adresse: e.target.value.trim()})
                        },
                        {
                            title: "Postnummer og by",
                            icon: <MapPin />,
                            input: true,
                            type: "text",
                            value: nyeKundeinformationer.postnummerOgBy || "",
                            onChange: (v) => setNyeKundeinformationer({...nyeKundeinformationer, postnummerOgBy: v}),
                            onBlur: (e) => setNyeKundeinformationer({...nyeKundeinformationer, postnummerOgBy: e.target.value.trim()})
                        },
                        {
                            title: "E-mail",
                            icon: <Mail />,
                            input: true,
                            type: "email",
                            value: nyeKundeinformationer.email || "",
                            onChange: (v) => setNyeKundeinformationer({...nyeKundeinformationer, email: v}),
                            onBlur: (e) => setNyeKundeinformationer({...nyeKundeinformationer, email: e.target.value.replace(/\s+/g, '')})
                        },
                        {
                            title: "Telefon",
                            icon: <Phone />,
                            input: true,
                            type: "text",
                            value: nyeKundeinformationer.telefon || "",
                            onChange: (v) => setNyeKundeinformationer({...nyeKundeinformationer, telefon: v}),
                            onBlur: (e) => setNyeKundeinformationer({...nyeKundeinformationer, telefon: e.target.value.replace(/\s+/g, '')})
                        },
                        {
                            title: "Virksomhed",
                            icon: <Building />,
                            input: true,
                            type: "text",
                            value: nyeKundeinformationer.virksomhed || "",
                            onChange: (v) => setNyeKundeinformationer({...nyeKundeinformationer, virksomhed: v}),
                            onBlur: (e) => setNyeKundeinformationer({...nyeKundeinformationer, virksomhed: e.target.value.trim()})
                        },
                        {
                            title: "CVR-nummer",
                            icon: <Hash />,
                            input: true,
                            type: "text",
                            value: nyeKundeinformationer.CVR || "",
                            placeholder: "CVR-nummer",
                            onChange: (v) => setNyeKundeinformationer({...nyeKundeinformationer, CVR: v.toUpperCase().replace(/\s+/g, '')}),
                            onBlur: (e) => setNyeKundeinformationer({...nyeKundeinformationer, CVR: e.target.value.toUpperCase().replace(/\s+/g, '')})
                        },
                        {
                            title: "Fakturerbar adresse",
                            icon: <MapPin />,
                            input: true,
                            type: "text",
                            value: nyeKundeinformationer.fakturerbarAdresse || "",
                            placeholder: "Fakturerbar adresse",
                            onChange: (v) => setNyeKundeinformationer({...nyeKundeinformationer, fakturerbarAdresse: v}),
                            onBlur: (e) => setNyeKundeinformationer({...nyeKundeinformationer, fakturerbarAdresse: e.target.value.trim()})
                        },
                        {
                            title: "Må kontaktes med reklame",
                            icon: <Megaphone />,
                            switch: true,
                            checked: nyeKundeinformationer.måKontaktesMedReklame || false,
                            onChange: (checked) => setNyeKundeinformationer({...nyeKundeinformationer, måKontaktesMedReklame: checked})
                        },
                        {
                            title: "Har stige",
                            icon: <Wrench />,
                            switch: true,
                            checked: nyeKundeinformationer.harStige || false,
                            onChange: (checked) => setNyeKundeinformationer({...nyeKundeinformationer, harStige: checked})
                        },
                        {
                            title: "Engelsk kunde",
                            subtitle: "Automatiske e-mails, SMS'er og regninger til kunden vil være på engelsk.",
                            icon: <Globe />,
                            switch: true,
                            checked: nyeKundeinformationer.engelskKunde || false,
                            onChange: (checked) => setNyeKundeinformationer({...nyeKundeinformationer, engelskKunde: checked})
                        }
                    ]}
                />
                <button className={ModalCSS.buttonFullWidth} type="submit" style={{marginTop: 20}}>Opdater kunde</button>
                {error && <p style={{color: "red", marginTop: 10}}>{error}</p>}
            </form>
        </Modal>
  )
}

export default RedigerKundeModal
