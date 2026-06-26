const prisma = require('../../config/db');

class DashboardController {
  getStats = async (req, res, next) => {
    try {
      const [
        totalResidents,
        totalStaff,
        totalBuildings,
        totalApartments,
        occupiedApartments,
        emptyApartments,
        openRequests,
        inProgressRequests,
        completedRequests,
        closedRequests
      ] = await prisma.$transaction([
        // Residents (excluding soft deleted)
        prisma.resident.count({ where: { isDeleted: false } }),
        // Staff (excluding soft deleted)
        prisma.staff.count({ where: { isDeleted: false } }),
        // Buildings
        prisma.building.count(),
        // Apartments total
        prisma.apartment.count(),
        // Occupied Apartments
        prisma.apartment.count({ where: { status: 'OCCUPIED' } }),
        // Empty Apartments
        prisma.apartment.count({ where: { status: 'EMPTY' } }),
        // Requests by status
        prisma.request.count({ where: { status: 'OPEN' } }),
        prisma.request.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.request.count({ where: { status: 'COMPLETED' } }),
        prisma.request.count({ where: { status: 'CLOSED' } })
      ]);

      const stats = {
        residents: {
          total: totalResidents
        },
        staff: {
          total: totalStaff
        },
        buildings: {
          total: totalBuildings
        },
        apartments: {
          total: totalApartments,
          occupied: occupiedApartments,
          empty: emptyApartments,
          occupancyRate: totalApartments > 0 ? ((occupiedApartments / totalApartments) * 100).toFixed(1) + '%' : '0%'
        },
        requests: {
          open: openRequests,
          inProgress: inProgressRequests,
          completed: completedRequests,
          closed: closedRequests,
          total: openRequests + inProgressRequests + completedRequests + closedRequests
        }
      };

      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new DashboardController();