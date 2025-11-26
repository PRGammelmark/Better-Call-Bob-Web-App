import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import Styles from './OpfølgendeSpørgsmålModal.module.css'
import { CirclePlus, ChevronLeft, MessageSquare, Trash2, Edit2, List, Grid, Search } from 'lucide-react'
import PageAnimation from '../PageAnimation.jsx'
import InputsContainer from '../basicComponents/inputs/InputsContainer.jsx'
import InputLine from '../basicComponents/inputs/InputLine.jsx'
import SelectLine from '../basicComponents/inputs/SelectLine.jsx'
import CreateSelectOptionsLine from '../basicComponents/inputs/CreateSelectOptionsLine.jsx'
import SwitchLine from '../basicComponents/inputs/SwitchLine.jsx'
import SelectManyPillsLine from '../basicComponents/inputs/SelectManyPillsLine.jsx'
import SelectNumberLine from '../basicComponents/inputs/SelectNumberLine.jsx'
import Button from '../basicComponents/buttons/Button.jsx'

const OpfølgendeSpørgsmålModal = ({ trigger, setTrigger, user, opgavetyper }) => {
    const [spørgsmål, setSpørgsmål] = useState([])
    const [opretNytSpørgsmål, setOpretNytSpørgsmål] = useState(false)
    const [redigerSpørgsmål, setRedigerSpørgsmål] = useState(null)
    const [errorMessage, setErrorMessage] = useState("")
    const [viewMode, setViewMode] = useState('opgavetyper') // 'opgavetyper' or 'spørgsmål'
    const [søgetekst, setSøgetekst] = useState("")

    // State for nyt/redigeret spørgsmål
    const [spørgsmålTekst, setSpørgsmålTekst] = useState("")
    const [spørgsmålTekstEn, setSpørgsmålTekstEn] = useState("")
    const [spørgsmålType, setSpørgsmålType] = useState("Ja/nej")
    const [valgteOpgavetyper, setValgteOpgavetyper] = useState([])
    const [selectOptions, setSelectOptions] = useState([])
    const [nySelectOption, setNySelectOption] = useState("")
    const [erStandard, setErStandard] = useState(false)
    const [rækkefølge, setRækkefølge] = useState(1)
    const [feltNavn, setFeltNavn] = useState("")

    // Hent alle opgavetyper navne
    const opgavetypeNavne = opgavetyper?.map(op => op.opgavetype) || []

    useEffect(() => {
        if (trigger) {
            fetchSpørgsmål()
            setSøgetekst("") // Nulstil søgetekst når modalen åbnes
        }
    }, [trigger])

    const fetchSpørgsmål = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/opfolgendeSporgsmaal/`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            setSpørgsmål(response.data)
        } catch (error) {
            console.error('Fejl ved hentning af spørgsmål:', error)
        }
    }

    const handleReset = () => {
        setSpørgsmålTekst("")
        setSpørgsmålTekstEn("")
        setSpørgsmålType("Ja/nej")
        setValgteOpgavetyper([])
        setSelectOptions([])
        setNySelectOption("")
        setErStandard(false)
        setRækkefølge(1)
        setFeltNavn("")
    }

    const handleTilføjSelectOption = () => {
        if (nySelectOption.trim()) {
            setSelectOptions([...selectOptions, nySelectOption.trim()])
            setNySelectOption("")
        }
    }

    const handleFjernSelectOption = (index) => {
        setSelectOptions(selectOptions.filter((_, i) => i !== index))
    }

    const handlePrioritetChange = (value) => {
        const numValue = Number(value)
        // Kun tillad 1, 2 eller 3
        if (!isNaN(numValue) && numValue >= 1 && numValue <= 3) {
            setRækkefølge(numValue)
        } else if (value === "") {
            // Hvis feltet er tomt, sæt til 1
            setRækkefølge(1)
        }
        // Hvis værdien er uden for 1-3, ignorer ændringen (behold nuværende værdi)
    }

    const handleToggleOpgavetype = (opgavetype) => {
        if (valgteOpgavetyper.includes(opgavetype)) {
            setValgteOpgavetyper(valgteOpgavetyper.filter(op => op !== opgavetype))
        } else {
            setValgteOpgavetyper([...valgteOpgavetyper, opgavetype])
        }
    }

    const handleSubmitNytSpørgsmål = async () => {
        if (!spørgsmålTekst.trim()) {
            setErrorMessage("Du skal indtaste et spørgsmål.")
            setTimeout(() => setErrorMessage(""), 5000)
            return
        }

        if (!feltNavn.trim()) {
            setErrorMessage("Du skal indtaste et feltnavn.")
            setTimeout(() => setErrorMessage(""), 5000)
            return
        }

        if (spørgsmålType === 'Valgmuligheder' && selectOptions.length === 0) {
            setErrorMessage("Du skal tilføje mindst ét valg til select-spørgsmålet.")
            setTimeout(() => setErrorMessage(""), 5000)
            return
        }

        if (!erStandard && valgteOpgavetyper.length === 0) {
            setErrorMessage("Du skal enten vælge opgavetyper eller markere som standard.")
            setTimeout(() => setErrorMessage(""), 5000)
            return
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/opfolgendeSporgsmaal/`,
                {
                    spørgsmål: spørgsmålTekst,
                    spørgsmålEn: spørgsmålTekstEn || undefined,
                    type: spørgsmålType,
                    opgavetyper: valgteOpgavetyper,
                    selectOptions: spørgsmålType === 'Valgmuligheder' ? selectOptions : [],
                    erStandard,
                    rækkefølge,
                    feltNavn: feltNavn.trim()
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
            fetchSpørgsmål()
            setOpretNytSpørgsmål(false)
            handleReset()
        } catch (error) {
            console.error('Fejl ved oprettelse af spørgsmål:', error)
            setErrorMessage(error.response?.data?.error || "Kunne ikke oprette spørgsmål.")
            setTimeout(() => setErrorMessage(""), 5000)
        }
    }

    const handleUpdateSpørgsmål = async () => {
        if (!spørgsmålTekst.trim()) {
            setErrorMessage("Du skal indtaste et spørgsmål.")
            setTimeout(() => setErrorMessage(""), 5000)
            return
        }

        if (!feltNavn.trim()) {
            setErrorMessage("Du skal indtaste et feltnavn.")
            setTimeout(() => setErrorMessage(""), 5000)
            return
        }

        if (spørgsmålType === 'Valgmuligheder' && selectOptions.length === 0) {
            setErrorMessage("Du skal tilføje mindst ét valg til select-spørgsmålet.")
            setTimeout(() => setErrorMessage(""), 5000)
            return
        }

        if (!erStandard && valgteOpgavetyper.length === 0) {
            setErrorMessage("Du skal enten vælge opgavetyper eller markere som standard.")
            setTimeout(() => setErrorMessage(""), 5000)
            return
        }

        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/opfolgendeSporgsmaal/${redigerSpørgsmål._id}`,
                {
                    spørgsmål: spørgsmålTekst,
                    spørgsmålEn: spørgsmålTekstEn || undefined,
                    type: spørgsmålType,
                    opgavetyper: valgteOpgavetyper,
                    selectOptions: spørgsmålType === 'Valgmuligheder' ? selectOptions : [],
                    erStandard,
                    rækkefølge,
                    feltNavn: feltNavn.trim()
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            )
            fetchSpørgsmål()
            setRedigerSpørgsmål(null)
            handleReset()
        } catch (error) {
            console.error('Fejl ved opdatering af spørgsmål:', error)
            setErrorMessage(error.response?.data?.error || "Kunne ikke opdatere spørgsmål.")
            setTimeout(() => setErrorMessage(""), 5000)
        }
    }

    const handleDeleteSpørgsmål = async () => {
        if (!redigerSpørgsmål?._id) return;

        if (!window.confirm(`Er du sikker på, at du vil slette spørgsmålet "${redigerSpørgsmål.spørgsmål}"?`)) {
            return;
        }

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/opfolgendeSporgsmaal/${redigerSpørgsmål._id}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            fetchSpørgsmål()
            setRedigerSpørgsmål(null)
        } catch (error) {
            console.error('Fejl ved sletning:', error)
            setErrorMessage(error.response?.data?.error || "Kunne ikke slette spørgsmål.")
            setTimeout(() => setErrorMessage(""), 5000)
        }
    }

    const openRedigerSpørgsmål = (spørgsmål) => {
        setRedigerSpørgsmål({
            ...spørgsmål,
            opgavetyper: spørgsmål.opgavetyper || []
        })
        setSpørgsmålTekst(spørgsmål.spørgsmål)
        setSpørgsmålTekstEn(spørgsmål.spørgsmålEn || "")
        setSpørgsmålType(spørgsmål.type)
        setValgteOpgavetyper(spørgsmål.opgavetyper || [])
        setSelectOptions(spørgsmål.selectOptions || [])
        setErStandard(spørgsmål.erStandard || false)
        setRækkefølge(spørgsmål.rækkefølge || 1)
        setFeltNavn(spørgsmål.feltNavn || "")
    }

    // Filtrer spørgsmål baseret på søgetekst
    const filtreretSpørgsmål = søgetekst.trim() === "" 
        ? spørgsmål 
        : spørgsmål.filter(sp => 
            sp.spørgsmål.toLowerCase().includes(søgetekst.toLowerCase()) ||
            sp.feltNavn?.toLowerCase().includes(søgetekst.toLowerCase()) ||
            (sp.opgavetyper && sp.opgavetyper.some(op => op.toLowerCase().includes(søgetekst.toLowerCase())))
        );

    // Gruppér spørgsmål efter opgavetyper
    const spørgsmålByOpgavetype = {};
    const standardSpørgsmål = [];

    filtreretSpørgsmål.forEach(sp => {
        if (sp.erStandard) {
            standardSpørgsmål.push(sp);
        } else {
            sp.opgavetyper.forEach(opgavetype => {
                if (!spørgsmålByOpgavetype[opgavetype]) {
                    spørgsmålByOpgavetype[opgavetype] = [];
                }
                spørgsmålByOpgavetype[opgavetype].push(sp);
            });
        }
    });

    // Filtrer opgavetyper baseret på søgetekst (kun vis kategorier der matcher)
    const filtreredeOpgavetyper = søgetekst.trim() === ""
        ? Object.keys(spørgsmålByOpgavetype)
        : Object.keys(spørgsmålByOpgavetype).filter(opgavetype => 
            opgavetype.toLowerCase().includes(søgetekst.toLowerCase())
        );

    // For spørgsmål-view: vis alle spørgsmål med deres opgavetyper
    const alleSpørgsmålMedOpgavetyper = filtreretSpørgsmål.map(sp => ({
        ...sp,
        visesI: sp.erStandard 
            ? ['Alle kategorier'] 
            : (sp.opgavetyper && sp.opgavetyper.length > 0 ? sp.opgavetyper : ['Ingen kategorier'])
    })).sort((a, b) => {
        // Sorter standard først, derefter efter rækkefølge
        if (a.erStandard && !b.erStandard) return -1;
        if (!a.erStandard && b.erStandard) return 1;
        return (a.rækkefølge || 0) - (b.rækkefølge || 0);
    });

    return (
        <Modal trigger={trigger} setTrigger={setTrigger}>
            {(!opretNytSpørgsmål && !redigerSpørgsmål) && (
                <PageAnimation>
                    <h2 className={Styles.modalHeader}>Opfølgende spørgsmål</h2>
                    <p className={Styles.modalDescription}>
                        Her kan du administrere opfølgende spørgsmål til bookingsystemet. 
                        Standard spørgsmål vises for alle kategorier, mens specifikke spørgsmål kun vises for valgte opgavetyper.
                    </p>
                    <div className={Styles.buttons}>
                        <button 
                            className={`${Styles.viewToggleButton} ${viewMode === 'spørgsmål' ? Styles.viewToggleButtonActive : ''}`}
                            onClick={() => setViewMode(viewMode === 'opgavetyper' ? 'spørgsmål' : 'opgavetyper')}
                            title={viewMode === 'opgavetyper' ? 'Vis efter spørgsmål' : 'Vis efter opgavetyper'}
                        >
                            {viewMode === 'opgavetyper' ? (
                                <>
                                    <List className={Styles.buttonIcon} />Vis efter spørgsmål
                                </>
                            ) : (
                                <>
                                    <Grid className={Styles.buttonIcon} />Vis efter opgavetyper
                                </>
                            )}
                        </button>
                        <button className={Styles.opretSpørgsmålButton} onClick={() => setOpretNytSpørgsmål(true)}>
                            <CirclePlus className={Styles.buttonIcon} />Opret spørgsmål
                        </button>
                    </div>

                    <div className={Styles.searchContainer}>
                        <Search className={Styles.searchIcon} />
                        <input
                            type="text"
                            className={Styles.searchInput}
                            placeholder={viewMode === 'opgavetyper' ? 'Søg efter opgavetyper eller spørgsmål...' : 'Søg efter spørgsmål...'}
                            value={søgetekst}
                            onChange={(e) => setSøgetekst(e.target.value)}
                        />
                    </div>

                    {viewMode === 'opgavetyper' ? (
                        <>
                            {standardSpørgsmål.length > 0 && (
                                <div className={Styles.spørgsmålKategori}>
                                    <h3><MessageSquare />Standard spørgsmål</h3>
                                    <div className={Styles.spørgsmålListe}>
                                        {standardSpørgsmål.map(sp => (
                                            <div key={sp._id} className={Styles.spørgsmålItem} onClick={() => openRedigerSpørgsmål(sp)}>
                                                <div className={Styles.spørgsmålInfo}>
                                                    <span className={Styles.spørgsmålTekst}>{sp.spørgsmål}</span>
                                                    <span className={Styles.spørgsmålType}>{sp.type === 'Ja/nej' ? 'Ja/Nej' : 'Valgmuligheder'}</span>
                                                </div>
                                                <Edit2 className={Styles.editIcon} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {filtreredeOpgavetyper.map(opgavetype => (
                                <div key={opgavetype} className={Styles.spørgsmålKategori}>
                                    <h3><MessageSquare />{opgavetype}</h3>
                                    <div className={Styles.spørgsmålListe}>
                                        {spørgsmålByOpgavetype[opgavetype].map(sp => (
                                            <div key={sp._id} className={Styles.spørgsmålItem} onClick={() => openRedigerSpørgsmål(sp)}>
                                                <div className={Styles.spørgsmålInfo}>
                                                    <span className={Styles.spørgsmålTekst}>{sp.spørgsmål}</span>
                                                    <span className={Styles.spørgsmålType}>{sp.type === 'Ja/nej' ? 'Ja/Nej' : 'Valgmuligheder'}</span>
                                                </div>
                                                <Edit2 className={Styles.editIcon} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {filtreretSpørgsmål.length === 0 && søgetekst.trim() !== "" && (
                                <p className={Styles.ingenSpørgsmål}>Ingen resultater fundet for "{søgetekst}".</p>
                            )}
                            {spørgsmål.length === 0 && søgetekst.trim() === "" && (
                                <p className={Styles.ingenSpørgsmål}>Ingen spørgsmål oprettet endnu.</p>
                            )}
                        </>
                    ) : (
                        <>
                            <div className={Styles.spørgsmålListe}>
                                {alleSpørgsmålMedOpgavetyper.map(sp => (
                                    <div key={sp._id} className={Styles.spørgsmålItem} onClick={() => openRedigerSpørgsmål(sp)}>
                                        <div className={Styles.spørgsmålInfo}>
                                            <span className={Styles.spørgsmålTekst}>{sp.spørgsmål}</span>
                                            <div className={Styles.spørgsmålMeta}>
                                                <span className={Styles.spørgsmålType}>Spørgsmålets type: {sp.type === 'Ja/nej' ? 'Ja/Nej' : 'Valgmuligheder'}</span>
                                                <span className={Styles.opgavetyperLabel}>
                                                    Vises i: {sp.visesI.join(', ')}
                                                </span>
                                            </div>
                                        </div>
                                        <Edit2 className={Styles.editIcon} />
                                    </div>
                                ))}
                            </div>

                            {alleSpørgsmålMedOpgavetyper.length === 0 && søgetekst.trim() !== "" && (
                                <p className={Styles.ingenSpørgsmål}>Ingen resultater fundet for "{søgetekst}".</p>
                            )}
                            {spørgsmål.length === 0 && søgetekst.trim() === "" && (
                                <p className={Styles.ingenSpørgsmål}>Ingen spørgsmål oprettet endnu.</p>
                            )}
                        </>
                    )}
                </PageAnimation>
            )}

            {opretNytSpørgsmål && (
                <PageAnimation>
                    <div className={Styles.subpageHeader}>
                        <ChevronLeft className={Styles.tilbageKnap} onClick={() => { setOpretNytSpørgsmål(false); handleReset(); }} />
                        <h2>Opret nyt spørgsmål</h2>
                    </div>
                    <form>
                        <InputsContainer>
                            <InputLine 
                                label="Spørgsmål" 
                                placeholder="Fx 'Har du selv materialer?'" 
                                required={true} 
                                value={spørgsmålTekst} 
                                onChange={setSpørgsmålTekst}
                                name="spørgsmål"
                            />
                            <InputLine 
                                label="Spørgsmål (engelsk)" 
                                placeholder="Fx 'Do you have your own materials?'" 
                                required={false} 
                                value={spørgsmålTekstEn} 
                                onChange={setSpørgsmålTekstEn}
                                name="spørgsmålEn"
                            />
                            <InputLine 
                                label="Feltnavn" 
                                placeholder="Fx 'harMaterialer' (skal være unikt)" 
                                required={true} 
                                value={feltNavn} 
                                onChange={setFeltNavn}
                                name="feltNavn"
                            />
                            <SelectLine 
                                label="Type" 
                                description="Hvilken slags spørgsmål er dette?"
                                options={['Ja/nej', 'Valgmuligheder']} 
                                value={spørgsmålType} 
                                onChange={setSpørgsmålType}
                                name="type"
                            />
                            
                            {spørgsmålType === 'Valgmuligheder' && (
                                <CreateSelectOptionsLine
                                    label="Opret valgmuligheder"
                                    description="Lav en liste af mulige svar til spørgsmålet. Adskil danske/engelske svar med et kolon (fx 'Træ:Wood')."
                                    value={selectOptions}
                                    newOptionValue={nySelectOption}
                                    onNewOptionChange={setNySelectOption}
                                    onAddOption={handleTilføjSelectOption}
                                    onRemoveOption={handleFjernSelectOption}
                                    name="selectOptions"
                                />
                            )}

                            <SelectNumberLine 
                                label="Prioritet (1-3)" 
                                description="Prioritet 1 vægtes højest"
                                value={rækkefølge} 
                                onChange={handlePrioritetChange}
                                name="rækkefølge"
                                min={1}
                                max={3}
                            />

                            <SwitchLine
                                label="Vis altid"
                                checked={erStandard}
                                onChange={setErStandard}
                                name="erStandard"
                            />

                            {!erStandard && (
                                <SelectManyPillsLine
                                    label="Vis i kategorierne:"
                                    options={opgavetypeNavne}
                                    value={valgteOpgavetyper}
                                    onToggle={handleToggleOpgavetype}
                                    name="opgavetyper"
                                />
                            )}
                        </InputsContainer>
                        <Button variant={"primary"} marginTop={20} marginBottom={10} onClick={(e) => { e.preventDefault(); handleSubmitNytSpørgsmål(); }}>
                            <MessageSquare />Opret spørgsmål
                        </Button>
                        {errorMessage && <p className={Styles.errorMessage}>{errorMessage}</p>}
                        <Button variant={"secondary"} onClick={(e) => { e.preventDefault(); setOpretNytSpørgsmål(false); handleReset(); }}>
                            Annuller
                        </Button>
                    </form>
                </PageAnimation>
            )}

            {redigerSpørgsmål && (
                <PageAnimation>
                    <div className={Styles.subpageHeader}>
                        <ChevronLeft className={Styles.tilbageKnap} onClick={() => { setRedigerSpørgsmål(null); handleReset(); }} />
                        <h2>Rediger spørgsmål</h2>
                    </div>
                    <form>
                        <InputsContainer>
                            <InputLine 
                                label="Spørgsmål" 
                                value={spørgsmålTekst} 
                                onChange={setSpørgsmålTekst}
                                name="spørgsmål"
                            />
                            <InputLine 
                                label="Spørgsmål (engelsk)" 
                                placeholder="Fx 'Do you have your own materials?'"
                                value={spørgsmålTekstEn || ""} 
                                onChange={setSpørgsmålTekstEn}
                                name="spørgsmålEn"
                            />
                            <InputLine 
                                label="Feltnavn" 
                                value={feltNavn} 
                                onChange={setFeltNavn}
                                name="feltNavn"
                            />
                            <SelectLine 
                                label="Type" 
                                options={['Ja/nej', 'Valgmuligheder']} 
                                value={spørgsmålType} 
                                onChange={setSpørgsmålType}
                                name="type"
                            />
                            
                            {spørgsmålType === 'Valgmuligheder' && (
                                <CreateSelectOptionsLine
                                    label="Opret valgmuligheder"
                                    description="Lav en liste af mulige svar til spørgsmålet. Adskil danske/engelske svar med et kolon (fx 'Træ:Wood')."
                                    value={selectOptions}
                                    newOptionValue={nySelectOption}
                                    onNewOptionChange={setNySelectOption}
                                    onAddOption={handleTilføjSelectOption}
                                    onRemoveOption={handleFjernSelectOption}
                                    name="selectOptions"
                                />
                            )}

                            <SelectNumberLine 
                                label="Prioritet (1-3)" 
                                description="Prioritet 1 vægtes højest"
                                value={rækkefølge} 
                                onChange={handlePrioritetChange}
                                name="rækkefølge"
                                min={1}
                                max={3}
                            />

                            <SwitchLine
                                label="Standard spørgsmål (viser for alle kategorier)"
                                checked={erStandard}
                                onChange={setErStandard}
                                name="erStandardEdit"
                            />

                            {!erStandard && (
                                <SelectManyPillsLine
                                    label="Vis i kategorierne:"
                                    options={opgavetypeNavne}
                                    value={valgteOpgavetyper}
                                    onToggle={handleToggleOpgavetype}
                                    name="opgavetyper"
                                />
                            )}
                        </InputsContainer>
                        <Button variant="primary" marginTop={20} onClick={(e) => { e.preventDefault(); handleUpdateSpørgsmål(); }}>
                            <MessageSquare /> Opdater spørgsmål
                        </Button>
                        {errorMessage && <p className={Styles.errorMessage}>{errorMessage}</p>}
                        <div className={Styles.flexButtonsDiv}>
                            <Button variant="secondary" onClick={(e) => { e.preventDefault(); handleDeleteSpørgsmål(); }}>
                                <Trash2 /> Slet spørgsmål
                            </Button>
                        </div>
                        <Button variant="secondary" onClick={(e) => { e.preventDefault(); setRedigerSpørgsmål(null); handleReset(); }}>
                            Annuller
                        </Button>
                    </form>
                </PageAnimation>
            )}
        </Modal>
    )
}

export default OpfølgendeSpørgsmålModal

