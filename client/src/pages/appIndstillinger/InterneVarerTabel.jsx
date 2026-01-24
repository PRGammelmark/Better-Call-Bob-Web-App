import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Styles from './InterneVarerTabel.module.css'
import { Plus, Edit2, Trash2, Check, X, GripVertical, Image, Upload } from 'lucide-react'
import PopUpMenu from '../../components/basicComponents/PopUpMenu.jsx'
import { storage } from '../../firebase.js'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import imageCompression from 'browser-image-compression'

const InterneVarerTabel = ({ user }) => {
    const [varer, setVarer] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [isAddingNew, setIsAddingNew] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [draggedIndex, setDraggedIndex] = useState(null)
    const [dragOverIndex, setDragOverIndex] = useState(null)
    const [uploadingImage, setUploadingImage] = useState(null) // Track which item is uploading
    const fileInputRef = useRef(null)
    const editFileInputRef = useRef(null)

    // State for ny vare
    const [newVare, setNewVare] = useState({
        navn: '',
        varenummer: '',
        billedeURL: '',
        listepris: '',
        kostpris: '',
        beskrivelse: '',
        aktiv: true,
        rækkefølge: 0
    })

    // State for redigering
    const [editData, setEditData] = useState({})

    useEffect(() => {
        fetchVarer()
    }, [])

    const fetchVarer = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/varer/`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            setVarer(response.data)
        } catch (error) {
            console.error('Fejl ved hentning af varer:', error)
            setErrorMessage('Kunne ikke hente varer')
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (file, isEdit = false) => {
        if (!file) return null
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setErrorMessage('Vælg venligst et billede')
            return null
        }

        try {
            // Compress the image
            const compressedFile = await imageCompression(file, {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 500,
                useWebWorker: true,
            })

            // Generate unique filename
            const filename = `varer/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
            const storageRef = ref(storage, filename)

            // Upload to Firebase Storage
            await uploadBytes(storageRef, compressedFile)
            const downloadURL = await getDownloadURL(storageRef)

            return downloadURL
        } catch (error) {
            console.error('Fejl ved upload af billede:', error)
            setErrorMessage('Kunne ikke uploade billede')
            return null
        }
    }

    const handleNewImageSelect = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingImage('new')
        const url = await handleImageUpload(file)
        if (url) {
            setNewVare({ ...newVare, billedeURL: url })
        }
        setUploadingImage(null)
    }

    const handleEditImageSelect = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingImage(editingId)
        const url = await handleImageUpload(file, true)
        if (url) {
            setEditData({ ...editData, billedeURL: url })
        }
        setUploadingImage(null)
    }

    const handleAddNew = () => {
        setIsAddingNew(true)
        setEditingId(null)
        setNewVare({
            navn: '',
            varenummer: '',
            billedeURL: '',
            listepris: '',
            kostpris: '',
            beskrivelse: '',
            aktiv: true,
            rækkefølge: varer.length
        })
    }

    const handleCancelAdd = () => {
        setIsAddingNew(false)
        setNewVare({
            navn: '',
            varenummer: '',
            billedeURL: '',
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
        if (!newVare.navn || !newVare.varenummer || newVare.listepris === '' || newVare.kostpris === '') {
            setErrorMessage('Udfyld venligst alle påkrævede felter')
            return
        }

        try {
            const payload = {
                ...newVare,
                varenummer: String(newVare.varenummer),
                listepris: Number(newVare.listepris),
                kostpris: Number(newVare.kostpris),
                rækkefølge: Number(newVare.rækkefølge) || 0
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/varer/`, payload, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            
            setIsAddingNew(false)
            setErrorMessage('')
            fetchVarer()
        } catch (error) {
            console.error('Fejl ved oprettelse af vare:', error)
            setErrorMessage(error.response?.data?.error || 'Kunne ikke oprette vare')
        }
    }

    const handleEdit = (vare) => {
        setEditingId(vare._id)
        setIsAddingNew(false)
        setEditData({
            navn: vare.navn || '',
            varenummer: vare.varenummer || '',
            billedeURL: vare.billedeURL || '',
            listepris: vare.listepris,
            kostpris: vare.kostpris,
            beskrivelse: vare.beskrivelse || '',
            aktiv: vare.aktiv !== undefined ? vare.aktiv : true,
            rækkefølge: vare.rækkefølge || 0
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
        if (!editData.navn || !editData.varenummer || editData.listepris === '' || editData.kostpris === '') {
            setErrorMessage('Udfyld venligst alle påkrævede felter')
            return
        }

        try {
            const payload = {
                ...editData,
                varenummer: String(editData.varenummer),
                listepris: Number(editData.listepris),
                kostpris: Number(editData.kostpris),
                rækkefølge: Number(editData.rækkefølge) || 0
            }

            await axios.patch(`${import.meta.env.VITE_API_URL}/varer/${id}`, payload, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            
            setEditingId(null)
            setEditData({})
            setErrorMessage('')
            fetchVarer()
        } catch (error) {
            console.error('Fejl ved opdatering af vare:', error)
            setErrorMessage(error.response?.data?.error || 'Kunne ikke opdatere vare')
        }
    }

    const handleDelete = async (id, navn) => {
        if (!window.confirm(`Er du sikker på, at du vil slette varen "${navn}"?`)) {
            return
        }

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/varer/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            fetchVarer()
        } catch (error) {
            console.error('Fejl ved sletning af vare:', error)
            setErrorMessage('Kunne ikke slette vare')
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

        const newVarer = [...varer]
        const draggedItem = newVarer[draggedIndex]
        
        // Fjern det trækkede element
        newVarer.splice(draggedIndex, 1)
        
        // Indsæt det trækkede element på den nye position
        newVarer.splice(dropIndex, 0, draggedItem)
        
        // Opdater rækkefølge for alle elementer
        const updatedVarer = newVarer.map((item, index) => ({
            ...item,
            rækkefølge: index
        }))

        // Opdater lokalt først for bedre UX
        setVarer(updatedVarer)
        setDraggedIndex(null)
        setDragOverIndex(null)

        // Opdater rækkefølge i databasen
        try {
            const updatePromises = updatedVarer.map((vare, index) => 
                axios.patch(
                    `${import.meta.env.VITE_API_URL}/varer/${vare._id}`,
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
            fetchVarer()
        }
    }

    if (loading) {
        return <div className={Styles.loading}>Henter varer...</div>
    }

    return (
        <div className={Styles.tabelContainer}>
            {errorMessage && (
                <div className={Styles.errorMessage}>{errorMessage}</div>
            )}

            {!isAddingNew && (
                <button onClick={handleAddNew} className={Styles.addButton}>
                    <Plus size={18} />
                    Tilføj ny vare
                </button>
            )}

            {/* Hidden file inputs */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleNewImageSelect}
                accept="image/*"
                style={{ display: 'none' }}
            />
            <input
                type="file"
                ref={editFileInputRef}
                onChange={handleEditImageSelect}
                accept="image/*"
                style={{ display: 'none' }}
            />

            {/* Desktop Table View */}
            <div className={`${Styles.tabelWrapper} ${Styles.desktopView}`}>
                <table className={Styles.tabel}>
                    <thead>
                        <tr>
                            <th className={Styles.dragHandleColumn}></th>
                            <th>Varenummer</th>
                            <th>Navn</th>
                            <th>Billede</th>
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
                                        type="text"
                                        value={newVare.varenummer}
                                        onChange={(e) => setNewVare({ ...newVare, varenummer: e.target.value })}
                                        placeholder="Varenummer"
                                        className={Styles.input}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={newVare.navn}
                                        onChange={(e) => setNewVare({ ...newVare, navn: e.target.value })}
                                        placeholder="Navn"
                                        className={Styles.input}
                                    />
                                </td>
                                <td>
                                    <div className={Styles.billedeContainer}>
                                        {newVare.billedeURL ? (
                                            <div className={Styles.billedePreviewWrapper}>
                                                <img 
                                                    src={newVare.billedeURL} 
                                                    alt="Preview" 
                                                    className={Styles.billedePreview}
                                                />
                                                <button 
                                                    className={Styles.removeBilledeButton}
                                                    onClick={() => setNewVare({ ...newVare, billedeURL: '' })}
                                                    title="Fjern billede"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                className={Styles.uploadButton}
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadingImage === 'new'}
                                            >
                                                {uploadingImage === 'new' ? (
                                                    <span className={Styles.uploadingSpinner}></span>
                                                ) : (
                                                    <Upload size={16} />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={newVare.listepris}
                                        onChange={(e) => setNewVare({ ...newVare, listepris: e.target.value })}
                                        placeholder="0"
                                        className={Styles.input}
                                        min="0"
                                        step="0.01"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={newVare.kostpris}
                                        onChange={(e) => setNewVare({ ...newVare, kostpris: e.target.value })}
                                        placeholder="0"
                                        className={Styles.input}
                                        min="0"
                                        step="0.01"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={newVare.beskrivelse}
                                        onChange={(e) => setNewVare({ ...newVare, beskrivelse: e.target.value })}
                                        placeholder="Beskrivelse"
                                        className={Styles.input}
                                    />
                                </td>
                                <td>
                                    <label className={Styles.switchLabel}>
                                        <input
                                            type="checkbox"
                                            className={Styles.switchInput}
                                            checked={newVare.aktiv}
                                            onChange={(e) => setNewVare({ ...newVare, aktiv: e.target.checked })}
                                        />
                                        <div className={`${Styles.switch} ${newVare.aktiv ? Styles.switchActive : ''}`}>
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

                        {/* Eksisterende varer */}
                        {varer.map((vare, index) => (
                            <tr 
                                key={vare._id} 
                                className={`${editingId === vare._id ? Styles.editingRow : ''} ${draggedIndex === index ? Styles.dragging : ''} ${dragOverIndex === index ? Styles.dragOver : ''}`}
                                draggable={editingId !== vare._id}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                            >
                                {editingId === vare._id ? (
                                    <>
                                        <td className={Styles.dragHandleColumn}></td>
                                        <td>
                                            <input
                                                type="text"
                                                value={editData.varenummer}
                                                onChange={(e) => setEditData({ ...editData, varenummer: e.target.value })}
                                                className={Styles.input}
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
                                            <div className={Styles.billedeContainer}>
                                                {editData.billedeURL ? (
                                                    <div className={Styles.billedePreviewWrapper}>
                                                        <img 
                                                            src={editData.billedeURL} 
                                                            alt="Preview" 
                                                            className={Styles.billedePreview}
                                                        />
                                                        <button 
                                                            className={Styles.removeBilledeButton}
                                                            onClick={() => setEditData({ ...editData, billedeURL: '' })}
                                                            title="Fjern billede"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        className={Styles.uploadButton}
                                                        onClick={() => editFileInputRef.current?.click()}
                                                        disabled={uploadingImage === editingId}
                                                    >
                                                        {uploadingImage === editingId ? (
                                                            <span className={Styles.uploadingSpinner}></span>
                                                        ) : (
                                                            <Upload size={16} />
                                                        )}
                                                    </button>
                                                )}
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
                                                    onClick={() => handleSaveEdit(vare._id)}
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
                                        <td>{vare.varenummer || '-'}</td>
                                        <td>{vare.navn || vare.beskrivelse}</td>
                                        <td>
                                            <div className={Styles.billedeContainer}>
                                                {vare.billedeURL ? (
                                                    <img 
                                                        src={vare.billedeURL} 
                                                        alt={vare.navn || vare.beskrivelse} 
                                                        className={Styles.billedePreview}
                                                    />
                                                ) : (
                                                    <div className={Styles.noBillede}>
                                                        <Image size={18} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>{vare.listepris?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr</td>
                                        <td>{vare.kostpris?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr</td>
                                        <td className={Styles.beskrivelseCell}>{vare.beskrivelse || '-'}</td>
                                        <td>
                                            <span className={vare.aktiv !== false ? Styles.aktivBadge : Styles.inaktivBadge}>
                                                {vare.aktiv !== false ? 'Aktiv' : 'Inaktiv'}
                                            </span>
                                        </td>
                                        <td className={Styles.actionCell}>
                                            <PopUpMenu
                                                actions={[
                                                    {
                                                        icon: <Edit2 size={16} />,
                                                        label: 'Rediger',
                                                        onClick: () => handleEdit(vare)
                                                    },
                                                    {
                                                        icon: <Trash2 size={16} />,
                                                        label: 'Slet',
                                                        onClick: () => handleDelete(vare._id, vare.navn || vare.beskrivelse)
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
                            <h3>Tilføj ny vare</h3>
                        </div>
                        <div className={Styles.mobileCardContent}>
                            <div className={Styles.mobileField}>
                                <label>Varenummer</label>
                                <input
                                    type="text"
                                    value={newVare.varenummer}
                                    onChange={(e) => setNewVare({ ...newVare, varenummer: e.target.value })}
                                    placeholder="Varenummer"
                                    className={Styles.mobileInput}
                                />
                            </div>
                            <div className={Styles.mobileField}>
                                <label>Navn</label>
                                <input
                                    type="text"
                                    value={newVare.navn}
                                    onChange={(e) => setNewVare({ ...newVare, navn: e.target.value })}
                                    placeholder="Navn"
                                    className={Styles.mobileInput}
                                />
                            </div>
                            <div className={Styles.mobileField}>
                                <label>Billede</label>
                                <div className={Styles.mobileBilledeUpload}>
                                    {newVare.billedeURL ? (
                                        <div className={Styles.mobileBilledePreviewWrapper}>
                                            <img 
                                                src={newVare.billedeURL} 
                                                alt="Preview" 
                                                className={Styles.mobileBilledePreview}
                                            />
                                            <button 
                                                className={Styles.mobileRemoveBilledeButton}
                                                onClick={() => setNewVare({ ...newVare, billedeURL: '' })}
                                            >
                                                <X size={16} />
                                                Fjern
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            className={Styles.mobileUploadButton}
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage === 'new'}
                                        >
                                            {uploadingImage === 'new' ? (
                                                <>
                                                    <span className={Styles.uploadingSpinner}></span>
                                                    Uploader...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={18} />
                                                    Upload billede
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className={Styles.mobileFieldRow}>
                                <div className={Styles.mobileField}>
                                    <label>Listepris</label>
                                    <input
                                        type="number"
                                        value={newVare.listepris}
                                        onChange={(e) => setNewVare({ ...newVare, listepris: e.target.value })}
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
                                        value={newVare.kostpris}
                                        onChange={(e) => setNewVare({ ...newVare, kostpris: e.target.value })}
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
                                    value={newVare.beskrivelse}
                                    onChange={(e) => setNewVare({ ...newVare, beskrivelse: e.target.value })}
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
                                        checked={newVare.aktiv}
                                        onChange={(e) => setNewVare({ ...newVare, aktiv: e.target.checked })}
                                    />
                                    <div className={`${Styles.switch} ${newVare.aktiv ? Styles.switchActive : ''}`}>
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
                {varer.map((vare, index) => (
                    <div
                        key={vare._id}
                        className={`${Styles.mobileCard} ${editingId === vare._id ? Styles.editingCard : ''} ${draggedIndex === index ? Styles.draggingCard : ''} ${dragOverIndex === index ? Styles.dragOverCard : ''}`}
                        draggable={editingId !== vare._id}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        {editingId === vare._id ? (
                            <>
                                <div className={Styles.mobileCardHeader}>
                                    <h3>Rediger vare</h3>
                                </div>
                                <div className={Styles.mobileCardContent}>
                                    <div className={Styles.mobileField}>
                                        <label>Varenummer</label>
                                        <input
                                            type="text"
                                            value={editData.varenummer}
                                            onChange={(e) => setEditData({ ...editData, varenummer: e.target.value })}
                                            className={Styles.mobileInput}
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
                                        <label>Billede</label>
                                        <div className={Styles.mobileBilledeUpload}>
                                            {editData.billedeURL ? (
                                                <div className={Styles.mobileBilledePreviewWrapper}>
                                                    <img 
                                                        src={editData.billedeURL} 
                                                        alt="Preview" 
                                                        className={Styles.mobileBilledePreview}
                                                    />
                                                    <button 
                                                        className={Styles.mobileRemoveBilledeButton}
                                                        onClick={() => setEditData({ ...editData, billedeURL: '' })}
                                                    >
                                                        <X size={16} />
                                                        Fjern
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    className={Styles.mobileUploadButton}
                                                    onClick={() => editFileInputRef.current?.click()}
                                                    disabled={uploadingImage === editingId}
                                                >
                                                    {uploadingImage === editingId ? (
                                                        <>
                                                            <span className={Styles.uploadingSpinner}></span>
                                                            Uploader...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload size={18} />
                                                            Upload billede
                                                        </>
                                                    )}
                                                </button>
                                            )}
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
                                            onClick={() => handleSaveEdit(vare._id)}
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
                                            <span className={Styles.mobileCardName}>{vare.navn || vare.beskrivelse}</span>
                                            <span className={Styles.mobileCardNumber}>#{vare.varenummer}</span>
                                        </div>
                                    </div>
                                    <div className={Styles.mobileCardHeaderRight}>
                                        {vare.billedeURL ? (
                                            <img 
                                                src={vare.billedeURL} 
                                                alt={vare.navn || vare.beskrivelse} 
                                                className={Styles.mobileBilledeBadge}
                                            />
                                        ) : (
                                            <div className={Styles.mobileNoBilledeBadge}>
                                                <Image size={16} />
                                            </div>
                                        )}
                                        <PopUpMenu
                                            actions={[
                                                {
                                                    icon: <Edit2 size={16} />,
                                                    label: 'Rediger',
                                                    onClick: () => handleEdit(vare)
                                                },
                                                {
                                                    icon: <Trash2 size={16} />,
                                                    label: 'Slet',
                                                    onClick: () => handleDelete(vare._id, vare.navn || vare.beskrivelse)
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
                                                {vare.listepris?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                                            </span>
                                        </div>
                                        <div className={Styles.mobileCardItem}>
                                            <span className={Styles.mobileCardLabel}>Kostpris</span>
                                            <span className={Styles.mobileCardValue}>
                                                {vare.kostpris?.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                                            </span>
                                        </div>
                                    </div>
                                    {vare.beskrivelse && (
                                        <div className={Styles.mobileCardItem}>
                                            <span className={Styles.mobileCardLabel}>Beskrivelse</span>
                                            <span className={Styles.mobileCardValue}>{vare.beskrivelse}</span>
                                        </div>
                                    )}
                                    <div className={Styles.mobileCardItem}>
                                        <span className={vare.aktiv !== false ? Styles.mobileAktivBadge : Styles.mobileInaktivBadge}>
                                            {vare.aktiv !== false ? 'Aktiv' : 'Inaktiv'}
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

export default InterneVarerTabel

