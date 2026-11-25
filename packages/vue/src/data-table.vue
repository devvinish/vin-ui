<script lang="ts">
/*
 * VinUI · Data Table (Vue). API: spec/data-table.json. Needs checkbox.vue and pagination.vue next to it.
 * A Table with sorting, a filter box, row selection and paging, all on the client:
 *   <DataTable label="Invoices" :data="invoices" row-key="id" :columns="[{ key: 'id', header: 'Invoice' }, …]"
 *              selectable filterable :page-size="5">
 *     <template #cell-status="{ row }"><Badge>{{ row.status }}</Badge></template>
 *   </DataTable>
 * Every row stays in the DOM (rows on other pages are hidden), the same as the HTML version,
 * so it suits up to a few hundred rows. For more, page on the server and pass one page at a time.
 */
import { computed, ref } from "vue";
import Checkbox from "./checkbox.vue";
import Pagination from "./pagination.vue";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

export type SortDirection = "ascending" | "descending";
export type DataTableColumn<T> = {
  /** The field this column shows. */
  key: string;
  header: string;
  /** The cell's text. Default: the field's value. For markup, use the #cell-<key> slot. */
  cell?: (row: T) => string;
  /** Value used for sorting. Default: the field's value. */
  sortValue?: (row: T) => string | number;
  /** Text the filter searches. Default: the field's value as text. */
  filterValue?: (row: T) => string;
  /** Default true. */
  sortable?: boolean;
  /** Right-align, same-width digits. */
  numeric?: boolean;
};

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
const compare = (a: unknown, b: unknown) =>
  typeof a === "number" && typeof b === "number" ? a - b : collator.compare(String(a ?? ""), String(b ?? ""));

/** "2 of 12 selected", "Showing 1–5 of 12" or "12 rows": the same words as vinui.js. */
export function dataTableStatus({ selected, total, from, to, selectable }: { selected: number; total: number; from: number; to: number; selectable: boolean }) {
  if (selectable) return `${selected} of ${total} selected`;
  if (to - from + 1 < total) return `Showing ${from}–${to} of ${total}`;
  return `${total} ${total === 1 ? "row" : "rows"}`;
}

const field = (row: object, key: string) => (row as Record<string, unknown>)[key];
</script>

<script setup lang="ts" generic="T extends object">
const props = withDefaults(defineProps<{
  columns: DataTableColumn<T>[];
  data: T[];
  /** A field (or function) that identifies each row. */
  rowKey: keyof T | ((row: T) => string | number);
  /** Names the table's scrolling region, e.g. "Invoices". */
  label: string;
  /** Rows per page. 0 shows every row. Default 0. */
  pageSize?: number;
  /** Checkboxes to select rows, with "select all" in the header. */
  selectable?: boolean;
  /** Rows selected at first. */
  defaultSelected?: (string | number)[];
  /** A filter box above the table. */
  filterable?: boolean;
  /** The filter box's name. Default: "Filter " + label in lower case. */
  filterLabel?: string;
  filterPlaceholder?: string;
  defaultSort?: { key: string; direction: SortDirection };
  /** Name of a row's checkbox. Default: "Select " + the first column's value. */
  rowLabel?: (row: T) => string;
  /** Shown when the filter matches nothing. Or use the #empty slot. */
  emptyText?: string;
}>(), { pageSize: 0, emptyText: "No results." });

const emit = defineEmits<{ "selection-change": [keys: (string | number)[]] }>();
defineSlots<{ [K in `cell-${string}`]?: (props: { row: T }) => unknown } & { empty?(): unknown }>();

if (isDev() && !props.label) console.warn('VinUI DataTable: pass a label, e.g. label="Invoices".');

const sort = ref(props.defaultSort);
const query = ref("");
const page = ref(1);
const selected = ref(new Set<string | number>(props.defaultSelected));

const keyOf = (row: T) => (typeof props.rowKey === "function" ? props.rowKey(row) : (row[props.rowKey] as string | number));

const sorted = computed(() => {
  const rows = props.data.map((row, i) => ({ row, i }));
  const s = sort.value;
  const col = s && props.columns.find((c) => c.key === s.key);
  if (col) {
    const value = (row: T) => (col.sortValue ? col.sortValue(row) : field(row, col.key));
    const dir = s!.direction === "ascending" ? 1 : -1;
    rows.sort((a, b) => compare(value(a.row), value(b.row)) * dir || a.i - b.i);
  }
  return rows.map((r) => r.row);
});
const shown = computed(() => {
  const q = query.value.trim().toLowerCase();
  return sorted.value.filter((row) =>
    !q || props.columns.some((c) => (c.filterValue ? c.filterValue(row) : String(field(row, c.key) ?? "")).toLowerCase().includes(q)));
});
const pages = computed(() => (props.pageSize > 0 ? Math.max(1, Math.ceil(shown.value.length / props.pageSize)) : 1));
const current = computed(() => Math.min(page.value, pages.value));
const start = computed(() => (props.pageSize > 0 ? (current.value - 1) * props.pageSize : 0));
const end = computed(() => (props.pageSize > 0 ? start.value + props.pageSize : shown.value.length));
const onPage = computed(() => new Set(shown.value.slice(start.value, end.value)));

