# Pagination Component

## Overview

The Pagination component provides an accessible and user-friendly interface for navigating through large sets of data or content that has been divided into separate pages. It includes intuitive controls for moving between pages and visual indicators of the current position within the total set.

## Table of Contents

- [Props](#props)
- [Example Usage](#example-usage)
- [Dependencies](#dependencies)
- [Component Structure](#component-structure)
- [Accessibility](#accessibility)
- [Best Practices](#best-practices)
- [Related Components](#related-components)
- [Changelog](#changelog)

## Props

| Prop         | Type                   | Required | Default | Description                                               |
| ------------ | ---------------------- | -------- | ------- | --------------------------------------------------------- |
| currentPage  | number                 | Yes      | -       | The current active page number (1-based)                  |
| totalPages   | number                 | Yes      | -       | Total number of pages available                           |
| onPageChange | (page: number) => void | Yes      | -       | Callback function triggered when a page button is clicked |
| className    | string                 | No       | ''      | Additional CSS class names to apply to the root element   |

## Example Usage

### Basic Usage

```tsx
import { Pagination } from '@/components/ui/pagination';
import { useState } from 'react';

function PaginatedContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  // Function to handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Load data for the selected page
    loadData(page);
  };

  return (
    <div>
      {/* Your paginated content here */}
      <div className="my-content">Page {currentPage} content</div>

      {/* Pagination controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
```

### With Custom Styling

```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  className="my-8 flex justify-end"
/>
```

### In Admin Tables

```tsx
function AdminTable({ data, pageSize = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);

  // Get current page items
  const currentItems = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <table className="w-full">
        {/* Table header */}
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>

        {/* Table body with current page items */}
        <tbody>
          {currentItems.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls at the bottom */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
```

## Dependencies

The Pagination component depends on:

- UI Components:
  - Button from '@/components/ui/button'
- Icons:
  - ChevronLeft, ChevronRight, MoreHorizontal (from lucide-react)
- Utilities:
  - cn function from '@/lib/utils' (for conditional class name merging)

## Component Structure

The Pagination component is structured as follows:

1. **Container** - Flex container that holds all pagination elements

2. **Navigation Buttons**:

   - Previous page button (left chevron)
   - Next page button (right chevron)

3. **Page Indicators**:

   - First page (always visible)
   - Ellipsis indicators for skipped pages
   - Page numbers around the current page
   - Last page (always visible when there's more than one page)

4. **Current Page Highlight** - Visual indication of the currently active page

## Accessibility

The Pagination component implements several accessibility features:

1. **Keyboard Navigation** - All buttons are focusable and can be activated using the keyboard

2. **Screen Reader Support**:

   - Each button includes proper aria labels
   - Previous/Next buttons have "sr-only" text describing their purpose
   - Page buttons include screen reader text indicating the page number

3. **Disabled States** - The Previous button is disabled when on the first page, and the Next button is disabled when on the last page

4. **Focus Management** - The current page button has a distinctive visual style and is marked as the current page

## Best Practices

1. **Server-Side Implementation**:

   - For large datasets, implement server-side pagination rather than client-side
   - Pass the total number of pages from your data source
   - Update URL parameters when page changes to support browser history and direct links

2. **Responsive Design**:

   - The component is designed to be responsive on all screen sizes
   - On very small screens, consider using a simplified version with fewer page numbers

3. **Performance**:

   - The component efficiently generates page numbers to display without unnecessarily rendering all pages
   - For very large numbers of pages, the ellipsis feature prevents rendering too many page buttons

4. **User Experience**:
   - Always show the first and last page for easy navigation to extremes
   - Use ellipsis to indicate skipped pages
   - Show pages adjacent to the current page for contextual navigation

## Related Components

- [Table Component](/docs/components/Table.md) - Often used with Pagination for data tables
- [Select Component](/docs/components/Select.md) - Can be used alongside Pagination for page size selection
- [DataGrid Component](/docs/components/DataGrid.md) - An advanced data display with built-in pagination

## Changelog

| Version | Date       | Changes                                        |
| ------- | ---------- | ---------------------------------------------- |
| 1.0.0   | 2024-03-19 | Initial implementation of Pagination component |
