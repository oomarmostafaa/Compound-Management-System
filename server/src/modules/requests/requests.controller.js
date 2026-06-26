const prisma = require('../../config/db');
const { uploadToCloudinary } = require('../../utils/cloudinaryUpload');

class RequestsController {
  create = async (req, res, next) => {
    try {
      const residentId = req.user.residentId;
      if (!residentId) {
        return res.status(403).json({
          status: 'error',
          message: 'Only residents can create requests'
        });
      }

      const fileBuffer = req.file ? req.file.buffer : null;
      const { title, description, type } = req.body;

      let imageUrl = null;

      if (fileBuffer) {
        const uploadResult = await uploadToCloudinary(fileBuffer, 'compound_requests');
        imageUrl = uploadResult.secure_url;
      }

      const request = await prisma.request.create({
        data: {
          title,
          description,
          type,
          image: imageUrl,
          residentId
        }
      });

      res.status(201).json({
        status: 'success',
        data: request
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { status, type, search } = req.query;

      const skip = (page - 1) * limit;
      const where = {};

      // Scoping based on Role
      if (req.user.role === 'RESIDENT') {
        where.residentId = req.user.residentId;
      } else if (req.user.role === 'STAFF') {
        where.assignedStaffId = req.user.staffId;
      }

      if (status) where.status = status;
      if (type) where.type = type;

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          {
            resident: {
              OR: [
                { phone: { contains: search, mode: 'insensitive' } },
                { user: { email: { contains: search, mode: 'insensitive' } } }
              ]
            }
          },
          {
            assignedStaff: {
              user: { email: { contains: search, mode: 'insensitive' } }
            }
          }
        ];
      }

      const [total, data] = await prisma.$transaction([
        prisma.request.count({ where }),
        prisma.request.findMany({
          where,
          skip,
          take: limit,
          include: {
            resident: {
              select: {
                phone: true,
                user: { select: { email: true } }
              }
            },
            assignedStaff: {
              select: {
                jobTitle: true,
                user: { select: { email: true } }
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

  getOne = async (req, res, next) => {
    try {
      const { id } = req.params;

      const request = await prisma.request.findUnique({
        where: { id },
        include: {
          resident: {
            select: {
              id: true,
              phone: true,
              user: { select: { email: true } }
            }
          },
          assignedStaff: {
            select: {
              id: true,
              jobTitle: true,
              user: { select: { email: true } }
            }
          }
        }
      });

      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Request not found'
        });
      }

      // Verify authorization to view
      if (req.user.role === 'RESIDENT' && request.residentId !== req.user.residentId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to view this request'
        });
      }
      if (req.user.role === 'STAFF' && request.assignedStaffId !== req.user.staffId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to view this request'
        });
      }

      res.status(200).json({
        status: 'success',
        data: request
      });
    } catch (error) {
      next(error);
    }
  };

  assignStaff = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { assignedStaffId } = req.body;

      // Check if request exists
      const request = await prisma.request.findUnique({
        where: { id }
      });

      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Request not found'
        });
      }

      // Check if staff exists and is active
      const staff = await prisma.staff.findFirst({
        where: { id: assignedStaffId, isDeleted: false }
      });

      if (!staff) {
        return res.status(404).json({
          status: 'error',
          message: 'Active staff member not found'
        });
      }

      const updated = await prisma.request.update({
        where: { id },
        data: {
          assignedStaffId,
          status: 'IN_PROGRESS' // Auto-update to IN_PROGRESS when staff is assigned
        }
      });

      res.status(200).json({
        status: 'success',
        message: 'Staff assigned successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updated = await prisma.request.update({
        where: { id },
        data: { status }
      });

      res.status(200).json({
        status: 'success',
        message: 'Request status updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new RequestsController();