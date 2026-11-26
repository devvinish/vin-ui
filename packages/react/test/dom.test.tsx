// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import * as React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Badge } from "../src/badge";
import { Button } from "../src/button";
import { Card, CardHeader, CardBody, CardFooter } from "../src/card";
import { Checkbox } from "../src/checkbox";
import { Field, Input } from "../src/input";
import { InputGroup } from "../src/input-group";
import { InputOTP } from "../src/input-otp";
import { NativeSelect } from "../src/native-select";
import { Switch } from "../src/switch";
import { Textarea } from "../src/textarea";
import { Toggle } from "../src/toggle";
import { DropdownMenu, DropdownMenuItem } from "../src/dropdown-menu";
import { Popover } from "../src/popover";
import { HoverCard } from "../src/hover-card";
import { Tooltip } from "../src/tooltip";

/*
 * Mounted in a DOM (the other tests render to HTML strings, where refs never attach).
 * Runs on React 19 here and on React 18 in the CLI's end-to-end test, so it checks what differs between them:
 * `ref` reaches the element, the popover attributes reach the DOM, and React logs no warnings.
 */
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
const errors = vi.spyOn(console, "error");
function mount(ui: React.ReactElement) {
  host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  act(() => root.render(ui));
  return () => act(() => root.unmount());
}
afterEach(() => {
  host?.remove();
  expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([]);
  errors.mockClear();
});

describe(`refs reach the element (React ${React.version})`, () => {
  const cases: [string, (r: React.RefObject<any>) => React.ReactElement, string][] = [
    ["Badge", (r) => <Badge ref={r}>New</Badge>, "SPAN"],
    ["Button", (r) => <Button ref={r}>Save</Button>, "BUTTON"],
    ["Button as link", (r) => <Button ref={r} href="/x">Docs</Button>, "A"],
    ["Card", (r) => <Card ref={r} />, "DIV"],
    ["CardHeader", (r) => <CardHeader ref={r} />, "DIV"],
    ["CardBody", (r) => <CardBody ref={r} />, "DIV"],
    ["CardFooter", (r) => <CardFooter ref={r} />, "DIV"],
    ["Input", (r) => <Input ref={r} aria-label="Name" />, "INPUT"],
    ["Field", (r) => <Field ref={r} label="Name" />, "INPUT"],
    ["Checkbox", (r) => <Checkbox ref={r} label="Agree" />, "INPUT"],
    ["Switch", (r) => <Switch ref={r} label="Wi-Fi" />, "INPUT"],
    ["Textarea", (r) => <Textarea ref={r} label="Bio" />, "TEXTAREA"],
    ["Toggle", (r) => <Toggle ref={r} aria-label="Bold">B</Toggle>, "BUTTON"],
    ["NativeSelect", (r) => <NativeSelect ref={r} label="Plan"><option>Free</option></NativeSelect>, "SELECT"],
    ["InputGroup", (r) => <InputGroup ref={r} label="Site" start="https://" />, "INPUT"],
    ["InputOTP", (r) => <InputOTP ref={r} label="Code" />, "INPUT"],
  ];
  for (const [name, ui, tag] of cases) {
    it(name, () => {
      const r = React.createRef<HTMLElement>();
      const unmount = mount(ui(r));
      expect(r.current?.tagName).toBe(tag);
      unmount();
      expect(r.current).toBe(null);
    });
  }

  it("a callback ref on Checkbox and Textarea is called too", () => {
    const seen: string[] = [];
    mount(<><Checkbox ref={(el) => { if (el) seen.push(el.tagName); }} label="A" /><Textarea ref={(el) => { if (el) seen.push(el.tagName); }} label="B" /></>);
    expect(seen).toEqual(["INPUT", "TEXTAREA"]);
  });
});

describe("triggers keep their own ref", () => {
  it("DropdownMenu, Popover, HoverCard and Tooltip", () => {
    const refs = Array.from({ length: 4 }, () => React.createRef<HTMLButtonElement>());
    mount(
      <>
        <DropdownMenu trigger={<button ref={refs[0]}>Menu</button>}><DropdownMenuItem>One</DropdownMenuItem></DropdownMenu>
        <Popover trigger={<button ref={refs[1]}>Open</button>}>Hi</Popover>
        <HoverCard trigger={<button ref={refs[2]}>@ada</button>}>Ada</HoverCard>
        <Tooltip content="Save"><button ref={refs[3]}>S</button></Tooltip>
      </>,
    );
    expect(refs.map((r) => r.current?.textContent)).toEqual(["Menu", "Open", "@ada", "S"]);
  });
});

describe("popover attributes reach the DOM", () => {
  it("menu and popover: popover on the panel, popovertarget on the button", () => {
    mount(
      <>
        <DropdownMenu trigger={<button>Menu</button>}><DropdownMenuItem>One</DropdownMenuItem></DropdownMenu>
        <Popover trigger={<button>Open</button>}>Hi</Popover>
      </>,
    );
    const panels = [...host.querySelectorAll("[popover]")];
    expect(panels.map((p) => p.getAttribute("popover"))).toEqual(["auto", "auto"]);
    const buttons = [...host.querySelectorAll("button[popovertarget]")];
    expect(buttons.map((b) => b.getAttribute("popovertarget"))).toEqual(panels.map((p) => p.id));
  });
});
