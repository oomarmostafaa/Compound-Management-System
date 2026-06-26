const prisma = require('../../config/db');

class BuildingsController {
  create = async (req, res, next) => {
    try {
      const { name, number } = req.body;

      // Check if building number exists
      const existing = await prisma.building.findUnique({
        where: { number }
      });

      if (existing) {
        return res.status(400).json({
          status: 'error',
          message: 'Building with this number already exists'
        });
      }

      const building = await prisma.building.create({
        data: { name, number }
      });

      res.status(201).json({
        status: 'success',
        data: building
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

      const skip = (page - 1) * limit;
      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { number: { contains: search, mode: 'insensitive' } }
            ]
          }
        : {};

      const [total, data] = await prisma.$transaction([
        prisma.building.count({ where }),
        prisma.building.findMany({
          where,
          skip,
          take: limit,
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
      const building = await prisma.building.findUnique({
        where: { id },
        include: { apartments: true }
      });

      if (!building) {
        return res.status(404).json({
          status: 'error',
          message: 'Building not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: building
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if building exists
      const building = await prisma.building.findUnique({
        where: { id }
      });

      if (!building) {
        return res.status(404).json({
          status: 'error',
          message: 'Building not found'
        });
      }

      // Check if number is being updated and already exists
      if (updateData.number && updateData.number !== building.number) {
        const existing = await prisma.building.findFirst({
          where: {
            number: updateData.number
          }
        });

        if (existing) {
          return res.status(400).json({
            status: 'error',
            message: 'Building with this number already exists'
          });
        }
      }

      const updated = await prisma.building.update({
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

      // Check if building exists
      const building = await prisma.building.findUnique({
        where: { id }
      });

      if (!building) {
        return res.status(404).json({
          status: 'error',
          message: 'Building not found'
        });
      }

      await prisma.building.delete({
        where: { id }
      });

      res.status(200).json({
        status: 'success',
        message: 'Building deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new BuildingsController();