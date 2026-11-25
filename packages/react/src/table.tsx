import * as React from "react";

/*
 * VinUI · Table (React). API: spec/table.json.
 * Write the thead / tbody / tfoot yourself; Table adds the scrolling frame and the caption.
 * Mark number cells with className="vin-table__num".
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type TableProps = React.TableHTMLAttributes<HTMLTableElement> & {
  /** Says what the table shows. Shown under the table. */
  caption?: React.ReactNode;
  /** Name for the scrolling frame. Default: the caption, if it's text. */
  label?: string;
  striped?: boolean;
};

export function Table({ caption, label, striped, className, children, ...rest }: TableProps) {
  const name = label ?? (typeof caption === "string" ? caption : undefined);
  return (
    <div className="vin-table-wrap" role="region" aria-label={name} tabIndex={0} style={rest.style}>
      <table {...rest} style={undefined} className={cx("vin-table", striped && "vin-table--striped", className)}>
        {caption != null && <caption className="vin-table__caption">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}
