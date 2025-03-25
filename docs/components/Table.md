# Table Component

*Last Updated: March 25, 2025*


## Overview

The Table component provides a set of accessible, styled table elements for displaying structured data. It follows a compositional approach where you can combine different table sub-components (TableHeader, TableBody, TableRow, etc.) to create customized table layouts while maintaining consistent styling and accessibility.

## Table of Contents

- [Component API](#component-api)
- [Example Usage](#example-usage)
- [Dependencies](#dependencies)
- [Component Structure](#component-structure)
- [Accessibility](#accessibility)
- [Best Practices](#best-practices)
- [Related Components](#related-components)
- [Changelog](#changelog)

## Component API

The Table component is a composition of multiple sub-components:

### Table

The root table component.

```tsx
<Table className="optional-custom-class">{/* Table content */}</Table>
```

### TableHeader

Container for table header rows.

```tsx
<TableHeader>{/* Header rows */}</TableHeader>
```

### TableBody

Container for table data rows.

```tsx
<TableBody>{/* Data rows */}</TableBody>
```

### TableFooter

Optional container for footer rows.

```tsx
<TableFooter>{/* Footer rows */}</TableFooter>
```

### TableRow

Represents a table row.

```tsx
<TableRow>{/* Row cells */}</TableRow>
```

### TableHead

Represents a header cell.

```tsx
<TableHead>Item Name</TableHead>
```

### TableCell

Represents a standard data cell.

```tsx
<TableCell>Cell content</TableCell>
```

### TableCaption

Provides a caption for the table.

```tsx
<TableCaption>Table of user data</TableCaption>
```

## Example Usage

### Basic Usage

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function UserTable({ users }) {
  return (
    <Table>
      <TableCaption>A list of users and their details.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell className="text-right">
              <button>Edit</button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### With Pagination

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { useState } from 'react';

function PaginatedTable({ data, pageSize = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);

  // Get current page items
  const currentItems = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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

### With Sorting

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

function SortableTable({ data }) {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = field => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead onClick={() => handleSort('id')} className="cursor-pointer">
            <div className="flex items-center">
              ID <SortIcon field="id" />
            </div>
          </TableHead>
          <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
            <div className="flex items-center">
              Name <SortIcon field="name" />
            </div>
          </TableHead>
          <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
            <div className="flex items-center">
              Status <SortIcon field="status" />
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map(item => (
          <TableRow key={item.id}>
            <TableCell>{item.id}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Dependencies

The Table component has minimal dependencies:

- React (with forwardRef)
- cn utility function from '@/lib/utils' for class name handling

## Component Structure

The Table component uses a compositional pattern where individual sub-components are defined and exported separately:

1. **Root Component Structure**:

   - `<Table>` - The main container, rendered as a `<table>` element
   - `<TableHeader>` - Rendered as a `<thead>` element
   - `<TableBody>` - Rendered as a `<tbody>` element
   - `<TableFooter>` - Rendered as a `<tfoot>` element
   - `<TableRow>` - Rendered as a `<tr>` element
   - `<TableHead>` - Rendered as a `<th>` element
   - `<TableCell>` - Rendered as a `<td>` element
   - `<TableCaption>` - Rendered as a `<caption>` element

2. **Component Composition**:
   These components can be composed together to create tables with different structures while maintaining consistent styling and accessibility.

## Accessibility

The Table component follows best practices for table accessibility:

1. **Semantic HTML**: Uses appropriate HTML table elements (`<table>`, `<thead>`, `<tbody>`, etc.)

2. **Captions**: Provides a `<TableCaption>` component for describing the table content

3. **Header Cells**: Uses `<th>` elements for column headers with appropriate scope attributes

4. **Row/Column Relationships**: Maintains proper relationships between headers and data cells

5. **Keyboard Navigation**: Supports native keyboard navigation between cells

6. **Screen Reader Support**: Uses semantic markup that works well with screen readers

## Best Practices

1. **Use Appropriate Components**:

   - `<TableHead>` for column headers
   - `<TableCell>` for data cells
   - `<TableCaption>` for table descriptions

2. **Responsive Design**:

   - Consider horizontal scrolling for tables on small screens
   - Use `className` prop to apply responsive utility classes
   - Consider collapsing or restructuring tables on mobile

3. **Data Handling**:

   - Include loading states for asynchronous data
   - Handle empty states appropriately
   - Consider pagination for large datasets

4. **Styling**:

   - Use the `className` prop on individual components for custom styling
   - Maintain consistent alignment and spacing
   - Use zebra striping or hover effects for readability

5. **Interactive Tables**:
   - Add sorting functionality when appropriate
   - Include row selection when needed
   - Ensure interactive elements have appropriate affordances

## Related Components

- [Pagination Component](/docs/components/Pagination.md) - For paginating through large datasets
- [Select Component](/docs/components/Select.md) - For row selection or filtering options
- [Button Component](/docs/components/Button.md) - For actions within table cells
- [Badge Component](/docs/components/Badge.md) - For displaying status indicators

## Changelog

| Version | Date       | Changes                                   |
| ------- | ---------- | ----------------------------------------- |
| 1.0.0   | 2024-03-19 | Initial implementation of Table component |
