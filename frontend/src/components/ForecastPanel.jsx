export default function ForecastPanel({ forecast }) {
  if (!forecast) return (
    <section className="rail-block" id="forecast">
      <h3>Forecast</h3>
      <div className="skel" />
    </section>
  );
  return (
    <section className="rail-block" id="forecast">
      <h3>Forecast</h3>
      <div className="stat">Trend<b>{forecast.trend}</b></div>
      <div className="stat">Estimated change<b>{forecast.summary}</b></div>
      <div className="stat">Confidence<b>Moderate</b></div>
      <p className="disclaimer" style={{ padding: "8px 0 0" }}>{forecast.disclaimer}</p>
    </section>
  );
}
