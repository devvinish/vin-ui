import { Marker } from "@/components/vin/marker";

export function MarkerCitations() {
  return (
    <p style={{ maxWidth: 520, margin: 0, fontSize: 15, lineHeight: 1.65 }}>
      The Fetch API returns a promise that resolves to a Response object
      <Marker index={1} href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API" title="Using the Fetch API" source="developer.mozilla.org" />.
      It doesn't reject on HTTP errors such as 404, so check <code>response.ok</code> yourself
      <Marker index={2} href="https://fetch.spec.whatwg.org/" title="Fetch Standard" source="fetch.spec.whatwg.org" />
      <Marker index={3} href="https://web.dev/articles/introduction-to-fetch" title="Introduction to fetch()" source="web.dev" />.
    </p>
  );
}
