import React, { useMemo, useState } from 'react';
import axios from 'axios';
import Modal from '../Modal.jsx';
import ModalStyles from '../Modal.module.css';
import SBStyles from '../basicComponents/buttons/SettingsButtons.module.css';
import { useAuthContext } from '../../hooks/useAuthContext';
import dayjs from 'dayjs';

const presets = [
  { label: 'Om 10 min (test)', ms: 10 * 60 * 1000 },
  { label: 'Om 2 timer', ms: 2 * 60 * 60 * 1000 },
  { label: 'Om 4 timer', ms: 4 * 60 * 60 * 1000 },
  { label: 'I morgen (24 t)', ms: 24 * 60 * 60 * 1000 },
  { label: 'Om 3 dage', ms: 3 * 24 * 60 * 60 * 1000 },
  { label: 'Om 1 uge', ms: 7 * 24 * 60 * 60 * 1000 },
];

const SaetReminderModal = ({ trigger, setTrigger, opgaveID, existingReminder, onSuccess }) => {
  const { user } = useAuthContext();
  const [presetMs, setPresetMs] = useState(presets[0].ms);
  const [titel, setTitel] = useState('Følg op på opgaven');
  const [beskrivelse, setBeskrivelse] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const sendesKl = useMemo(() => new Date(Date.now() + Number(presetMs)), [presetMs]);
  const formattedTime = useMemo(() => dayjs(sendesKl).format('DD. MMMM HH:mm'), [sendesKl]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');
    if (!titel?.trim()) { setError('Titel er påkrævet'); return; }
    if (titel.length > 60) { setError('Titel må højest være 60 tegn'); return; }
    if (beskrivelse.length > 200) { setError('Beskrivelse må højest være 200 tegn'); return; }
    setSaving(true);
    try {
      if (existingReminder?._id) {
        await axios.patch(`${import.meta.env.VITE_API_URL}/reminders/${existingReminder._id}` , {
          titel: titel.trim(),
          beskrivelse: beskrivelse.trim(),
          sendesKl: sendesKl.toISOString(),
        }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/reminders`, {
          brugerID: user.id || user._id,
          opgaveID,
          titel: titel.trim(),
          beskrivelse: beskrivelse.trim(),
          sendesKl: sendesKl.toISOString(),
        }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
      onSuccess && onSuccess();
      setTrigger(false);
    } catch (err) {
      setError('Kunne ikke oprette reminder. Prøv igen.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReminder?._id) return setTrigger(false);
    setSaving(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/reminders/${existingReminder._id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      onSuccess && onSuccess();
      setTrigger(false);
    } catch (e) {
      setError('Kunne ikke slette reminder.');
    } finally {
      setSaving(false);
    }
  };

  // Prefill when opening for edit
  React.useEffect(() => {
    if (trigger && existingReminder) {
      setTitel(existingReminder.titel || 'Følg op på opgaven');
      setBeskrivelse(existingReminder.beskrivelse || '');
      const diff = new Date(existingReminder.sendesKl).getTime() - Date.now();
      if (diff > 0) {
        // choose nearest preset
        const nearest = presets.reduce((a, b) => Math.abs(b.ms - diff) < Math.abs(a.ms - diff) ? b : a, presets[0]);
        setPresetMs(nearest.ms);
      }
    }
    if (trigger && !existingReminder) {
      setTitel('Følg op på opgaven');
      setBeskrivelse('');
      setPresetMs(presets[0].ms);
    }
  }, [trigger, existingReminder]);

  return (
    <Modal trigger={trigger} setTrigger={setTrigger}>
      <h2 className={ModalStyles.modalHeading}>{existingReminder ? 'Rediger påmindelse' : 'Ny påmindelse'}</h2>
      <div className={ModalStyles.modalSubheadingContainer}>
        <p className={ModalStyles.modalSubheading}>Påmindelsen sendes d. {formattedTime}</p>
      </div>
      <div className={SBStyles.container}>
        <div className={`${SBStyles.row} ${SBStyles.inputLine}`}>
          <div className={SBStyles.iconAndTitleDiv}>
            <h3>Påmind mig ...</h3>
          </div>
          <div className={SBStyles.inputContainer}>
            <select className={SBStyles.inputField} value={presetMs} onChange={(e) => setPresetMs(e.target.value)}>
              {presets.map(p => (
                <option key={p.ms} value={p.ms}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={`${SBStyles.row} ${SBStyles.inputLine}`}>
          <div className={SBStyles.iconAndTitleDiv}>
            <h3 style={{lineHeight: "14px"}}>Titel <br /><span style={{color: "#888", fontSize: "11px"}}>(højst 60 tegn)</span></h3>
          </div>
          <div className={SBStyles.inputContainer}>
            <input
              className={SBStyles.inputField}
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              maxLength={60}
              placeholder="Titel"
            />
          </div>
        </div>

        <div className={`${SBStyles.row} ${SBStyles.inputLine}`}>
          <div className={SBStyles.iconAndTitleDiv}>
            <h3 style={{lineHeight: "14px"}}>Beskrivelse <br /><span style={{color: "#888", fontSize: "11px"}}>(højst 200 tegn)</span></h3>
          </div>
          <div className={SBStyles.inputContainer}>
            <textarea
              className={`${SBStyles.inputField} ${SBStyles.textareaCompact}`}
              value={beskrivelse}
              onChange={(e) => setBeskrivelse(e.target.value)}
              maxLength={200}
              rows={1}
              placeholder="Beskrivelse"
            />
          </div>
        </div>
      </div>

      {error && <p style={{ color: '#c11a39', marginBottom: 10 }}>{error}</p>}

      <button disabled={saving} onClick={handleSubmit} className={ModalStyles.buttonFullWidth}>
        {saving ? 'Gemmer...' : existingReminder ? 'Gem ændringer' : 'Gem reminder'}
      </button>
      {existingReminder && (
        <button disabled={saving} onClick={handleDelete} className={ModalStyles.buttonFullWidth} style={{ marginTop: 10 }}>
          Annullér reminder
        </button>
      )}
    </Modal>
  );
};

export default SaetReminderModal;


