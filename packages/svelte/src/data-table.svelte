<!--
  VinUI · Data Table (Svelte). API: spec/data-table.json. Needs checkbox.svelte and pagination.svelte.
  A Table with sorting, a filter box, row selection and paging, all on the client:
    <DataTable label="Invoices" data={invoices} rowKey="id" columns={[{ key: "id", header: "Invoice" }, …]}
               selectable filterable pageSize={5} />
  A column's `cell` is a snippet that gets the row. bind:selected and bind:sort work.
  Every row stays in the DOM (rows on other pages are hidden), the same as the HTML version,
  so it suits up to a few hundred rows. For more, page on the server and pass one page at a time.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";

  export type SortDirection = "ascending" | "descending";
  export type DataTableSort = { key: string; direction: SortDirection };
  export type DataTableColumn<T> = {
    /** The field this column shows. */
    key: string;
    header: string | Snippet;
    /** Render the cell. Default: the field's value. */
    cell?: Snippet<[T]>;
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
  const compare = (a: unknown, b: unknown) => (typeof a === "number" && typeof b === "number" ? a - b : collator.compare(String(a ?? ""), String(b ?? "")));

  /** "2 of 12 selected", "Showing 1–5 of 12" or "12 rows": the same words as vinui.js. */
  export function dataTableStatus({ selected, total, from, to, selectable }: { selected: number; total: number; from: number; to: number; selectable: boolean }) {
    if (selectable) return `${selected} of ${total} selected`;
    if (to - from + 1 < total) return `Showing ${from}–${to} of ${total}`;
    return `${total} ${total === 1 ? "row" : "rows"}`;
  }
</script>

<script lang="ts" generics="T extends object">
  import type { HTMLAttributes } from "svelte/elements";
  import Checkbox from "./checkbox.svelte";
  import Pagination from "./pagination.svelte";

  type Key = string | number;
  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    columns: DataTableColumn<T>[];
    data: T[];
    /** A field (or function) that identifies each row. */
    rowKey: keyof T | ((row: T) => Key);
    /** Names the table's scrolling region, e.g. "Invoices". */
    label: string;
    /** Rows per page. 0 shows every row. Default 0. */
    pageSize?: number;
    /** Checkboxes to select rows, with "select all" in the header. */
    selectable?: boolean;
    /** Keys of the selected rows. */
    selected?: Key[];
    onSelectionChange?: (keys: Key[]) => void;
    /** A filter box above the table. */
    filterable?: boolean;
    /** The filter box's name. Default: "Filter " + label in lower case. */
    filterLabel?: string;
    filterPlaceholder?: string;
    sort?: DataTableSort;
    /** Name of a row's checkbox. Default: "Select " + the first column's value. */
    rowLabel?: (row: T) => string;
    /** Shown when the filter matches nothing. */
    emptyText?: string | Snippet;
    class?: string;
  };
  let {
    columns,
    data,
    rowKey,
    label,
    pageSize = 0,
    selectable = false,
    selected = $bindable([]),
    onSelectionChange,
    filterable = false,
    filterLabel,
    filterPlaceholder,
    sort = $bindable(),
    rowLabel,
    emptyText = "No results.",
    class: className,
    ...rest
  }: Props = $props();

  let query = $state("");
  let page = $state(1);

  const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
  const warnIfUnnamed = () => {
    if (isDev() && !label) console.warn('VinUI DataTable: pass a label, e.g. label="Invoices".');
  };
  warnIfUnnamed();

  const keyOf = (row: T): Key => (typeof rowKey === "function" ? rowKey(row) : (row[rowKey] as Key));
  const field = (row: T, key: string) => (row as Record<string, unknown>)[key];

  const sorted = $derived.by(() => {
    const rows = data.map((row, i) => ({ row, i }));
    const s = sort;
    const col = s && columns.find((c) => c.key === s.key);
    if (s && col) {
      const value = (row: T) => (col.sortValue ? col.sortValue(row) : field(row, col.key));
      const dir = s.direction === "ascending" ? 1 : -1;
      rows.sort((a, b) => compare(value(a.row), value(b.row)) * dir || a.i - b.i);
    }
    return rows.map((r) => r.row);
  });

  const q = $derived(query.trim().toLowerCase());
  const shown = $derived(
    sorted.filter((row) => !q || columns.some((c) => (c.filterValue ? c.filterValue(row) : String(field(row, c.key) ?? "")).toLowerCase().includes(q))),
  );
  const pages = $derived(pageSize > 0 ? Math.max(1, Math.ceil(shown.length / pageSize)) : 1);
  const current = $derived(Math.min(page, pages));
  const start = $derived(pageSize > 0 ? (current - 1) * pageSize : 0);
  const end = $derived(pageSize > 0 ? start + pageSize : shown.length);
  const onPage = $derived(new Set(shown.slice(start, end)));

  const chosen = $derived(new Set(selected));
  const shownKeys = $derived(shown.map(keyOf));
  const picked = $derived(shownKeys.filter((k) => chosen.has(k)).length);
  const allOn = $derived(shownKeys.length > 0 && picked === shownKeys.length);

  function update(next: Set<Key>) {
    selected = [...next];
    onSelectionChange?.([...next]);
  }
  function toggleAll() {
    const next = new Set(chosen);
    for (const k of shownKeys) {
      if (allOn) next.delete(k);
      else next.add(k);
    }
    update(next);
  }
  function toggle(k: Key) {
    const next = new Set(chosen);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    update(next);
  }
  function sortBy(key: string) {
    sort = { key, direction: sort?.key === key && sort.direction === "ascending" ? "descending" : "ascending" };
  }

  const colSpan = $derived(columns.length + (selectable ? 1 : 0));
  const status = $derived(
    dataTableStatus({
      selected: data.filter((r) => chosen.has(keyOf(r))).length,
      total: data.length,
      from: shown.length ? start + 1 : 0,
      to: Math.min(end, shown.length),
      selectable,
    }),
  );
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

