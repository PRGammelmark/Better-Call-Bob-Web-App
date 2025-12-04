import React, { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import Styles from './VisBillede.module.css'
import PDFIcon from '../../assets/pdf-logo.svg'

const VisBillede = (props) => {
    const [pdfUrl, setPdfUrl] = useState(null);
    
    // Check if it's a PDF - for booking, PDFs will have type 'pdf' or URL includes '.pdf'
    const medieItem = props.medieItem;
    
    // Always use medieItem.preview - it's the current object from the array
    const previewUrl = medieItem ? medieItem.preview : null;
    
    const isPDF = medieItem && (medieItem.type === 'pdf' || (previewUrl && (previewUrl.includes('.pdf') || previewUrl.includes('application/pdf'))));
    const isVideo = medieItem && medieItem.type === 'video';
    
    // trigger should be boolean - true if we have medieItem
    const trigger = !!medieItem;

    // Create blob URL for PDF files when modal opens
    useEffect(() => {
        if (isPDF && medieItem && medieItem.file && previewUrl) {
            const url = URL.createObjectURL(medieItem.file);
            setPdfUrl(url);
            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [isPDF, medieItem, previewUrl]);

    const handlePDFClick = () => {
        if (pdfUrl) {
            window.open(pdfUrl, '_blank');
        } else if (medieItem && medieItem.file) {
            const url = URL.createObjectURL(medieItem.file);
            window.open(url, '_blank');
        } else if (previewUrl) {
            window.open(previewUrl, '_blank');
        }
    };

    const handleClose = () => {
        if (props.setTrigger) {
            props.setTrigger(null);
        }
        // Also clear medieItem if there's a way to do it
        // For now, we rely on props.trigger being null
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
    };

    return (
        <Modal trigger={trigger} setTrigger={handleClose}>
            {isVideo ? <h2>Vis video</h2> : isPDF ? <h2>Vis PDF</h2> : <h2>Vis billede</h2>}
            {isVideo 
            ? 
            <video 
                className={Styles.video} 
                src={previewUrl} 
                controls 
            />
            : isPDF
            ?
            <div style={{textAlign: 'center', padding: '20px'}}>
                <p style={{marginBottom: '15px'}}>Klik på ikonet for at åbne PDF'en i et nyt vindue.</p>
                <img 
                    className={Styles.pdfIcon} 
                    src={PDFIcon} 
                    alt="PDF" 
                    onClick={handlePDFClick}
                    style={{cursor: 'pointer', maxWidth: '200px'}}
                />
            </div>
            : 
            <img className={Styles.billede} src={previewUrl} alt="Preview"></img>}
        </Modal>
    )
}

export default VisBillede

