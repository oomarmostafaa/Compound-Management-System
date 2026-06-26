const prisma = require('../../config/db');

class ApartmentsController {
  create = async (req, res, next) => {
    try {
      const { number, floor, buildingId } = req.body;

      // Check if apartment number exists
      const existing = await prisma.apartment.findUnique({
        where: { number }
      });

      if (existing) {
        return res.status(400).json({
          status: 'error',
          message: 'Apartment with this number already exists'
        });
      }

      // Verify building exists
      const building = await prisma.building.findUnique({
        where: { id: buildingId }
      });

      if (!building) {
        return res.status(404).json({
          status: 'error',
          message: 'Building not found'
        });
      }

      const apartment = await prisma.apartment.create({
        data: { number, floor, buildingId }
      });

      res.status(201).json({
        status: 'success',
        data: apartment
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
      const status = req.query.status || '';

      const skip = (page - 1) * limit;
      const where = {};

      if (search) {
        where.OR = [
          { number: { contains: search, mode: 'insensitive' } },
          {
            building: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { number: { contains: search, mode: 'insensitive' } }
              ]
            }
          },
          {
            resident: {
              user: {
                email: { contains: search, mode: 'insensitive' }
              }
            }
          }
        ];
      }

      if (status) {
        where.status = status;
      }

      const [total, data] = await prisma.$transaction([
        prisma.apartment.count({ where }),
        prisma.apartment.findMany({
          where,
          skip,
          take: limit,
          include: {
            building: true,
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

  getOne = async (req, res, next) => {
    try {
      const { id } = req.params;
      const apartment = await prisma.apartment.findUnique({
        where: { id },
        include: {
          building: true,
          resident: {
            include: {
              user: {
                select: { email: true }
              }
            }
          }
        }
      });

      if (!apartment) {
        return res.status(404).json({
          status: 'error',
          message: 'Apartment not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: apartment
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const apartment = await prisma.apartment.findUnique({
        where: { id }
      });

      if (!apartment) {
        return res.status(404).json({
          status: 'error',
          message: 'Apartment not found'
        });
      }

      if (updateData.number && updateData.number !== apartment.number) {
        const existing = await prisma.apartment.findFirst({
          where: {
            number: updateData.number,
            id: { not: id }
          }
        });

        if (existing) {
          return res.status(400).json({
            status: 'error',
            message: 'Apartment with this number already exists'
          });
        }
      }

      const updated = await prisma.apartment.update({
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

      const apartment = await prisma.apartment.findUnique({
        where: { id }
      });

      if (!apartment) {
        return res.status(404).json({
          status: 'error',
          message: 'Apartment not found'
        });
      }

      await prisma.apartment.delete({
        where: { id }
      });

      res.status(200).json({
        status: 'success',
        message: 'Apartment deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  assignResident = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { residentId } = req.body;

      const apartment = await prisma.apartment.findUnique({
        where: { id }
      });

      if (!apartment) {
        return res.status(404).json({
          status: 'error',
          message: 'Apartment not found'
        });
      }

      const resident = await prisma.resident.findFirst({
        where: { id: residentId, isDeleted: false }
      });

      if (!resident) {
        return res.status(404).json({
          status: 'error',
          message: 'Resident not found'
        });
      }

      const updated = await prisma.apartment.update({
        where: { id },
        data: {
          status: 'OCCUPIED',
          resident: {
            connect: { id: residentId }
          }
        },
        include: {
          building: true,
          resident: {
            include: {
              user: {
                select: { email: true }
              }
            }
          }
        }
      });

      res.status(200).json({
        status: 'success',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ApartmentsController();