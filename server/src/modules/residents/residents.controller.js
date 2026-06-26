const prisma = require('../../config/db');
const bcrypt = require('bcryptjs');
const { uploadToCloudinary } = require('../../utils/cloudinaryUpload');

class ResidentsController {
  create = async (req, res, next) => {
    try {
      const { email, password, phone, nationalId, apartmentId } = req.body;

      // Check if email exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already registered'
        });
      }

      // Check if national ID or phone exists
      const existingResident = await prisma.resident.findFirst({
        where: { OR: [{ nationalId }, { phone }] }
      });
      if (existingResident) {
        return res.status(400).json({
          status: 'error',
          message: 'Resident with this National ID or Phone already exists'
        });
      }

      // Verify apartment exists
      if (apartmentId) {
        const apartment = await prisma.apartment.findUnique({
          where: { id: apartmentId }
        });
        if (!apartment) {
          return res.status(404).json({
            status: 'error',
            message: 'Apartment not found'
          });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Create User + Resident in transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            role: 'RESIDENT'
          }
        });

        const resident = await tx.resident.create({
          data: {
            userId: user.id,
            phone,
            nationalId,
            apartmentId: apartmentId || null
          }
        });

        if (apartmentId) {
          await tx.apartment.update({
            where: { id: apartmentId },
            data: { status: 'OCCUPIED' }
          });
        }

        return {
          user: { id: user.id, email: user.email, role: user.role },
          resident
        };
      });

      res.status(201).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const search = req.query.search || '';
      const includeDeleted = req.query.includeDeleted === 'true';

      const skip = (page - 1) * limit;
      const where = {
        isDeleted: includeDeleted ? undefined : false
      };

      if (search) {
        where.OR = [
          { phone: { contains: search, mode: 'insensitive' } },
          { nationalId: { contains: search, mode: 'insensitive' } },
          {user: {email: { contains: search, mode: 'insensitive' } }}
        ];
      }

      const [total, data] = await prisma.$transaction([
        prisma.resident.count({ where }),
        prisma.resident.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: { email: true }
            },
            apartment: {
              include: { building: true }
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

  getMe = async (req, res, next) => {
    try {
      const residentId = req.user.residentId;
      if (!residentId) {
        return res.status(404).json({
          status: 'error',
          message: 'Resident profile not found'
        });
      }

      const resident = await prisma.resident.findFirst({
        where: { id: residentId, isDeleted: false },
        include: {
          user: { select: { email: true } },
          apartment: { include: { building: true } },
          documents: true
        }
      });

      if (!resident) {
        return res.status(404).json({
          status: 'error',
          message: 'Resident profile not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: resident
      });
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req, res, next) => {
    try {
      const { id } = req.params;
      const resident = await prisma.resident.findFirst({
        where: { id, isDeleted: false },
        include: {
          user: { select: { email: true } },
          apartment: { include: { building: true } },
          documents: true
        }
      });

      if (!resident) {
        return res.status(404).json({
          status: 'error',
          message: 'Resident not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: resident
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const resident = await prisma.resident.findFirst({
        where: { id, isDeleted: false }
      });

      if (!resident) {
        return res.status(404).json({
          status: 'error',
          message: 'Resident not found'
        });
      }

      // 1. check nationalId uniqueness
      if (updateData.nationalId) {
        const exists = await prisma.resident.findFirst({
          where: {
            nationalId: updateData.nationalId,
          }
        });

        if (exists) {
          return res.status(400).json({
            message: 'National ID already in use'
          });
        }
      }

      // 2. handle apartment change (تبسيطها)
      if (updateData.apartmentId && updateData.apartmentId !== resident.apartmentId) {

        // old apartment check
        if (resident.apartmentId) {
          const count = await prisma.resident.count({
            where: {
              apartmentId: resident.apartmentId,
              isDeleted: false
            }
          });

          if (count === 1) {
            await prisma.apartment.update({
              where: { id: resident.apartmentId },
              data: { status: 'EMPTY' }
            });
          }
        }

        // new apartment
        await prisma.apartment.update({
          where: { id: updateData.apartmentId },
          data: { status: 'OCCUPIED' }
        });
      }

      // 3. update
      const updated = await prisma.resident.update({
        where: { id },
        data: updateData,
        include: { apartment: true }
      });

      res.json({
        status: 'success',
        data: updated
      });

    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const resident = await prisma.resident.findFirst({
        where: { id, isDeleted: false }
      });

      if (!resident) {
        return res.status(404).json({
          status: 'error',
          message: 'Resident not found'
        });
      }

      await prisma.$transaction(async (tx) => {
        // Mark resident as deleted
        await tx.resident.update({
          where: { id },
          data: {
            isDeleted: true,
            deletedAt: new Date()
          }
        });

        // Deactivate linked User account
        await tx.user.update({
          where: { id: resident.userId },
          data: { isDeleted: true }
        });

        // If resident had an apartment, check if it becomes empty
        if (resident.apartmentId) {
          const siblingCount = await tx.resident.count({
            where: {
              apartmentId: resident.apartmentId,
              id: { not: id },
              isDeleted: false
            }
          });

          if (siblingCount === 0) {
            await tx.apartment.update({
              where: { id: resident.apartmentId },
              data: { status: 'EMPTY' }
            });
          }
        }
      });

      res.status(200).json({
        status: 'success',
        message: 'Resident soft deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  uploadProfileImage = async (req, res, next) => {
    try {
      const residentId = req.user.residentId;

      if (!residentId) {
        return res.status(400).json({
          status: 'error',
          message: 'Resident profile not found for current user'
        });
      }

      const fileBuffer = req.file ? req.file.buffer : null;
      const uploadResult = await uploadToCloudinary(fileBuffer, 'compound_profiles');

      const updated = await prisma.resident.update({
        where: { id: residentId },
        data: {
          profileImage: uploadResult.secure_url
        }
      });

      res.status(200).json({
        status: 'success',
        message: 'Profile image uploaded successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ResidentsController();