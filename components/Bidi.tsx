// يعزل المقاطع الإنجليزية داخل النص العربي حتى لا تنعكس
const LATIN = /([A-Za-z][A-Za-z0-9 \/+.\-]*[A-Za-z0-9]|[A-Za-z0-9])/g;

export default function Bidi({ text }: { text: string }) {
  const parts = text.split(LATIN);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? <bdi key={i} className="ltr">{p}</bdi> : <span key={i}>{p}</span>,
      )}
    </>
  );
}
