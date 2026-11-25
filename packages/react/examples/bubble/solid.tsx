import { Bubble, BubbleGroup } from "@/components/vin/bubble";

export function BubbleSolid() {
  return (
    <BubbleGroup style={{ width: "100%", maxWidth: 460 }}>
      <Bubble as="p">Your order has shipped. It should arrive on Thursday.</Bubble>
      <Bubble as="p" from="user" solid>Great, thanks!</Bubble>
      <Bubble as="p" from="user" solid>Can I change the delivery address?</Bubble>
    </BubbleGroup>
  );
}
