import { ListOrdered } from 'lucide-react';
import { PROCESS_STEPS } from '../lib/data/services-data';

export function ProcessTimeline() {
  return (
    <section className="process-section">
      <div className="container">
        <div className="section__header">
          <div className="section__label">Quy trình làm việc</div>
          <h2 className="section__title">4 bước đơn giản</h2>
          <p className="section__subtitle">
            Quy trình làm việc chuyên nghiệp, minh bạch giúp khách hàng yên tâm tuyệt đối.
          </p>
        </div>

        <div className="process-timeline">
          {PROCESS_STEPS.map((step) => (
            <div key={step.step} className="process-step">
              <div className="process-step__num">
                <ListOrdered size={20} aria-hidden="true" />
              </div>
              <h3 className="process-step__title">{step.title}</h3>
              <p className="process-step__desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