const shownKeys = computed(() => shown.value.map(keyOf));
const picked = computed(() => shownKeys.value.filter((k) => selected.value.has(k)).length);
const allOn = computed(() => shownKeys.value.length > 0 && picked.value === shownKeys.value.length);

function update(next: Set<string | number>) { selected.value = next; emit("selection-change", [...next]); }
function toggleAll() {
  const next = new Set(selected.value);
  for (const k of shownKeys.value) { if (allOn.value) next.delete(k); else next.add(k); }
  update(next);
}
function toggle(k: string | number) {
  const next = new Set(selected.value);
  if (next.has(k)) next.delete(k); else next.add(k);
  update(next);
}
function sortBy(key: string) {
  const s = sort.value;
  sort.value = { key, direction: s?.key === key && s.direction === "ascending" ? "descending" : "ascending" };
}
function onFilter(e: Event) { query.value = (e.target as HTMLInputElement).value; page.value = 1; }

const colSpan = computed(() => props.columns.length + (props.selectable ? 1 : 0));
const status = computed(() => dataTableStatus({
  selected: props.data.filter((r) => selected.value.has(keyOf(r))).length,
  total: props.data.length,
  from: shown.value.length ? start.value + 1 : 0,
  to: Math.min(end.value, shown.value.length),
  selectable: props.selectable,
}));
const rowCheckLabel = (row: T) => (props.rowLabel ? props.rowLabel(row) : `Select ${String(field(row, props.columns[0]?.key) ?? keyOf(row))}`);
const cellText = (c: DataTableColumn<T>, row: T) => (c.cell ? c.cell(row) : String(field(row, c.key) ?? ""));
const sortOf = (key: string) => (sort.value?.key === key ? sort.value.direction : undefined);
</script>

<template>
  <div class="vin-data-table">
    <div v-if="filterable" class="vin-data-table__toolbar">
      <div class="vin-input vin-input-group vin-data-table__search">
        <span class="vin-input-group__addon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        </span>
        <input
          type="search"
          class="vin-input-group__input"
          :placeholder="filterPlaceholder ?? 'Filter…'"
          :aria-label="filterLabel ?? `Filter ${label.toLowerCase()}`"
          :value="query"
          @input="onFilter"
        />
      </div>
    </div>
    <div class="vin-table-wrap" role="region" :aria-label="label" tabindex="0">
      <table class="vin-table">
        <thead>
          <tr>
            <th v-if="selectable" scope="col" class="vin-data-table__select">
              <Checkbox aria-label="Select all rows" :model-value="allOn" :indeterminate="picked > 0 && !allOn" @update:model-value="toggleAll" />
            </th>
            <th v-for="c in columns" :key="c.key" scope="col" :class="c.numeric ? 'vin-table__num' : undefined" :aria-sort="sortOf(c.key)">
              <template v-if="c.sortable === false">{{ c.header }}</template>
              <button v-else type="button" class="vin-data-table__sort" @click="sortBy(c.key)">
                {{ c.header }}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 9 4-4 4 4" /><path d="m16 15-4 4-4-4" /></svg>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in sorted"
            :key="keyOf(row)"
            :hidden="!onPage.has(row) || undefined"
            :data-selected="selected.has(keyOf(row)) ? '' : undefined"
          >
            <td v-if="selectable" class="vin-data-table__select">
              <Checkbox :aria-label="rowCheckLabel(row)" :model-value="selected.has(keyOf(row))" @update:model-value="toggle(keyOf(row))" />
            </td>
            <td v-for="c in columns" :key="c.key" :class="c.numeric ? 'vin-table__num' : undefined">
              <slot :name="`cell-${c.key}`" :row="row">{{ cellText(c, row) }}</slot>
            </td>
          </tr>
          <tr v-if="shown.length === 0" class="vin-data-table__empty">
            <td :colspan="colSpan"><slot name="empty">{{ emptyText }}</slot></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="selectable || pageSize > 0" class="vin-data-table__footer">
      <p class="vin-data-table__status" aria-live="polite">{{ status }}</p>
      <Pagination v-if="pageSize > 0" simple :page="current" :count="pages" @update:page="page = $event" />
    </div>
  </div>
</template>
