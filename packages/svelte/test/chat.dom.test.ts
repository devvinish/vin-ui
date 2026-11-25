import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";

import MessageBasic from "../examples/message/basic.svelte";
import MessageConversation from "../examples/message/conversation.svelte";
import MessageStreaming from "../examples/message/streaming.svelte";
import MessageScrollerBasic from "../examples/message-scroller/basic.svelte";
import AttachmentBasic from "../examples/attachment/basic.svelte";
import AttachmentUpload from "../examples/attachment/upload.svelte";
import MarkerCitations from "../examples/marker/citations.svelte";
import MarkerStatus from "../examples/marker/status.svelte";
import QuestionnaireSubmitted from "../examples/questionnaire/submitted.svelte";
import TraceBasic from "../examples/trace/basic.svelte";
import Questionnaire from "../src/questionnaire.svelte";
import { formatBytes } from "../src/attachment.svelte";

afterEach(() => {
  vi.useRealTimers();
});

describe("Message", () => {
  it("copies the message's content, then says Copied for two seconds", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(MessageBasic);
    expect(screen.getByRole("article")).toBeTruthy();
    expect(screen.getByRole("group", { name: "Message actions" })).toBeTruthy();
    expect(document.querySelector("time")!.getAttribute("datetime")).toBe("2026-11-25T10:42");
    expect(document.querySelector(".vin-message__avatar")!.getAttribute("aria-hidden")).toBe("true");

    const copy = screen.getByRole("button", { name: "Copy" });
    await fireEvent.click(copy);
    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText.mock.calls[0]).toEqual([expect.stringMatching(/^Here are three ways to speed up your build:[\s\S]*changed\.$/)]);
    expect(copy.getAttribute("aria-label")).toBe("Copied");
    expect(copy.hasAttribute("data-copied")).toBe(true);
    vi.advanceTimersByTime(2000);
    await vi.waitFor(() => expect(copy.getAttribute("aria-label")).toBe("Copy"));
  });

  it("feedback: one thumb at a time; pressing it again clears it", async () => {
    render(MessageBasic);
    const up = screen.getByRole("button", { name: "Good response" });
    const down = screen.getByRole("button", { name: "Bad response" });
    expect(up.getAttribute("aria-pressed")).toBe("false");
    await fireEvent.click(up);
    expect(up.getAttribute("aria-pressed")).toBe("true");
    await fireEvent.click(down);
    expect(up.getAttribute("aria-pressed")).toBe("false");
    expect(down.getAttribute("aria-pressed")).toBe("true");
    await fireEvent.click(down);
    expect(down.getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("button", { name: "Retry" }).hasAttribute("aria-pressed")).toBe(false);
  });

  it("starts with a value, sits on the end side for the person, and marks a streaming reply busy", () => {
    render(MessageConversation);
    expect(screen.getByRole("button", { name: "Good response" }).getAttribute("aria-pressed")).toBe("true");
    expect(document.querySelector(".vin-message--end .vin-bubble--user")).toBeTruthy();
    render(MessageStreaming);
    const streaming = document.querySelector(".vin-message--streaming")!;
    expect(streaming.getAttribute("aria-busy")).toBe("true");
    expect(streaming.querySelector(".vin-message__time")!.tagName).toBe("SPAN");
  });
});

