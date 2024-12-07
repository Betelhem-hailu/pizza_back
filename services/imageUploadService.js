require('dotenv').config();
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (file, folder) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder
    });
    return result.secure_url; 
  } catch (error) {
    console.error('Cloudinary error:', error);
    throw new Error('Image upload failed');
  }
};

module.exports = { uploadImage };
