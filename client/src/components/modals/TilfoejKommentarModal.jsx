import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../Modal.jsx';
import ModalStyles from '../Modal.module.css';
import { useAuthContext } from '../../hooks/useAuthContext';

const TilfoejKommentarModal = ({ trigger, setTrigger, opgaveID, onSuccess }) => {
  const { user } = useAuthContext();
  const [kommentar, setKommentar] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');
    
    if (!kommentar?.trim()) {
      setError('Kommentar kan ikke være tom');
      return;
    }

    setSaving(true);
    try {
      const kommentarObject = {
        kommentarIndhold: kommentar.trim(),
        brugerID: user.id || user._id,
        opgaveID: opgaveID
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/kommentarer/`, kommentarObject, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      setKommentar('');
      onSuccess && onSuccess();
      setTrigger(false);
    } catch (err) {
      setError('Kunne ikke tilføje kommentar. Prøv igen.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Reset form when modal closes
  React.useEffect(() => {
    if (!trigger) {
      setKommentar('');
      setError('');
    }
  }, [trigger]);

  return (
    <Modal trigger={trigger} setTrigger={setTrigger}>
      <h2 className={ModalStyles.modalHeading}>Tilføj kommentar</h2>
      <form onSubmit={handleSubmit}>
        <label className={ModalStyles.modalLabel} htmlFor="kommentar-indhold">
          Kommentar
        </label>
        <textarea
          className={ModalStyles.modalInput}
          id="kommentar-indhold"
          rows="5"
          value={kommentar}
          onChange={(e) => setKommentar(e.target.value)}
          placeholder="Skriv din kommentar her..."
          disabled={saving}
        />
        {error && <p style={{ color: '#c11a39', marginBottom: 10 }}>{error}</p>}
        <button
          type="submit"
          disabled={saving || !kommentar?.trim()}
          className={ModalStyles.buttonFullWidth}
        >
          {saving ? 'Gemmer...' : 'Tilføj kommentar'}
        </button>
      </form>
    </Modal>
  );
};

export default TilfoejKommentarModal;

