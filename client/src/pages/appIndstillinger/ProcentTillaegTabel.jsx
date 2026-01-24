import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Styles from './TimetyperTabel.module.css'
import { Plus, Edit2, Trash2, Check, X, GripVertical } from 'lucide-react'
import PopUpMenu from '../../components/basicComponents/PopUpMenu.jsx'

const ProcentTillaegTabel = ({ user }) => {
    const [procentTillaeg, setProcentTillaeg] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [isAddingNew, setIsAddingNew] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [draggedIndex, setDraggedIndex] = useState(null)
    const [dragOverIndex, setDragOverIndex] = useState(null)

    // State for ny procentTillaeg
    const [newProcentTillaeg, setNewProcentTillaeg] = useState({
        navn: '',
        nummer: '',
        farve: '#3b82f6',
        listeSats: '',
        kostSats: '',
        beskrivelse: '',
        aktiv: true,
        rækkefølge: 0
    })

    // State for redigering
    const [editData, setEditData] = useState({})

    useEffect(() => {
        fetchProcentTillaeg()
    }, [])

    const fetchProcentTillaeg = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/procentTillaeg/`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            setProcentTillaeg(response.data)
        } catch (error) {
            console.error('Fejl ved hentning af procentTillaeg:', error)
            setErrorMessage('Kunne ikke hente procentTillaeg')
        } finally {
            setLoading(false)
        }
    }

    const handleAddNew = () => {
        setIsAddingNew(true)
        setEditingId(null)
        setNewProcentTillaeg({
            navn: '',
            nummer: '',
            farve: '#3b82f6',
            listeSats: '',
            kostSats: '',
            beskrivelse: '',
            aktiv: true,
            rækkefølge: procentTillaeg.length
        })
    }

    const handleCancelAdd = () => {
        setIsAddingNew(false)
        setNewProcentTillaeg({
            navn: '',
            nummer: '',
            farve: '#3b82f6',
            listeSats: '',
            kostSats: '',
            beskrivelse: '',
            aktiv: true,
            rækkefølge: 0
        })
        setErrorMessage('')
    }

    const handleSaveNew = async () => {
        // Validering
        if (!newProcentTillaeg.navn || !newProcentTillaeg.nummer || newProcentTillaeg.listeSats === '' || newProcentTillaeg.kostSats === '') {
            setErrorMessage('Udfyld venligst alle påkrævede felter')
            return
        }

        try {
            const payload = {
                ...newProcentTillaeg,
                nummer: Number(newProcentTillaeg.nummer),
                listeSats: Number(newProcentTillaeg.listeSats),
                kostSats: Number(newProcentTillaeg.kostSats),
                rækkefølge: Number(newProcentTillaeg.rækkefølge) || 0
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/procentTillaeg/`, payload, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            
            setIsAddingNew(false)
            setErrorMessage('')
            fetchProcentTillaeg()
        } catch (error) {
            console.error('Fejl ved oprettelse af procentTillaeg:', error)
            setErrorMessage(error.response?.data?.error || 'Kunne ikke oprette procentTillaeg')
        }
    }

    const handleEdit = (procentTillaeg) => {
        setEditingId(procentTillaeg._id)
        setIsAddingNew(false)
        setEditData({
            navn: procentTillaeg.navn,
            nummer: procentTillaeg.nummer,
            farve: procentTillaeg.farve || '#3b82f6',
            listeSats: procentTillaeg.listeSats,
            kostSats: procentTillaeg.kostSats,
            beskrivelse: procentTillaeg.beskrivelse || '',
            aktiv: procentTillaeg.aktiv !== undefined ? procentTillaeg.aktiv : true,
            rækkefølge: procentTillaeg.rækkefølge || 0
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
        if (!editData.navn || !editData.nummer || editData.listeSats === '' || editData.kostSats === '') {
            setErrorMessage('Udfyld venligst alle påkrævede felter')
            return
        }

        try {
            const payload = {
                ...editData,
                nummer: Number(editData.nummer),
                listeSats: Number(editData.listeSats),
                kostSats: Number(editData.kostSats),
                rækkefølge: Number(editData.rækkefølge) || 0
            }

            await axios.patch(`${import.meta.env.VITE_API_URL}/procentTillaeg/${id}`, payload, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            
            setEditingId(null)
            setEditData({})
            setErrorMessage('')
            fetchProcentTillaeg()
        } catch (error) {
            console.error('Fejl ved opdatering af procentTillaeg:', error)
            setErrorMessage(error.response?.data?.error || 'Kunne ikke opdatere procentTillaeg')
        }
    }

    const handleDelete = async (id, navn) => {
        if (!window.confirm(`Er du sikker på, at du vil slette procentTillaeget "${navn}"?`)) {
            return
        }

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/procentTillaeg/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            fetchProcentTillaeg()
        } catch (error) {
            console.error('Fejl ved sletning af procentTillaeg:', error)
            setErrorMessage('Kunne ikke slette procentTillaeg')
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

        const newProcentTillaegList = [...procentTillaeg]
        const draggedItem = newProcentTillaegList[draggedIndex]
        
        // Fjern det trækkede element
        newProcentTillaegList.splice(draggedIndex, 1)
        
        // Indsæt det trækkede element på den nye position
        newProcentTillaegList.splice(dropIndex, 0, draggedItem)
        
        // Opdater rækkefølge for alle elementer
        const updatedProcentTillaeg = newProcentTillaegList.map((item, index) => ({
            ...item,
            rækkefølge: index
        }))

        // Opdater lokalt først for bedre UX
        setProcentTillaeg(updatedProcentTillaeg)
        setDraggedIndex(null)
        setDragOverIndex(null)

        // Opdater rækkefølge i databasen
        try {
            const updatePromises = updatedProcentTillaeg.map((procentTillaeg, index) => 
                axios.patch(
                    `${import.meta.env.VITE_API_URL}/procentTillaeg/${procentTillaeg._id}`,
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
            fetchProcentTillaeg()
        }
    }

    if (loading) {
        return <div className={Styles.loading}>Henter procentTillaeg...</div>
    }

    return (
        <div className={Styles.tabelContainer}>
            {errorMessage && (
                <div className={Styles.errorMessage}>{errorMessage}</div>
            )}

            {!isAddingNew && (
                <button onClick={handleAddNew} className={Styles.addButton}>
                    <Plus size={18} />
                    Tilføj nyt procenttillæg
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
                            <th>ListeSats</th>
                            <th>KostSats</th>
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
                                        value={newProcentTillaeg.nummer}
                                        onChange={(e) => setNewProcentTillaeg({ ...newProcentTillaeg, nummer: e.target.value })}
                                        placeholder="Nummer"
                                        className={Styles.input}
                                        min="1"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={newProcentTillaeg.navn}
                                        onChange={(e) => setNewProcentTillaeg({ ...newProcentTillaeg, navn: e.target.value })}
                                        placeholder="Navn"
                                        className={Styles.input}
                                    />
                                </td>
                                <td>
                                    <div className={Styles.farveContainer}>
                                        <input
                                            type="color"
                                            value={newProcentTillaeg.farve}
                                            onChange={(e) => setNewProcentTillaeg({ ...newProcentTillaeg, farve: e.target.value })}
                                            className={Styles.colorInput}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={newProcentTillaeg.listeSats}
                                        onChange={(e) => setNewProcentTillaeg({ ...newProcentTillaeg, listeSats: e.target.value })}
                                        placeholder="0"
                                        className={Styles.input}
                                        min="0"
                                        step="0.01"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={newProcentTillaeg.kostSats}
                                        onChange={(e) => setNewProcentTillaeg({ ...newProcentTillaeg, kostSats: e.target.value })}
                                        placeholder="0"
                                        className={Styles.input}
                                        min="0"
                                        step="0.01"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={newProcentTillaeg.beskrivelse}
                                        onChange={(e) => setNewProcentTillaeg({ ...newProcentTillaeg, beskrivelse: e.target.value })}
                                        placeholder="Beskrivelse"
                                        className={Styles.input}
                                    />
                                </td>
                                <td>
                                    <label className={Styles.switchLabel}>
                                        <input
                                            type="checkbox"
                                            className={Styles.switchInput}
                                            checked={newProcentTillaeg.aktiv}
                                            onChange={(e) => setNewProcentTillaeg({ ...newProcentTillaeg, aktiv: e.target.checked })}
                                        />
                                        <div className={`${Styles.switch} ${newProcentTillaeg.aktiv ? Styles.switchActive : ''}`}>
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

                        {/* Eksisterende procentTillaeg */}
                        {procentTillaeg.map((procentTillaeg, index) => (
                            <tr 
                                key={procentTillaeg._id} 
                                className={`${editingId === procentTillaeg._id ? Styles.editingRow : ''} ${draggedIndex === index ? Styles.dragging : ''} ${dragOverIndex === index ? Styles.dragOver : ''}`}
                                draggable={editingId !== procentTillaeg._id}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                            >
                                {editingId === procentTillaeg._id ? (
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
                                                value={editData.listeSats}
                                                onChange={(e) => setEditData({ ...editData, listeSats: e.target.value })}
                                                className={Styles.input}
                                                min="0"
                                                step="0.01"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={editData.kostSats}
                                                onChange={(e) => setEditData({ ...editData, kostSats: e.target.value })}
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
                                                    onClick={() => handleSaveEdit(procentTillaeg._id)}
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
                                        <td>{procentTillaeg.nummer}</td>
                                        <td>{procentTillaeg.navn}</td>
                                        <td>
                                            <div className={Styles.farveContainer}>
                                                <span 
                                                    className={Styles.farvePreview} 
                                                    style={{ backgroundColor: procentTillaeg.farve || '#3b82f6' }}
                                                    title={procentTillaeg.farve || '#3b82f6'}
                                                ></span>
                                            </div>
                                        </td>
                                        <td>{procentTillaeg.listeSats?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</td>
                                        <td>{procentTillaeg.kostSats?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</td>
                                        <td className={Styles.beskrivelseCell}>{procentTillaeg.beskrivelse || '-'}</td>
                                        <td>
                                            <span className={procentTillaeg.aktiv !== false ? Styles.aktivBadge : Styles.inaktivBadge}>
                                                {procentTillaeg.aktiv !== false ? 'Aktiv' : 'Inaktiv'}
                                            </span>
                                        </td>
                                        <td className={Styles.actionCell}>
                                            <PopUpMenu
                                                actions={[
                                                    {
                                                        icon: <Edit2 size={16} />,
                                                        label: 'Rediger',
                                                        onClick: () => handleEdit(procentTillaeg)
                                                    },
                                                    {
                                                        icon: <Trash2 size={16} />,
                                                        label: 'Slet',
                                                        onClick: () => handleDelete(procentTillaeg._id, procentTillaeg.navn)
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
                            <h3>Tilføj nyt procenttillæg</h3>
                        </div>
                        <div className={Styles.mobileCardContent}>
                            <div className={Styles.mobileField}>
                                <label>Nummer</label>
                                <input
                                    type="number"
                                    value={newProcentTillaeg.nummer}
                                    onChange={(e) => setNewProcentTillaeg({ ...newProcentTillaeg, nummer: e.target.value })}
                                    placeholder="Nummer"
                                    className={Styles.mobileInput}
                                    min="1"
                                />
                            </div>
                            <div className={Styles.mobileField}>
                                <label>Navn</label>
                                <input
                                    type="text"
                                    value={newProcentTillaeg.navn}
                                    onChange={(e) => setNewProcentTillaeg({ ...newProcentTillaeg, navn: e.target.value })}
                                    placeholder="Navn"
                                    className={Styles.mobileInput}
                                />
                            </div>
                            <div className={Styles.mobileField}>
                                <label>Farve</label>
                                <div className={Styles.mobileColorInputWrapper}>
                                    <input
                                        type="color"
                                        value={newProcentTillaeg.farve}
                                        onChange={(e) => setNewProcentTillaeg({ ...newProcentTillaeg, farve: e.target.value })}
                                        className={Styles.mobileColorInput}
                                    />
                                    <span className={Styles.mobileColorPreview} style={{ backgroundColor: newProcentTillaeg.farve }}></span>
                                </div>
                            </div>
                            <div className={Styles.mobileFieldRow}>
                                <div className={Styles.mobileField}>
                                    <label>ListeSats</label>
                                    <input
                                        type="number"
                                        value={newProcentTillaeg.listeSats}
                                        onChange={(e) => setNewProcentTillaeg({ ...newProcentTillaeg, listeSats: e.target.value })}
                                        placeholder="0"
                                        className={Styles.mobileInput}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className={Styles.mobileField}>
                                    <label>KostSats</label>
                                    <input
                                        type="number"
                                        value={newProcentTillaeg.kostSats}
                                        onChange={(e) => setNewProcentTillaeg({ ...newProcentTillaeg, kostSats: e.target.value })}
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
                                    value={newProcentTillaeg.beskrivelse}
                                    onChange={(e) => setNewProcentTillaeg({ ...newProcentTillaeg, beskrivelse: e.target.value })}
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
                                        checked={newProcentTillaeg.aktiv}
                                        onChange={(e) => setNewProcentTillaeg({ ...newProcentTillaeg, aktiv: e.target.checked })}
                                    />
                                    <div className={`${Styles.switch} ${newProcentTillaeg.aktiv ? Styles.switchActive : ''}`}>
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
                {procentTillaeg.map((procentTillaeg, index) => (
                    <div
                        key={procentTillaeg._id}
                        className={`${Styles.mobileCard} ${editingId === procentTillaeg._id ? Styles.editingCard : ''} ${draggedIndex === index ? Styles.draggingCard : ''} ${dragOverIndex === index ? Styles.dragOverCard : ''}`}
                        draggable={editingId !== procentTillaeg._id}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        {editingId === procentTillaeg._id ? (
                            <>
                                <div className={Styles.mobileCardHeader}>
                                    <h3>Rediger procenttillæg</h3>
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
                                            <label>ListeSats</label>
                                            <input
                                                type="number"
                                                value={editData.listeSats}
                                                onChange={(e) => setEditData({ ...editData, listeSats: e.target.value })}
                                                className={Styles.mobileInput}
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className={Styles.mobileField}>
                                            <label>KostSats</label>
                                            <input
                                                type="number"
                                                value={editData.kostSats}
                                                onChange={(e) => setEditData({ ...editData, kostSats: e.target.value })}
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
                                            onClick={() => handleSaveEdit(procentTillaeg._id)}
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
                                            <span className={Styles.mobileCardName}>{procentTillaeg.navn}</span>
                                            <span className={Styles.mobileCardNumber}>#{procentTillaeg.nummer}</span>
                                        </div>
                                    </div>
                                    <div className={Styles.mobileCardHeaderRight}>
                                        <span 
                                            className={Styles.mobileColorBadge} 
                                            style={{ backgroundColor: procentTillaeg.farve || '#3b82f6' }}
                                        ></span>
                                        <PopUpMenu
                                            actions={[
                                                {
                                                    icon: <Edit2 size={16} />,
                                                    label: 'Rediger',
                                                    onClick: () => handleEdit(procentTillaeg)
                                                },
                                                {
                                                    icon: <Trash2 size={16} />,
                                                    label: 'Slet',
                                                    onClick: () => handleDelete(procentTillaeg._id, procentTillaeg.navn)
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
                                            <span className={Styles.mobileCardLabel}>ListeSats</span>
                                            <span className={Styles.mobileCardValue}>
                                                {procentTillaeg.listeSats?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                            </span>
                                        </div>
                                        <div className={Styles.mobileCardItem}>
                                            <span className={Styles.mobileCardLabel}>KostSats</span>
                                            <span className={Styles.mobileCardValue}>
                                                {procentTillaeg.kostSats?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                            </span>
                                        </div>
                                    </div>
                                    {procentTillaeg.beskrivelse && (
                                        <div className={Styles.mobileCardItem}>
                                            <span className={Styles.mobileCardLabel}>Beskrivelse</span>
                                            <span className={Styles.mobileCardValue}>{procentTillaeg.beskrivelse}</span>
                                        </div>
                                    )}
                                    <div className={Styles.mobileCardItem}>
                                        <span className={procentTillaeg.aktiv !== false ? Styles.mobileAktivBadge : Styles.mobileInaktivBadge}>
                                            {procentTillaeg.aktiv !== false ? 'Aktiv' : 'Inaktiv'}
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

export default ProcentTillaegTabel

