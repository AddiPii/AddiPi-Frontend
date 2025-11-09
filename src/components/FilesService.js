import React, { useState } from "react";

export default function FilesService(){
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [resultData, setResultData] = useState(null);


    const handleFileChange = (e) => {
        if(e.target.files){
            setStatus('initial');
            setFile(e.target.files[0]);
        }
    };


    const handleUpload = async() => {
        if (file){
            setStatus('uploading');

            const formData = new FormData();
            formData.append('file', file);
            if (scheduledAt) {
                formData.append('scheduledAt', scheduledAt);
            }

            try {
                const ip = 'http://localhost:5000';
                const apiBase = `${ip}`;
                const result = await fetch(`${apiBase}/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (result.ok){
                    const data = await result.json();

                    console.log('Upload successful:', data);
                    setResultData(data);
                    setStatus('success');
                }
                else {
                    console.error('Upload failed:', result.statusText);
                    setStatus('error');
                }
            }
            catch (error){
                console.error('Error uploading file:', error);
                setStatus('error');
            }
        }
    };


    return(
        <>
            <div className="files-service">
                <h1>Files Service Page</h1>
                <form className="upload-form">
                    <input type="file" accept=".gcode" onChange={handleFileChange}/>
                    <div style={{marginTop: '8px'}}>
                        <label>
                            Schedule (optional):
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                style={{marginLeft: '8px'}}
                            />
                        </label>
                    </div>
                    {file &&
                        <section>
                            File details:
                            <ul>
                                <li>Name: {file.name}</li>
                                <li>Type: {file.type || 'gcode'}</li>
                                <li>Size: {Math.round(file.size*0.000001 * 100)/100} MB</li>
                                <li>Last Modified: {file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : 'N/A'}</li>
                            </ul>
                        </section>}
                    {file && (
                        <button 
                            type="button" 
                            onClick={handleUpload} 
                            className="submit">Upload and Print</button>
                        )}

                        <Result status={status} />

                        {resultData && resultData.fileId && (
                            <div style={{marginTop: '12px'}}>
                                <strong>Uploaded fileId:</strong> {resultData.fileId}
                            </div>
                        )}
                </form>
            </div>
        </>
        
    )
};


const Result = ({status}) => {
    switch (status){
        case 'initial':
            return <p></p>;
        case 'uploading':
            return <p>Uploading file, please wait...</p>;
        case 'success':
            return <p>File uploaded successfully!</p>;
        case 'error':
            return <p>Error uploading file. Please try again.</p>;
        default:
            return null;
    };
};