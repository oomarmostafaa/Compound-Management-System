const prisma = require('../../config/db');
const bcrypt = require('bcryptjs');

class StaffController {
  create = async (req, res, next) => {
    try {
      const { email, password, phone, jobTitle } = req.body;

      // Check if email exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already registered'
        });
      }

      // Check if phone exists
      const existingStaff = await prisma.staff.findFirst({ where: { phone } });
      if (existingStaff) {
        return res.status(400).json({
          status: 'error',
          message: 'Staff with this phone number already exists'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Create User + Staff in transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            role: 'STAFF'
          }
        });

        const staff = await tx.staff.create({
          data: {
            userId: user.id,
            phone,
            jobTitle
          }
        });

        return {
          user: { id: user.id, email: user.email, role: user.role },
          staff
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
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const includeDeleted = req.query.includeDeleted === 'true';

      const skip = (page - 1) * limit;
      const where = {
        isDeleted: includeDeleted ? undefined : false
      };

      if (search) {
        where.OR = [
          { phone: { contains: search, mode: 'insensitive' } },
          { jobTitle: { contains: search, mode: 'insensitive' } },
          {
            user: {
              email: { contains: search, mode: 'insensitive' }
            }
          }
        ];
      }

      const [total, data] = await prisma.$transaction([
        prisma.staff.count({ where }),
        prisma.staff.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: { email: true }
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
      const staff = await prisma.staff.findFirst({
        where: { id, isDeleted: false },
        include: {
          user: {
            select: { email: true }
          }
        }
      });

      if (!staff) {
        return res.status(404).json({
          status: 'error',
          message: 'Staff member not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: staff
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const staff = await prisma.staff.findFirst({
        where: { id, isDeleted: false }
      });

      if (!staff) {
        return res.status(404).json({
          status: 'error',
          message: 'Staff member not found'
        });
      }

      const updated = await prisma.staff.update({
        where: { id },
        data: updateData
      });

      res.status(200).json({
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
      const staff = await prisma.staff.findFirst({
        where: { id, isDeleted: false }
      });

      if (!staff) {
        return res.status(404).json({
          status: 'error',
          message: 'Staff member not found'
        });
      }

      await prisma.$transaction(async (tx) => {
        // Mark staff as deleted
        await tx.staff.update({
          where: { id },
          data: {
            isDeleted: true,
            deletedAt: new Date()
          }
        });

        // Deactivate user
        await tx.user.update({
          where: { id: staff.userId },
          data: { isDeleted: true }
        });
      });

      res.status(200).json({
        status: 'success',
        message: 'Staff member soft deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new StaffController();