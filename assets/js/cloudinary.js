export async function uploadFotoKain(fileGambar) {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const formData = new FormData();
    formData.append('file', fileGambar);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Gagal mengunggah gambar ke server');
        }

        const data = await response.json();
        return data.secure_url; 
    } catch (error) {
        console.error("Error Cloudinary:", error);
        return null;
    }
}