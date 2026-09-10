
export default function Principles() {
  const items = [
    "Private by Design",
    "AI Assisted",
    "Consent Controlled",
    "Instant Medical Timeline",
  ];

  return (
    <section className="principles">
      <div className="wrap principles-grid">
        {items.map((item) => (
          <div key={item} className="principle-card">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}