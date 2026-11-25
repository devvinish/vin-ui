import * as React from "react";

/*
 * VinUI · Attachment (React). API: spec/attachment.json.
 * A file or picture attached to a message: icon or thumbnail, name, size and type,
 * an optional remove button, upload progress and an error state.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

/** 2516582 → "2.4 MB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let n = bytes / 1024, i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${i === 0 || n >= 100 ? Math.round(n) : Number(n.toFixed(1))} ${units[i]}`;
}

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const FileIcon = () => <Svg><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h4" /></Svg>;
const FileErrorIcon = () => <Svg><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M12 11v3.5" /><path d="M12 17.5h.01" /></Svg>;
const XIcon = () => <Svg><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Svg>;
const RetryIcon = () => <Svg><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Svg>;

export type AttachmentProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  /** The file name. It is also the picture's alt text and part of the button labels. */
  name: string;
  /** Short type label, e.g. "PDF". */
  type?: string;
  /** Size in bytes, shown as "2.4 MB". */
  size?: number;
  /** Your own line under the name. Replaces type and size. */
  meta?: React.ReactNode;
  /** "image" draws a square picture tile. Default: "file". */
  variant?: "file" | "image";
  /** A picture: the thumbnail in a file row, or the whole tile. */
  thumbnail?: string;
  /** Your own icon instead of the file icon. */
  icon?: React.ReactNode;
  /** Makes it a link, e.g. to download a file that was sent. */
  href?: string;
  download?: boolean | string;
  /** Upload progress, 0–100. Shows a progress bar while it's set. */
  progress?: number;
  /** The upload failed: the message to show. */
  error?: React.ReactNode;
  /** Shows a remove button (cancel while uploading). */
  onRemove?: () => void;
  /** With error: shows a retry button. */
  onRetry?: () => void;
};

export function Attachment({
  name, type, size, meta, variant = "file", thumbnail, icon, href, download, progress, error, onRemove, onRetry, className, ...rest
}: AttachmentProps) {
  const Tag = (href ? "a" : "div") as React.ElementType;
  const uploading = progress != null && !error;
  const pct = uploading ? Math.round(Math.min(100, Math.max(0, progress))) : 0;
  const link = href ? { href, download } : {};
  const classes = cx("vin-attachment", variant === "image" && "vin-attachment--image", error != null && "vin-attachment--error", className);
  const remove = onRemove && (
    <button type="button" className="vin-btn vin-btn--ghost vin-btn--icon vin-attachment__action" aria-label={uploading ? `Cancel upload of ${name}` : `Remove ${name}`} onClick={onRemove}>
      <XIcon />
    </button>
  );

  if (variant === "image") {
    return (
      <Tag {...rest} {...link} className={classes}>
        <img className="vin-attachment__thumb" src={thumbnail} alt={name} />
        {remove}
      </Tag>
    );
  }

  const line = error ?? (uploading ? `Uploading… ${pct}%` : meta ?? ([type, size != null && formatBytes(size)].filter(Boolean).join(" · ") || null));
  return (
    <Tag {...rest} {...link} className={classes}>
      {thumbnail
        ? <img className="vin-attachment__thumb" src={thumbnail} alt="" />
        : <span className="vin-attachment__icon">{icon ?? (error != null ? <FileErrorIcon /> : <FileIcon />)}</span>}
      <span className="vin-attachment__body">
        <span className="vin-attachment__name">{name}</span>
        {line != null && <span className="vin-attachment__meta">{line}</span>}
        {uploading && (
          <span
            className="vin-progress vin-progress--sm"
            role="progressbar"
            aria-label={`Uploading ${name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            style={{ ["--vin-value" as string]: `${pct}%` }}
          />
        )}
      </span>
      {error != null && onRetry && (
        <button type="button" className="vin-btn vin-btn--ghost vin-btn--icon vin-attachment__action" aria-label={`Retry ${name}`} onClick={onRetry}>
          <RetryIcon />
        </button>
      )}
      {remove}
    </Tag>
  );
}

export type AttachmentListProps = React.HTMLAttributes<HTMLUListElement> & {
  /** Name for the list, e.g. "Attached files". */
  label?: string;
};

/** A wrapping row of attachments. Each child becomes a list item. */
export function AttachmentList({ label, className, children, ...rest }: AttachmentListProps) {
  return (
    <ul aria-label={label} {...rest} className={cx("vin-attachment-list", className)}>
      {React.Children.map(children, (child) => (child == null || child === false ? null : <li>{child}</li>))}
    </ul>
  );
}
