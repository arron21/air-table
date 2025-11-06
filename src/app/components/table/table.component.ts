import { Component, computed, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColumnDefinition } from './column-definition';

type SortDirection = 'asc' | 'desc' | null;
type SelectionMode = 'single' | 'multiple' | 'none';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent<T = any> {
  data = input.required<T[]>();
  columns = input.required<ColumnDefinition<T>[]>();
  
  // Selection inputs
  selectionMode = input<SelectionMode>('none');
  rowIdentifier = input<((row: T) => any) | undefined>(undefined);
  selectedRows = input<T[] | undefined>(undefined);
  
  // Selection outputs
  selectionChange = output<T[]>();
  
  // External inputs for parent-controlled filtering
  externalSearchQuery = input<string | undefined>(undefined);
  externalFilter = input<((row: T) => boolean) | undefined>(undefined);

  // Internal search (used when externalSearchQuery is not provided)
  searchQuery = signal<string>('');
  private sortColumn = signal<keyof T | string | null>(null);
  private sortDirection = signal<SortDirection>(null);
  
  // Internal selection state (used when selectedRows is not provided)
  private internalSelectedRows = signal<Set<any>>(new Set());
  
  // Column visibility state
  private columnVisibility = signal<Map<string, boolean>>(new Map());
  protected readonly showColumnPicker = signal<boolean>(false);
  
  // Column order state
  private columnOrder = signal<string[]>([]);
  protected draggedColumnIndex = signal<number | null>(null);
  protected dragOverColumnIndex = signal<number | null>(null);
  
  // Get effective selected rows (external or internal)
  protected readonly effectiveSelectedRows = computed<Set<any>>(() => {
    const external = this.selectedRows();
    if (external !== undefined) {
      const identifier = this.rowIdentifier();
      const set = new Set<any>();
      external.forEach(row => {
        const id = identifier ? identifier(row) : row;
        set.add(id);
      });
      return set;
    }
    return this.internalSelectedRows();
  });

  // Get visible columns
  protected readonly visibleColumns = computed<ColumnDefinition<T>[]>(() => {
    const allColumns = this.columns();
    const visibility = this.columnVisibility();
    const order = this.columnOrder();

    // Apply order if it exists, otherwise use original order
    let orderedColumns = allColumns;
    if (order.length > 0) {
      orderedColumns = [];
      // First add columns in the specified order
      order.forEach(key => {
        const col = allColumns.find(c => String(c.key) === key);
        if (col) {
          orderedColumns.push(col);
        }
      });
      // Then add any columns not in the order list (for newly added columns)
      allColumns.forEach(col => {
        if (!order.includes(String(col.key))) {
          orderedColumns.push(col);
        }
      });
    }
    
    return orderedColumns.filter(col => {
      const isVisible = visibility.get(String(col.key)) ?? true;
      return isVisible;
    });
  });

  filteredAndSortedData = computed(() => {
    let dataArray = this.data();
    
    // Apply external filter if provided
    const externalFilterFn = this.externalFilter();
    if (externalFilterFn) {
      dataArray = dataArray.filter(externalFilterFn);
    }
    
    // Apply search filter (external or internal)
    const externalQuery = this.externalSearchQuery();
    if (externalQuery !== undefined) {
      // Use external search query
      const query = externalQuery.trim().toLowerCase();
      if (query) {
        dataArray = dataArray.filter(row => this.matchesSearch(row, query));
      }
    } else {
      // Use internal search query
      const query = this.searchQuery().trim().toLowerCase();
      if (query) {
        dataArray = dataArray.filter(row => this.matchesSearch(row, query));
      }
    }

    // Apply sorting
    const column = this.sortColumn();
    const direction = this.sortDirection();

    if (!column || !direction) {
      return dataArray;
    }

    return [...dataArray].sort((a, b) => {
      const aValue = this.getNestedValue(a, column);
      const bValue = this.getNestedValue(b, column);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Handle Date objects
      if (aValue instanceof Date && bValue instanceof Date) {
        const diff = aValue.getTime() - bValue.getTime();
        return direction === 'asc' ? diff : -diff;
      }

      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle strings
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  });
  
  constructor() {
    effect(() => {
      const allColumns = this.columns();
      const visibility = this.columnVisibility();
      const order = this.columnOrder();
      console.log(this.visibleColumns());
      
      // Initialize visibility map if needed
      const needsInit = allColumns.some(col => !visibility.has(String(col.key)));
      if (needsInit) {
        const newVisibility = new Map(visibility);
        allColumns.forEach(col => {
          if (!newVisibility.has(String(col.key))) {
            newVisibility.set(String(col.key), true); // Default to visible
          }
        });
        this.columnVisibility.set(newVisibility);
      }
      
      // Initialize column order if needed
      if (order.length === 0 && allColumns.length > 0) {
        this.columnOrder.set(allColumns.map(col => String(col.key)));
      }
    });
  }

  sortIcon(column: ColumnDefinition<T>): string {
    if (this.sortColumn() !== column.key) {
      return '⇅';
    }
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  isSorted(column: ColumnDefinition<T>): boolean {
    return this.sortColumn() === column.key && this.sortDirection() !== null;
  }

  onSort(column: ColumnDefinition<T>): void {
    if (!column.sortable) {
      return;
    }

    const currentColumn = this.sortColumn();
    const currentDirection = this.sortDirection();

    if (currentColumn === column.key) {
      // Cycle through: asc -> desc -> null
      if (currentDirection === 'asc') {
        this.sortDirection.set('desc');
      } else if (currentDirection === 'desc') {
        this.sortColumn.set(null);
        this.sortDirection.set(null);
      }
    } else {
      // New column, start with ascending
      this.sortColumn.set(column.key);
      this.sortDirection.set('asc');
    }
  }

  private getNestedValue(obj: any, path: string | keyof T): any {
    if (typeof path === 'string' && path.includes('.')) {
      return path.split('.').reduce((current, prop) => current?.[prop], obj);
    }
    return obj[path];
  }

  getCellValue(row: T, column: ColumnDefinition<T>): any {
    const value = this.getNestedValue(row, column.key);
    // Format Date objects for display
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return value;
  }

  private matchesSearch(row: T, query: string): boolean {
    // Search across all columns
    return this.columns().some(column => {
      const value = this.getNestedValue(row, column.key);
      if (value === null || value === undefined) {
        return false;
      }
      
      // Convert value to string for searching
      let searchValue: string;
      if (value instanceof Date) {
        searchValue = value.toLocaleDateString().toLowerCase();
      } else {
        searchValue = String(value).toLowerCase();
      }
      
      return searchValue.includes(query);
    });
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  // Computed to determine if external controls are active
  protected readonly isExternalControlActive = computed(() => {
    return this.externalSearchQuery() !== undefined || this.externalFilter() !== undefined;
  });

  // Get effective search query (external or internal)
  protected readonly effectiveSearchQuery = computed(() => {
    const external = this.externalSearchQuery();
    return external !== undefined ? external : this.searchQuery();
  });

  // Selection methods
  protected isRowSelected(row: T): boolean {
    const identifier = this.rowIdentifier();
    const id = identifier ? identifier(row) : row;
    return this.effectiveSelectedRows().has(id);
  }

  protected toggleRowSelection(row: T): void {
    const identifier = this.rowIdentifier();
    const id = identifier ? identifier(row) : row;
    const currentSelected = new Set(this.effectiveSelectedRows());
    
    if (this.selectionMode() === 'single') {
      // Single selection: clear all and select this one
      currentSelected.clear();
      currentSelected.add(id);
    } else {
      // Multiple selection: toggle
      if (currentSelected.has(id)) {
        currentSelected.delete(id);
      } else {
        currentSelected.add(id);
      }
    }
    
    // Update internal state if not externally controlled
    if (this.selectedRows() === undefined) {
      this.internalSelectedRows.set(currentSelected);
    }
    
    // Emit selection change
    this.emitSelectionChange(currentSelected);
  }

  protected toggleSelectAll(): void {
    if (this.selectionMode() !== 'multiple') {
      return;
    }
    
    const currentSelected = new Set(this.effectiveSelectedRows());
    const allRows = this.filteredAndSortedData();
    const identifier = this.rowIdentifier();
    
    // Check if all are selected
    const allSelected = allRows.length > 0 && allRows.every(row => {
      const id = identifier ? identifier(row) : row;
      return currentSelected.has(id);
    });
    
    const newSelected = new Set<any>();
    if (!allSelected) {
      // Select all
      allRows.forEach(row => {
        const id = identifier ? identifier(row) : row;
        newSelected.add(id);
      });
    }
    // If all selected, deselect all (newSelected stays empty)
    
    // Update internal state if not externally controlled
    if (this.selectedRows() === undefined) {
      this.internalSelectedRows.set(newSelected);
    }
    
    // Emit selection change
    this.emitSelectionChange(newSelected);
  }

  protected isAllSelected(): boolean {
    if (this.selectionMode() !== 'multiple') {
      return false;
    }
    
    const allRows = this.filteredAndSortedData();
    if (allRows.length === 0) {
      return false;
    }
    
    const selected = this.effectiveSelectedRows();
    const identifier = this.rowIdentifier();
    
    return allRows.every(row => {
      const id = identifier ? identifier(row) : row;
      return selected.has(id);
    });
  }

  protected isIndeterminate(): boolean {
    if (this.selectionMode() !== 'multiple') {
      return false;
    }
    
    const allRows = this.filteredAndSortedData();
    if (allRows.length === 0) {
      return false;
    }
    
    const selected = this.effectiveSelectedRows();
    const identifier = this.rowIdentifier();
    const selectedCount = allRows.filter(row => {
      const id = identifier ? identifier(row) : row;
      return selected.has(id);
    }).length;
    
    return selectedCount > 0 && selectedCount < allRows.length;
  }

  private emitSelectionChange(selectedIds: Set<any>): void {
    const identifier = this.rowIdentifier();
    const allData = this.data();
    
    // Convert IDs back to rows
    const selectedRows: T[] = [];
    selectedIds.forEach(id => {
      const row = allData.find(r => {
        const rowId = identifier ? identifier(r) : r;
        return rowId === id;
      });
      if (row) {
        selectedRows.push(row);
      }
    });
    
    this.selectionChange.emit(selectedRows);
  }

  protected getRowId(row: T): any {
    const identifier = this.rowIdentifier();
    return identifier ? identifier(row) : row;
  }

  // Get total count of selected rows across all data
  protected readonly totalSelectedCount = computed(() => {
    const selectedIds = this.effectiveSelectedRows();
    const allData = this.data();
    const identifier = this.rowIdentifier();
    
    let count = 0;
    allData.forEach(row => {
      const id = identifier ? identifier(row) : row;
      if (selectedIds.has(id)) {
        count++;
      }
    });
    
    return count;
  });

  protected selectAll(): void {
    if (this.selectionMode() !== 'multiple') {
      return;
    }
    
    const allRows = this.filteredAndSortedData();
    const identifier = this.rowIdentifier();
    const newSelected = new Set<any>();
    
    allRows.forEach(row => {
      const id = identifier ? identifier(row) : row;
      newSelected.add(id);
    });
    
    // Update internal state if not externally controlled
    if (this.selectedRows() === undefined) {
      this.internalSelectedRows.set(newSelected);
    }
    
    // Emit selection change
    this.emitSelectionChange(newSelected);
  }

  protected deselectAll(): void {
    if (this.selectionMode() !== 'multiple') {
      return;
    }
    
    const newSelected = new Set<any>();
    
    // Update internal state if not externally controlled
    if (this.selectedRows() === undefined) {
      this.internalSelectedRows.set(newSelected);
    }
    
    // Emit selection change
    this.emitSelectionChange(newSelected);
  }

  // Column visibility methods
  protected isColumnVisible(columnKey: string | keyof T): boolean {
    const visibility = this.columnVisibility();
    return visibility.get(String(columnKey)) ?? true;
  }

  protected toggleColumnVisibility(columnKey: string | keyof T): void {
    const visibility = new Map(this.columnVisibility());
    const key = String(columnKey);
    const current = visibility.get(key) ?? true;
    visibility.set(key, !current);
    this.columnVisibility.set(visibility);
  }

  protected toggleColumnPicker(): void {
    this.showColumnPicker.set(!this.showColumnPicker());
  }

  protected closeColumnPicker(): void {
    this.showColumnPicker.set(false);
  }

  // Get columns ordered for display in picker
  protected readonly orderedColumns = computed<ColumnDefinition<T>[]>(() => {
    const allColumns = this.columns();
    const order = this.columnOrder();

    if (order.length === 0) {
      return allColumns;
    }

    const ordered: ColumnDefinition<T>[] = [];
    // Add columns in the specified order
    order.forEach(key => {
      const col = allColumns.find(c => String(c.key) === key);
      if (col) {
        ordered.push(col);
      }
    });
    // Add any columns not in the order list
    allColumns.forEach(col => {
      if (!order.includes(String(col.key))) {
        ordered.push(col);
      }
    });

    return ordered;
  });

  // Drag and drop methods for column reordering
  protected onDragStart(event: DragEvent, index: number): void {
    this.draggedColumnIndex.set(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', ''); // Required for Firefox
    }
  }

  protected onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    
    const dragIndex = this.draggedColumnIndex();
    if (dragIndex !== null && dragIndex !== index) {
      this.dragOverColumnIndex.set(index);
    }
  }

  protected onDragEnter(event: DragEvent, index: number): void {
    event.preventDefault();
    const dragIndex = this.draggedColumnIndex();
    if (dragIndex !== null && dragIndex !== index) {
      this.dragOverColumnIndex.set(index);
    }
  }

  protected onDragLeave(event: DragEvent): void {
    // Only clear if we're leaving the container entirely
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (!relatedTarget || !relatedTarget.classList.contains('column-picker-item')) {
      this.dragOverColumnIndex.set(null);
    }
  }

  protected onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();
    const dragIndex = this.draggedColumnIndex();
    
    if (dragIndex === null || dragIndex === dropIndex) {
      this.draggedColumnIndex.set(null);
      this.dragOverColumnIndex.set(null);
      return;
    }

    const currentOrder = [...this.columnOrder()];
    const [movedItem] = currentOrder.splice(dragIndex, 1);
    currentOrder.splice(dropIndex, 0, movedItem);
    
    this.columnOrder.set(currentOrder);
    this.draggedColumnIndex.set(null);
    this.dragOverColumnIndex.set(null);
  }

  protected onDragEnd(): void {
    this.draggedColumnIndex.set(null);
    this.dragOverColumnIndex.set(null);
  }

  protected shouldShowDropIndicator(index: number): 'before' | 'after' | null {
    const dragIndex = this.draggedColumnIndex();
    const overIndex = this.dragOverColumnIndex();
    
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) {
      return null;
    }
    
    // Show indicator based on drag direction
    if (overIndex === index) {
      return dragIndex < overIndex ? 'after' : 'before';
    }
    
    return null;
  }
}
