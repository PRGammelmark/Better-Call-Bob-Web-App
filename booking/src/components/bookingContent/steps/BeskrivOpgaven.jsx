import React, { useState, useEffect } from 'react'
import StepsStyles from './Steps.module.css'
import Styles from './BeskrivOpgaven.module.css'
import { Trash2, ImagePlus } from 'lucide-react'
import MoonLoader from "react-spinners/MoonLoader";
import imageCompression from 'browser-image-compression'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util';

// File structure: { file: File/Blob, preview: string (object URL), type: 'image' | 'video' }
const BeskrivOpgaven = ({ opgaveBeskrivelse, setOpgaveBeskrivelse, opgaveBilleder, setOpgaveBilleder, wordCount = 0 }) => {
    const shouldPulse = wordCount < 5
    const [dragging, setDragging] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    // Dummy states
    const [åbnBillede, setÅbnBillede] = useState(null)
    const [imageIndex, setImageIndex] = useState(0)

    // Cleanup object URLs when component unmounts or files change
    useEffect(() => {
        return () => {
            opgaveBilleder.forEach(item => {
                if (item.preview && item.preview.startsWith('blob:')) {
                    URL.revokeObjectURL(item.preview);
                }
            });
        };
    }, [opgaveBilleder]);

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

        const validFiles = Array.from(selectedFiles).filter(file => 
            allowedImageTypes.includes(file.type) || allowedVideoTypes.includes(file.type)
        );

        if(opgaveBilleder.length + validFiles.length > 5){
            window.alert("Du må højst uploade 5 billede- eller videofiler til opgaven.")
            return
        }
        
        if (validFiles.length > 0) {
            setIsProcessing(true);
            
            // Separate image and video files
            const imageFiles = validFiles.filter(file => allowedImageTypes.includes(file.type));
            const videoFiles = validFiles.filter(file => allowedVideoTypes.includes(file.type));
            
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
                const ffmpeg = new FFmpeg({ log: false });
                await ffmpeg.load();

                for (let file of videoFiles) {
                    try {
                        const fileName = file.name;
                        const videoData = await fetchFile(file);
                        await ffmpeg.writeFile(fileName, videoData);

                        const outputFileName = fileName.replace(/\.[^/.]+$/, '') + '_compressed_video.mp4';
                        
                        await ffmpeg.exec([
                            '-i', fileName,
                            '-vcodec', 'libx264', 
                            '-crf', '30', 
                            '-b:v', '1000k', 
                            '-preset', 'ultrafast', 
                            '-acodec', 'copy',
                            outputFileName
                        ]);

                        const compressedVideo = await ffmpeg.readFile(outputFileName);
                        const compressedFile = new Blob([compressedVideo.buffer], { type: 'video/mp4' });
                        const preview = URL.createObjectURL(compressedFile);
                        
                        processedFiles.push({
                            file: compressedFile,
                            preview: preview,
                            type: 'video'
                        });
                    } catch (error) {
                        console.error("Video compression failed", error);
                        window.alert(`Noget gik galt under behandling af "${file.name}". 
                            Prøv igen – du kan evt. også prøve at gemme videoen i et andet filformat.`);
                        // Fallback to original file if compression fails
                        const preview = URL.createObjectURL(file);
                        processedFiles.push({
                            file: file,
                            preview: preview,
                            type: 'video'
                        });
                    }
                }
            }

            // Add processed files to state
            setOpgaveBilleder(prev => [...prev, ...processedFiles]);
            setIsProcessing(false);
        }
    }


  
    return (
        <div className={Styles.opgavebeskrivelseContainer}>
            <div className={Styles.opgaveBeskrivelseTopContainer}>
                <h2 className={StepsStyles.headingH2}>Fortæl os hvad du skal have lavet</h2>
                <textarea 
                    name="opgavebeskrivelse" 
                    placeholder="Eksempel: &#10;&#10;'Jeg skal have hængt 2 gardiner op, 5 billeder, et tv, samlet et klædeskab og monteret en lampe. Væggene er af beton og jeg har en stige.'" 
                    className={`${Styles.opgavebeskrivelse} ${shouldPulse ? Styles.pulsating : ''}`} 
                    value={opgaveBeskrivelse} 
                    onChange={(e) => setOpgaveBeskrivelse(e.target.value)}
                ></textarea>
                <h3 className={StepsStyles.headingH3} style={{marginTop: 15}}>Vedhæft evt. billeder, dokumenter eller video</h3>
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
                                        onClick={() => {setÅbnBillede(medieItem.preview); setImageIndex(index)}}
                                    />
                                :
                                    <img 
                                        src={medieItem.preview} 
                                        alt={`Preview ${index + 1}`} 
                                        className={Styles.imagePreview}
                                        onClick={() => {setÅbnBillede(medieItem.preview); setImageIndex(index)}}
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
                            <p style={{fontSize: 8, textAlign: "center"}}>Behandler filer <br />– vent venligst ...</p>
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
                            accept=".jpg, .jpeg, .png, .heic, .mp4, .mov, .avi, .hevc" 
                            onChange={handleFileChange} 
                            multiple 
                            style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', padding: 0 }} 
                        />
                    </div>}
                </div>
            </div>
            <div className={Styles.opgaveBeskrivelseBottomContainer}>
                <p>Vi kører automatiske analyser af din opgavebeskrivelse for at kunne betjene dig bedre og hurtigere. Når du trykker 'Næste' antager vi din implicitte accept. Vi gemmer aldrig persondata uden din eksplicitte accept.</p>
            </div>
        </div>
    )
}

export default BeskrivOpgaven
