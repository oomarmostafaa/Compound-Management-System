const prisma = require('../../config/db');
const { uploadToCloudinary } = require('../../utils/cloudinaryUpload');

class DocumentsController {
  upload = async (req, res, next) => {
    try {
      const residentId = req.user.residentId;
      if (!residentId) {
        return res.status(403).json({
          status: 'error',
          message: 'Only residents can upload documents'
        });
      }

      const { type } = req.body;
      const fileBuffer = req.file ? req.file.buffer : null;

      if (!fileBuffer) {
        return res.status(400).json({
          status: 'error',
          message: 'No file provided'
        });
      }

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(fileBuffer, 'compound_documents');

      // Save to database
      const document = await prisma.document.create({
        data: {
          residentId,
          type,
          fileUrl: uploadResult.secure_url
        },
        include: {
          resident: {
            include: {
              user: {
                select: { email: true }
              }
            }
          }
        }
      });

      res.status(201).json({
        status: 'success',
        message: 'Document uploaded successfully',
        data: document
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // Residents can only view their own documents
      // Admins can view all documents
      const residentId = req.user.role === 'RESIDENT'
        ? req.user.residentId
        : req.query.residentId || null;

      const skip = (page - 1) * limit;
      const where = residentId ? { residentId } : {};

      const [total, data] = await prisma.$transaction([
        prisma.document.count({ where }),
        prisma.document.findMany({
          where,
          skip,
          take: limit,
          include: {
            resident: {
              include: {
                user: {
                  select: { email: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      ]);

      res.status(200).json({
        status: 'success',
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const residentId = req.user.residentId;

      if (!residentId) {
        return res.status(403).json({
          status: 'error',
          message: 'Only residents can delete their documents'
        });
      }

      // Check if document exists and belongs to this resident
      const document = await prisma.document.findFirst({
        where: { id, residentId }
      });

      if (!document) {
        return res.status(404).json({
          status: 'error',
          message: 'Document not found'
        });
      }

      await prisma.document.delete({
        where: { id }
      });

      res.status(200).json({
        status: 'success',
        message: 'Document deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new DocumentsController();