import { Avatar } from "@/components/vin/avatar";

export function AvatarSizes() {
  return (
    <>
      <Avatar name="Katherine Johnson" src="/ui/avatars/kat.svg" size="sm" />
      <Avatar name="Katherine Johnson" src="/ui/avatars/kat.svg" />
      <Avatar name="Katherine Johnson" src="/ui/avatars/kat.svg" size="lg" status="busy" />
      <Avatar name="Grace Hopper" size="sm" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Grace Hopper" size="lg" status="away" />
    </>
  );
}
