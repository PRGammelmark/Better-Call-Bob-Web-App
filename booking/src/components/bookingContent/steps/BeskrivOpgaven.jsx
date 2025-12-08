import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence } from 'framer-motion'
import StepsStyles from './Steps.module.css'
import Styles from './BeskrivOpgaven.module.css'
import { Trash2, ImagePlus } from 'lucide-react'
import MoonLoader from "react-spinners/MoonLoader";
import imageCompression from 'browser-image-compression'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util';
import dayjs from 'dayjs'
import 'dayjs/locale/da'
import 'dayjs/locale/en'
import PDFIcon from '../../../assets/pdf-logo.svg'
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

    const [åbnBilledeIndex, setÅbnBilledeIndex] = useState(null)
    
    // Get the current medieItem from opgaveBilleder array based on index
    // This ensures we always use the current object reference from the array
    const currentMedieItem = åbnBilledeIndex !== null && opgaveBilleder[åbnBilledeIndex] 
        ? opgaveBilleder[åbnBilledeIndex] 
        : null

    // Opdater dayjs locale når sprog skifter
    useEffect(() => {
        dayjs.locale(i18n.language)
    }, [i18n.language])

    // Håndter sprogskifte
    const handleLanguageChange = () => {
        const newLang = i18n.language === 'da' ? 'en' : 'da'
        i18n.changeLanguage(newLang)
    }

    // Cleanup object URLs only when component unmounts
    // Don't revoke URLs when opgaveBilleder changes, as they're still in use
    useEffect(() => {
        return () => {
            // Only cleanup on unmount
            opgaveBilleder.forEach(item => {
                if (item.preview && item.preview.startsWith('blob:')) {
                    URL.revokeObjectURL(item.preview);
                }
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - only run cleanup on unmount

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
                        <span className={Styles.flagIcon}>{i18n.language === 'da' ? '🇬🇧' : '🇩🇰'}</span>
                        <span>{i18n.language === 'da' ? 'EN' : 'DA'}</span>
                    </button>
                </div>
                <textarea 
                    name="opgavebeskrivelse" 
                    placeholder={t('beskrivOpgaven.placeholder')}
                    className={`${Styles.opgavebeskrivelse} ${shouldPulse ? Styles.pulsating : ''}`} 
                    value={opgaveBeskrivelse} 
                    onChange={(e) => setOpgaveBeskrivelse(e.target.value)}
                    enterKeyHint="done"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && wordCount >= 5 && onNavigateNext) {
                        e.preventDefault()
                        onNavigateNext()
                      }
                    }}
                ></textarea>
                <AnimatePresence>
                    {showQuestionsPopup && aiQuestions.length > 0 && (
                        <AIFollowUpQuestionsPopup
                            questions={aiQuestions}
                            currentIndex={currentQuestionIndex}
                            onIndexChange={onQuestionIndexChange}
                            onClose={onCloseQuestions}
                            onContinue={onContinueQuestions}
                            isIntegrated={true}
                        />
                    )}
                </AnimatePresence>
                <h3 className={StepsStyles.headingH3} style={{marginTop: 15}}>{t('beskrivOpgaven.tilfoejBilleder')}</h3>
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
                        <ImagePlus />
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
            </div>
            <VisBilledeModal trigger={!!currentMedieItem} setTrigger={(value) => { if (!value) setÅbnBilledeIndex(null); }} medieItem={currentMedieItem} />
        </div>
    )
}

export default BeskrivOpgaven
