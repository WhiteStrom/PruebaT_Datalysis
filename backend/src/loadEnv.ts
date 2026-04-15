import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

const envCandidates = [
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '..', '..', '.env'),
];//Direcciones de los archivos .env Necesarias para que el backend pueda conectarse a la base de datos

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    config({ path: envPath, override: false });
  }//Si el archivo .env existe, se carga
}
