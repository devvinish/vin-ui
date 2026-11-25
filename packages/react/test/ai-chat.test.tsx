import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { formatBytes, Attachment } from "../src/attachment";
import { TraceStep } from "../src/trace";
import { Message } from "../src/message";
import { StatusMarker, Marker } from "../src/marker";
import { Questionnaire } from "../src/questionnaire";

describe("Attachment", () => {
  it("formats sizes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(860160)).toBe("840 KB");
    expect(formatBytes(2516582)).toBe("2.4 MB");
    expect(formatBytes(1024 * 1024 * 150)).toBe("150 MB");
  });
  it("shows upload progress and names its buttons after the file", () => {
    const html = renderToStaticMarkup(<Attachment name="a.csv" progress={42.4} onRemove={() => {}} />);
    expect(html).toContain("Uploading… 42%");
    expect(html).toContain('aria-valuenow="42"');
    expect(html).toContain('aria-label="Cancel upload of a.csv"');
  });
});

describe("TraceStep", () => {
  it("joins kind and duration and names the status", () => {
    const html = renderToStaticMarkup(<TraceStep status="error" title="Ran it" kind="Tool call" duration="2s" />);
    expect(html).toContain("Tool call · 2s");
    expect(html).toContain('aria-label="Failed"');
    expect(html).toContain("vin-trace__step--error");
  });
});

describe("Message", () => {
  it("is busy while streaming and uses <time> with a dateTime", () => {
    const html = renderToStaticMarkup(<Message streaming author="AI" time="10:42" dateTime="2026-11-25T10:42">Hi</Message>);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('<time class="vin-message__time" dateTime="2026-11-25T10:42">10:42</time>');
  });
});

describe("Marker", () => {
  it("names the citation after its source", () => {
    expect(renderToStaticMarkup(<Marker index={2} href="#" title="Spec" source="w3.org" />)).toContain('aria-label="Source 2: Spec, w3.org"');
  });
  it("is a live status only while running", () => {
    expect(renderToStaticMarkup(<StatusMarker>Searching</StatusMarker>)).toContain('role="status"');
    expect(renderToStaticMarkup(<StatusMarker status="done">Done</StatusMarker>)).not.toContain("role=");
  });
});

describe("Questionnaire", () => {
  const questions = [{ id: "q", prompt: "Pick", options: ["a", "b"] }];
  it("disables the questions and shows the status once submitted", () => {
    const html = renderToStaticMarkup(<Questionnaire label="Q" questions={questions} defaultState="submitted" defaultValues={{ q: ["a"] }} />);
    expect(html).toContain('data-state="submitted"');
    expect(html).toContain("disabled");
    expect(html).toContain("Answer sent");
    expect(html).not.toContain("vin-questionnaire__actions");
  });
});
