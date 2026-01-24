import React from 'react';
import ÅbenOpgaveCSS from '../../../../pages/ÅbenOpgave.module.css';
import Styles from '../AddPosteringV2.module.css';

/**
 * Footer komponent med total preview og submit knap
 */
const PosteringFooter = ({
    dynamiskHonorarBeregning,
    previewDynamiskHonorar,
    posteringFastHonorar,
    rabatProcent,
    previewDynamiskOutlays,
    kvitteringLoadingStates,
    uploadingFiles,
    brugHonorar,
    isEditMode = false,
    isEditingTimer = false,
    isEditingMateriale = false
}) => {
    const isLoading = Object.values(kvitteringLoadingStates).some(Boolean) || uploadingFiles?.length > 0;
    const isEditing = isEditingTimer || isEditingMateriale;
    
    // Vis kun honorar-sektionen hvis brugHonorar er true
    // brugHonorar er true hvis enten brugDynamiskHonorar eller brugFastHonorar er aktiveret
    const visHonorar = brugHonorar;

    return (
        <div className={ÅbenOpgaveCSS.previewTotalPostering}>
            {visHonorar && (
                <div className={ÅbenOpgaveCSS.previewHonorarTotal}>
                    <h3 className={ÅbenOpgaveCSS.modalHeading4}>
                        Total: {(dynamiskHonorarBeregning ? previewDynamiskHonorar : posteringFastHonorar).toLocaleString('da-DK', { 
                            style: 'currency', 
                            currency: 'DKK', 
                            minimumFractionDigits: 0, 
                            maximumFractionDigits: 0 
                        })}
                        {rabatProcent > 0 && dynamiskHonorarBeregning && (
                            <span className={ÅbenOpgaveCSS.overstregetPreview}>
                                {(((previewDynamiskHonorar - previewDynamiskOutlays) / (100 - rabatProcent) * 100) + previewDynamiskOutlays).toLocaleString('da-DK', { 
                                    style: 'currency', 
                                    currency: 'DKK', 
                                    minimumFractionDigits: 0, 
                                    maximumFractionDigits: 0 
                                })}
                            </span>
                        )}
                    </h3>
                    <p className={ÅbenOpgaveCSS.modalSubheading}>Dit honorar for posteringen</p>
                </div>
            )}
            
            {isLoading ? (
                <>
                    <button 
                        className={`${ÅbenOpgaveCSS.registrerPosteringButtonDesktop} ${Styles.disabledButton}`} 
                        type="submit" 
                        disabled
                    >
                        Afventer upload ...
                    </button>
                    <button 
                        className={`${ÅbenOpgaveCSS.registrerPosteringButtonMobile} ${Styles.disabledButton}`} 
                        type="submit" 
                        disabled
                    >
                        Afventer upload ...
                    </button>
                </>
            ) : isEditing ? (
                <>
                    <button 
                        className={`${ÅbenOpgaveCSS.registrerPosteringButtonDesktop} ${Styles.disabledButton}`} 
                        type="submit" 
                        disabled
                    >
                        Afslut redigering først
                    </button>
                    <button 
                        className={`${ÅbenOpgaveCSS.registrerPosteringButtonMobile} ${Styles.disabledButton}`} 
                        type="submit" 
                        disabled
                    >
                        Afslut redigering
                    </button>
                </>
            ) : (
                <>
                    <button 
                        className={ÅbenOpgaveCSS.registrerPosteringButtonDesktop} 
                        type="submit"
                    >
                        {isEditMode ? 'Opdatér postering' : 'Registrér postering'}
                    </button>
                    <button 
                        className={ÅbenOpgaveCSS.registrerPosteringButtonMobile} 
                        type="submit"
                    >
                        {isEditMode ? 'Opdatér' : 'Registrér'}
                    </button>
                </>
            )}
        </div>
    );
};

export default PosteringFooter;

