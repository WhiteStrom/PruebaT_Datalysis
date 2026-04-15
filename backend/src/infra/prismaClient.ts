import { PrismaClient } from '@prisma/client';

// Prisma client (Completos)
const prisma = new PrismaClient({// Se define el cliente Prisma
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],// Se define el log
});
// OJO recuerdar por si acaso : Es la instancia central de conexión a la base de datos usando Prisma: 
// crea y configura el cliente que gestiona el pool de conexiones y permite ejecutar queries desde todo el backend 
// como un singleton reutilizable; además, la opción log solo habilita el registro de advertencias y errores en consola 
// según el entorno

// Exportacion del cliente Prisma
export default prisma;
