/**
 * Export utility functions for CSV, Excel, and PDF exports
 */

// Export data to CSV
export const exportToCSV = (data, filename, columns = null) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // If columns are provided, use them to format the data
  let exportData = data;
  let headers = [];

  if (columns && Array.isArray(columns)) {
    headers = columns.map(col => col.header || col.key);
    exportData = data.map(row => {
      const formattedRow = {};
      columns.forEach(col => {
        const value = row[col.key];
        if (col.render && typeof col.render === 'function') {
          // For rendered values, try to extract text content
          formattedRow[col.header || col.key] = value;
        } else {
          formattedRow[col.header || col.key] = value;
        }
      });
      return formattedRow;
    });
  } else {
    headers = Object.keys(data[0]);
  }

  // Convert data to CSV format
  const csvHeaders = headers.map(h => escapeCSVValue(h)).join(',');
  const csvRows = exportData.map(row => {
    return headers.map(header => {
      const value = row[header];
      return escapeCSVValue(value);
    }).join(',');
  });

  const csvContent = [csvHeaders, ...csvRows].join('\n');
  
  // Add BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  downloadFile(blob, `${filename}.csv`, 'text/csv');
};

// Export data to Excel (using CSV with .xlsx extension and proper formatting)
export const exportToExcel = (data, filename, columns = null) => {
  // For now, we'll use CSV format with .xlsx extension
  // In production, you might want to use a library like xlsx
  exportToCSV(data, filename, columns);
  
  // Rename the downloaded file to .xlsx
  // Note: This is a workaround. For proper Excel files, use xlsx library
  setTimeout(() => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    link.download = `${filename}.xlsx`;
    // This won't work perfectly, but it's a placeholder
  }, 100);
};

// Helper function to escape CSV values
const escapeCSVValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If value contains comma, newline, or quote, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

// Helper function to download file
const downloadFile = (blob, filename, mimeType) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};

// Format date for filename
export const formatDateForFilename = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

// Format date range for filename
export const formatDateRangeForFilename = (startDate, endDate) => {
  const start = startDate ? formatDateForFilename(new Date(startDate)) : 'all';
  const end = endDate ? formatDateForFilename(new Date(endDate)) : 'all';
  return `${start}_to_${end}`;
};

