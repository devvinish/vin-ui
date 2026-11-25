"use client";

import * as React from "react";
import { Checkbox } from "./checkbox";
import { Pagination } from "./pagination";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

/*
 * VinUI · Data Table (React). API: spec/data-table.json.
 * A Table with sorting, a filter box, row selection and paging, all on the client:
 *   <DataTable label="Invoices" data={invoices} rowKey="id" columns={[{ key: "id", header: "Invoice" }, …]}
 *              selectable filterable pageSize={5} />
 * Every row stays in the DOM (rows on other pages are hidden), the same as the HTML version,
 * so it suits up to a few hundred rows. For more, page on the server and pass one page at a time.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type SortDirection = "ascending" | "descending";
export type DataTableColumn<T> = {
  /** The field this column shows. */
  key: string;
  header: React.ReactNode;
  /** Render the cell. Default: the field's value. */
  cell?: (row: T) => React.ReactNode;
  /** Value used for sorting. Default: the field's value. */
  sortValue?: (row: T) => string | number;
  /** Text the filter searches. Default: the field's value as text. */
  filterValue?: (row: T) => string;
  /** Default true. */
  sortable?: boolean;
  /** Right-align, same-width digits. */
  numeric?: boolean;
};

export type DataTableProps<T extends object> = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
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
  onSelectionChange?: (keys: (string | number)[]) => void;
  /** A filter box above the table. */
  filterable?: boolean;
  /** The filter box's name. Default: "Filter " + label in lower case. */
  filterLabel?: string;
  filterPlaceholder?: string;
  defaultSort?: { key: string; direction: SortDirection };
  /** Name of a row's checkbox. Default: "Select " + the first column's value. */
  rowLabel?: (row: T) => string;
  /** Shown when the filter matches nothing. */
  emptyText?: React.ReactNode;
};

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const SortIcon = () => <svg {...svg}><path d="m8 9 4-4 4 4" /><path d="m16 15-4 4-4-4" /></svg>;
const SearchIcon = () => <svg {...svg}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
const compare = (a: unknown, b: unknown) =>
  typeof a === "number" && typeof b === "number" ? a - b : collator.compare(String(a ?? ""), String(b ?? ""));

/** "2 of 12 selected", "Showing 1–5 of 12" or "12 rows": the same words as vinui.js. */
export function dataTableStatus({ selected, total, from, to, selectable }: { selected: number; total: number; from: number; to: number; selectable: boolean }) {
  if (selectable) return `${selected} of ${total} selected`;
  if (to - from + 1 < total) return `Showing ${from}–${to} of ${total}`;
  return `${total} ${total === 1 ? "row" : "rows"}`;
}

