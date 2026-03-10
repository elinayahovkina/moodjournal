const { PrismaClient } = require("@prisma/client");

// Prisma 7 requires passing options when using the classic engine.
const prisma = new PrismaClient({
  log: ["error"],
});

module.exports = prisma;