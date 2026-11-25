import { Kbd, KbdGroup } from "@/components/vin/kbd";

export function KbdShortcuts() {
  return (
    <>
      <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>
      <KbdGroup><Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>P</Kbd></KbdGroup>
      <KbdGroup><Kbd>Ctrl</Kbd>+<Kbd>Shift</Kbd>+<Kbd>P</Kbd></KbdGroup>
    </>
  );
}
