import { storage } from '../../../../firebase.js';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 } from 'uuid';
import imageCompression from 'browser-image-compression';
import { fetchFile } from '@ffmpeg/util';

/**
 * Custom hook til at håndtere fil-uploads for posteringer
 */
export function useFileUpload({
    posteringBilleder,
    setPosteringBilleder,
    uploadingFiles,
    setUploadingFiles,
    isCompressingVideo,
    setIsCompressingVideo,
    ffmpegRef,
    ffmpegLoaded,
    nyeUploadedeBilleder,
    setNyeUploadedeBilleder,
    setDragging,
    åbnBillede,
    setÅbnBillede,
    kvitteringLoadingStates,
    setKvitteringLoadingStates,
    outlays,
    setOutlays,
    materialeKvitteringLoadingStates,
    setMaterialeKvitteringLoadingStates,
    materialer,
    setMaterialer
}) {
    // Håndter fil-upload for posteringsbilleder
    const handlePosteringFileChange = async (e) => {
        const selectedFiles = e.target.files;
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
        const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime', 'video/hevc'];
        const allowedPDFTypes = ['application/pdf'];

        const validFiles = Array.from(selectedFiles).filter(file => 
            allowedImageTypes.includes(file.type) || 
            allowedVideoTypes.includes(file.type) || 
            allowedPDFTypes.includes(file.type)
        );

        if (posteringBilleder.length + validFiles.length > 10) {
            window.alert("Du må højst uploade 10 filer til posteringen.");
            return;
        }

        if (validFiles.length > 0) {
            setUploadingFiles(prev => [...prev, ...validFiles]);
            let filesToUpload = [];

            const imageFiles = validFiles.filter(file => allowedImageTypes.includes(file.type));
            const videoFiles = validFiles.filter(file => allowedVideoTypes.includes(file.type));
            const pdfFiles = validFiles.filter(file => allowedPDFTypes.includes(file.type));

            // Komprimér billeder
            let compressedFiles = [];
            if (imageFiles.length > 0) {
                for (let file of imageFiles) {
                    try {
                        const compressedFile = await imageCompression(file, {
                            maxSizeMB: 1,
                            maxWidthOrHeight: 1920,
                        });
                        compressedFiles.push(compressedFile);
                    } catch (error) {
                        console.error("Error compressing image:", error);
                        compressedFiles.push(file);
                    }
                }
            }

            // Komprimér videoer
            let compressedVideos = [];
            if (videoFiles.length > 0) {
                setIsCompressingVideo(true);
                const ffmpeg = ffmpegRef.current;
                
                try {
                    if (!ffmpegLoaded.current) {
                        await ffmpeg.load();
                        ffmpegLoaded.current = true;
                    }
                    
                    for (let file of videoFiles) {
                        try {
                            const fileName = file.name;
                            const videoData = await fetchFile(file);
                            await ffmpeg.writeFile(fileName, videoData);
                            
                            const outputFileName = fileName.replace(/\.[^/.]+$/, '') + '_compressed_video.mp4';
                            
                            await ffmpeg.exec([
                                '-i', fileName,
                                '-vcodec', 'libx264',
                                '-crf', '28',
                                '-preset', 'fast',
                                '-acodec', 'aac',
                                outputFileName
                            ]);

                            const compressedVideo = await ffmpeg.readFile(outputFileName);
                            const compressedFile = new Blob([compressedVideo.buffer], { type: 'video/mp4', name: outputFileName });
                            compressedVideos.push(compressedFile);
                        } catch (error) {
                            console.error("Video compression failed", error);
                            window.alert(`Noget gik galt under behandling af "${file.name}". Prøv igen – du kan evt. også prøve at gemme videoen i et andet filformat.`);
                        }
                    }
                } catch (error) {
                    console.error("FFmpeg load failed", error);
                }
                setIsCompressingVideo(false);
            }

            filesToUpload = [...compressedFiles, ...compressedVideos, ...pdfFiles];

            if (filesToUpload.length > 0) {
                const uploadedFilesPromises = filesToUpload.map((file) => {
                    const storageRef = ref(storage, `posteringer/${file.type + v4()}`);
                    const uploadTask = uploadBytesResumable(storageRef, file);

                    return new Promise((resolve, reject) => {
                        uploadTask.on(
                            "state_changed",
                            () => {},
                            (error) => reject(error),
                            () => {
                                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                    resolve(downloadURL);
                                });
                            }
                        );
                    });
                });

                const downloadURLs = await Promise.all(uploadedFilesPromises);
                
                setUploadingFiles(prev => prev.slice(0, prev.length - validFiles.length));
                setPosteringBilleder(prev => [...prev, ...downloadURLs]);
                setNyeUploadedeBilleder(prev => [...prev, ...downloadURLs]);
            }
        }
    };

    // Håndter fil-drop
    const handlePosteringFileDrop = async (e) => {
        e.preventDefault();
        setDragging(false);
        
        const droppedFiles = e.dataTransfer.files;
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'application/pdf'];
        
        const validFiles = Array.from(droppedFiles).filter(file =>
            allowedTypes.includes(file.type)
        );

        if (posteringBilleder.length + validFiles.length > 10) {
            window.alert("Du må højst uploade 10 billeder.");
            return;
        }

        if (validFiles.length > 0) {
            setUploadingFiles(prev => [...prev, ...validFiles]);
            let compressedFiles = [];
            const imageFiles = validFiles.filter(file => ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'].includes(file.type));
            const pdfFiles = validFiles.filter(file => file.type === 'application/pdf');

            for (let file of imageFiles) {
                try {
                    const compressedFile = await imageCompression(file, {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1920,
                    });
                    compressedFiles.push(compressedFile);
                } catch (error) {
                    console.error("Error compressing image:", error);
                    compressedFiles.push(file);
                }
            }

            compressedFiles.push(...pdfFiles);

            if (compressedFiles.length > 0) {
                const uploadedFilesPromises = compressedFiles.map((file) => {
                    const storageRef = ref(storage, `posteringer/${file.name + v4()}`);
                    const uploadTask = uploadBytesResumable(storageRef, file);

                    return new Promise((resolve, reject) => {
                        uploadTask.on(
                            "state_changed",
                            () => {},
                            (error) => reject(error),
                            () => {
                                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                    resolve(downloadURL);
                                });
                            }
                        );
                    });
                });

                const downloadURLs = await Promise.all(uploadedFilesPromises);
                
                setUploadingFiles(prev => prev.slice(0, prev.length - validFiles.length));
                setPosteringBilleder(prev => [...prev, ...downloadURLs]);
                setNyeUploadedeBilleder(prev => [...prev, ...downloadURLs]);
            }
        }
    };

    // Slet posteringsbillede
    const handleDeletePosteringFile = async (medie, index) => {
        try {
            const urlObj = new URL(medie);
            const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
            
            let fileRef;
            if (pathMatch) {
                const filePath = decodeURIComponent(pathMatch[1]);
                fileRef = ref(storage, filePath);
            } else {
                fileRef = ref(storage, medie);
            }
            
            let nyeBilleder = [...posteringBilleder];
            if (index >= 0 && index < nyeBilleder.length) {
                nyeBilleder.splice(index, 1);
            }
            
            setPosteringBilleder(nyeBilleder);
            setNyeUploadedeBilleder(prev => prev.filter(url => url !== medie));
            
            await deleteObject(fileRef);
            
            if (åbnBillede) {
                setÅbnBillede(null);
            }
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    // Kvittering upload for udlæg
    const handleKvitteringUpload = (file, index) => {
        if (!file) return;
    
        setKvitteringLoadingStates(prev => ({ ...prev, [index]: true }));
    
        const storageRef = ref(storage, `kvitteringer/${file.name + v4()}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
    
        const timeoutId = setTimeout(() => {
            uploadTask.cancel();
            setKvitteringLoadingStates(prev => ({ ...prev, [index]: false }));
            alert("Upload af udlægsbillede tog for lang tid. Find et sted med bedre internetforbindelse, vælg et mindre billede, genstart app'en eller prøv igen om lidt.");
        }, 25000);
    
        uploadTask.on(
            "state_changed",
            () => {},
            (error) => {
                if (error.code === "storage/canceled") {
                    console.log("Billedupload blev annulleret.");
                } else {
                    alert("Billedupload fejlede. Prøv igen.");
                }
                clearTimeout(timeoutId);
                setKvitteringLoadingStates(prev => ({ ...prev, [index]: false }));
            },
            () => {
                clearTimeout(timeoutId);
                setKvitteringLoadingStates(prev => ({ ...prev, [index]: false }));
    
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setOutlays(prev => {
                        const newOutlays = [...prev];
                        newOutlays[index] = { ...newOutlays[index], kvittering: downloadURL };
                        return newOutlays;
                    });
                });
            }
        );
    };

    // Kvittering upload for materialer
    const handleMaterialeKvitteringUpload = (file, index) => {
        if (!file) return;
    
        setMaterialeKvitteringLoadingStates(prev => ({ ...prev, [index]: true }));
    
        const storageRef = ref(storage, `kvitteringer/${file.name + v4()}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
    
        const timeoutId = setTimeout(() => {
            uploadTask.cancel();
            setMaterialeKvitteringLoadingStates(prev => ({ ...prev, [index]: false }));
            alert("Upload af kvitteringsbillede tog for lang tid. Find et sted med bedre internetforbindelse, vælg et mindre billede, genstart app'en eller prøv igen om lidt.");
        }, 25000);
    
        uploadTask.on(
            "state_changed",
            () => {},
            (error) => {
                if (error.code === "storage/canceled") {
                    console.log("Billedupload blev annulleret.");
                } else {
                    alert("Billedupload fejlede. Prøv igen.");
                }
                clearTimeout(timeoutId);
                setMaterialeKvitteringLoadingStates(prev => ({ ...prev, [index]: false }));
            },
            () => {
                clearTimeout(timeoutId);
                setMaterialeKvitteringLoadingStates(prev => ({ ...prev, [index]: false }));
    
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setMaterialer(prev => {
                        const newMaterialer = [...prev];
                        newMaterialer[index] = { ...newMaterialer[index], kvittering: downloadURL };
                        return newMaterialer;
                    });
                });
            }
        );
    };

    // Cleanup af uploadede filer
    const cleanupUploadedFiles = async () => {
        if (nyeUploadedeBilleder.length > 0) {
            const deletePromises = nyeUploadedeBilleder.map(async (url) => {
                try {
                    if (url && typeof url === 'string' && url.startsWith('http')) {
                        const urlObj = new URL(url);
                        const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
                        
                        if (pathMatch) {
                            const filePath = decodeURIComponent(pathMatch[1]);
                            const fileRef = ref(storage, filePath);
                            await deleteObject(fileRef);
                            console.log(`Slettet midlertidig fil: ${filePath}`);
                        }
                    }
                } catch (error) {
                    console.error("Error deleting file during cleanup:", error);
                }
            });
            
            await Promise.all(deletePromises);
        }
    };

    return {
        handlePosteringFileChange,
        handlePosteringFileDrop,
        handleDeletePosteringFile,
        handleKvitteringUpload,
        handleMaterialeKvitteringUpload,
        cleanupUploadedFiles
    };
}

export default useFileUpload;

