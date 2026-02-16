/**
 * Utilidades para manejo de fechas
 * VERSIÓN CORREGIDA - Fuerza la fecha local correcta
 */

/**
 * Obtiene la fecha actual en la zona horaria local
 */
export function obtenerFechaActual(): Date {
    const ahora = new Date();
    // Crear fecha usando componentes locales
    return new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
      12, 0, 0
    );
  }
  
  /**
   * Crea una fecha local a partir de string YYYY-MM-DD
   * Versión CORREGIDA que funciona en cualquier zona horaria
   */
  export function crearFechaLocal(fechaStr: string): Date {
    if (!fechaStr) {
      return obtenerFechaActual();
    }
    
    // Split manual y creación con componentes numéricos
    const [year, month, day] = fechaStr.split('-').map(Number);
    
    // Crear fecha a las 12:00 PM (mediodía) para evitar problemas
    // Esto asegura que la fecha no cambie por zona horaria
    const fecha = new Date(year, month - 1, day, 12, 0, 0);
    
    console.log('crearFechaLocal:', {
      input: fechaStr,
      output: fecha.toString(),
      iso: fecha.toISOString(),
      dia: fecha.getDate(),
      mes: fecha.getMonth() + 1,
      año: fecha.getFullYear()
    });
    
    return fecha;
  }
  
  /**
   * Formatea una fecha para input type="date" (YYYY-MM-DD)
   * Usa la fecha local del navegador
   */
  export function formatearFechaParaInput(date: Date = new Date()): string {
    const d = new Date(date);
    // Usar métodos locales en lugar de UTC
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Convierte fecha local a string ISO para Supabase
   * Mantiene la fecha correcta
   */
  export function fechaParaSupabase(date: Date): string {
    const año = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    // Forzar mediodía UTC para mantener la fecha
    return `${año}-${mes}-${dia}T12:00:00.000Z`;
  }
  
  /**
   * Formatea una fecha para mostrar en UI
   */
  export function formatearFechaMostrar(date: Date): string {
    return date.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  /**
   * Verifica si una fecha es hoy en la zona local
   */
  export function esHoy(date: Date): boolean {
    const hoy = obtenerFechaActual();
    return date.getDate() === hoy.getDate() &&
           date.getMonth() === hoy.getMonth() &&
           date.getFullYear() === hoy.getFullYear();
  }