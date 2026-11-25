import { Avatar } from "@/components/vin/avatar";

export function AvatarBasic() {
  return (
    <>
      <Avatar name="Ada Lovelace" src="/ui/avatars/ada.svg" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Acme Inc." shape="square" />
      <Avatar name="Alan Turing" src="/ui/avatars/alan.svg" status="online" />
    </>
  );
}