export function DataTable<T extends object>({
  columns, data, rowKey, label, pageSize = 0, selectable = false, defaultSelected, onSelectionChange,
  filterable = false, filterLabel, filterPlaceholder, defaultSort, rowLabel, emptyText = "No results.", className, ...rest
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState(defaultSort);
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<string | number>>(() => new Set(defaultSelected));
  if (isDev() && !label) console.warn("VinUI DataTable: pass a label, e.g. label=\"Invoices\".");

  const keyOf = (row: T) => (typeof rowKey === "function" ? rowKey(row) : (row[rowKey] as string | number));
  const field = (row: T, key: string) => (row as Record<string, unknown>)[key];
  const colByKey = (key: string) => columns.find((c) => c.key === key);

  const sorted = React.useMemo(() => {
    const rows = data.map((row, i) => ({ row, i }));
    const col = sort && colByKey(sort.key);
    if (col) {
      const value = (row: T) => (col.sortValue ? col.sortValue(row) : field(row, col.key));
      const dir = sort!.direction === "ascending" ? 1 : -1;
      rows.sort((a, b) => compare(value(a.row), value(b.row)) * dir || a.i - b.i);
    }
    return rows.map((r) => r.row);
  }, [data, sort, columns]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = query.trim().toLowerCase();
  const matches = (row: T) => !q || columns.some((c) => (c.filterValue ? c.filterValue(row) : String(field(row, c.key) ?? "")).toLowerCase().includes(q));
  const shown = sorted.filter(matches);
  const pages = pageSize > 0 ? Math.max(1, Math.ceil(shown.length / pageSize)) : 1;
  const current = Math.min(page, pages);
  const start = pageSize > 0 ? (current - 1) * pageSize : 0;
  const end = pageSize > 0 ? start + pageSize : shown.length;
  const onPage = new Set(shown.slice(start, end));

  const update = (next: Set<string | number>) => { setSelected(next); onSelectionChange?.([...next]); };
  const shownKeys = shown.map(keyOf);
  const picked = shownKeys.filter((k) => selected.has(k)).length;
  const allOn = shownKeys.length > 0 && picked === shownKeys.length;
  const toggleAll = () => {
    const next = new Set(selected);
    for (const k of shownKeys) { if (allOn) next.delete(k); else next.add(k); }
    update(next);
  };
  const toggle = (k: string | number) => {
    const next = new Set(selected);
    if (next.has(k)) next.delete(k); else next.add(k);
    update(next);
  };
  const sortBy = (key: string) => {
    setSort((s) => ({ key, direction: s?.key === key && s.direction === "ascending" ? "descending" : "ascending" }));
  };

  const colSpan = columns.length + (selectable ? 1 : 0);
  const status = dataTableStatus({ selected: data.filter((r) => selected.has(keyOf(r))).length, total: data.length, from: shown.length ? start + 1 : 0, to: Math.min(end, shown.length), selectable });
  const showFooter = selectable || pageSize > 0;

  return (
    <div {...rest} className={cx("vin-data-table", className)}>
      {filterable && (
        <div className="vin-data-table__toolbar">
          <div className="vin-input vin-input-group vin-data-table__search">
            <span className="vin-input-group__addon"><SearchIcon /></span>
            <input
              type="search"
              className="vin-input-group__input"
              placeholder={filterPlaceholder ?? "Filter…"}
              aria-label={filterLabel ?? `Filter ${label.toLowerCase()}`}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      )}
      <div className="vin-table-wrap" role="region" aria-label={label} tabIndex={0}>
        <table className="vin-table">
          <thead>
            <tr>
              {selectable && (
                <th scope="col" className="vin-data-table__select">
                  <Checkbox aria-label="Select all rows" checked={allOn} indeterminate={picked > 0 && !allOn} onChange={toggleAll} />
                </th>
              )}
              {columns.map((c) => {
                const dir = sort?.key === c.key ? sort.direction : undefined;
                return (
                  <th key={c.key} scope="col" className={c.numeric ? "vin-table__num" : undefined} aria-sort={dir}>
                    {c.sortable === false ? c.header : (
                      <button type="button" className="vin-data-table__sort" onClick={() => sortBy(c.key)}>
                        {c.header}<SortIcon />
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const k = keyOf(row);
              const on = selected.has(k);
              return (
                <tr key={k} hidden={!onPage.has(row) || undefined} data-selected={on ? "" : undefined}>
                  {selectable && (
                    <td className="vin-data-table__select">
                      <Checkbox aria-label={rowLabel ? rowLabel(row) : `Select ${String(field(row, columns[0]?.key) ?? k)}`} checked={on} onChange={() => toggle(k)} />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={c.numeric ? "vin-table__num" : undefined}>
                      {c.cell ? c.cell(row) : String(field(row, c.key) ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
            {shown.length === 0 && (
              <tr className="vin-data-table__empty"><td colSpan={colSpan}>{emptyText}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {showFooter && (
        <div className="vin-data-table__footer">
          <p className="vin-data-table__status" aria-live="polite">{status}</p>
          {pageSize > 0 && <Pagination simple page={current} count={pages} onPageChange={setPage} />}
        </div>
      )}
    </div>
  );
}
