import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import dayjs from 'dayjs'
import axios from 'axios'
import Modal from '../Modal.jsx'
import ModalStyles from '../Modal.module.css'
import { useAuthContext } from '../../hooks/useAuthContext'
import { MapPin, Calendar, Clock, ArrowRight } from 'lucide-react'

const BesoegsInfoModal = ({
  trigger,
  setTrigger,
  besoegId,
  onUpdated,
  onDeleted
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [besoeg, setBesoeg] = useState(null)
  const [opgave, setOpgave] = useState(null)
  const [medarbejder, setMedarbejder] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [timeFrom, setTimeFrom] = useState("")
  const [timeTo, setTimeTo] = useState("")
  const [comment, setComment] = useState("")

  const token = user?.token

  useEffect(() => {
    if (!trigger) return
    if (!besoegId || !token) return
    let active = true
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const resB = await axios.get(`${import.meta.env.VITE_API_URL}/besoeg/${besoegId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!active) return
        const b = resB.data
        setBesoeg(b)
        setSelectedDate(dayjs(b.datoTidFra).format('YYYY-MM-DD'))
        setTimeFrom(dayjs(b.datoTidFra).format('HH:mm'))
        setTimeTo(dayjs(b.datoTidTil).format('HH:mm'))
        setComment(b.kommentar || "")
        if (b.opgaveID) {
          const resO = await axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${b.opgaveID}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (!active) return
          setOpgave(resO.data)
        } else {
          setOpgave(null)
        }
        if (b.brugerID) {
          try {
            const resU = await axios.get(`${import.meta.env.VITE_API_URL}/brugere/${b.brugerID}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            if (!active) return
            setMedarbejder(resU.data)
          } catch (e) {
            // Ignore error if user not found
            if (active) setMedarbejder(null)
          }
        } else {
          setMedarbejder(null)
        }
      } catch (e) {
        if (!active) return
        setError('Kunne ikke hente besøg.')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchData()
    return () => { active = false }
  }, [trigger, besoegId, token])

  const kundeNavn = useMemo(() => opgave?.kunde?.navn || opgave?.kunde?.fornavn && opgave?.kunde?.efternavn ? `${opgave?.kunde?.fornavn} ${opgave?.kunde?.efternavn}` : "", [opgave])
  const adresse = useMemo(() => {
    if (!opgave?.kunde?.adresse) return ""
    const adr = opgave.kunde.adresse
    const postnummerOgBy = opgave.kunde.postnummerOgBy
    return postnummerOgBy ? `${adr}, ${postnummerOgBy}` : adr
  }, [opgave])

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = String(name).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleDelete = async () => {
    if (!besoeg?._id) return
    const confirm = window.confirm('Er du sikker på, at du vil slette dette besøg?')
    if (!confirm) return
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/besoeg/${besoeg._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      onDeleted && onDeleted(besoeg)
      setTrigger(false)
    } catch (e) {
      setError('Kunne ikke slette besøg.')
    }
  }

  const handleUpdate = async (e) => {
    e?.preventDefault()
    if (!besoeg?._id) return
    const payload = {
      datoTidFra: dayjs(`${selectedDate}T${timeFrom}:00.000${dayjs().format('Z')}`),
      datoTidTil: dayjs(`${selectedDate}T${timeTo}:00.000${dayjs().format('Z')}`),
      kommentar: comment || ""
    }
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/besoeg/${besoeg._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      onUpdated && onUpdated()
      setEditMode(false)
      setTrigger(false)
    } catch (e) {
      setError('Kunne ikke opdatere besøg.')
    }
  }

  const resetState = () => {
    setLoading(false);
    setError(null);
    setBesoeg(null)
    setOpgave(null)
    setMedarbejder(null)
    setEditMode(false)
    setSelectedDate("")
    setTimeFrom("")
    setTimeTo("")
    setComment("")
  }

  return (
    <Modal trigger={trigger} setTrigger={setTrigger} onClose={resetState}>
      {loading || (trigger && !besoeg && !error) ? (
        <>
          <div className={`${ModalStyles.skeletonLine} ${ModalStyles.skeletonHeading}`}></div>
          <div className={`${ModalStyles.skeletonLine} ${ModalStyles.skeletonText}`}></div>
          <div className={`${ModalStyles.skeletonLine} ${ModalStyles.skeletonTextShort}`}></div>
          <div className={`${ModalStyles.skeletonLine} ${ModalStyles.skeletonText}`} style={{ width: '80%' }}></div>
          <div className={`${ModalStyles.skeletonLine} ${ModalStyles.skeletonButton}`}></div>
        </>
      ) : error ? (
        <p className={ModalStyles.errorMessage}>{error}</p>
      ) : !besoeg ? (
        <p>Ingen data</p>
      ) : editMode ? (
        <>
          <h2 className={ModalStyles.modalHeading}>Rediger besøg</h2>
          <div className={ModalStyles.modalSubheadingContainer}>
            <h3 className={ModalStyles.modalSubheading}>Kunde: {kundeNavn || '—'}</h3>
            {adresse && <h3 className={ModalStyles.modalSubheading}>{adresse}</h3>}
          </div>
          <form onSubmit={handleUpdate}>
            <label className={ModalStyles.modalLabel} htmlFor="besoeg-dato">Dato</label>
            <input className={ModalStyles.modalInput} type="date" id="besoeg-dato" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            <label className={ModalStyles.modalLabel} htmlFor="besoeg-tid-fra">Tid</label>
            <div className={ModalStyles.timeInputs}>
              <div className={ModalStyles.timeInput}>
                <input className={ModalStyles.modalInput} type="time" id="besoeg-tid-fra" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} />
              </div>
              <div className={ModalStyles.timeSeparator}>–</div>
              <div className={ModalStyles.timeInput}>
                <input className={ModalStyles.modalInput} type="time" id="besoeg-tid-til" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} />
              </div>
            </div>
            <label className={ModalStyles.modalLabel} htmlFor="besoeg-kommentar">Evt. noter til besøg</label>
            <textarea className={ModalStyles.modalInput} id="besoeg-kommentar" rows="3" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className={ModalStyles.buttonFullWidth}>Opdatér besøg</button>
          </form>
        </>
      ) : (
        <>
          <h2 className={ModalStyles.modalHeading}>Besøg hos {kundeNavn || '—'}</h2>
          {medarbejder && (
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <span style={{
                height: '18px',
                width: '18px',
                borderRadius: '50%',
                background: '#ebf5de',
                border: '1px solid #c7e9b9',
                color: '#3c5a3f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'OmnesBold',
                fontSize: '0.55rem',
                marginLeft: '-2.5px'
              }}>
                {getInitials(medarbejder.navn)}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>{medarbejder.navn}</span>
            </p>
          )}
          {adresse && (
            <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px', fontSize: '0.85rem' }}>
              <MapPin size={14} style={{ color: '#666' }} />
              <span style={{ color: '#666' }}>{adresse}</span>
            </p>
          )}
          <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
            <Calendar size={14} style={{ color: '#666' }} />
            <span style={{ color: '#666' }}>{dayjs(besoeg.datoTidFra).format('D. MMMM')}</span>
            <Clock size={14} style={{ marginLeft: '10px', color: '#666' }} />
            <span style={{ color: '#666' }}>{dayjs(besoeg.datoTidFra).format('HH:mm')}-{dayjs(besoeg.datoTidTil).format('HH:mm')}</span>
          </p>
          {besoeg.kommentar && (
            <>
              <br />
              <b className={ModalStyles.bold}>Noter til besøg</b>
              <p>{besoeg.kommentar}</p>
            </>
          )}
          {opgave?.opgaveBeskrivelse && (
            <>
              <br />
              <b className={ModalStyles.bold}>Oprindelig opgavebeskrivelse:</b>
              <p>{opgave.opgaveBeskrivelse}</p>
            </>
          )}
          {opgave?._id && !location.pathname.includes(`/opgave/${opgave._id}`) && (
            <button className={ModalStyles.buttonFullWidth} onClick={() => navigate(`../opgave/${opgave._id}`)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#fff' }}>
              <span style={{ color: '#fff', fontSize: '0.85rem', fontFamily: 'OmnesBold' }}>Gå til opgaven</span>
              <ArrowRight size={18} />
            </button>
          )}
          {(besoeg.brugerID === (user?.id || user?._id) || user.isAdmin) && <div className={ModalStyles.deleteEditButtons} style={{ marginTop: location.pathname.includes(`/opgave/${opgave?._id}`) ? '20px' : undefined }}>
            <button className={ModalStyles.deleteButton} style={{marginTop: 0}} onClick={handleDelete}>Slet besøg</button>
            <button className={ModalStyles.editButton} onClick={() => setEditMode(true)}>Rediger besøg</button>
          </div>}
        </>
      )}
    </Modal>
  )
}

export default BesoegsInfoModal