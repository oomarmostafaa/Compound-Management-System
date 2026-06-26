const prisma = require('../../config/db');

class AnnouncementsController {
  create = async (req, res, next) => {
    try {
      const createdById = req.user.id;
      const { title, content } = req.body;

      const announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          createdById
        },
        include: {
          createdBy: {
            select: { email: true }
          }
        }
      });

      res.status(201).json({
        status: 'success',
        data: announcement
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req, res, next) => {
    try {
      const { sortBy, sortOrder, startDate, endDate } = req.query;

      const where = {};

      // Filter by date range
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setDate(end.getDate() + 1);
          where.createdAt.lt = end;
        }
      }

      // Sorting
      const orderBy = {};
      if (sortBy) {
        orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      const data = await prisma.announcement.findMany({
        where,
        include: {
          createdBy: {
            select: { email: true }
          }
        },
        orderBy
      });

      res.status(200).json({
        status: 'success',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req, res, next) => {
    try {
      const { id } = req.params;

      const announcement = await prisma.announcement.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: { email: true }
          }
        }
      });

      if (!announcement) {
        return res.status(404).json({
          status: 'error',
          message: 'Announcement not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: announcement
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if announcement exists
      const announcement = await prisma.announcement.findUnique({
        where: { id }
      });

      if (!announcement) {
        return res.status(404).json({
          status: 'error',
          message: 'Announcement not found'
        });
      }

      const updated = await prisma.announcement.update({
        where: { id },
        data: updateData,
        include: {
          createdBy: {
            select: { email: true }
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

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if announcement exists
      const announcement = await prisma.announcement.findUnique({
        where: { id }
      });

      if (!announcement) {
        return res.status(404).json({
          status: 'error',
          message: 'Announcement not found'
        });
      }

      await prisma.announcement.delete({
        where: { id }
      });

      res.status(200).json({
        status: 'success',
        message: 'Announcement deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AnnouncementsController();