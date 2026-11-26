export default function Home({ ready, dueCount, inquiryCount }) {
  const start = ready ? '#/reply' : '#/setup'
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Coaching centres ke liye AI admission assistant</span>
          <h1>Admission inquiries ka jawab seconds mein</h1>
          <p className="lead">
            Parent ka sawaal paste karein. AI aapke courses, fees aur timings ke hisaab se WhatsApp par bhejne layak jawab
            tayyar karega — Hindi, English ya Hinglish mein. Follow-up bhi yaad dilayega.
          </p>
          <div className="row wrap">
            <a className="btn primary lg" href={start}>
              Free try karein
            </a>
            <a className="btn ghost lg" href="#/pricing">
              Pricing dekhein
            </a>
          </div>
          {inquiryCount > 0 && (
            <p className="hint">
              Aapki {inquiryCount} {inquiryCount === 1 ? "inquiry" : "inquiries"} saved hain
              {dueCount > 0 && (
                <>
                  {' '}
                  · <a href="#/followups">{dueCount} follow-up aaj baaki</a>
                </>
              )}
            </p>
          )}
        </div>

        <div className="phone" aria-label="Example chat">
          <div className="phone-head">
            <span className="avatar">P</span>
            <div>
              <strong>Parent (Class 10)</strong>
              <small>online</small>
            </div>
          </div>
          <div className="chat">
            <div className="msg in">Sir 10th ke liye maths science ki coaching hai? Fees kitni hai aur timing kya hai?</div>
            <div className="msg out">
              Namaste ji 🙏
              <br />
              Haan, Class 10 ke liye Maths + Science batch chal raha hai.
              <br />
              <b>Fees: ₹2,500/month</b>
              <br />
              Timing: Shaam 4–6 baje (Mon–Sat)
              <br />
              Aap kal free demo class ke liye aa sakte hain. Kya main aapka naam note kar loon?
            </div>
            <div className="typing">AI ne 4 second mein likha</div>
          </div>
        </div>
      </section>

      <section className="steps">
        <div className="step">
          <span className="num">1</span>
          <h3>Centre ki details daalein</h3>
          <p>Courses, fees, timings, location aur common FAQs — bas ek baar.</p>
        </div>
        <div className="step">
          <span className="num">2</span>
          <h3>Sawaal paste karein</h3>
          <p>Parent ya student ka WhatsApp message copy karke daalein, bhasha chunein.</p>
        </div>
        <div className="step">
          <span className="num">3</span>
          <h3>Copy karke bhej dein</h3>
          <p>Jawab copy karein ya seedha WhatsApp kholein. Naam aur follow-up date save karein.</p>
        </div>
      </section>
    </>
  )
}
