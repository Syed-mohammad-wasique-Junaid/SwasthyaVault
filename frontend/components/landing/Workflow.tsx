export default function Workflow() {
  const steps = [
    "Patient creates digital health vault",
    "Doctor records consultation",
    "AI prepares health summary",
    "Timeline updates automatically",
  ];

  return (
    <section id="workflow" className="workflow">
      <div className="wrap">
        <p className="section-tag">WORKFLOW</p>
        <h2>Four simple steps.</h2>

        <div className="workflow-grid">
          {steps.map((step, i) => (
            <div className="step-card" key={step}>
              <span>0{i + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}