# AirTable Copilot Instructions

## Project Overview
This is a modern Angular 20 standalone application showcasing a configurable data table component with comprehensive sorting, filtering, and selection features. The project demonstrates cutting-edge Angular patterns including signals, computed values, and the new control flow syntax.

## Architecture & Key Components

### Core Component: `TableComponent<T>`
- **Location**: `src/app/components/table/`
- **Generic component** supporting any data type via `ColumnDefinition<T>`
- **Dual control modes**: Internal controls (built-in search/filter) vs External controls (parent-managed)
- **Column-specific search**: Dropdown to search across all columns or filter by specific column
- **Selection patterns**: `none`, `single`, `multiple` with controlled/uncontrolled state
- **Column visibility & ordering**: Dynamic show/hide with drag-and-drop reordering in picker dropdown

### Signal-Based State Management
The project exclusively uses Angular signals for state management:
```typescript
// Preferred pattern - signals with computed derived state
protected readonly users = signal(dummyUsers);
protected readonly filteredData = computed(() => /* derivation logic */);
```

### Column Definition Pattern
All table configurations use strongly-typed `ColumnDefinition<T>`:
```typescript
interface ColumnDefinition<T> {
  key: keyof T | string;  // Supports nested properties like 'user.profile.name'
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  cellTemplate?: TemplateRef<{ $implicit: T; column: ColumnDefinition<T> }>;
}
```

## Development Patterns

### Component Structure
- **Standalone components only** - no NgModules
- **Signal inputs/outputs**: Use `input()` and `output()` functions, not decorators
- **OnPush change detection**: Always set `changeDetection: ChangeDetectionStrategy.OnPush`
- **New control flow**: Use `@if`, `@for`, `@switch` instead of structural directives

### External vs Internal Control Pattern
The table supports both control modes:
- **Internal**: Table manages its own search/filter state (`searchQuery` signal)
- **External**: Parent provides `externalSearchQuery` and `externalFilter` inputs
- **Detection**: `isExternalControlActive()` computed determines active mode

### Selection State Management
Follows controlled/uncontrolled pattern:
- **Controlled**: Parent provides `selectedRows` input and handles `selectionChange` output
- **Uncontrolled**: Table manages internal `internalSelectedRows` signal
- **Row identification**: Optional `rowIdentifier` function for complex objects

## Development Workflows

### Running the Application
```bash
npm start              # Development server
npm run build          # Production build
npm test               # Run tests
npm run watch          # Build with file watching
```

### Testing Patterns
The project includes multiple demo sections in `App` component:
- Internal controls demo
- External controls demo
- Apply/reset pattern demo (pending vs applied state)
- Selection mode demos

### Code Style & Conventions
- **Prettier configuration**: 100 char line width, single quotes, Angular HTML parser
- **Signal updates**: Use `set()` and `update()`, never `mutate()`
- **Computed derivations**: Keep pure and predictable
- **Template bindings**: Use `class` and `style` bindings, not `ngClass`/`ngStyle`

## File Organization
```
src/app/
├── app.ts              # Main demo app with usage examples
├── app.html            # Multiple table demo sections
├── components/table/   # Reusable table component
│   ├── table.component.ts
│   ├── table.component.html
│   └── column-definition.ts
└── data/dummy-data.ts  # Sample User interface and data
```

## Integration Points
- **FormsModule**: Required for template-driven forms in search inputs
- **CommonModule**: Standard Angular common directives
- **No external dependencies**: Pure Angular implementation
- **TypeScript strict mode**: Comprehensive type checking enabled

## Common Tasks
- **Adding new column types**: Extend `ColumnDefinition` interface and update `getCellValue()` method
- **Custom cell templates**: Use `cellTemplate` property with `TemplateRef`
- **External filtering**: Implement `(row: T) => boolean` function and pass to `externalFilter`
- **Selection handling**: Listen to `selectionChange` output and manage parent state
- **Column reordering**: Use drag-and-drop in column picker - order persists via `columnOrder` signal
- **Column-specific search**: Set `searchColumn` signal to filter by specific column key

When extending this table component, maintain the signal-based architecture and dual control mode pattern for maximum flexibility.