import React, { useState, useCallback } from 'react'
import Modal from '../Modal.jsx'
import { storage } from '../../firebase.js'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '../../utils/cropImage.js'
import imageCompression from 'browser-image-compression'
import axios from 'axios'
import Styles from './ProfilePictureModal.module.css'
import { Camera, X, Check } from 'lucide-react'

const ProfilePictureModal = ({ trigger, setTrigger, user, bruger, refetchBruger, setRefetchBruger }) => {
    const [imageSrc, setImageSrc] = useState(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [step, setStep] = useState('upload') // 'upload' or 'crop'

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Vælg venligst et billede')
            return
        }

        // Compress image before cropping
        try {
            const compressedFile = await imageCompression(file, {
                maxSizeMB: 2,
                maxWidthOrHeight: 2000,
                useWebWorker: true,
            })

            const reader = new FileReader()
            reader.onload = () => {
                setImageSrc(reader.result)
                setStep('crop')
            }
            reader.readAsDataURL(compressedFile)
        } catch (error) {
            console.error('Fejl ved komprimering:', error)
            const reader = new FileReader()
            reader.onload = () => {
                setImageSrc(reader.result)
                setStep('crop')
            }
            reader.readAsDataURL(file)
        }
    }

    const handleCrop = async () => {
        if (!imageSrc || !croppedAreaPixels) return

        setIsUploading(true)
        try {
            // Get cropped image
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)

            // Convert blob to file
            const file = new File([croppedImage], `profilbillede_${bruger._id || bruger.id}.jpg`, {
                type: 'image/jpeg',
            })

            // Compress the cropped image
            const compressedFile = await imageCompression(file, {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 500,
                useWebWorker: true,
            })

            // Upload to Firebase Storage
            const storagePath = `profilbilleder/${bruger._id || bruger.id}.jpg`
            const storageRef = ref(storage, storagePath)

            // Delete old image if it exists (using the same path format)
            if (bruger.profilbillede) {
                try {
                    const oldImageRef = ref(storage, storagePath)
                    await deleteObject(oldImageRef)
                } catch (error) {
                    console.log('Kunne ikke slette gammelt billede:', error)
                }
            }

            // Upload new image
            await uploadBytes(storageRef, compressedFile)
            const downloadURL = await getDownloadURL(storageRef)

            // Update user in database
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/brugere/${bruger._id || bruger.id}`,
                { profilbillede: downloadURL },
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }
            )

            // Refresh user data
            setRefetchBruger((prev) => !prev)
            setTrigger(false)
            resetModal()
        } catch (error) {
            console.error('Fejl ved upload:', error)
            alert('Der opstod en fejl ved upload af billedet. Prøv igen.')
        } finally {
            setIsUploading(false)
        }
    }

    const resetModal = () => {
        setImageSrc(null)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setCroppedAreaPixels(null)
        setStep('upload')
    }

    const handleClose = () => {
        resetModal()
        setTrigger(false)
    }

    return (
        <Modal trigger={trigger} setTrigger={handleClose}>
            <div className={Styles.modalContent}>
                <h2 className={Styles.modalHeading}>Opdater profilbillede</h2>

                {step === 'upload' && (
                    <div className={Styles.uploadStep}>
                        {bruger.profilbillede ? (
                            <>
                                <div className={Styles.currentImageContainer}>
                                    <img 
                                        src={bruger.profilbillede} 
                                        alt="Nuværende profilbillede" 
                                        className={Styles.currentImage}
                                    />
                                </div>
                                <div className={Styles.buttonContainer}>
                                    <button
                                        className={Styles.replaceButton}
                                        onClick={() => {
                                            const fileInput = document.getElementById('file-upload')
                                            fileInput?.click()
                                        }}
                                    >
                                        <Camera size={20} />
                                        Udskift
                                    </button>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                        className={Styles.removeButton}
                                        onClick={async () => {
                                            if (
                                                !confirm('Er du sikker på, at du vil fjerne dit profilbillede?')
                                            ) {
                                                return
                                            }

                                            try {
                                                // Delete from Firebase Storage (using consistent path format)
                                                const storagePath = `profilbilleder/${bruger._id || bruger.id}.jpg`
                                                const imageRef = ref(storage, storagePath)
                                                await deleteObject(imageRef)

                                                // Update user in database
                                                await axios.patch(
                                                    `${import.meta.env.VITE_API_URL}/brugere/${bruger._id || bruger.id}`,
                                                    { profilbillede: null },
                                                    {
                                                        headers: {
                                                            'Authorization': `Bearer ${user.token}`,
                                                        },
                                                    }
                                                )

                                                setRefetchBruger((prev) => !prev)
                                                setTrigger(false)
                                            } catch (error) {
                                                console.error('Fejl ved sletning:', error)
                                                alert('Der opstod en fejl ved sletning af billedet.')
                                            }
                                        }}
                                    >
                                        <X size={20} />
                                        Fjern
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className={Styles.uploadArea}>
                                <label htmlFor="file-upload" className={Styles.uploadLabel}>
                                    <Camera size={48} />
                                    <span>Vælg et billede</span>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                )}

                {step === 'crop' && imageSrc && (
                    <div className={Styles.cropStep}>
                        <div className={Styles.cropContainer}>
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                cropShape="round"
                            />
                        </div>
                        <div className={Styles.cropControls}>
                            <label className={Styles.zoomLabel}>
                                Zoom
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className={Styles.zoomSlider}
                                />
                            </label>
                            <div className={Styles.cropButtons}>
                                <button
                                    className={Styles.cancelButton}
                                    onClick={() => {
                                        resetModal()
                                    }}
                                    disabled={isUploading}
                                >
                                    Annuller
                                </button>
                                <button
                                    className={Styles.saveButton}
                                    onClick={handleCrop}
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'Uploader...' : (
                                        <>
                                            <Check size={20} />
                                            Gem billede
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default ProfilePictureModal

