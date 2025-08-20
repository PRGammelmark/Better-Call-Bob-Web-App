import React, { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import Styles from './SeOpkrævningerModal.module.css'
import { useAuthContext } from '../../hooks/useAuthContext.js'
import dayjs from 'dayjs'
import { Smartphone, Banknote, BanknoteArrowDown, Send, Search, Coins, Check, Trash } from 'lucide-react'
import axios from 'axios'

const SeOpkrævningerModal = (props) => {
    const [opkrævninger, setOpkrævninger] = useState(props.postering.opkrævninger);
    const [senesteOpkrævning, setSenesteOpkrævning] = useState(props.postering.opkrævninger.sort((a, b) => new Date(b.dato) - new Date(a.dato))[0]);
    const { user } = useAuthContext();

    const economicHeaders = {
        'Accept': 'application/json',
        'X-AppSecretToken': import.meta.env.VITE_BCBSECRETTOKEN,
        'X-AgreementGrantToken': import.meta.env.VITE_BCBAGREEMENTGRANTTOKEN
    }

    useEffect(() => {
        const betalingerForPostering = props.postering.betalinger || [];
        const opkrævningerForPostering = (props.postering.opkrævninger || []).map(opkrævning => ({
            ...opkrævning,
            betalt: betalingerForPostering.some(betaling => betaling.opkrævningID === opkrævning._id)
        }));
    
        const sortedOpkrævninger = [...opkrævningerForPostering].sort((a, b) => new Date(b.dato) - new Date(a.dato));
        setSenesteOpkrævning(sortedOpkrævninger[0]);
        setOpkrævninger(sortedOpkrævninger.slice(1));
    }, [props.postering.opkrævninger, props.postering.betalinger]);
    

    const betalingsMetodeIkon = (metode) => {
        let betalingsMetodeIkon;

        if(metode === 'mobilepay') {
            betalingsMetodeIkon = <span style={{display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end'}}><Smartphone style={{width: 18, height: 18}}/> <b style={{fontFamily: 'OmnesBold'}}>Mobile Pay</b></span>
        } else if(metode === 'faktura') {
            betalingsMetodeIkon = <span style={{display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end'}}><Banknote style={{width: 18, height: 18}}/> <b style={{fontFamily: 'OmnesBold'}}>Faktura</b></span>
        } else if(metode === 'bankoverførsel') {
            betalingsMetodeIkon = <span style={{display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end'}}><BanknoteArrowDown style={{width: 18, height: 18}}/> <b style={{fontFamily: 'OmnesBold'}}>Bankoverførsel</b></span>
        }

        return betalingsMetodeIkon;
    }

    const seFaktura = async (opkrævning) => {
        if (!opkrævning?.reference) {
          console.error('Ingen bookedInvoiceNumber');
          return;
        }

        const fakturaNummer = opkrævning.reference.split('/').pop();
        const fakturaURL = `https://restapi.e-conomic.com/invoices/booked/${fakturaNummer}/pdf`
        console.log(fakturaURL)
      
        try {
          const response = await axios.get(
            fakturaURL,
            {
              headers: economicHeaders,
              responseType: 'blob'
            }
          );
      
          const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
          window.open(url, '_blank');
        } catch (error) {
          console.error('Kunne ikke hente PDF:', error);
        }
    };
    
    const sendFakturaIgen = async (opkrævning) => {
        if (!opkrævning?.reference) {
            console.error('Ingen bookedInvoiceNumber');
            return;
        }
    
        const email = props.postering.kunde.email;
        const fakturaNummer = opkrævning.reference.split('/').pop();
        
        if(window.confirm("Er du sikker på, at du vil sende denne faktura igen?")) {
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/send-faktura-igen`, {
                    to: email,
                    subject: 'Påmindelse: Din faktura fra Better Call Bob',
                    body: `Hej, vedhæftet finder du faktura ${fakturaNummer}.`,
                    html: `<p>Hej,</p><p>Vedhæftet finder du faktura <b>${fakturaNummer}</b>.</p>`,
                    fakturaNummer
                });
        
                console.log(response.data.message);

                const updatedOpkrævning = { ...opkrævning, fakturaSendtIgen: true };

                // Hvis det er den seneste opkrævning
                if (senesteOpkrævning._id === opkrævning._id) {
                    setSenesteOpkrævning(updatedOpkrævning);
                } else {
                    setOpkrævninger(prev =>
                        prev.map(o => o._id === opkrævning._id ? updatedOpkrævning : o)
                    );
                }

                alert(response.data.message); // evt. vis feedback til brugeren
            } catch (error) {
                console.error('Fejl ved afsendelse af faktura:', error);
                alert('Kunne ikke sende fakturaen. Prøv igen.');
            }
        }
    }

    const tjekBetaling = async (opkrævning) => {
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/tjek-faktura-for-betaling`, { opkrævning });
    
        const updatedOpkrævning = { ...opkrævning, betalt: data.betalt, tjekket: true };
    
        // Hvis det er den seneste opkrævning
        if (senesteOpkrævning._id === opkrævning._id) {
            setSenesteOpkrævning(updatedOpkrævning);
        } else {
            setOpkrævninger(prev =>
                prev.map(o => o._id === opkrævning._id ? updatedOpkrævning : o)
            );
        }
    };

    const sletOpkrævning = async (opkrævning) => {
        if(window.confirm("Er du sikker på, at du vil slette denne opkrævning?")) {
            await axios.patch(`${import.meta.env.VITE_API_URL}/posteringer/${props.postering._id}`, { opkrævninger: props.postering.opkrævninger.filter(o => o._id !== opkrævning._id) }, { headers: { 'Authorization': `Bearer ${user.token}` } });
            await props.refetchPostering();
        }
    } 

  return (
    <Modal trigger={props.trigger} setTrigger={props.setTrigger}> 
        <h2>Opkrævninger for denne postering</h2>
        <p style={{color: '#808080', fontSize: 16, marginBottom: 20}}>Opkrævningerne herunder viser de gange, hvor systemet har anmodet kunden om betaling for posteringen.</p>
        <b style={{fontSize: 20, fontFamily: 'OmnesBold'}}>Seneste opkrævning:</b>
        <div className={Styles.senesteOpkrævning}>
            <div className={Styles.opkrævningerHeader}>
                <div>
                    <p>{dayjs(senesteOpkrævning?.dato).format('D. MMMM YYYY')}</p>
                    <p className={Styles.klokkeslæt}>Kl. {dayjs(senesteOpkrævning?.dato).format('HH:mm')}</p>
                </div>
                <div className={Styles.betalingsMetodeIkonWrapper}>
                    <b style={{fontFamily: 'OmnesBold', textAlign: 'right'}}>{betalingsMetodeIkon(senesteOpkrævning?.metode)}</b>
                    {senesteOpkrævning?.betalt && <span className={Styles.betaltPill}>Betalt <Check style={{width: 15, height: 15}}/></span>}
                    {user.isAdmin && senesteOpkrævning?.manueltRegistreret && <button className={Styles.fakturaKnap} style={{marginTop: 10}} onClick={() => sletOpkrævning(senesteOpkrævning)}>Slet opkrævning <Trash style={{width: 15, height: 15}}/></button>}
                </div>
            </div>
            <div className={Styles.betalingerFooter}>
                {senesteOpkrævning?.reference && <>
                    <p style={{fontSize: 12, color: '#808080'}}>Reference: {senesteOpkrævning?.reference}</p>
                </>}
            </div>
            {senesteOpkrævning?.metode === 'faktura' && <>
                {!senesteOpkrævning?.betalt && (senesteOpkrævning?.tjekket ? <button className={Styles.tjekBetalingKnap} disabled style={{backgroundColor: '#c0c0c0', color: '#808080'}}>Faktura ikke betalt</button> : <button className={Styles.tjekBetalingKnap} onClick={() => tjekBetaling(senesteOpkrævning)}>Tjek betaling <Coins style={{width: 15, height: 15}}/></button>)}
                <div className={Styles.fakturaKnapperWrapper}>
                    <button className={Styles.fakturaKnap} onClick={() => seFaktura(senesteOpkrævning)}>Se faktura <Search style={{width: 15, height: 15}}/></button>
                    {!senesteOpkrævning?.fakturaSendtIgen ? <button className={Styles.fakturaKnap} onClick={() => sendFakturaIgen(senesteOpkrævning)}>Send igen <Send style={{width: 15, height: 15}}/></button> : <button className={Styles.fakturaKnap} disabled style={{cursor: 'default'}}>Sendt <Check style={{width: 15, height: 15}}/></button>}
                </div>
            </>}
        </div>
        {opkrævninger.length > 0 && <b style={{fontSize: 20, fontFamily: 'OmnesBold'}}>Tidligere opkrævninger:</b>}
        <div className={Styles.opkrævningerContainer}>
            {opkrævninger.map((opkrævning) => (
                <div key={opkrævning?._id} className={Styles.opkrævningWrapper}>
                    <div className={Styles.opkrævningCard}>
                        <div className={Styles.opkrævningerHeader}>
                            <div>
                                <p>{dayjs(opkrævning.dato).format('D. MMMM YYYY')}</p>
                                <p className={Styles.klokkeslæt}>Kl. {dayjs(opkrævning.dato).format('HH:mm')}</p>
                            </div>
                            <div className={Styles.betalingsMetodeIkonWrapper}>
                                <b style={{fontFamily: 'OmnesBold'}}>{betalingsMetodeIkon(opkrævning.metode)}</b>
                                {opkrævning?.betalt && <span className={Styles.betaltPill}>Betalt <Check style={{width: 15, height: 15}}/></span>}
                                {user.isAdmin && opkrævning?.manueltRegistreret && <button className={Styles.fakturaKnap} style={{marginTop: 10}} onClick={() => sletOpkrævning(opkrævning)}>Slet <Trash style={{width: 15, height: 15}}/></button>}
                            </div>
                        </div>
                        <div className={Styles.betalingerFooter} style={{marginTop: 40}}>
                            {opkrævning?.reference && <>
                                <p style={{fontSize: 12, color: '#808080'}}>Reference: {opkrævning.reference}</p>
                            </>}
                        </div>
                        {opkrævning?.metode === 'faktura' && <>
                            {!opkrævning?.betalt && (opkrævning?.tjekket ? <button className={Styles.tjekBetalingKnap} disabled style={{backgroundColor: '#c0c0c0', color: '#808080', marginTop: 20}}>Faktura ikke betalt</button> : <button className={Styles.tjekBetalingKnap} style={{marginTop: 20}} onClick={() => tjekBetaling(opkrævning)}>Tjek betaling <Coins style={{width: 15, height: 15 }}/></button>)}
                            <div className={Styles.fakturaKnapperWrapper} style={{marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10}}>
                                <button className={Styles.fakturaKnap} onClick={() => seFaktura(opkrævning)}>Se faktura <Search style={{width: 15, height: 15}}/></button>
                                <button className={Styles.fakturaKnap} onClick={() => sendFakturaIgen(opkrævning)}>Send igen <Send style={{width: 15, height: 15}}/></button>
                            </div>
                        </>}
                    </div>
                </div>
            ))}
        </div>
    </Modal>
  )
}

export default SeOpkrævningerModal

