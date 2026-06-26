const prisma = require('../../config/db');

class VisitorsController {
  create = async (req, res, next) => {
    try {
      const residentId = req.user.residentId;
      if (!residentId) {
        return res.status(403).json({
          status: 'error',
          message: 'Only residents can pre-register visitors'
        });
      }

      const { name, phone, visitDate } = req.body;

      const visitor = await prisma.visitor.create({
        data: {
          residentId,
          name,
          phone,
          visitDate: new Date(visitDate)
        },
        include: {
          resident: {
            select: {
              phone: true,
              apartment: {
                select: {
                  number: true,
                  building: { select: { number: true } }
                }
              },
              user: { select: { email: true } }
            }
          }
        }
      });

      res.status(201).json({
        status: 'success',
        data: visitor
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { search, status } = req.query;

      const skip = (page - 1) * limit;
      const where = {};

      // Residents can only see their own visitor lists
      if (req.user.role === 'RESIDENT') {
        where.residentId = req.user.residentId;
      }

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          {
            resident: {
              OR: [
                { phone: { contains: search, mode: 'insensitive' } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { apartment: { number: { contains: search, mode: 'insensitive' } } }
              ]
            }
          }
        ];
      }

      const [total, data] = await prisma.$transaction([
        prisma.visitor.count({ where }),
        prisma.visitor.findMany({
          where,
          skip,
          take: limit,
          include: {
            resident: {
              select: {
                phone: true,
                apartment: {
                  select: {
                    number: true,
                    building: { select: { number: true } }
                  }
                },
                user: { select: { email: true } }
              }
            }
          },
          orderBy: { visitDate: 'desc' }
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

      const visitor = await prisma.visitor.findUnique({
        where: { id },
        include: {
          resident: {
            select: {
              phone: true,
              apartment: true,
              user: { select: { email: true } }
            }
          }
        }
      });

      if (!visitor) {
        return res.status(404).json({
          status: 'error',
          message: 'Visitor not found'
        });
      }

      // Verify resident owns this visitor pre-registration
      if (req.user.role === 'RESIDENT' && visitor.residentId !== req.user.residentId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to view this visitor details'
        });
      }

      res.status(200).json({
        status: 'success',
        data: visitor
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Check if visitor exists
      const visitor = await prisma.visitor.findUnique({
        where: { id }
      });

      if (!visitor) {
        return res.status(404).json({
          status: 'error',
          message: 'Visitor not found'
        });
      }

      const updated = await prisma.visitor.update({
        where: { id },
        data: { status }
      });

      res.status(200).json({
        status: 'success',
        message: `Visitor status updated to ${status} successfully`,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new VisitorsController();