 //Importar pdfMake y fuentes
//  import pdfMake from 'pdfmake/build/pdfmake';
//  import pdfFonts from 'pdfmake/build/vfs_fonts';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// // // Usar la configuración de fuentes proporcionada por pdfmake
//  const vfs = pdfFonts.pdfMake.vfs;
//  pdfMake.vfs = vfs; // Intentar asignar usando una función si está disponible

(<any>pdfMake).addVirtualFileSystem(pdfFonts);

 export function createPdf(docDefinition: any) {
   return pdfMake.createPdf(docDefinition);
 }
