const cloudinary = require('../config/cloudinary');

// بترفع الملف لـ Cloudinary وترجع رابط الصورة
async function uploadToCloudinary(fileBuffer, folder = 'compound_assets', mimeType = 'image/jpeg') {
  return new Promise((resolve, reject) => {
    const isPdf = mimeType === 'application/pdf';
    // For PDFs, use 'image' as resource_type (Cloudinary auto-converts PDF to viewable images)
    const options = {
      folder,
      type: 'upload',
      resource_type: 'auto'
    };

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
}

module.exports = { uploadToCloudinary };



// المستخدم يختار صورة
//     ↓
// Multer يستقبلها (file.buffer)
//     ↓
// uploadToCloudinary(fileBuffer, 'compound_profiles')
//     ↓
// Cloudinary يستقبل الملف ويرفعه
//     ↓
// Cloudinary يرجع رابط الصورة
//     ↓
// نحفظ الرابط في قاعدة البيانات
//     ↓
// لما نعرض الصفحة، نجيب الصورة من الرابط
