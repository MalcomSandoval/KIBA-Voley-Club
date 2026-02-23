/**
 * Utilidades para manejo de fechas
 */

/**
 * Convierte una fecha a formato ISO (YYYY-MM-DD) para usar en input type="date"
 * @param dateString - Fecha en cualquier formato o Date object
 * @returns Fecha en formato ISO (YYYY-MM-DD)
 */
export const formatDateToISO = (dateString: string | Date | undefined): string => {
  if (!dateString) return '';
  
  try {
    // Si ya es una fecha en formato ISO, devolver tal cual
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Convertir a objeto Date
    const date = typeof dateString === 'string' 
      ? new Date(dateString)
      : dateString;
    
    // Si la fecha es inválida, retornar vacío
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Obtener año, mes y día con padding de ceros
    // Usar getUTCFullYear, getUTCMonth, getUTCDate para evitar problemas de zona horaria
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date to ISO:', error);
    return '';
  }
};

/**
 * Formatea una fecha para mostrar en interfaz de usuario
 * @param dateString - Fecha en formato ISO o date string
 * @param locale - Locale para el formato (ej: 'es-CO', 'en-US')
 * @returns Fecha formateada legible
 */
export const formatDateDisplay = (dateString: string | undefined, locale: string = 'es-CO'): string => {
  if (!dateString) return 'No especificado';
  
  try {
    // Parsear la fecha ISO manualmente para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Crear una fecha en representación local usando los componentes
    const date = new Date(year, month - 1, day);
    
    // Si la fecha es inválida, retornar mensaje
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date display:', error);
    return 'Fecha inválida';
  }
};

/**
 * Obtiene la edad a partir de una fecha de nacimiento
 * @param birthDate - Fecha de nacimiento en formato ISO
 * @returns Edad en años
 */
export const calculateAge = (birthDate: string | undefined): number | null => {
  if (!birthDate) return null;
  
  try {
    // Parsear la fecha ISO manualmente para evitar problemas de zona horaria
    const [year, month, day] = birthDate.split('-').map(Number);
    
    // Crear fecha de nacimiento en representación local
    const birth = new Date(year, month - 1, day);
    
    // Crear fecha actual en representación local
    const today = new Date();
    
    if (isNaN(birth.getTime())) {
      return null;
    }
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
};
