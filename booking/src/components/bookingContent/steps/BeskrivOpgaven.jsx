import React, { useState } from 'react'
import StepsStyles from './Steps.module.css'
import Styles from './BeskrivOpgaven.module.css'
import { Trash2, ImagePlus } from 'lucide-react'
import MoonLoader from "react-spinners/MoonLoader";
import imageCompression from 'browser-image-compression'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util';
import axios from 'axios'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'


const BeskrivOpgaven = () => {
    const [opgaveBeskrivelse, setOpgaveBeskrivelse] = useState("")
    const [opgaveBilleder, setOpgaveBilleder] = useState([])
    const [dragging, setDragging] = useState(false)
    const [uploadingImages, setUploadingImages] = useState([])
    const [isCompressingVideo, setIsCompressingVideo] = useState(false)

    // Dummy states
    const [åbnBillede, setÅbnBillede] = useState(null)
    const [imageIndex, setImageIndex] = useState(0)

    const handleDeleteFile = (medie, index) => {
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
            setUploadingImages(prevUploadingImages => [...prevUploadingImages, ...validFiles]);
            let filesToUpload = [];
        
            // Separate image and video files
            const imageFiles = validFiles.filter(file => allowedImageTypes.includes(file.type));
            const videoFiles = validFiles.filter(file => allowedVideoTypes.includes(file.type));
            
            // Compress image files (if any)
            let compressedFiles = [];
            if(imageFiles.length > 0) {
                for (let file of imageFiles) {
                    try {
                      const compressedFile = await imageCompression(file, {
                        maxSizeMB: 1, // Adjust as needed (1MB is a good starting point)
                        maxWidthOrHeight: 1000, // You can change this to a specific size you want
                        useWebWorker: true,
                      });
                      compressedFiles.push(compressedFile);
                    } catch (error) {
                      console.error("Image compression failed", error);
                    }
                  }
            }

            // Compress video files (if any)
            let compressedVideos = [];
            if (videoFiles.length > 0) {
                setIsCompressingVideo(true)
                console.log("Video file detected.")
                const ffmpeg = new FFmpeg({ log: true }); // Create an FFmpeg instance
                console.log("Created FFMPEG.")
                await ffmpeg.load(); // Load FFmpeg (this may take a moment)
                console.log("FFMPEG loaded.")

                for (let file of videoFiles) {
                    try {
                        const fileName = file.name;
                        console.log(fileName)
                        const videoData = await fetchFile(file); // Fetch the video data
                        // Write the video file to the FFmpeg virtual file system
                        await ffmpeg.writeFile(fileName, videoData);
                        console.log("Compressing file ...")

                        const outputFileName = fileName.replace(/\.[^/.]+$/, '') + '_compressed_video.mp4';
                        
                        // Compress the video (e.g., reducing the resolution and bitrate)
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
                        const compressedFile = new Blob([compressedVideo.buffer], { type: 'video/mp4', name: outputFileName });
                        compressedVideos.push(compressedFile);
                    } catch (error) {
                        console.error("Video compression failed", error);
                        window.alert(`Noget gik galt under behandling af "${file.name}". 
                            Prøv igen – du kan evt. også prøve at gemme videoen i et andet filformat.`);
                    } finally {
                        setIsCompressingVideo(false)
                    }
                }
            }

            // Combine compressed images and videos for upload
            filesToUpload = [...compressedFiles, ...compressedVideos];
            console.log(filesToUpload)
            
            try {
                // Prepare to upload all files
                const uploadedFilesPromises = filesToUpload.map((file) => {
                    const storageRef = ref(storage, `opgaver/${file.type + v4()}`);
                    const uploadTask = uploadBytesResumable(storageRef, file);
            
                    return new Promise((resolve, reject) => {
                        uploadTask.on(
                            "state_changed",
                            (snapshot) => {
                                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            },
                            (error) => {
                                reject(error); // Reject if there's an error uploading
                            },
                            () => {
                                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                    resolve(downloadURL); // Resolve with the download URL
                                });
                            }
                        );
                    });
                });
            
                // Wait for all files to upload and get their download URLs
                const downloadURLs = await Promise.all(uploadedFilesPromises);
                
                // Update database with most recent information
                axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                })
                .then(res => {
                    let nuværendeOpgaveMedier = res.data.opgaveBilleder;
                    let nyeOpgaveMedier = [...nuværendeOpgaveMedier, ...downloadURLs];

                    axios.patch(`${import.meta.env.VITE_API_URL}/opgaver/${opgaveID}`, {
                        opgaveBilleder: nyeOpgaveMedier
                    }, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    })
                    .then(res => {
                        setUploadingImages(prevUploadingImages => 
                            prevUploadingImages.slice(0, prevUploadingImages.length - validFiles.length)
                        );
                        setOpgaveBilleder(nyeOpgaveMedier)
                    })
                    .catch(error => console.log(error))
                })
                .catch(error => console.log(error))
            } catch (err) {
                console.log(err);
            }
        }
    }


  
    return (
        <div className={Styles.opgavebeskrivelseContainer}>
            <h2 className={StepsStyles.headingH2}>Fortæl os hvad du skal have lavet</h2>
            <textarea name="opgavebeskrivelse" className={Styles.opgavebeskrivelse} value={opgaveBeskrivelse} onChange={(e) => setOpgaveBeskrivelse(e.target.value)}></textarea>
            <h3 className={StepsStyles.headingH3} style={{marginTop: 15}}>Vedhæft evt. billeder eller videoklip</h3>
            <div className={Styles.billederDiv}>
                {opgaveBilleder?.length > 0 && opgaveBilleder.map((medie, index) => {
                    return (
                        <div key={index} className={Styles.uploadetBillede} >
                            {medie.includes("video%") 
                            ?
                                <video 
                                    className={Styles.playVideoPlaceholder} 
                                    src={medie}
                                    autoPlay
                                    muted
                                    playsInline
                                    loop
                                    onClick={() => {setÅbnBillede(medie); setImageIndex(index)}}
                                />
                            :
                                <img 
                                    src={medie} 
                                    alt={`Preview ${index + 1}`} 
                                    className={Styles.imagePreview}
                                    onClick={() => {setÅbnBillede(medie); setImageIndex(index)}}
                                />
                            }
                            <button
                                type="button"
                                onClick={() => handleDeleteFile(medie, index)}
                                className={Styles.deleteButton}
                            >
                                <Trash2 />
                            </button>
                        </div>
                    )
                })}

                {uploadingImages?.length > 0 && uploadingImages.map(image => (
                    <div className={Styles.spinnerDiv}>
                        <MoonLoader size="20px"/>
                        {isCompressingVideo && <p style={{fontSize: 8, textAlign: "center"}}>Behandler video <br />– vent venligst ...</p>}
                    </div>
                ))}
                {!((uploadingImages?.length + opgaveBilleder?.length) > 4) && <div 
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
    )
}

export default BeskrivOpgaven
