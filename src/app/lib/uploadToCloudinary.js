export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'stock-tk'); // <- ชื่อ preset ที่คุณตั้งไว้

  const res = await fetch('https://api.cloudinary.com/v1_1/dap72yoce/image/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const error = await res.text();
    console.error('Cloudinary Upload Error:', error);
    throw new Error(`Upload failed (${res.status}): ${error}`);
  }

  const data = await res.json();
  return data.secure_url;
};
