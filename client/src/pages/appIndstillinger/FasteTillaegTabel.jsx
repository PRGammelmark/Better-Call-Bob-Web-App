import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Styles from './TimetyperTabel.module.css'
import { Plus, Edit2, Trash2, Check, X, GripVertical } from 'lucide-react'
import PopUpMenu from '../../components/basicComponents/PopUpMenu.jsx'

const FasteTillaegTabel = ({ user }) => {
    const [fasteTillaeg, setFasteTillaeg] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [isAddingNew, setIsAddingNew] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [draggedIndex, setDraggedIndex] = useState(null)
    const [dragOverIndex, setDragOverIndex] = useState(null)

    // State for ny fasteTillaeg
    const [newFasteTillaeg, setNewFasteTillaeg] = useState({
        navn: '',
        nummer: '',
        farve: '#3b82f6',
        listepris: '',
        kostpris: '',
        beskrivelse: '',
        aktiv: true,
        rækkefølge: 0
    })

    // State for redigering
    const [editData, setEditData] = useState({})

    useEffect(() => {
        fetchFasteTillaeg()
    }, [])

    const fetchFasteTillaeg = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/fasteTillaeg/`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            setFasteTillaeg(response.data)
        } catch (error) {
            console.error('Fejl ved hentning af fasteTillaeg:', error)
            setErrorMessage('Kunne ikke hente fasteTillaeg')
        } finally {
            setLoading(false)
        }
    }

    const handleAddNew = () => {
        setIsAddingNew(true)
        setEditingId(null)
        setNewFasteTillaeg({
            navn: '',
            nummer: '',
            farve: '#3b82f6',
            listepris: '',
            kostpris: '',
            beskrivelse: '',
            aktiv: true,
            rækkefølge: fasteTillaeg.length
        })
    }

    const handleCancelAdd = () => {
        setIsAddingNew(false)
        setNewFasteTillaeg({
            navn: '',
            nummer: '',
            farve: '#3b82f6',
            listepris: '',
            kostpris: '',
            beskrivelse: '',
            aktiv: true,
            rækkefølge: 0
        })
        setErrorMessage('')
    }

    const handleSaveNew = async () => {
        // Validering
        if (!newFasteTillaeg.navn || !newFasteTillaeg.nummer || newFasteTillaeg.listepris === '' || newFasteTillaeg.kostpris === '') {
            setErrorMessage('Udfyld venligst alle påkrævede felter')
            return
        }

        try {
            const payload = {
                ...newFasteTillaeg,
                nummer: Number(newFasteTillaeg.nummer),
                listepris: Number(newFasteTillaeg.listepris),
                kostpris: Number(newFasteTillaeg.kostpris),
                rækkefølge: Number(newFasteTillaeg.rækkefølge) || 0
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/fasteTillaeg/`, payload, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            
            setIsAddingNew(false)
            setErrorMessage('')
            fetchFasteTillaeg()
        } catch (error) {
            console.error('Fejl ved oprettelse af fasteTillaeg:', error)
            setErrorMessage(error.response?.data?.error || 'Kunne ikke oprette fasteTillaeg')
        }
    }

    const handleEdit = (fasteTillaeg) => {
        setEditingId(fasteTillaeg._id)
        setIsAddingNew(false)
        setEditData({
            navn: fasteTillaeg.navn,
            nummer: fasteTillaeg.nummer,
            farve: fasteTillaeg.farve || '#3b82f6',
            listepris: fasteTillaeg.listepris,
            kostpris: fasteTillaeg.kostpris,
            beskrivelse: fasteTillaeg.beskrivelse || '',
            aktiv: fasteTillaeg.aktiv !== undefined ? fasteTillaeg.aktiv : true,
            rækkefølge: fasteTillaeg.rækkefølge || 0
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
        if (!editData.navn || !editData.nummer || editData.listepris === '' || editData.kostpris === '') {
            setErrorMessage('Udfyld venligst alle påkrævede felter')
            return
        }

        try {
            const payload = {
                ...editData,
                nummer: Number(editData.nummer),
                listepris: Number(editData.listepris),
                kostpris: Number(editData.kostpris),
                rækkefølge: Number(editData.rækkefølge) || 0
            }

            await axios.patch(`${import.meta.env.VITE_API_URL}/fasteTillaeg/${id}`, payload, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            
            setEditingId(null)
            setEditData({})
            setErrorMessage('')
            fetchFasteTillaeg()
        } catch (error) {
            console.error('Fejl ved opdatering af fasteTillaeg:', error)
            setErrorMessage(error.response?.data?.error || 'Kunne ikke opdatere fasteTillaeg')
        }
    }

    const handleDelete = async (id, navn) => {
        if (!window.confirm(`Er du sikker på, at du vil slette fasteTillaeget "${navn}"?`)) {
            return
        }

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/fasteTillaeg/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            fetchFasteTillaeg()
        } catch (error) {
            console.error('Fejl ved sletning af fasteTillaeg:', error)
            setErrorMessage('Kunne ikke slette fasteTillaeg')
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

        const newFasteTillaegList = [...fasteTillaeg]
        const draggedItem = newFasteTillaegList[draggedIndex]
        
        // Fjern det trækkede element
        newFasteTillaegList.splice(draggedIndex, 1)
        
        // Indsæt det trækkede element på den nye position
        newFasteTillaegList.splice(dropIndex, 0, draggedItem)
        
        // Opdater rækkefølge for alle elementer
        const updatedFasteTillaeg = newFasteTillaegList.map((item, index) => ({
            ...item,
            rækkefølge: index
        }))

        // Opdater lokalt først for bedre UX
        setFasteTillaeg(updatedFasteTillaeg)
        setDraggedIndex(null)
        setDragOverIndex(null)

        // Opdater rækkefølge i databasen
        try {
            const updatePromises = updatedFasteTillaeg.map((fasteTillaeg, index) => 
                axios.patch(
                    `${import.meta.env.VITE_API_URL}/fasteTillaeg/${fasteTillaeg._id}`,
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
            fetchFasteTillaeg()
        }
    }

    if (loading) {
        return <div className={Styles.loading}>Henter fasteTillaeg...</div>
    }

    return (
        <div className={Styles.tabelContainer}>
            {errorMessage && (
                <div className={Styles.errorMessage}>{errorMessage}</div>
            )}

            {!isAddingNew && (
                <button onClick={handleAddNew} className={Styles.addButton}>
                    <Plus size={18} />
                    Tilføj nyt fast tillæg
                </button>
            )}

            {/* Desktop Table View */}
            <div className={`${Styles.tabelWrapper} ${Styles.desktopView}`}>
                <table className={Styles.tabel}>
                    <thead>
                        <tr>
                            <th className={Styles.dragHandleColumn}></th>
                            <th>Nummer</th>
                            <th>Navn</th>
                            <th>Farve</th>
                            <th>Listepris</th>
                            <th>Kostpris</th>
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
                                        type="number"
                                        value={newFasteTillaeg.nummer}
                                        onChange={(e) => setNewFasteTillaeg({ ...newFasteTillaeg, nummer: e.target.value })}
                                        placeholder="Nummer"
                                        className={Styles.input}
                                        min="1"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={newFasteTillaeg.navn}
                                        onChange={(e) => setNewFasteTillaeg({ ...newFasteTillaeg, navn: e.target.value })}
                                        placeholder="Navn"
                                        className={Styles.input}
                                    />
                                </td>
                                <td>
                                    <div className={Styles.farveContainer}>
                                        <input
                                            type="color"
                                            value={newFasteTillaeg.farve}
                                            onChange={(e) => setNewFasteTillaeg({ ...newFasteTillaeg, farve: e.target.value })}
                                            className={Styles.colorInput}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={newFasteTillaeg.listepris}
                                        onChange={(e) => setNewFasteTillaeg({ ...newFasteTillaeg, listepris: e.target.value })}
                                        placeholder="0"
                                        className={Styles.input}
                                        min="0"
                                        step="0.01"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={newFasteTillaeg.kostpris}
                                        onChange={(e) => setNewFasteTillaeg({ ...newFasteTillaeg, kostpris: e.target.value })}
                                        placeholder="0"
                                        className={Styles.input}
                                        min="0"
                                        step="0.01"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={newFasteTillaeg.beskrivelse}
                                        onChange={(e) => setNewFasteTillaeg({ ...newFasteTillaeg, beskrivelse: e.target.value })}
                                        placeholder="Beskrivelse"
                                        className={Styles.input}
                                    />
                                </td>
                                <td>
                                    <label className={Styles.switchLabel}>
                                        <input
                                            type="checkbox"
                                            className={Styles.switchInput}
                                            checked={newFasteTillaeg.aktiv}
                                            onChange={(e) => setNewFasteTillaeg({ ...newFasteTillaeg, aktiv: e.target.checked })}
                                        />
                                        <div className={`${Styles.switch} ${newFasteTillaeg.aktiv ? Styles.switchActive : ''}`}>
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

                        {/* Eksisterende fasteTillaeg */}
                        {fasteTillaeg.map((fasteTillaeg, index) => (
                            <tr 
                                key={fasteTillaeg._id} 
                                className={`${editingId === fasteTillaeg._id ? Styles.editingRow : ''} ${draggedIndex === index ? Styles.dragging : ''} ${dragOverIndex === index ? Styles.dragOver : ''}`}
                                draggable={editingId !== fasteTillaeg._id}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                            >
                                {editingId === fasteTillaeg._id ? (
                                    <>
                                        <td className={Styles.dragHandleColumn}></td>
                                        <td>
                                            <input
                                                type="number"
                                                value={editData.nummer}
                                                onChange={(e) => setEditData({ ...editData, nummer: e.target.value })}
                                                className={Styles.input}
                                                min="1"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={editData.navn}
                                                onChange={(e) => setEditData({ ...editData, navn: e.target.value })}
                                                className={Styles.input}
                                            />
                                        </td>
                                        <td>
                                            <div className={Styles.farveContainer}>
                                                <input
                                                    type="color"
                                                    value={editData.farve}
                                                    onChange={(e) => setEditData({ ...editData, farve: e.target.value })}
                                                    className={Styles.colorInput}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={editData.listepris}
                                                onChange={(e) => setEditData({ ...editData, listepris: e.target.value })}
                                                className={Styles.input}
                                                min="0"
                                                step="0.01"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={editData.kostpris}
                                                onChange={(e) => setEditData({ ...editData, kostpris: e.target.value })}
                                                className={Styles.input}
                                                min="0"
                                                step="0.01"
                                            />
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
                                                    onClick={() => handleSaveEdit(fasteTillaeg._id)}
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
                                        <td>{fasteTillaeg.nummer}</td>
                                        <td>{fasteTillaeg.navn}</td>
                                        <td>
                                            <div className={Styles.farveContainer}>
                                                <span 
                                                    className={Styles.farvePreview} 
                                                    style={{ backgroundColor: fasteTillaeg.farve || '#3b82f6' }}
                                                    title={fasteTillaeg.farve || '#3b82f6'}
                                                ></span>
                                            </div>
                                        </td>
                                        <td>{fasteTillaeg.listepris?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr</td>
                                        <td>{fasteTillaeg.kostpris?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr</td>
                                        <td className={Styles.beskrivelseCell}>{fasteTillaeg.beskrivelse || '-'}</td>
                                        <td>
                                            <span className={fasteTillaeg.aktiv !== false ? Styles.aktivBadge : Styles.inaktivBadge}>
                                                {fasteTillaeg.aktiv !== false ? 'Aktiv' : 'Inaktiv'}
                                            </span>
                                        </td>
                                        <td className={Styles.actionCell}>
                                            <PopUpMenu
                                                actions={[
                                                    {
                                                        icon: <Edit2 size={16} />,
                                                        label: 'Rediger',
                                                        onClick: () => handleEdit(fasteTillaeg)
                                                    },
                                                    {
                                                        icon: <Trash2 size={16} />,
                                                        label: 'Slet',
                                                        onClick: () => handleDelete(fasteTillaeg._id, fasteTillaeg.navn)
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
                            <h3>Tilføj nyt fast tillæg</h3>
                        </div>
                        <div className={Styles.mobileCardContent}>
                            <div className={Styles.mobileField}>
                                <label>Nummer</label>
                                <input
                                    type="number"
                                    value={newFasteTillaeg.nummer}
                                    onChange={(e) => setNewFasteTillaeg({ ...newFasteTillaeg, nummer: e.target.value })}
                                    placeholder="Nummer"
                                    className={Styles.mobileInput}
                                    min="1"
                                />
                            </div>
                            <div className={Styles.mobileField}>
                                <label>Navn</label>
                                <input
                                    type="text"
                                    value={newFasteTillaeg.navn}
                                    onChange={(e) => setNewFasteTillaeg({ ...newFasteTillaeg, navn: e.target.value })}
                                    placeholder="Navn"
                                    className={Styles.mobileInput}
                                />
                            </div>
                            <div className={Styles.mobileField}>
                                <label>Farve</label>
                                <div className={Styles.mobileColorInputWrapper}>
                                    <input
                                        type="color"
                                        value={newFasteTillaeg.farve}
                                        onChange={(e) => setNewFasteTillaeg({ ...newFasteTillaeg, farve: e.target.value })}
                                        className={Styles.mobileColorInput}
                                    />
                                    <span className={Styles.mobileColorPreview} style={{ backgroundColor: newFasteTillaeg.farve }}></span>
                                </div>
                            </div>
                            <div className={Styles.mobileFieldRow}>
                                <div className={Styles.mobileField}>
                                    <label>Listepris</label>
                                    <input
                                        type="number"
                                        value={newFasteTillaeg.listepris}
                                        onChange={(e) => setNewFasteTillaeg({ ...newFasteTillaeg, listepris: e.target.value })}
                                        placeholder="0"
                                        className={Styles.mobileInput}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className={Styles.mobileField}>
                                    <label>Kostpris</label>
                                    <input
                                        type="number"
                                        value={newFasteTillaeg.kostpris}
                                        onChange={(e) => setNewFasteTillaeg({ ...newFasteTillaeg, kostpris: e.target.value })}
                                        placeholder="0"
                                        className={Styles.mobileInput}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div className={Styles.mobileField}>
                                <label>Beskrivelse</label>
                                <input
                                    type="text"
                                    value={newFasteTillaeg.beskrivelse}
                                    onChange={(e) => setNewFasteTillaeg({ ...newFasteTillaeg, beskrivelse: e.target.value })}
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
                                        checked={newFasteTillaeg.aktiv}
                                        onChange={(e) => setNewFasteTillaeg({ ...newFasteTillaeg, aktiv: e.target.checked })}
                                    />
                                    <div className={`${Styles.switch} ${newFasteTillaeg.aktiv ? Styles.switchActive : ''}`}>
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
                {fasteTillaeg.map((fasteTillaeg, index) => (
                    <div
                        key={fasteTillaeg._id}
                        className={`${Styles.mobileCard} ${editingId === fasteTillaeg._id ? Styles.editingCard : ''} ${draggedIndex === index ? Styles.draggingCard : ''} ${dragOverIndex === index ? Styles.dragOverCard : ''}`}
                        draggable={editingId !== fasteTillaeg._id}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        {editingId === fasteTillaeg._id ? (
                            <>
                                <div className={Styles.mobileCardHeader}>
                                    <h3>Rediger fast tillæg</h3>
                                </div>
                                <div className={Styles.mobileCardContent}>
                                    <div className={Styles.mobileField}>
                                        <label>Nummer</label>
                                        <input
                                            type="number"
                                            value={editData.nummer}
                                            onChange={(e) => setEditData({ ...editData, nummer: e.target.value })}
                                            className={Styles.mobileInput}
                                            min="1"
                                        />
                                    </div>
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
                                        <label>Farve</label>
                                        <div className={Styles.mobileColorInputWrapper}>
                                            <input
                                                type="color"
                                                value={editData.farve}
                                                onChange={(e) => setEditData({ ...editData, farve: e.target.value })}
                                                className={Styles.mobileColorInput}
                                            />
                                            <span className={Styles.mobileColorPreview} style={{ backgroundColor: editData.farve }}></span>
                                        </div>
                                    </div>
                                    <div className={Styles.mobileFieldRow}>
                                        <div className={Styles.mobileField}>
                                            <label>Listepris</label>
                                            <input
                                                type="number"
                                                value={editData.listepris}
                                                onChange={(e) => setEditData({ ...editData, listepris: e.target.value })}
                                                className={Styles.mobileInput}
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className={Styles.mobileField}>
                                            <label>Kostpris</label>
                                            <input
                                                type="number"
                                                value={editData.kostpris}
                                                onChange={(e) => setEditData({ ...editData, kostpris: e.target.value })}
                                                className={Styles.mobileInput}
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
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
                                            onClick={() => handleSaveEdit(fasteTillaeg._id)}
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
                                            <span className={Styles.mobileCardName}>{fasteTillaeg.navn}</span>
                                            <span className={Styles.mobileCardNumber}>#{fasteTillaeg.nummer}</span>
                                        </div>
                                    </div>
                                    <div className={Styles.mobileCardHeaderRight}>
                                        <span 
                                            className={Styles.mobileColorBadge} 
                                            style={{ backgroundColor: fasteTillaeg.farve || '#3b82f6' }}
                                        ></span>
                                        <PopUpMenu
                                            actions={[
                                                {
                                                    icon: <Edit2 size={16} />,
                                                    label: 'Rediger',
                                                    onClick: () => handleEdit(fasteTillaeg)
                                                },
                                                {
                                                    icon: <Trash2 size={16} />,
                                                    label: 'Slet',
                                                    onClick: () => handleDelete(fasteTillaeg._id, fasteTillaeg.navn)
                                                }
                                            ]}
                                            direction="right"
                                            openAbove={true}
                                        />
                                    </div>
                                </div>
                                <div className={Styles.mobileCardContent}>
                                    <div className={Styles.mobileCardRow}>
                                        <div className={Styles.mobileCardItem}>
                                            <span className={Styles.mobileCardLabel}>Listepris</span>
                                            <span className={Styles.mobileCardValue}>
                                                {fasteTillaeg.listepris?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                                            </span>
                                        </div>
                                        <div className={Styles.mobileCardItem}>
                                            <span className={Styles.mobileCardLabel}>Kostpris</span>
                                            <span className={Styles.mobileCardValue}>
                                                {fasteTillaeg.kostpris?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                                            </span>
                                        </div>
                                    </div>
                                    {fasteTillaeg.beskrivelse && (
                                        <div className={Styles.mobileCardItem}>
                                            <span className={Styles.mobileCardLabel}>Beskrivelse</span>
                                            <span className={Styles.mobileCardValue}>{fasteTillaeg.beskrivelse}</span>
                                        </div>
                                    )}
                                    <div className={Styles.mobileCardItem}>
                                        <span className={fasteTillaeg.aktiv !== false ? Styles.mobileAktivBadge : Styles.mobileInaktivBadge}>
                                            {fasteTillaeg.aktiv !== false ? 'Aktiv' : 'Inaktiv'}
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

export default FasteTillaegTabel

