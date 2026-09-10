export default function FAQ() {
  return (
    <section id="faq" className="faq">
      <div className="wrap">
        <p className="section-tag">FAQ</p>
        <h2>Frequently Asked Questions</h2>

        <div className="faq-list">
          <div className="faq-item">
            <h3>Is my medical data encrypted?</h3>
            <p>Yes. Every record is stored securely with patient-controlled access.</p>
          </div>

          <div className="faq-item">
            <h3>Can multiple doctors access reports?</h3>
            <p>Only after explicit patient consent.</p>
          </div>

          <div className="faq-item">
            <h3>Does AI replace doctors?</h3>
            <p>No. AI only assists by summarising medical history.</p>
          </div>
        </div>
      </div>
    </section>
  );
}