describe("MessageScroller", () => {
  it("scrolling up shows Jump to latest; clicking it goes back to the bottom", async () => {
    render(MessageScrollerBasic);
    const log = screen.getByRole("log", { name: "Conversation" });
    const jump = document.querySelector<HTMLButtonElement>(".vin-message-scroller__jump")!;
    expect(jump.textContent!.trim()).toBe("Jump to latest");
    expect(jump.hidden).toBe(true);

    let top = 680;
    Object.defineProperty(log, "scrollHeight", { configurable: true, value: 1000 });
    Object.defineProperty(log, "clientHeight", { configurable: true, value: 320 });
    Object.defineProperty(log, "scrollTop", { configurable: true, get: () => top });
    const scrollTo = vi.fn((o: ScrollToOptions) => {
      top = Math.min(680, o.top ?? top);
      log.dispatchEvent(new Event("scroll"));
    });
    log.scrollTo = scrollTo as unknown as typeof log.scrollTo;
    await fireEvent.scroll(log); // at the bottom: still following

    top = 200;
    await fireEvent.scroll(log);
    expect(jump.hidden).toBe(false);

    await fireEvent.click(jump);
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 1000 }));
    expect(document.activeElement).toBe(log);
    expect(jump.hidden).toBe(true);

    // Scrolling up again lets go; reaching the bottom follows again.
    top = 100;
    await fireEvent.scroll(log);
    expect(jump.hidden).toBe(false);
    top = 680;
    await fireEvent.scroll(log);
    expect(jump.hidden).toBe(true);
  });
});

