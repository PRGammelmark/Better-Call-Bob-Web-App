import React, { useState } from 'react'
import { Info, Hammer, Radius, Download } from 'lucide-react'
import SettingsButtons from '../../components/basicComponents/buttons/SettingsButtons.jsx'
import SeOpgavetyperModal from '../../components/modals/SeOpgavetyperModal.jsx'
import ImportOpgavetyperModal from '../../components/modals/ImportOpgavetyperModal.jsx'
import Styles from './SettingsPage.module.css'

const Arbejdspræferencer = ({ 
    opgavetyper,
    indstillinger,
    user,
    refetchOpgavetyper,
    setRefetchOpgavetyper,
    maxArbejdsradius,
    setMaxArbejdsradius,
    handleRadiusBlur
}) => {
    const [visOpgavetyperInfo, setVisOpgavetyperInfo] = useState(false)
    const [visOpgavetyperModal, setVisOpgavetyperModal] = useState(false)
    const [visImportOpgavetyperModal, setVisImportOpgavetyperModal] = useState(false)

    return (
        <div className={Styles.settingsPage}>
            <h1>Arbejdspræferencer</h1>
            <div className={Styles.indstillingerContainer}>
                <h2>
                    Arbejdspræferencer 
                    <Info 
                        className={`${Styles.infoIcon} ${visOpgavetyperInfo ? Styles.active : ""}`} 
                        onClick={() => setVisOpgavetyperInfo(!visOpgavetyperInfo)}
                    />
                </h2>
                <p className={`${Styles.infoText} ${visOpgavetyperInfo ? Styles.visible : ""}`}>
                    Herunder kan du bl.a. indstille hvilke opgavetyper, I arbejder med i jeres virksomhed. 
                    Du kan også definere maks. radius i dine medarbejderes områdeindstillinger.
                </p>
                <SettingsButtons
                    items={[
                        {
                            title: "Opgavetyper",
                            icon: <Hammer />,
                            onClick: () => setVisOpgavetyperModal(true),
                            value: `${opgavetyper?.length || 0} typer, ${indstillinger?.opgavetyperKategorier?.length || 0} kategorier`,
                        },
                        {
                            title: "Importer opgavetyper",
                            icon: <Download />,
                            onClick: () => setVisImportOpgavetyperModal(true),
                        },
                        {
                            title: "Max. arbejdsradius",
                            icon: <Radius />,
                            input: true,
                            type: "number",
                            min: 0,
                            max: 200,
                            value: maxArbejdsradius,
                            postfix: "km.",
                            onChange: (v) => setMaxArbejdsradius(v),
                            onBlur: handleRadiusBlur
                        }
                    ]}
                />
            </div>

            <SeOpgavetyperModal 
                trigger={visOpgavetyperModal} 
                setTrigger={setVisOpgavetyperModal} 
                opgavetyper={opgavetyper} 
                user={user} 
                refetchOpgavetyper={refetchOpgavetyper} 
                setRefetchOpgavetyper={setRefetchOpgavetyper} 
                kategorier={indstillinger?.opgavetyperKategorier}
            />
            <ImportOpgavetyperModal 
                trigger={visImportOpgavetyperModal} 
                setTrigger={setVisImportOpgavetyperModal} 
                user={user} 
                kategorier={indstillinger?.opgavetyperKategorier || []} 
                refetchOpgavetyper={refetchOpgavetyper} 
                setRefetchOpgavetyper={setRefetchOpgavetyper} 
            />
        </div>
    )
}

export default Arbejdspræferencer

