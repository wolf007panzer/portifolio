// components/KpiCard.jsx
import './KpiCard.css';

export default function KpiCard({ label, value, icon }) {
  return (
    <div className="kpi-card">
      <span className="kpi-icon">{icon}</span>
      <div>
        <p className="kpi-label">{label}</p>
        <p className="kpi-value">{value}</p>
      </div>
    </div>
  );
}
