import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import ModalStyles from '../Modal.module.css'
import Styles from './AISystemPromptModal.module.css'

const AISystemPromptModal = ({ trigger, setTrigger, user, indstillinger }) => {
    const [extraRules, setExtraRules] = useState("")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    useEffect(() => {
        if (trigger) {
            // Load current extra rules
            const currentRules = indstillinger?.aiExtraRules || ""
            setExtraRules(currentRules)
            setError("")
            setSuccess("")
        }
    }, [trigger, indstillinger])

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError("")
        setSuccess("")

        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/indstillinger`,
                { aiExtraRules: extraRules },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
            setSuccess("Regler og retningslinjer gemt!")
            setTimeout(() => {
                setSuccess("")
            }, 3000)
        } catch (err) {
            console.error("Fejl ved gemning af ekstra regler:", err)
            setError(err.response?.data?.error || "Kunne ikke gemme regler og retningslinjer. Prøv igen.")
        } finally {
            setSaving(false)
        }
    }

    const handleReset = () => {
        setExtraRules("")
    }

    return (
        <Modal trigger={trigger} setTrigger={setTrigger}>
            <h2 className={ModalStyles.modalHeading}>Opfølgende spørgsmål</h2>
            <p className={Styles.modalDescription}>
                Tilføj regler og retningslinjer, almene eller specifikke, som AI'en skal følge når den stiller opfølgende spørgsmål til opgavebeskrivelsen.
            </p>
            
            <form onSubmit={handleSave}>
                <label className={ModalStyles.modalLabel} htmlFor="extra-rules">
                    Regler og retningslinjer
                </label>
                <textarea
                    className={`${ModalStyles.modalInput} ${Styles.textarea}`}
                    id="extra-rules"
                    rows="10"
                    value={extraRules}
                    onChange={(e) => setExtraRules(e.target.value)}
                    placeholder="Tilføj regler og retningslinjer her, f.eks.:&#10;- Fokuser på specifikke materialer&#10;- Spørg altid om adgang til området&#10;- Undgå at spørge om information der allerede er givet"
                    disabled={saving}
                />
                
                <div className={Styles.buttonRow}>
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={saving || !extraRules}
                        className={Styles.resetButton}
                    >
                        Ryd regler
                    </button>
                </div>

                {error && <p className={ModalStyles.errorMessage}>{error}</p>}
                {success && <p className={ModalStyles.successMessage}>{success}</p>}
                
                <button
                    type="submit"
                    disabled={saving}
                    className={ModalStyles.buttonFullWidth}
                >
                    {saving ? 'Gemmer...' : 'Gem regler og retningslinjer'}
                </button>
            </form>
        </Modal>
    )
}

export default AISystemPromptModal