<div {...rest} class={["vin-data-table", className].filter(Boolean).join(" ")}>
  {#if filterable}
    <div class="vin-data-table__toolbar">
      <div class="vin-input vin-input-group vin-data-table__search">
        <span class="vin-input-group__addon"
          ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
            ><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg
          ></span
        >
        <input
          type="search"
          class="vin-input-group__input"
          placeholder={filterPlaceholder ?? "Filter…"}
          aria-label={filterLabel ?? `Filter ${label.toLowerCase()}`}
          value={query}
          oninput={(e) => {
            query = e.currentTarget.value;
            page = 1;
          }}
        />
      </div>
    </div>
  {/if}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (a wide table scrolls, so keyboard users need to reach it) -->
  <div class="vin-table-wrap" role="region" aria-label={label} tabindex="0">
    <table class="vin-table">
      <thead>
        <tr>
          {#if selectable}
            <th scope="col" class="vin-data-table__select">
              <Checkbox aria-label="Select all rows" checked={allOn} indeterminate={picked > 0 && !allOn} onchange={toggleAll} />
            </th>
          {/if}
          {#each columns as c (c.key)}
            <th scope="col" class={c.numeric ? "vin-table__num" : undefined} aria-sort={sort?.key === c.key ? sort.direction : undefined}>
              {#if c.sortable === false}
                {@render text(c.header)}
              {:else}
                <button type="button" class="vin-data-table__sort" onclick={() => sortBy(c.key)}
                  >{@render text(c.header)}<svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"><path d="m8 9 4-4 4 4" /><path d="m16 15-4 4-4-4" /></svg
                  ></button
                >
              {/if}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each sorted as row (keyOf(row))}
          {@const k = keyOf(row)}
          {@const on = chosen.has(k)}
          <tr hidden={!onPage.has(row) || undefined} data-selected={on ? "" : undefined}>
            {#if selectable}
              <td class="vin-data-table__select">
                <Checkbox
                  aria-label={rowLabel ? rowLabel(row) : `Select ${String(field(row, columns[0]?.key) ?? k)}`}
                  checked={on}
                  onchange={() => toggle(k)}
                />
              </td>
            {/if}
            {#each columns as c (c.key)}
              <td class={c.numeric ? "vin-table__num" : undefined}>
                {#if c.cell}{@render c.cell(row)}{:else}{String(field(row, c.key) ?? "")}{/if}
              </td>
            {/each}
          </tr>
        {/each}
        {#if shown.length === 0}
          <tr class="vin-data-table__empty"><td colspan={colSpan}>{@render text(emptyText)}</td></tr>
        {/if}
      </tbody>
    </table>
  </div>
  {#if selectable || pageSize > 0}
    <div class="vin-data-table__footer">
      <p class="vin-data-table__status" aria-live="polite">{status}</p>
      {#if pageSize > 0}<Pagination simple page={current} count={pages} onPageChange={(p) => (page = p)} />{/if}
    </div>
  {/if}
</div>
