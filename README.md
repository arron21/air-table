# AirTable

The goal of Air Table is to provide a simple yet configurable data table that uses the most modern angular features

## Features

- Modern Angular 20 standalone component using signals and new template syntax (@for/@if)
- Strongly-typed column definitions (`key`, `header`, `sortable`, `filterable`, `cellTemplate`)
- Internal sorting (asc/desc/none), including Date and numeric handling
- Global search (internal) across all visible columns
- External controls support:
  - External search query via input
  - External filter function `(row: T) => boolean`
  - "Apply" pattern example (pending vs applied state)
- Row selection:
  - Selection modes: `none`, `single`, `multiple`
  - Header select-all with indeterminate state (multiple mode)
  - Select/Deselect All buttons above the table
  - Emits `selectionChange` with selected rows
  - Controlled selection via `selectedRows` and custom `rowIdentifier`
  - Selection count: "X of Y selected" (current selected vs total rows)
- Column visibility:
  - Column picker dropdown to toggle column visibility
  - Table renders only `visibleColumns()`; empty state colspans adjust accordingly
- Custom cell templates per column via `cellTemplate`
- Nested property access for column keys (e.g., `user.profile.name`)
- Responsive, accessible UI with keyboard/focus-friendly controls
- Example data and multiple demos in `App` (internal controls, external controls, apply-button pattern, selection)
