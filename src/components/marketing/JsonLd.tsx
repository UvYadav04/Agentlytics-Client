type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export default function JsonLd({ data }: { data: Record<string, JsonValue> | Record<string, JsonValue>[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}
