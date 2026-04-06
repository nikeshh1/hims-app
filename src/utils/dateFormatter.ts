/**
 * Format date to YYYY-MM-DD format, removing any timestamp
 * @param dateString - ISO date string or YYYY-MM-DD format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  // Extract only the date part (YYYY-MM-DD) from ISO timestamp
  // Handles formats like: 2065-03-31T18:30:00.000000Z or 2005-04-01
  const dateMatch = dateString.match(/^(\d{4}-\d{2}-\d{2})/);
  
  if (dateMatch) {
    return dateMatch[1];
  }
  
  return dateString;
};

/**
 * Validate date format is YYYY-MM-DD
 */
export const isValidDateFormat = (dateString: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(dateString);
};

/**
 * Compare two dates (ignoring time)
 * @returns true if date1 < date2
 */
export const isDateBefore = (date1: string, date2: string): boolean => {
  const d1 = new Date(formatDateDisplay(date1));
  const d2 = new Date(formatDateDisplay(date2));
  return d1 < d2;
};
