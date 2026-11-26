export default function Pricing() {
  return (
    <div className="page">
      <header className="page-head center">
        <div>
          <h1>Simple pricing</h1>
          <p className="lead">Pehle free mein try karein. Pasand aaye to ek hi plan.</p>
        </div>
      </header>

      <div className="plans">
        <div className="card plan">
          <h2>Free trial</h2>
          <p className="price">
            ₹0 <small>/ 14 din</small>
          </p>
          <ul>
            <li>50 AI replies</li>
            <li>Hindi, English, Hinglish</li>
            <li>Follow-up reminders</li>
            <li>Card ki zaroorat nahi</li>
          </ul>
          <a className="btn ghost lg block" href="#/setup">
            Free try karein
          </a>
        </div>

        <div className="card plan featured">
          <span className="ribbon">Coaching centres ke liye</span>
          <h2>Pro</h2>
          <p className="price">
            ₹499 <small>/ month</small>
          </p>
          <ul>
            <li>Unlimited AI replies</li>
            <li>Unlimited inquiries aur follow-ups</li>
            <li>Courses, fees, FAQs — sab ek jagah</li>
            <li>WhatsApp support</li>
          </ul>
          <button className="btn primary lg block" disabled title="Online payment jald aa raha hai">
            Payment jald aa raha hai
          </button>
        </div>
      </div>
      <p className="hint center">Prices GST ke bina. Jab chahein cancel karein.</p>
    </div>
  )
}
