import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import StepsStyles from './Steps.module.css'
import Styles from './BeskrivOpgaven.module.css'
import { Trash2, Camera, FileText, Globe } from 'lucide-react'
import MoonLoader from "react-spinners/MoonLoader";
import imageCompression from 'browser-image-compression'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util';
import dayjs from 'dayjs'
import 'dayjs/locale/da'
import 'dayjs/locale/en'
import PDFIcon from '../../../assets/pdf-logo.svg'
import HenrikFoto from '../../../assets/HenrikFoto.webp'
import VisBilledeModal from '../../modals/VisBillede.jsx'
import AIFollowUpQuestionsPopup from './AIFollowUpQuestionsPopup'

// File structure: { file: File/Blob, preview: string (object URL), type: 'image' | 'video' }
const BeskrivOpgaven = ({ 
  opgaveBeskrivelse, 
  setOpgaveBeskrivelse, 
  opgaveBilleder, 
  setOpgaveBilleder, 
  wordCount = 0, 
  onNavigateNext, 
  isAnalyzing = false,
  aiQuestions = [],
  showQuestionsPopup = false,
  currentQuestionIndex = 0,
  onQuestionIndexChange,
  onCloseQuestions,
  onContinueQuestions
}) => {
    const { t, i18n } = useTranslation()
    const shouldPulse = wordCount < 5
    const [dragging, setDragging] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [currentIcon, setCurrentIcon] = useState(0) // 0 = Image, 1 = FileText
    const textareaRef = useRef(null)

    const [åbnBilledeIndex, setÅbnBilledeIndex] = useState(null)
    const previewUrlsRegeneratedRef = useRef(false)
    
    // Get the current medieItem from opgaveBilleder array based on index
    // This ensures we always use the current object reference from the array
    const currentMedieItem = åbnBilledeIndex !== null && opgaveBilleder[åbnBilledeIndex] 
        ? opgaveBilleder[åbnBilledeIndex] 
        : null

    // Opdater dayjs locale når sprog skifter
    useEffect(() => {
        dayjs.locale(i18n.language)
    }, [i18n.language])

    // Regenerer preview URLs når komponenten vises igen, hvis de mangler eller er ugyldige
    // Dette håndterer tilfældet hvor komponenten unmountes og remountes
    useEffect(() => {
        // Tjek om nogen items har file objekter men mangler preview URLs
        const itemsNeedingPreview = opgaveBilleder.filter(item => 
            item.file && (!item.preview || !item.preview.startsWith('blob:'))
        )

        // Kun regenerer hvis der er items der mangler preview, og vi ikke lige har regenereret
        if (itemsNeedingPreview.length > 0 && !previewUrlsRegeneratedRef.current) {
            const updatedBilleder = opgaveBilleder.map(item => {
                // Hvis item har file men mangler preview eller preview ikke er blob URL, regenerer den
                if (item.file && (!item.preview || !item.preview.startsWith('blob:'))) {
                    // Revoke gammel URL hvis den eksisterer og er blob
                    if (item.preview && item.preview.startsWith('blob:')) {
                        try {
                            URL.revokeObjectURL(item.preview)
                        } catch (e) {
                            // Ignorer fejl hvis URL allerede er revoked
                        }
                    }
                    // Opret ny preview URL fra file objektet
                    const newPreview = URL.createObjectURL(item.file)
                    return {
                        ...item,
                        preview: newPreview
                    }
                }
                return item
            })
            setOpgaveBilleder(updatedBilleder)
            previewUrlsRegeneratedRef.current = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opgaveBilleder.length]) // Kør når antal billeder ændres eller komponenten vises igen

    // Reset flag når komponenten unmountes, så URLs kan regenereres næste gang
    useEffect(() => {
        return () => {
            previewUrlsRegeneratedRef.current = false
        }
    }, [])

    // Roter mellem ikoner
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIcon(prev => (prev === 0 ? 1 : 0))
        }, 4000) // Skift hver 4. sekund
        return () => clearInterval(interval)
    }, [])

    // Håndter sprogskifte
    const handleLanguageChange = () => {
        const newLang = i18n.language === 'da' ? 'en' : 'da'
        i18n.changeLanguage(newLang)
    }

    // Fjern cleanup ved unmount - URLs skal bevares i state så længe filerne er der
    // Cleanup sker kun når filer faktisk slettes (i handleDeleteFile)
    // Den oprindelige cleanup-effekt forårsagede problemet ved at revoke URLs der stadig var i brug

    const handleDeleteFile = (index) => {
        const item = opgaveBilleder[index];
        // Revoke object URL to free memory
        if (item.preview && item.preview.startsWith('blob:')) {
            URL.revokeObjectURL(item.preview);
        }
        setOpgaveBilleder(opgaveBilleder.filter((_, i) => i !== index))
    }

    const handleFileDrop = (e) => {
        e.preventDefault()
        setDragging(false)
        const files = e.dataTransfer.files
        handleFileChange({ target: { files } })
    }
    
    const handleFileChange = async (e) => {        
        const selectedFiles = e.target.files;
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
        const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime', 'video/hevc'];
        const allowedPDFTypes = ['application/pdf'];

        const validFiles = Array.from(selectedFiles).filter(file => 
            allowedImageTypes.includes(file.type) || allowedVideoTypes.includes(file.type) || allowedPDFTypes.includes(file.type)
        );

        if(opgaveBilleder.length + validFiles.length > 5){
            window.alert(t('beskrivOpgaven.max5Filer'))
            return
        }
        
        if (validFiles.length > 0) {
            setIsProcessing(true);
            
            try {
                // Separate image, video, and PDF files
                const imageFiles = validFiles.filter(file => allowedImageTypes.includes(file.type));
                const videoFiles = validFiles.filter(file => allowedVideoTypes.includes(file.type));
                const pdfFiles = validFiles.filter(file => allowedPDFTypes.includes(file.type));
                
                const processedFiles = [];
                
                // Compress and process image files
                if(imageFiles.length > 0) {
                    for (let file of imageFiles) {
                        try {
                            const compressedFile = await imageCompression(file, {
                                maxSizeMB: 1,
                                maxWidthOrHeight: 1000,
                                useWebWorker: true,
                            });
                            const preview = URL.createObjectURL(compressedFile);
                            processedFiles.push({
                                file: compressedFile,
                                preview: preview,
                                type: 'image'
                            });
                        } catch (error) {
                            console.error("Image compression failed", error);
                            // Fallback to original file if compression fails
                            const preview = URL.createObjectURL(file);
                            processedFiles.push({
                                file: file,
                                preview: preview,
                                type: 'image'
                            });
                        }
                    }
                }

                // Compress and process video files
                if (videoFiles.length > 0) {
                    // Helper function to add timeout to FFmpeg load
                    const loadFFmpegWithTimeout = (ffmpeg, timeoutMs = 10000) => {
                        return Promise.race([
                            ffmpeg.load(),
                            new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('FFmpeg load timeout')), timeoutMs)
                            )
                        ]);
                    };

                    let ffmpegLoaded = false;
                    let ffmpegInstance = null;

                    try {
                        ffmpegInstance = new FFmpeg({ log: false });
                        console.log('Loading FFmpeg...');
                        await loadFFmpegWithTimeout(ffmpegInstance, 10000); // 10 second timeout
                        ffmpegLoaded = true;
                        console.log('FFmpeg loaded successfully');
                    } catch (loadError) {
                        console.warn("FFmpeg load failed or timed out, using original files:", loadError);
                        ffmpegLoaded = false;
                    }

                    if (ffmpegLoaded && ffmpegInstance) {
                        // Try to compress videos
                        for (let file of videoFiles) {
                            try {
                                console.log(`Processing video file: ${file.name}`);
                                const fileName = file.name;
                                const videoData = await fetchFile(file);
                                await ffmpegInstance.writeFile(fileName, videoData);

                                const outputFileName = fileName.replace(/\.[^/.]+$/, '') + '_compressed_video.mp4';
                                
                                console.log(`Compressing video: ${fileName} -> ${outputFileName}`);
                                
                                // Add timeout to compression as well
                                const compressionPromise = ffmpegInstance.exec([
                                    '-i', fileName,
                                    '-vcodec', 'libx264', 
                                    '-crf', '30', 
                                    '-b:v', '1000k', 
                                    '-preset', 'ultrafast', 
                                    '-acodec', 'copy',
                                    outputFileName
                                ]);
                                
                                await Promise.race([
                                    compressionPromise,
                                    new Promise((_, reject) => 
                                        setTimeout(() => reject(new Error('Video compression timeout')), 30000)
                                    )
                                ]);

                                const compressedVideo = await ffmpegInstance.readFile(outputFileName);
                                const compressedFile = new Blob([compressedVideo.buffer], { type: 'video/mp4' });
                                const preview = URL.createObjectURL(compressedFile);
                                
                                processedFiles.push({
                                    file: compressedFile,
                                    preview: preview,
                                    type: 'video'
                                });
                                console.log(`Successfully compressed: ${file.name}`);
                            } catch (error) {
                                console.error(`Video compression failed for ${file.name}:`, error);
                                // Fallback to original file if compression fails
                                const preview = URL.createObjectURL(file);
                                processedFiles.push({
                                    file: file,
                                    preview: preview,
                                    type: 'video'
                                });
                            }
                        }
                    } else {
                        // FFmpeg not loaded - use original files
                        console.log('Using original video files without compression');
                        for (let file of videoFiles) {
                            const preview = URL.createObjectURL(file);
                            processedFiles.push({
                                file: file,
                                preview: preview,
                                type: 'video'
                            });
                        }
                    }
                }

                // Process PDF files
                if (pdfFiles.length > 0) {
                    for (let file of pdfFiles) {
                        const preview = URL.createObjectURL(file);
                        processedFiles.push({
                            file: file,
                            preview: preview,
                            type: 'pdf'
                        });
                    }
                }

                // Add processed files to state
                setOpgaveBilleder(prev => [...prev, ...processedFiles]);
            } catch (error) {
                console.error("File processing error:", error);
            } finally {
                setIsProcessing(false);
            }
        }
    }


  
    return (
        <div className={Styles.opgavebeskrivelseContainer}>
            <div className={Styles.opgaveBeskrivelseTopContainer}>
                <div className={Styles.headingWithLanguage}>
                    <h2 className={StepsStyles.headingH2}>{t('beskrivOpgaven.hvadVilDuHaveLavet')}</h2>
                    <button 
                        type="button"
                        className={Styles.languageButton}
                        onClick={handleLanguageChange}
                        aria-label={i18n.language === 'da' ? t('beskrivOpgaven.skiftSprogTilEngelsk') : t('beskrivOpgaven.skiftSprogTilDansk')}
                    >
                        <Globe className={Styles.languageIcon} size={18} />
                        <span>{i18n.language === 'da' ? 'EN' : 'DA'}</span>
                    </button>
                </div>
                <div className={Styles.textareaWrapper}>
                    <textarea 
                        ref={textareaRef}
                        name="opgavebeskrivelse" 
                        placeholder={t('beskrivOpgaven.placeholder')}
                        className={`${Styles.opgavebeskrivelse} ${shouldPulse ? Styles.pulsating : ''}`} 
                        value={opgaveBeskrivelse} 
                        onChange={(e) => setOpgaveBeskrivelse(e.target.value)}
                        disabled={isAnalyzing}
                        style={{
                            filter: isAnalyzing ? 'blur(2px)' : 'blur(0px)',
                            transition: 'filter 0.3s ease-in-out'
                        }}
                    ></textarea>
                    <AnimatePresence>
                        {isAnalyzing && (
                            <motion.div 
                                className={Styles.analyzingOverlay}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                <MoonLoader size={30} color="#59bf1a" />
                                <p className={Styles.analyzingText}>
                                    {t('beskrivOpgaven.analyserer')}
                                    <br />
                                    {t('beskrivOpgaven.etOjeblik')}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <AnimatePresence>
                    {showQuestionsPopup && aiQuestions.length > 0 && (
                        <AIFollowUpQuestionsPopup
                            questions={aiQuestions}
                            currentIndex={currentQuestionIndex}
                            onIndexChange={onQuestionIndexChange}
                            onClose={onCloseQuestions}
                            onContinue={onContinueQuestions}
                            isIntegrated={true}
                            onFocusTextarea={() => {
                              if (textareaRef.current) {
                                textareaRef.current.focus()
                                // Set cursor to end of text
                                const length = textareaRef.current.value.length
                                textareaRef.current.setSelectionRange(length, length)
                              }
                            }}
                        />
                    )}
                </AnimatePresence>
                <div className={Styles.billederDiv}>
                    {opgaveBilleder?.length > 0 && opgaveBilleder.map((medieItem, index) => {
                        return (
                            <div key={index} className={Styles.uploadetBillede} >
                                {medieItem.type === 'video'
                                ?
                                    <video 
                                        className={Styles.playVideoPlaceholder} 
                                        src={medieItem.preview}
                                        autoPlay
                                        muted
                                        playsInline
                                        loop
                                        onClick={() => setÅbnBilledeIndex(index)}
                                    />
                                : medieItem.type === 'pdf'
                                ?
                                    <img 
                                        src={PDFIcon} 
                                        alt={`PDF ${index + 1}`} 
                                        className={Styles.imagePreview}
                                        onClick={() => setÅbnBilledeIndex(index)}
                                    />
                                :
                                    <img 
                                        src={medieItem.preview} 
                                        alt={`Preview ${index + 1}`} 
                                        className={Styles.imagePreview}
                                        onClick={() => setÅbnBilledeIndex(index)}
                                    />
                                }
                                <button
                                    type="button"
                                    onClick={() => handleDeleteFile(index)}
                                    className={Styles.deleteButton}
                                >
                                    <Trash2 />
                                </button>
                            </div>
                        )
                    })}

                    {isProcessing && (
                        <div className={Styles.spinnerDiv}>
                            <MoonLoader size="20px"/>
                            <p style={{fontSize: 8, textAlign: "center"}}>{t('beskrivOpgaven.behandlerFiler')} <br />{t('beskrivOpgaven.ventVenligst')}</p>
                        </div>
                    )}
                    {!((isProcessing ? 1 : 0) + opgaveBilleder?.length > 4) && <div 
                        className={`${Styles.fileInput} ${dragging ? Styles.dragover : ''}`} 
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }} 
                        onDragLeave={() => setDragging(false)} 
                        onDrop={handleFileDrop}
                    >
                        <div className={Styles.iconContainer}>
                            <AnimatePresence mode="sync">
                                {currentIcon === 0 ? (
                                    <motion.div
                                        key="camera"
                                        initial={{ x: 24, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -24, opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className={Styles.iconWrapper}
                                    >
                                        <Camera />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="filetext"
                                        initial={{ x: 24, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -24, opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className={Styles.iconWrapper}
                                    >
                                        <FileText />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <input 
                            type="file" 
                            name="file" 
                            accept=".jpg, .jpeg, .png, .heic, .mp4, .mov, .avi, .hevc, .pdf" 
                            onChange={handleFileChange} 
                            multiple 
                            style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', padding: 0 }} 
                        />
                    </div>}
                </div>
            </div>
            <div className={Styles.opgaveBeskrivelseBottomContainer}>
                {!isAnalyzing && !showQuestionsPopup && (
                    <p>{t('beskrivOpgaven.aiBehandlerInfo')}</p>
                )}
                <img src={HenrikFoto} alt="Henrik" className={`${Styles.maskotFoto} ${showQuestionsPopup ? Styles.hideOnMobile : ''}`} />
            </div>
            <VisBilledeModal trigger={!!currentMedieItem} setTrigger={(value) => { if (!value) setÅbnBilledeIndex(null); }} medieItem={currentMedieItem} />
        </div>
    )
}

export default BeskrivOpgaven
