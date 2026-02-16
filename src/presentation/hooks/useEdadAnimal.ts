export interface EdadFormateada {
    dias: number;
    meses: number;
    años: number;
    texto: string;
    textoCompleto: string;
  }
  
  export function useEdadAnimal() {
    const calcularEdad = (fechaNacimiento: Date): EdadFormateada => {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      
      // Calcular diferencia en milisegundos
      const diffMs = hoy.getTime() - nacimiento.getTime();
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      // Cálculos precisos
      let años = hoy.getFullYear() - nacimiento.getFullYear();
      let meses = hoy.getMonth() - nacimiento.getMonth();
      let dias = hoy.getDate() - nacimiento.getDate();
      
      // Ajustar si el día actual es menor al día de nacimiento
      if (dias < 0) {
        meses--;
        const ultimoMes = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
        dias += ultimoMes.getDate();
      }
      
      // Ajustar si los meses son negativos
      if (meses < 0) {
        años--;
        meses += 12;
      }
      
      // Generar textos formateados
      let texto = '';
      if (años > 0) {
        texto = `${años} ${años === 1 ? 'año' : 'años'}`;
        if (meses > 0) {
          texto += ` ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
        }
      } else if (meses > 0) {
        texto = `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
        if (dias > 0) {
          texto += ` ${dias} ${dias === 1 ? 'día' : 'días'}`;
        }
      } else {
        texto = `${dias} ${dias === 1 ? 'día' : 'días'}`;
      }
      
      // Texto completo
      const partes = [];
      if (años > 0) partes.push(`${años} ${años === 1 ? 'año' : 'años'}`);
      if (meses > 0) partes.push(`${meses} ${meses === 1 ? 'mes' : 'meses'}`);
      if (dias > 0 && años === 0) partes.push(`${dias} ${dias === 1 ? 'día' : 'días'}`);
      
      return {
        dias: diffDias,
        meses: años * 12 + meses,
        años,
        texto,
        textoCompleto: partes.join(', ')
      };
    };
  
    const formatearEdadCorta = (fechaNacimiento: Date): string => {
      const { texto } = calcularEdad(fechaNacimiento);
      return texto;
    };
  
    const formatearEdadCompleta = (fechaNacimiento: Date): string => {
      const { textoCompleto } = calcularEdad(fechaNacimiento);
      return textoCompleto;
    };
  
    return {
      calcularEdad,
      formatearEdadCorta,
      formatearEdadCompleta,
    };
  }