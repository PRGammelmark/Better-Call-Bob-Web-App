export function getPagination(currentPage, totalPages, delta = 2) {
    // delta = hvor mange sider på hver side af currentPage
    const pages = [];
    const range = [];
  
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
  
    // Første side
    pages.push(1);
  
    // Ellipsis hvis der er et hul før start
    if (start > 2) {
      pages.push("...");
    }
  
    // Midterområdet
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  
    // Ellipsis hvis der er et hul efter end
    if (end < totalPages - 1) {
      pages.push("...");
    }
  
    // Sidste side
    if (totalPages > 1) {
      pages.push(totalPages);
    }
  
    return pages;
  }
  