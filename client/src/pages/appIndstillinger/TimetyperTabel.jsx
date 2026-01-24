import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Styles from './TimetyperTabel.module.css'
import { Plus, Edit2, Trash2, Check, X, GripVertical } from 'lucide-react'
import PopUpMenu from '../../components/basicComponents/PopUpMenu.jsx'

const TimetyperTabel = ({ user }) => {
    const [timetyper, setTimetyper] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [isAddingNew, setIsAddingNew] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [draggedIndex, setDraggedIndex] = useState(null)
    const [dragOverIndex, setDragOverIndex] = useState(null)

    // State for ny timetype
    const [newTimetype, setNewTimetype] = useState({
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
        fetchTimetyper()
    }, [])

    const fetchTimetyper = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/timetyper/`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            setTimetyper(response.data)
        } catch (error) {
            console.error('Fejl ved hentning af timetyper:', error)
            setErrorMessage('Kunne ikke hente timetyper')
        } finally {
            setLoading(false)
        }
    }

    const handleAddNew = () => {
        setIsAddingNew(true)
        setEditingId(null)
        setNewTimetype({
            navn: '',
            nummer: '',
            farve: '#3b82f6',
            listepris: '',
            kostpris: '',
            beskrivelse: '',
            aktiv: true,
            rækkefølge: timetyper.length
        })
    }

    const handleCancelAdd = () => {
        setIsAddingNew(false)
        setNewTimetype({
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
        if (!newTimetype.navn || !newTimetype.nummer || newTimetype.listepris === '' || newTimetype.kostpris === '') {
            setErrorMessage('Udfyld venligst alle påkrævede felter')
            return
        }

        try {
            const payload = {
                ...newTimetype,
                nummer: Number(newTimetype.nummer),
                listepris: Number(newTimetype.listepris),
                kostpris: Number(newTimetype.kostpris),
                rækkefølge: Number(newTimetype.rækkefølge) || 0
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/timetyper/`, payload, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            
            setIsAddingNew(false)
            setErrorMessage('')
            fetchTimetyper()
        } catch (error) {
            console.error('Fejl ved oprettelse af timetype:', error)
            setErrorMessage(error.response?.data?.error || 'Kunne ikke oprette timetype')
        }
    }

    const handleEdit = (timetype) => {
        setEditingId(timetype._id)
        setIsAddingNew(false)
        setEditData({
            navn: timetype.navn,
            nummer: timetype.nummer,
            farve: timetype.farve || '#3b82f6',
            listepris: timetype.listepris,
            kostpris: timetype.kostpris,
            beskrivelse: timetype.beskrivelse || '',
            aktiv: timetype.aktiv !== undefined ? timetype.aktiv : true,
            rækkefølge: timetype.rækkefølge || 0
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

            await axios.patch(`${import.meta.env.VITE_API_URL}/timetyper/${id}`, payload, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            
            setEditingId(null)
            setEditData({})
            setErrorMessage('')
            fetchTimetyper()
        } catch (error) {
            console.error('Fejl ved opdatering af timetype:', error)
            setErrorMessage(error.response?.data?.error || 'Kunne ikke opdatere timetype')
        }
    }

    const handleDelete = async (id, navn) => {
        if (!window.confirm(`Er du sikker på, at du vil slette timetypen "${navn}"?`)) {
            return
        }

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/timetyper/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            fetchTimetyper()
        } catch (error) {
            console.error('Fejl ved sletning af timetype:', error)
            setErrorMessage('Kunne ikke slette timetype')
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

        const newTimetyper = [...timetyper]
        const draggedItem = newTimetyper[draggedIndex]
        
        // Fjern det trækkede element
        newTimetyper.splice(draggedIndex, 1)
        
        // Indsæt det trækkede element på den nye position
        newTimetyper.splice(dropIndex, 0, draggedItem)
        
        // Opdater rækkefølge for alle elementer
        const updatedTimetyper = newTimetyper.map((item, index) => ({
            ...item,
            rækkefølge: index
        }))

        // Opdater lokalt først for bedre UX
        setTimetyper(updatedTimetyper)
        setDraggedIndex(null)
        setDragOverIndex(null)

        // Opdater rækkefølge i databasen
        try {
            const updatePromises = updatedTimetyper.map((timetype, index) => 
                axios.patch(
                    `${import.meta.env.VITE_API_URL}/timetyper/${timetype._id}`,
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
            fetchTimetyper()
        }
    }

    if (loading) {
        return <div className={Styles.loading}>Henter timetyper...</div>
    }

    return (
        <div className={Styles.tabelContainer}>
            {errorMessage && (
                <div className={Styles.errorMessage}>{errorMessage}</div>
            )}

            {!isAddingNew && (
                <button onClick={handleAddNew} className={Styles.addButton}>
                    <Plus size={18} />
                    Tilføj ny timetype
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
                                        value={newTimetype.nummer}
                                        onChange={(e) => setNewTimetype({ ...newTimetype, nummer: e.target.value })}
                                        placeholder="Nummer"
                                        className={Styles.input}
                                        min="1"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={newTimetype.navn}
                                        onChange={(e) => setNewTimetype({ ...newTimetype, navn: e.target.value })}
                                        placeholder="Navn"
                                        className={Styles.input}
                                    />
                                </td>
                                <td>
                                    <div className={Styles.farveContainer}>
                                        <input
                                            type="color"
                                            value={newTimetype.farve}
                                            onChange={(e) => setNewTimetype({ ...newTimetype, farve: e.target.value })}
                                            className={Styles.colorInput}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={newTimetype.listepris}
                                        onChange={(e) => setNewTimetype({ ...newTimetype, listepris: e.target.value })}
                                        placeholder="0"
                                        className={Styles.input}
                                        min="0"
                                        step="0.01"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={newTimetype.kostpris}
                                        onChange={(e) => setNewTimetype({ ...newTimetype, kostpris: e.target.value })}
                                        placeholder="0"
                                        className={Styles.input}
                                        min="0"
                                        step="0.01"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={newTimetype.beskrivelse}
                                        onChange={(e) => setNewTimetype({ ...newTimetype, beskrivelse: e.target.value })}
                                        placeholder="Beskrivelse"
                                        className={Styles.input}
                                    />
                                </td>
                                <td>
                                    <label className={Styles.switchLabel}>
                                        <input
                                            type="checkbox"
                                            className={Styles.switchInput}
                                            checked={newTimetype.aktiv}
                                            onChange={(e) => setNewTimetype({ ...newTimetype, aktiv: e.target.checked })}
                                        />
                                        <div className={`${Styles.switch} ${newTimetype.aktiv ? Styles.switchActive : ''}`}>
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

                        {/* Eksisterende timetyper */}
                        {timetyper.map((timetype, index) => (
                            <tr 
                                key={timetype._id} 
                                className={`${editingId === timetype._id ? Styles.editingRow : ''} ${draggedIndex === index ? Styles.dragging : ''} ${dragOverIndex === index ? Styles.dragOver : ''}`}
                                draggable={editingId !== timetype._id}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                            >
                                {editingId === timetype._id ? (
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
                                                    onClick={() => handleSaveEdit(timetype._id)}
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
                                        <td>{timetype.nummer}</td>
                                        <td>{timetype.navn}</td>
                                        <td>
                                            <div className={Styles.farveContainer}>
                                                <span 
                                                    className={Styles.farvePreview} 
                                                    style={{ backgroundColor: timetype.farve || '#3b82f6' }}
                                                    title={timetype.farve || '#3b82f6'}
                                                ></span>
                                            </div>
                                        </td>
                                        <td>{timetype.listepris?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr</td>
                                        <td>{timetype.kostpris?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr</td>
                                        <td className={Styles.beskrivelseCell}>{timetype.beskrivelse || '-'}</td>
                                        <td>
                                            <span className={timetype.aktiv !== false ? Styles.aktivBadge : Styles.inaktivBadge}>
                                                {timetype.aktiv !== false ? 'Aktiv' : 'Inaktiv'}
                                            </span>
                                        </td>
                                        <td className={Styles.actionCell}>
                                            <PopUpMenu
                                                actions={[
                                                    {
                                                        icon: <Edit2 size={16} />,
                                                        label: 'Rediger',
                                                        onClick: () => handleEdit(timetype)
                                                    },
                                                    {
                                                        icon: <Trash2 size={16} />,
                                                        label: 'Slet',
                                                        onClick: () => handleDelete(timetype._id, timetype.navn)
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
                            <h3>Tilføj ny timetype</h3>
                        </div>
                        <div className={Styles.mobileCardContent}>
                            <div className={Styles.mobileField}>
                                <label>Nummer</label>
                                <input
                                    type="number"
                                    value={newTimetype.nummer}
                                    onChange={(e) => setNewTimetype({ ...newTimetype, nummer: e.target.value })}
                                    placeholder="Nummer"
                                    className={Styles.mobileInput}
                                    min="1"
                                />
                            </div>
                            <div className={Styles.mobileField}>
                                <label>Navn</label>
                                <input
                                    type="text"
                                    value={newTimetype.navn}
                                    onChange={(e) => setNewTimetype({ ...newTimetype, navn: e.target.value })}
                                    placeholder="Navn"
                                    className={Styles.mobileInput}
                                />
                            </div>
                            <div className={Styles.mobileField}>
                                <label>Farve</label>
                                <div className={Styles.mobileColorInputWrapper}>
                                    <input
                                        type="color"
                                        value={newTimetype.farve}
                                        onChange={(e) => setNewTimetype({ ...newTimetype, farve: e.target.value })}
                                        className={Styles.mobileColorInput}
                                    />
                                    <span className={Styles.mobileColorPreview} style={{ backgroundColor: newTimetype.farve }}></span>
                                </div>
                            </div>
                            <div className={Styles.mobileFieldRow}>
                                <div className={Styles.mobileField}>
                                    <label>Listepris</label>
                                    <input
                                        type="number"
                                        value={newTimetype.listepris}
                                        onChange={(e) => setNewTimetype({ ...newTimetype, listepris: e.target.value })}
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
                                        value={newTimetype.kostpris}
                                        onChange={(e) => setNewTimetype({ ...newTimetype, kostpris: e.target.value })}
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
                                    value={newTimetype.beskrivelse}
                                    onChange={(e) => setNewTimetype({ ...newTimetype, beskrivelse: e.target.value })}
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
                                        checked={newTimetype.aktiv}
                                        onChange={(e) => setNewTimetype({ ...newTimetype, aktiv: e.target.checked })}
                                    />
                                    <div className={`${Styles.switch} ${newTimetype.aktiv ? Styles.switchActive : ''}`}>
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
                {timetyper.map((timetype, index) => (
                    <div
                        key={timetype._id}
                        className={`${Styles.mobileCard} ${editingId === timetype._id ? Styles.editingCard : ''} ${draggedIndex === index ? Styles.draggingCard : ''} ${dragOverIndex === index ? Styles.dragOverCard : ''}`}
                        draggable={editingId !== timetype._id}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        {editingId === timetype._id ? (
                            <>
                                <div className={Styles.mobileCardHeader}>
                                    <h3>Rediger timetype</h3>
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
                                            onClick={() => handleSaveEdit(timetype._id)}
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
                                            <span className={Styles.mobileCardName}>{timetype.navn}</span>
                                            <span className={Styles.mobileCardNumber}>#{timetype.nummer}</span>
                                        </div>
                                    </div>
                                    <div className={Styles.mobileCardHeaderRight}>
                                        <span 
                                            className={Styles.mobileColorBadge} 
                                            style={{ backgroundColor: timetype.farve || '#3b82f6' }}
                                        ></span>
                                        <PopUpMenu
                                            actions={[
                                                {
                                                    icon: <Edit2 size={16} />,
                                                    label: 'Rediger',
                                                    onClick: () => handleEdit(timetype)
                                                },
                                                {
                                                    icon: <Trash2 size={16} />,
                                                    label: 'Slet',
                                                    onClick: () => handleDelete(timetype._id, timetype.navn)
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
                                                {timetype.listepris?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                                            </span>
                                        </div>
                                        <div className={Styles.mobileCardItem}>
                                            <span className={Styles.mobileCardLabel}>Kostpris</span>
                                            <span className={Styles.mobileCardValue}>
                                                {timetype.kostpris?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                                            </span>
                                        </div>
                                    </div>
                                    {timetype.beskrivelse && (
                                        <div className={Styles.mobileCardItem}>
                                            <span className={Styles.mobileCardLabel}>Beskrivelse</span>
                                            <span className={Styles.mobileCardValue}>{timetype.beskrivelse}</span>
                                        </div>
                                    )}
                                    <div className={Styles.mobileCardItem}>
                                        <span className={timetype.aktiv !== false ? Styles.mobileAktivBadge : Styles.mobileInaktivBadge}>
                                            {timetype.aktiv !== false ? 'Aktiv' : 'Inaktiv'}
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

export default TimetyperTabel

