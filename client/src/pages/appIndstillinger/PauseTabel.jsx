import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Styles from './PauseTabel.module.css'
import { Plus, Edit2, Trash2, Check, X, GripVertical } from 'lucide-react'
import PopUpMenu from '../../components/basicComponents/PopUpMenu.jsx'

const PauseTabel = ({ user }) => {
    const [pauser, setPauser] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [isAddingNew, setIsAddingNew] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [draggedIndex, setDraggedIndex] = useState(null)
    const [dragOverIndex, setDragOverIndex] = useState(null)

    // State for ny pause
    const [newPause, setNewPause] = useState({
        navn: '',
        beskrivelse: '',
        varighed: 30,
        lønnet: false,
        aktiv: true,
        rækkefølge: 0
    })

    // State for redigering
    const [editData, setEditData] = useState({})

    useEffect(() => {
        fetchPauser()
    }, [])

    const fetchPauser = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/pauser/`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            setPauser(response.data)
        } catch (error) {
            console.error('Fejl ved hentning af pauser:', error)
            setErrorMessage('Kunne ikke hente pauser')
        } finally {
            setLoading(false)
        }
    }

    const handleAddNew = () => {
        setIsAddingNew(true)
        setEditingId(null)
        setNewPause({
            navn: '',
            beskrivelse: '',
            varighed: 30,
            lønnet: false,
            aktiv: true,
            rækkefølge: pauser.length
        })
    }

    const handleCancelAdd = () => {
        setIsAddingNew(false)
        setNewPause({
            navn: '',
            beskrivelse: '',
            varighed: 30,
            lønnet: false,
            aktiv: true,
            rækkefølge: 0
        })
        setErrorMessage('')
    }

    const handleSaveNew = async () => {
        // Validering
        if (!newPause.navn || newPause.varighed === '') {
            setErrorMessage('Udfyld venligst alle påkrævede felter')
            return
        }

        try {
            const payload = {
                ...newPause,
                varighed: Number(newPause.varighed),
                rækkefølge: Number(newPause.rækkefølge) || 0
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/pauser/`, payload, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            
            setIsAddingNew(false)
            setErrorMessage('')
            fetchPauser()
        } catch (error) {
            console.error('Fejl ved oprettelse af pause:', error)
            setErrorMessage(error.response?.data?.error || 'Kunne ikke oprette pause')
        }
    }

    const handleEdit = (pause) => {
        setEditingId(pause._id)
        setIsAddingNew(false)
        setEditData({
            navn: pause.navn || '',
            beskrivelse: pause.beskrivelse || '',
            varighed: pause.varighed || 30,
            lønnet: pause.lønnet || false,
            aktiv: pause.aktiv !== undefined ? pause.aktiv : true,
            rækkefølge: pause.rækkefølge || 0
        })
        setErrorMessage('')
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditData({})
        setErrorMessage('')
    }

    const handleSaveEdit = async (id) => {
        // Validering
        if (!editData.navn || editData.varighed === '') {
            setErrorMessage('Udfyld venligst alle påkrævede felter')
            return
        }

        try {
            const payload = {
                ...editData,
                varighed: Number(editData.varighed),
                rækkefølge: Number(editData.rækkefølge) || 0
            }

            await axios.patch(`${import.meta.env.VITE_API_URL}/pauser/${id}`, payload, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            
            setEditingId(null)
            setEditData({})
            setErrorMessage('')
            fetchPauser()
        } catch (error) {
            console.error('Fejl ved opdatering af pause:', error)
            setErrorMessage(error.response?.data?.error || 'Kunne ikke opdatere pause')
        }
    }

    const handleDelete = async (id, navn) => {
        if (!window.confirm(`Er du sikker på, at du vil slette pausen "${navn}"?`)) {
            return
        }

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/pauser/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            fetchPauser()
        } catch (error) {
            console.error('Fejl ved sletning af pause:', error)
            setErrorMessage('Kunne ikke slette pause')
        }
    }

    const handleDragStart = (e, index) => {
        setDraggedIndex(index)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/html', e.target)
        e.target.style.opacity = '0.5'
    }

    const handleDragEnd = (e) => {
        e.target.style.opacity = ''
        setDraggedIndex(null)
        setDragOverIndex(null)
    }

    const handleDragOver = (e, index) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOverIndex(index)
    }

    const handleDragLeave = () => {
        setDragOverIndex(null)
    }

    const handleDrop = async (e, dropIndex) => {
        e.preventDefault()
        
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null)
            setDragOverIndex(null)
            return
        }

        const newPauser = [...pauser]
        const draggedItem = newPauser[draggedIndex]
        
        // Fjern det trækkede element
        newPauser.splice(draggedIndex, 1)
        
        // Indsæt det trækkede element på den nye position
        newPauser.splice(dropIndex, 0, draggedItem)
        
        // Opdater rækkefølge for alle elementer
        const updatedPauser = newPauser.map((item, index) => ({
            ...item,
            rækkefølge: index
        }))

        // Opdater lokalt først for bedre UX
        setPauser(updatedPauser)
        setDraggedIndex(null)
        setDragOverIndex(null)

        // Opdater rækkefølge i databasen
        try {
            const updatePromises = updatedPauser.map((pause, index) => 
                axios.patch(
                    `${import.meta.env.VITE_API_URL}/pauser/${pause._id}`,
                    { rækkefølge: index },
                    {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    }
                )
            )
            await Promise.all(updatePromises)
        } catch (error) {
            console.error('Fejl ved opdatering af rækkefølge:', error)
            setErrorMessage('Kunne ikke opdatere rækkefølge')
            // Hent data igen ved fejl
            fetchPauser()
        }
    }

    const formatVarighed = (minutter) => {
        if (minutter < 60) {
            return `${minutter} min`
        }
        const timer = Math.floor(minutter / 60)
        const restMinutter = minutter % 60
        if (restMinutter === 0) {
            return `${timer} time${timer > 1 ? 'r' : ''}`
        }
        return `${timer} t ${restMinutter} min`
    }

    if (loading) {
        return <div className={Styles.loading}>Henter pauser...</div>
    }

    return (
        <div className={Styles.tabelContainer}>
            {errorMessage && (
                <div className={Styles.errorMessage}>{errorMessage}</div>
            )}

            {!isAddingNew && (
                <button onClick={handleAddNew} className={Styles.addButton}>
                    <Plus size={18} />
                    Tilføj ny pause
                </button>
            )}

            {/* Desktop Table View */}
            <div className={`${Styles.tabelWrapper} ${Styles.desktopView}`}>
                <table className={Styles.tabel}>
                    <thead>
                        <tr>
                            <th className={Styles.dragHandleColumn}></th>
                            <th>Navn</th>
                            <th>Varighed</th>
                            <th>Lønnet</th>
                            <th>Beskrivelse</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Tilføj ny række */}
                        {isAddingNew && (
                            <tr className={Styles.addRow}>
                                <td className={Styles.dragHandleColumn}></td>
                                <td>
                                    <input
                                        type="text"
                                        value={newPause.navn}
                                        onChange={(e) => setNewPause({ ...newPause, navn: e.target.value })}
                                        placeholder="Navn"
                                        className={Styles.input}
                                    />
                                </td>
                                <td>
                                    <div className={Styles.varighedInput}>
                                        <input
                                            type="number"
                                            value={newPause.varighed}
                                            onChange={(e) => setNewPause({ ...newPause, varighed: e.target.value })}
                                            placeholder="30"
                                            className={Styles.input}
                                            min="1"
                                        />
                                        <span className={Styles.varighedSuffix}>min</span>
                                    </div>
                                </td>
                                <td>
                                    <label className={Styles.switchLabel}>
                                        <input
                                            type="checkbox"
                                            className={Styles.switchInput}
                                            checked={newPause.lønnet}
                                            onChange={(e) => setNewPause({ ...newPause, lønnet: e.target.checked })}
                                        />
                                        <div className={`${Styles.switch} ${newPause.lønnet ? Styles.switchActive : ''}`}>
                                            <div className={Styles.switchThumb}></div>
                                        </div>
                                    </label>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={newPause.beskrivelse}
                                        onChange={(e) => setNewPause({ ...newPause, beskrivelse: e.target.value })}
                                        placeholder="Beskrivelse"
                                        className={Styles.input}
                                    />
                                </td>
                                <td>
                                    <label className={Styles.switchLabel}>
                                        <input
                                            type="checkbox"
                                            className={Styles.switchInput}
                                            checked={newPause.aktiv}
                                            onChange={(e) => setNewPause({ ...newPause, aktiv: e.target.checked })}
                                        />
                                        <div className={`${Styles.switch} ${newPause.aktiv ? Styles.switchActive : ''}`}>
                                            <div className={Styles.switchThumb}></div>
                                        </div>
                                    </label>
                                </td>
                                <td>
                                    <div className={Styles.actionButtons}>
                                        <button
                                            onClick={handleSaveNew}
                                            className={Styles.saveButton}
                                            title="Gem"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={handleCancelAdd}
                                            className={Styles.cancelButton}
                                            title="Annuller"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Eksisterende pauser */}
                        {pauser.map((pause, index) => (
                            <tr 
                                key={pause._id} 
                                className={`${editingId === pause._id ? Styles.editingRow : ''} ${draggedIndex === index ? Styles.dragging : ''} ${dragOverIndex === index ? Styles.dragOver : ''}`}
                                draggable={editingId !== pause._id}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                            >
                                {editingId === pause._id ? (
                                    <>
                                        <td className={Styles.dragHandleColumn}></td>
                                        <td>
                                            <input
                                                type="text"
                                                value={editData.navn}
                                                onChange={(e) => setEditData({ ...editData, navn: e.target.value })}
                                                className={Styles.input}
                                            />
                                        </td>
                                        <td>
                                            <div className={Styles.varighedInput}>
                                                <input
                                                    type="number"
                                                    value={editData.varighed}
                                                    onChange={(e) => setEditData({ ...editData, varighed: e.target.value })}
                                                    className={Styles.input}
                                                    min="1"
                                                />
                                                <span className={Styles.varighedSuffix}>min</span>
                                            </div>
                                        </td>
                                        <td>
                                            <label className={Styles.switchLabel}>
                                                <input
                                                    type="checkbox"
                                                    className={Styles.switchInput}
                                                    checked={editData.lønnet}
                                                    onChange={(e) => setEditData({ ...editData, lønnet: e.target.checked })}
                                                />
                                                <div className={`${Styles.switch} ${editData.lønnet ? Styles.switchActive : ''}`}>
                                                    <div className={Styles.switchThumb}></div>
                                                </div>
                                            </label>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={editData.beskrivelse || ''}
                                                onChange={(e) => setEditData({ ...editData, beskrivelse: e.target.value })}
                                                className={Styles.input}
                                            />
                                        </td>
                                        <td>
                                            <label className={Styles.switchLabel}>
                                                <input
                                                    type="checkbox"
                                                    className={Styles.switchInput}
                                                    checked={editData.aktiv}
                                                    onChange={(e) => setEditData({ ...editData, aktiv: e.target.checked })}
                                                />
                                                <div className={`${Styles.switch} ${editData.aktiv ? Styles.switchActive : ''}`}>
                                                    <div className={Styles.switchThumb}></div>
                                                </div>
                                            </label>
                                        </td>
                                        <td>
                                            <div className={Styles.actionButtons}>
                                                <button
                                                    onClick={() => handleSaveEdit(pause._id)}
                                                    className={Styles.saveButton}
                                                    title="Gem"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className={Styles.cancelButton}
                                                    title="Annuller"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className={Styles.dragHandleColumn}>
                                            <div className={Styles.dragHandle}>
                                                <GripVertical size={18} />
                                            </div>
                                        </td>
                                        <td className={Styles.navnCell}>{pause.navn}</td>
                                        <td>{formatVarighed(pause.varighed)}</td>
                                        <td>
                                            <span className={pause.lønnet ? Styles.lønnetBadge : Styles.ulønnetBadge}>
                                                {pause.lønnet ? 'Lønnet' : 'Ulønnet'}
                                            </span>
                                        </td>
                                        <td className={Styles.beskrivelseCell}>{pause.beskrivelse || '-'}</td>
                                        <td>
                                            <span className={pause.aktiv !== false ? Styles.aktivBadge : Styles.inaktivBadge}>
                                                {pause.aktiv !== false ? 'Aktiv' : 'Inaktiv'}
                                            </span>
                                        </td>
                                        <td className={Styles.actionCell}>
                                            <PopUpMenu
                                                actions={[
                                                    {
                                                        icon: <Edit2 size={16} />,
                                                        label: 'Rediger',
                                                        onClick: () => handleEdit(pause)
                                                    },
                                                    {
                                                        icon: <Trash2 size={16} />,
                                                        label: 'Slet',
                                                        onClick: () => handleDelete(pause._id, pause.navn)
                                                    }
                                                ]}
                                                direction="right"
                                                openAbove={true}
                                            />
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className={`${Styles.mobileView} ${Styles.mobileCardsContainer}`}>
                {/* Add New Card */}
                {isAddingNew && (
                    <div className={`${Styles.mobileCard} ${Styles.addCard}`}>
                        <div className={Styles.mobileCardHeader}>
                            <h3>Tilføj ny pause</h3>
                        </div>
                        <div className={Styles.mobileCardContent}>
                            <div className={Styles.mobileField}>
                                <label>Navn</label>
                                <input
                                    type="text"
                                    value={newPause.navn}
                                    onChange={(e) => setNewPause({ ...newPause, navn: e.target.value })}
                                    placeholder="Navn"
                                    className={Styles.mobileInput}
                                />
                            </div>
                            <div className={Styles.mobileField}>
                                <label>Varighed (minutter)</label>
                                <input
                                    type="number"
                                    value={newPause.varighed}
                                    onChange={(e) => setNewPause({ ...newPause, varighed: e.target.value })}
                                    placeholder="30"
                                    className={Styles.mobileInput}
                                    min="1"
                                />
                            </div>
                            <div className={Styles.mobileField}>
                                <label className={Styles.mobileSwitchLabel}>
                                    <span>Lønnet pause</span>
                                    <input
                                        type="checkbox"
                                        className={Styles.switchInput}
                                        checked={newPause.lønnet}
                                        onChange={(e) => setNewPause({ ...newPause, lønnet: e.target.checked })}
                                    />
                                    <div className={`${Styles.switch} ${newPause.lønnet ? Styles.switchActive : ''}`}>
                                        <div className={Styles.switchThumb}></div>
                                    </div>
                                </label>
                            </div>
                            <div className={Styles.mobileField}>
                                <label>Beskrivelse</label>
                                <input
                                    type="text"
                                    value={newPause.beskrivelse}
                                    onChange={(e) => setNewPause({ ...newPause, beskrivelse: e.target.value })}
                                    placeholder="Beskrivelse"
                                    className={Styles.mobileInput}
                                />
                            </div>
                            <div className={Styles.mobileField}>
                                <label className={Styles.mobileSwitchLabel}>
                                    <span>Aktiv</span>
                                    <input
                                        type="checkbox"
                                        className={Styles.switchInput}
                                        checked={newPause.aktiv}
                                        onChange={(e) => setNewPause({ ...newPause, aktiv: e.target.checked })}
                                    />
                                    <div className={`${Styles.switch} ${newPause.aktiv ? Styles.switchActive : ''}`}>
                                        <div className={Styles.switchThumb}></div>
                                    </div>
                                </label>
                            </div>
                            <div className={Styles.mobileCardActions}>
                                <button
                                    onClick={handleSaveNew}
                                    className={Styles.mobileSaveButton}
                                >
                                    <Check size={18} />
                                    Gem
                                </button>
                                <button
                                    onClick={handleCancelAdd}
                                    className={Styles.mobileCancelButton}
                                >
                                    <X size={18} />
                                    Annuller
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Existing Cards */}
                {pauser.map((pause, index) => (
                    <div
                        key={pause._id}
                        className={`${Styles.mobileCard} ${editingId === pause._id ? Styles.editingCard : ''} ${draggedIndex === index ? Styles.draggingCard : ''} ${dragOverIndex === index ? Styles.dragOverCard : ''}`}
                        draggable={editingId !== pause._id}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        {editingId === pause._id ? (
                            <>
                                <div className={Styles.mobileCardHeader}>
                                    <h3>Rediger pause</h3>
                                </div>
                                <div className={Styles.mobileCardContent}>
                                    <div className={Styles.mobileField}>
                                        <label>Navn</label>
                                        <input
                                            type="text"
                                            value={editData.navn}
                                            onChange={(e) => setEditData({ ...editData, navn: e.target.value })}
                                            className={Styles.mobileInput}
                                        />
                                    </div>
                                    <div className={Styles.mobileField}>
                                        <label>Varighed (minutter)</label>
                                        <input
                                            type="number"
                                            value={editData.varighed}
                                            onChange={(e) => setEditData({ ...editData, varighed: e.target.value })}
                                            className={Styles.mobileInput}
                                            min="1"
                                        />
                                    </div>
                                    <div className={Styles.mobileField}>
                                        <label className={Styles.mobileSwitchLabel}>
                                            <span>Lønnet pause</span>
                                            <input
                                                type="checkbox"
                                                className={Styles.switchInput}
                                                checked={editData.lønnet}
                                                onChange={(e) => setEditData({ ...editData, lønnet: e.target.checked })}
                                            />
                                            <div className={`${Styles.switch} ${editData.lønnet ? Styles.switchActive : ''}`}>
                                                <div className={Styles.switchThumb}></div>
                                            </div>
                                        </label>
                                    </div>
                                    <div className={Styles.mobileField}>
                                        <label>Beskrivelse</label>
                                        <input
                                            type="text"
                                            value={editData.beskrivelse || ''}
                                            onChange={(e) => setEditData({ ...editData, beskrivelse: e.target.value })}
                                            className={Styles.mobileInput}
                                        />
                                    </div>
                                    <div className={Styles.mobileField}>
                                        <label className={Styles.mobileSwitchLabel}>
                                            <span>Aktiv</span>
                                            <input
                                                type="checkbox"
                                                className={Styles.switchInput}
                                                checked={editData.aktiv}
                                                onChange={(e) => setEditData({ ...editData, aktiv: e.target.checked })}
                                            />
                                            <div className={`${Styles.switch} ${editData.aktiv ? Styles.switchActive : ''}`}>
                                                <div className={Styles.switchThumb}></div>
                                            </div>
                                        </label>
                                    </div>
                                    <div className={Styles.mobileCardActions}>
                                        <button
                                            onClick={() => handleSaveEdit(pause._id)}
                                            className={Styles.mobileSaveButton}
                                        >
                                            <Check size={18} />
                                            Gem
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className={Styles.mobileCancelButton}
                                        >
                                            <X size={18} />
                                            Annuller
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={Styles.mobileCardHeader}>
                                    <div className={Styles.mobileCardHeaderLeft}>
                                        <div className={Styles.mobileDragHandle}>
                                            <GripVertical size={18} />
                                        </div>
                                        <div className={Styles.mobileCardTitle}>
                                            <span className={Styles.mobileCardName}>{pause.navn}</span>
                                            <span className={Styles.mobileCardVarighed}>{formatVarighed(pause.varighed)}</span>
                                        </div>
                                    </div>
                                    <div className={Styles.mobileCardHeaderRight}>
                                        <span className={pause.lønnet ? Styles.mobileLønnetBadge : Styles.mobileUlønnetBadge}>
                                            {pause.lønnet ? 'Lønnet' : 'Ulønnet'}
                                        </span>
                                        <PopUpMenu
                                            actions={[
                                                {
                                                    icon: <Edit2 size={16} />,
                                                    label: 'Rediger',
                                                    onClick: () => handleEdit(pause)
                                                },
                                                {
                                                    icon: <Trash2 size={16} />,
                                                    label: 'Slet',
                                                    onClick: () => handleDelete(pause._id, pause.navn)
                                                }
                                            ]}
                                            direction="right"
                                            openAbove={true}
                                        />
                                    </div>
                                </div>
                                <div className={Styles.mobileCardContent}>
                                    {pause.beskrivelse && (
                                        <div className={Styles.mobileCardItem}>
                                            <span className={Styles.mobileCardLabel}>Beskrivelse</span>
                                            <span className={Styles.mobileCardValue}>{pause.beskrivelse}</span>
                                        </div>
                                    )}
                                    <div className={Styles.mobileCardItem}>
                                        <span className={pause.aktiv !== false ? Styles.mobileAktivBadge : Styles.mobileInaktivBadge}>
                                            {pause.aktiv !== false ? 'Aktiv' : 'Inaktiv'}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PauseTabel

