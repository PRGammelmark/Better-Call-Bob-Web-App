import React from 'react';
import Styles from '../AddPosteringV2.module.css';
import { Calendar, ChevronDown, Settings, Search } from 'lucide-react';
import dayjs from 'dayjs';
import PopUpMenu from '../../../basicComponents/PopUpMenu.jsx';
import { getInitials } from '../utils/posteringBeregninger.js';

/**
 * Header komponent med dato-picker, medarbejder-valg og settings
 */
const PosteringHeader = ({
    user,
    posteringDato,
    setPosteringDato,
    dateInputRef,
    nuværendeMedarbejder,
    valgtMedarbejder,
    setValgtMedarbejder,
    visMedarbejderDropdown,
    setVisMedarbejderDropdown,
    medarbejderSøgetekst,
    setMedarbejderSøgetekst,
    medarbejdere,
    dynamiskPrisBeregning,
    setDynamiskPrisBeregning,
    dynamiskHonorarBeregning,
    setDynamiskHonorarBeregning,
    posteringType,
    setPosteringType,
    låsPosteringVedOprettelse,
    setLåsPosteringVedOprettelse
}) => {
    return (
        <div className={Styles.headerRow}>
            {/* Dato-knap til venstre */}
            <div data-date-picker className={Styles.datePickerWrapper}>
                <input
                    ref={dateInputRef}
                    type="date"
                    value={posteringDato}
                    onChange={(e) => {
                        setPosteringDato(e.target.value);
                    }}
                    className={Styles.hiddenDateInput}
                />
                <button
                    type="button"
                    onClick={() => {
                        if (dateInputRef.current) {
                            dateInputRef.current.showPicker();
                        }
                    }}
                    className={Styles.headerButton}
                >
                    <Calendar size={16} />
                    <span>{dayjs(posteringDato).format('DD/MM/YYYY')}</span>
                </button>
            </div>

            {/* Medarbejder-knap i midten */}
            <div data-medarbejder-dropdown className={Styles.medarbejderWrapper}>
                <button
                    type="button"
                    onClick={() => {
                        if (user.isAdmin) {
                            setVisMedarbejderDropdown(!visMedarbejderDropdown);
                            if (!visMedarbejderDropdown) {
                                setMedarbejderSøgetekst("");
                            }
                        }
                    }}
                    disabled={!user.isAdmin}
                    className={Styles.medarbejderButton}
                >
                    {nuværendeMedarbejder?.profilbillede ? (
                        <img
                            src={nuværendeMedarbejder.profilbillede}
                            alt={nuværendeMedarbejder.navn}
                            className={Styles.avatarSmall}
                        />
                    ) : (
                        <div className={`${Styles.avatarInitials} ${Styles.avatarInitialsSmall}`}>
                            {getInitials(nuværendeMedarbejder?.navn || '?')}
                        </div>
                    )}
                    {user.isAdmin && <ChevronDown size={14} />}
                </button>
                
                {visMedarbejderDropdown && user.isAdmin && (
                    <div className={`${Styles.dropdown} ${Styles.dropdownRight}`}>
                        {/* Søgefelt */}
                        <div className={Styles.searchFieldWrapper}>
                            <div className={Styles.searchFieldInner}>
                                <Search size={16} className={Styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Søg medarbejder..."
                                    value={medarbejderSøgetekst}
                                    onChange={(e) => setMedarbejderSøgetekst(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={Styles.searchInput}
                                />
                            </div>
                        </div>
                        <div className={Styles.medarbejderList}>
                            {(() => {
                                const migItem = {
                                    _id: 'mig',
                                    navn: user.navn,
                                    profilbillede: user.profilbillede,
                                    isMig: true
                                };
                                
                                const andreMedarbejdere = medarbejdere.filter(m => 
                                    m._id !== user._id && m._id !== user.id
                                );
                                
                                let alleMedarbejdere = [migItem, ...andreMedarbejdere];
                                
                                if (medarbejderSøgetekst) {
                                    const søgetekst = medarbejderSøgetekst.toLowerCase();
                                    alleMedarbejdere = alleMedarbejdere.filter(m => 
                                        m.navn && m.navn.toLowerCase().includes(søgetekst)
                                    );
                                } else {
                                    alleMedarbejdere.sort((a, b) => {
                                        const aSelected = a.isMig ? valgtMedarbejder === null : valgtMedarbejder?._id === a._id;
                                        const bSelected = b.isMig ? valgtMedarbejder === null : valgtMedarbejder?._id === b._id;
                                        if (aSelected && !bSelected) return -1;
                                        if (!aSelected && bSelected) return 1;
                                        return 0;
                                    });
                                }
                                
                                return alleMedarbejdere.map(medarbejder => {
                                    const isSelected = medarbejder.isMig 
                                        ? valgtMedarbejder === null 
                                        : valgtMedarbejder?._id === medarbejder._id;
                                    
                                    return (
                                        <div
                                            key={medarbejder._id}
                                            onClick={() => {
                                                if (medarbejder.isMig) {
                                                    setValgtMedarbejder(null);
                                                } else {
                                                    setValgtMedarbejder(medarbejder);
                                                }
                                                setVisMedarbejderDropdown(false);
                                                setMedarbejderSøgetekst("");
                                            }}
                                            className={`${Styles.medarbejderItem} ${isSelected ? Styles.medarbejderItemSelected : ''}`}
                                        >
                                            {medarbejder.profilbillede ? (
                                                <img
                                                    src={medarbejder.profilbillede}
                                                    alt={medarbejder.navn}
                                                    className={Styles.avatarMedium}
                                                />
                                            ) : (
                                                <div className={`${Styles.avatarInitials} ${Styles.avatarInitialsMedium}`}>
                                                    {getInitials(medarbejder.navn)}
                                                </div>
                                            )}
                                            <span>{medarbejder.navn}{medarbejder.isMig ? ' (Mig)' : ''}</span>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                )}
            </div>

            {/* Popupmenu-knap til højre */}
            <PopUpMenu
                text=""
                icon={<Settings size={16} />}
                variant="grey"
                actions={[
                    // Admin-only indstillinger
                    ...(user.isAdmin ? [
                        {
                            label: "Tilbudspris",
                            switch: true,
                            checked: !dynamiskPrisBeregning,
                            onChange: (checked) => {
                                setDynamiskPrisBeregning(!checked);
                            }
                        },
                        {
                            label: "Fast honorar",
                            switch: true,
                            checked: !dynamiskHonorarBeregning,
                            onChange: (checked) => {
                                setDynamiskHonorarBeregning(!checked);
                            }
                        },
                        {
                            label: "Modregn (beta)",
                            switch: true,
                            checked: posteringType === 'kredit',
                            onChange: (checked) => {
                                setPosteringType(checked ? 'kredit' : 'debet');
                            }
                        }
                    ] : []),
                    {
                        label: "Lås postering med det samme",
                        switch: true,
                        checked: låsPosteringVedOprettelse,
                        onChange: (checked) => {
                            setLåsPosteringVedOprettelse(checked);
                        }
                    }
                ]}
            />
        </div>
    );
};

export default PosteringHeader;

