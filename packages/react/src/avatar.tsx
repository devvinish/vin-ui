import * as React from "react";

/*
 * VinUI · Avatar (React). API: spec/avatar.json.
 * role="img" with the person's name; the picture covers the initials, and if it fails to load the initials show.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

/** "Ada Lovelace" → "AL". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export type AvatarProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Who it is: the accessible name, and the initials when there's no picture. */
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
  /** Presence dot. It is added to the name: "Ada Lovelace (online)". */
  status?: "online" | "busy" | "away";
  /** Text to show instead of the initials, e.g. "+3". */
  fallback?: string;
};

export function Avatar({ name, src, size = "md", shape = "circle", status, fallback, className, ...rest }: AvatarProps) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [src]);
  return (
    <span
      role="img"
      aria-label={status ? `${name} (${status})` : name}
      {...rest}
      className={cx("vin-avatar", size !== "md" && `vin-avatar--${size}`, shape === "square" && "vin-avatar--square", className)}
    >
      {src && !failed && <img className="vin-avatar__img" src={src} alt="" onError={() => setFailed(true)} />}
      <span className="vin-avatar__fallback">{fallback ?? initials(name)}</span>
      {status && <span className={`vin-avatar__status vin-avatar__status--${status}`} />}
    </span>
  );
}

export type AvatarGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Name for the group, e.g. "Project members". */
  label?: string;
};

export function AvatarGroup({ label, className, ...rest }: AvatarGroupProps) {
  return <div role="group" aria-label={label} {...rest} className={cx("vin-avatar-group", className)} />;
}
