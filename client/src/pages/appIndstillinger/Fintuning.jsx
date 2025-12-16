import React from 'react'
import { Clock, MessageCircleQuestion } from 'lucide-react'
import SettingsButtons from '../../components/basicComponents/buttons/SettingsButtons.jsx'
import AISystemPromptModal from '../../components/modals/AISystemPromptModal.jsx'
import AITidsestimaterPromptModal from '../../components/modals/AITidsestimaterPromptModal.jsx'
import Styles from './SettingsPage.module.css'

const Fintuning = ({ 
    indstillinger,
    user,
    visAISystemPromptModal,
    setVisAISystemPromptModal,
    visAITidsestimaterPromptModal,
    setVisAITidsestimaterPromptModal
}) => {
    return (
        <div className={Styles.settingsPage}>
            <h1>Fintuning</h1>
            <p className={Styles.infoText}>
                Administrer indstillinger til bookingsystemet. Tilpas AI'en, der genererer opfølgende spørgsmål baseret på opgavebeskrivelser.
            </p>
            <SettingsButtons
                items={[
                    {
                        title: "Opfølgende spørgsmål",
                        icon: <MessageCircleQuestion />,
                        onClick: () => setVisAISystemPromptModal(true),
                        value: indstillinger?.aiExtraRules ? "Tilpasset" : "Standard",
                    },
                    {
                        title: "Tidsestimater",
                        icon: <Clock />,
                        onClick: () => setVisAITidsestimaterPromptModal(true),
                        value: indstillinger?.aiTidsestimaterPrompt ? "Tilpasset" : "Standard",
                    }
                ]}
            />

            <AISystemPromptModal 
                trigger={visAISystemPromptModal} 
                setTrigger={setVisAISystemPromptModal} 
                user={user} 
                indstillinger={indstillinger} 
            />
            <AITidsestimaterPromptModal 
                trigger={visAITidsestimaterPromptModal} 
                setTrigger={setVisAITidsestimaterPromptModal} 
                user={user} 
                indstillinger={indstillinger} 
            />
        </div>
    )
}

export default Fintuning

