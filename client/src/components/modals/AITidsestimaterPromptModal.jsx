import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import ModalStyles from '../Modal.module.css'
import Styles from './AISystemPromptModal.module.css'

const AITidsestimaterPromptModal = ({ trigger, setTrigger, user, indstillinger }) => {
    const [tidsestimaterPrompt, setTidsestimaterPrompt] = useState("")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    useEffect(() => {
        if (trigger) {
            // Load current time estimate prompt
            const currentPrompt = indstillinger?.aiTidsestimaterPrompt || ""
            setTidsestimaterPrompt(currentPrompt)
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
                { aiTidsestimaterPrompt: tidsestimaterPrompt },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
            setSuccess("Prompt til tidsestimater gemt!")
            setTimeout(() => {
                setSuccess("")
            }, 3000)
        } catch (err) {
            console.error("Fejl ved gemning af tidsestimater prompt:", err)
            setError(err.response?.data?.error || "Kunne ikke gemme prompt til tidsestimater. Prøv igen.")
        } finally {
            setSaving(false)
        }
    }

    const handleReset = () => {
        setTidsestimaterPrompt("")
    }

    return (
        <Modal trigger={trigger} setTrigger={setTrigger}>
            <h2 className={ModalStyles.modalHeading}>Tidsestimater</h2>
            <p className={Styles.modalDescription}>
                Tilføj regler og retningslinjer, almene eller specifikke, som AI'en skal følge når den estimerer tidsforbrug for opgaver baseret på opgavebeskrivelser.
            </p>
            
            <form onSubmit={handleSave}>
                <label className={ModalStyles.modalLabel} htmlFor="tidsestimater-prompt">
                    Regler og retningslinjer
                </label>
                <textarea
                    className={`${ModalStyles.modalInput} ${Styles.textarea}`}
                    id="tidsestimater-prompt"
                    rows="10"
                    value={tidsestimaterPrompt}
                    onChange={(e) => setTidsestimaterPrompt(e.target.value)}
                    placeholder="Tilføj regler og retningslinjer her, f.eks.:&#10;- VVS-opgaver tager typisk 2-4 timer&#10;- Tømrerarbejde skal estimeres konservativt med ekstra tid til materialehåndtering&#10;- Rengøringsopgaver tager normalt 1-2 timer afhængigt af størrelse"
                    disabled={saving}
                />
                
                <div className={Styles.buttonRow}>
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={saving || !tidsestimaterPrompt}
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

export default AITidsestimaterPromptModal