describe("Attachment", () => {
  it("formats sizes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(860160)).toBe("840 KB");
    expect(formatBytes(2516582)).toBe("2.4 MB");
    expect(formatBytes(1024 ** 3 * 150)).toBe("150 GB");
  });

  it("is a list of files; remove takes one out", async () => {
    render(AttachmentBasic);
    const list = screen.getByRole("list", { name: "Attached files" });
    expect(list.querySelectorAll(":scope > li")).toHaveLength(3);
    expect(screen.getByText("PDF · 2.4 MB")).toBeTruthy();
    expect(screen.getByRole("img", { name: "lake.jpg" })).toBeTruthy();
    await fireEvent.click(screen.getByRole("button", { name: "Remove design-brief.pdf" }));
    expect(list.querySelectorAll(":scope > li")).toHaveLength(2);
    expect(screen.queryByText("design-brief.pdf")).toBeNull();
  });

  it("shows upload progress and a failed upload with retry", () => {
    render(AttachmentUpload);
    const bar = screen.getByRole("progressbar", { name: "Uploading sales-q3.csv" });
    expect(bar.getAttribute("aria-valuenow")).toBe("64");
    expect(screen.getByText("Uploading… 64%")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancel upload of sales-q3.csv" })).toBeTruthy();
    expect(screen.getByText("Upload failed").closest(".vin-attachment")!.classList.contains("vin-attachment--error")).toBe(true);
    expect(screen.getByRole("button", { name: "Retry recording.mov" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove recording.mov" })).toBeTruthy();
  });
});

describe("Marker", () => {
  it("names the source; Escape hides the preview until the pointer or focus leaves", async () => {
    render(MarkerCitations);
    const marker = screen.getByRole("link", { name: "Source 1: Using the Fetch API, developer.mozilla.org" });
    expect(marker.getAttribute("href")).toBe("https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API");

    await fireEvent.keyDown(document, { key: "Escape" });
    expect(marker.hasAttribute("data-dismissed")).toBe(false); // nothing is showing

    await fireEvent.focus(marker);
    await fireEvent.keyDown(document, { key: "Escape" });
    expect(marker.hasAttribute("data-dismissed")).toBe(true);
    await fireEvent.blur(marker);
    expect(marker.hasAttribute("data-dismissed")).toBe(false);

    await fireEvent.mouseEnter(marker);
    await fireEvent.keyDown(document, { key: "Escape" });
    expect(marker.hasAttribute("data-dismissed")).toBe(true);
    await fireEvent.mouseLeave(marker);
    expect(marker.hasAttribute("data-dismissed")).toBe(false);
  });

  it("StatusMarker announces only while running", () => {
    render(MarkerStatus);
    expect(screen.getAllByRole("status").map((s) => s.textContent!.trim())).toEqual(["Searching the web…"]);
    expect(document.querySelector(".vin-marker--success")!.textContent!.trim()).toBe("Read 4 pages");
    expect(document.querySelector(".vin-marker--danger .vin-marker__icon")).toBeTruthy();
  });
});

const trip = [
  {
    id: "length",
    prompt: "How long do you want to hike?",
    options: [
      { value: "short", label: "Under 2 hours" },
      { value: "half-day", label: "Half a day" },
    ],
    other: true,
  },
];
const see = {
  id: "see",
  prompt: "What would you like to see?",
  multiple: true,
  options: ["Lakes", "Views", "Waterfalls"],
};

describe("Questionnaire", () => {
  it("submits the chosen answer, then goes read-only and moves focus to the status", async () => {
    const onSubmit = vi.fn();
    render(Questionnaire, { props: { label: "Trip length", questions: trip, onSubmit } });
    const form = screen.getByRole("form", { name: "Trip length" });
    await fireEvent.click(screen.getByRole("radio", { name: "Half a day" }));
    await fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledWith({ length: "half-day" });
    expect(form.dataset.state).toBe("submitted");
    expect((form.querySelector("fieldset") as HTMLFieldSetElement).disabled).toBe(true);
    expect(screen.queryByRole("button", { name: "Submit" })).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("status")));
    expect(screen.getByRole("status").textContent!.trim()).toBe("Answer sent");
  });

  it("Other sends the typed text; multiple answers keep the listed order", async () => {
    const onSubmit = vi.fn();
    render(Questionnaire, { props: { title: "Plan", questions: [...trip, see], onSubmit } });
    expect(screen.getByRole("form", { name: "Plan" })).toBeTruthy();
    await fireEvent.click(screen.getByRole("radio", { name: "Other" }));
    await fireEvent.input(screen.getByRole("textbox", { name: "Other answer" }), { target: { value: "  Overnight " } });
    await fireEvent.click(screen.getByRole("checkbox", { name: "Waterfalls" }));
    await fireEvent.click(screen.getByRole("checkbox", { name: "Lakes" }));
    await fireEvent.click(screen.getByRole("checkbox", { name: "Views" }));
    await fireEvent.click(screen.getByRole("checkbox", { name: "Views" }));
    await fireEvent.submit(screen.getByRole("form"));
    expect(onSubmit).toHaveBeenCalledWith({ length: "Overnight", see: ["Lakes", "Waterfalls"] });
    expect(screen.getByRole("status").textContent!.trim()).toBe("Answers sent");
  });

  it("Skip calls onSkip and says Skipped; a submitted one starts read-only", async () => {
    const onSkip = vi.fn();
    const onSubmit = vi.fn();
    render(Questionnaire, { props: { label: "Trip", questions: trip, onSkip, onSubmit } });
    await fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(onSkip).toHaveBeenCalledOnce();
    expect(screen.getByRole("form").dataset.state).toBe("skipped");
    expect(screen.getByRole("status").textContent!.trim()).toBe("Skipped");
    await fireEvent.submit(screen.getByRole("form"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("the submitted example shows the answer, disabled", () => {
    render(QuestionnaireSubmitted);
    const half = screen.getByRole("radio", { name: "Half a day" }) as HTMLInputElement;
    expect(half.checked).toBe(true);
    expect((half.closest("fieldset") as HTMLFieldSetElement).disabled).toBe(true);
    expect(screen.getByRole("status").textContent!.trim()).toBe("Answer sent");
  });
});

describe("Trace", () => {
  it("lists steps with a named status; details open and close", async () => {
    render(TraceBasic);
    expect(screen.getByRole("list", { name: "Agent steps" })).toBeTruthy();
    expect(screen.getAllByRole("img").map((i) => i.getAttribute("aria-label"))).toEqual(["Done", "Done", "Done", "Running"]);
    const details = document.querySelectorAll("details");
    expect(details).toHaveLength(2);
    expect(details[0].open).toBe(true);
    expect(details[1].open).toBe(false);
    expect(screen.getByText("Tool call · 1.2s")).toBeTruthy();
    details[1].open = true;
    await fireEvent(details[1], new Event("toggle"));
    expect(details[1].open).toBe(true);
  });
});
