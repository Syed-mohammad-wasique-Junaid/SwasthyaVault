export default function Features() {
  const features = [
    {
      title: "Health Locker",
      desc: "Store prescriptions, ECGs, scans and reports in one secure place.",
    },
    {
      title: "Medical Timeline",
      desc: "View every consultation in chronological order.",
    },
    {
      title: "AI Health Brief",
      desc: "Generate concise summaries before every appointment.",
    },
    {
      title: "Smart Consent",
      desc: "Patients decide exactly who can access their records.",
    },
  ];

  return (
    <section id="features" className="features">
      <div className="wrap">
        <p className="section-tag">FEATURES</p>
        <h2>Everything needed for modern healthcare.</h2>

        <div className="feature-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}