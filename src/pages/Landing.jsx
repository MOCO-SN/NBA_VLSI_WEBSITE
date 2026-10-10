import { useState } from "react";
import {
  Cpu,
  Bot,
  Radio,
  Zap,
  ArrowRight,
  Menu,
  X,
  Code2,
  Terminal,
  Activity,
  CheckCircle2
} from "lucide-react";
import { saveContactMessage } from "../utils/contactMessages";

// Landy-style design system
const theme = {
  primary: "#18216d", // Deep blue from Landy
  secondary: "#ff825c", // Vibrant orange accent from Landy
  bg: "#ffffff",
  text: "#18216d",
  textSecondary: "#a0a4ab",
  grayBg: "#f5f7fa"
};

const Container = ({ children }) => (
  <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
    {children}
  </div>
);

const Button = ({ children, onClick, type = "primary", style = {} }) => {
  const isPrimary = type === "primary";
  return (
    <button
      onClick={onClick}
      style={{
        background: isPrimary ? theme.secondary : "#fff",
        color: isPrimary ? "#fff" : theme.secondary,
        border: `1px solid ${isPrimary ? theme.secondary : theme.secondary}`,
        padding: "14px 32px",
        borderRadius: "30px",
        fontSize: "1rem",
        fontWeight: 600,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
        ...style
      }}
      onMouseEnter={e => {
        if (!isPrimary) {
          e.target.style.background = theme.secondary;
          e.target.style.color = "#fff";
        } else {
          e.target.style.opacity = "0.9";
        }
      }}
      onMouseLeave={e => {
        if (!isPrimary) {
          e.target.style.background = "#fff";
          e.target.style.color = theme.secondary;
        } else {
          e.target.style.opacity = "1";
        }
      }}
    >
      {children}
    </button>
  );
};

const Header = ({ onGetStarted, onSignIn, user }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Mission", href: "#mission" },
    { label: "Product", href: "#product" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header style={{ padding: "30px 0", background: theme.bg, position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #eaeaea" }}>
      <Container>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Logo */}
          <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <Cpu size={28} color={theme.primary} />
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: theme.primary, letterSpacing: "-0.5px" }}>
              DEVELOPMENT CLUB
            </span>
          </a>

          {/* Desktop Nav */}
          <nav style={{ display: "none", alignItems: "center", gap: "30px" }} className="desktop-nav">
            {navLinks.map(link => (
              <a key={link.label} href={link.href} style={{ color: theme.text, textDecoration: "none", fontSize: "1rem", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = theme.secondary} onMouseLeave={e => e.target.style.color = theme.text}>
                {link.label}
              </a>
            ))}
            {user ? (
              <Button onClick={onGetStarted}>Dashboard</Button>
            ) : (
              <div style={{ display: "flex", gap: "12px" }}>
                <Button onClick={onSignIn} type="secondary">Sign In</Button>
                <Button onClick={onGetStarted}>Get Started</Button>
              </div>
            )}
          </nav>

          {/* Mobile Toggle */}
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: "none", border: "none", display: "none", cursor: "pointer", color: theme.primary }}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: theme.bg, padding: "20px 24px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "15px", borderBottom: "1px solid #eaeaea" }}>
            {navLinks.map(link => (
              <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} style={{ color: theme.text, textDecoration: "none", fontSize: "1.1rem", fontWeight: 500 }}>
                {link.label}
              </a>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
              {user ? (
                <Button onClick={onGetStarted} style={{ width: "100%" }}>Dashboard</Button>
              ) : (
                <>
                  <Button onClick={onSignIn} type="secondary" style={{ width: "100%" }}>Sign In</Button>
                  <Button onClick={onGetStarted} style={{ width: "100%" }}>Get Started</Button>
                </>
              )}
            </div>
          </div>
        )}
      </Container>
      
      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
        }
        @media (max-width: 899px) {
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
};

const ContentBlock = ({ type, title, content, button, icon: Icon, isFirst, id }) => {
  const isRight = type === "right";
  
  return (
    <section id={id} style={{ padding: isFirst ? "140px 0 100px" : "100px 0", background: theme.bg }}>
      <Container>
        <div style={{ 
          display: "flex", 
          flexDirection: isRight ? "row" : "row-reverse", 
          alignItems: "center", 
          gap: "80px",
          flexWrap: "wrap" 
        }}>
          {/* Text Content */}
          <div style={{ flex: "1 1 400px" }}>
             <h1 style={{ fontSize: isFirst ? "3.5rem" : "2.5rem", fontWeight: 700, color: theme.text, marginBottom: "24px", lineHeight: 1.2, letterSpacing: "-1px" }}>
               {title}
             </h1>
             <p style={{ fontSize: "1.125rem", color: theme.textSecondary, lineHeight: 1.6, marginBottom: button ? "32px" : "0" }}>
               {content}
             </p>
             {button && (
                <Button onClick={button.onClick} style={{ padding: "16px 40px", fontSize: "1.125rem" }}>
                  {button.label}
                </Button>
             )}
          </div>
          
          {/* Graphic/Illustration replacement */}
          <div style={{ flex: "1 1 400px", display: "flex", justifyContent: "center" }}>
             <div style={{ 
               width: "100%", maxWidth: "500px", aspectRatio: "4/3", 
               display: "flex", alignItems: "center", justifyContent: "center"
             }}>
               {/* Simulating Landy SVG illustrations with large colored icons */}
               <Icon size={isFirst ? 300 : 220} color={theme.secondary} strokeWidth={1} style={{ filter: "drop-shadow(0 20px 30px rgba(255, 130, 92, 0.2))" }} />
             </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

const MiddleBlock = ({ title, content, button }) => {
  return (
    <section style={{ padding: "100px 0", textAlign: "center", background: theme.grayBg }}>
      <Container>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 700, color: theme.text, marginBottom: "24px", letterSpacing: "-0.5px" }}>
            {title}
          </h2>
          <p style={{ fontSize: "1.125rem", color: theme.textSecondary, lineHeight: 1.6, marginBottom: "32px" }}>
            {content}
          </p>
          {button && (
            <Button onClick={button.onClick}>{button.label}</Button>
          )}
        </div>
      </Container>
    </section>
  );
};

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setBusy(true);
    try {
      await saveContactMessage({ name, email, message });
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error("Failed to submit contact:", err);
      alert("Failed to submit message. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="contact" style={{ padding: "100px 0", background: theme.bg }}>
      <Container>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "60px", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 300px" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 700, color: theme.text, marginBottom: "24px", letterSpacing: "-0.5px" }}>
              Contact Form
            </h2>
            <p style={{ fontSize: "1.125rem", color: theme.textSecondary, lineHeight: 1.6 }}>
              Want to join our research lab or collaborate on outcome-based engineering projects? Get in touch with our faculty and administrative leads.
            </p>
          </div>
          <div style={{ flex: "1 1 400px" }}>
            {submitted && (
              <div style={{
                padding: "16px 20px",
                background: "#ecfdf5",
                color: "#059669",
                borderRadius: "12px",
                border: "1px solid #a7f3d0",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
                fontSize: "0.95rem",
                fontWeight: 600
              }}>
                <CheckCircle2 size={20} color="#059669" />
                <span>Thank you! Your message has been sent to our lab administration.</span>
              </div>
            )}
            <form style={{ display: "flex", flexDirection: "column", gap: "20px" }} onSubmit={handleSubmit}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", color: theme.text, fontWeight: 600, marginBottom: "8px" }}>Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "8px", border: "1px solid #eaeaea", background: theme.grayBg, fontSize: "1rem", outline: "none", color: theme.text }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", color: theme.text, fontWeight: 600, marginBottom: "8px" }}>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "8px", border: "1px solid #eaeaea", background: theme.grayBg, fontSize: "1rem", outline: "none", color: theme.text }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", color: theme.text, fontWeight: 600, marginBottom: "8px" }}>Message</label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your project or inquiry..."
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "8px", border: "1px solid #eaeaea", background: theme.grayBg, fontSize: "1rem", outline: "none", color: theme.text, resize: "vertical" }}
                />
              </div>
              <Button style={{ width: "100%" }} onClick={handleSubmit}>
                {busy ? "Sending..." : "Submit Inquiry"}
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
};

const Footer = () => (
  <footer style={{ padding: "60px 0 30px", background: theme.grayBg }}>
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
        <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <Cpu size={24} color={theme.primary} />
          <span style={{ fontSize: "1.25rem", fontWeight: 700, color: theme.primary, letterSpacing: "-0.5px" }}>
            DEVELOPMENT CLUB
          </span>
        </a>
        <p style={{ color: theme.textSecondary, fontSize: "0.9rem", margin: 0 }}>
          © 2026 DEVELOPMENT CLUB & Robotics Lab · All Rights Reserved
        </p>
      </div>
    </Container>
  </footer>
);

export default function Landing({ onGetStarted, onSignIn, user }) {
  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header onGetStarted={onGetStarted} onSignIn={onSignIn} user={user} />

      <ContentBlock
        id="intro"
        type="right"
        isFirst={true}
        title="The premier platform for VLSI & Robotics Labs"
        content="Turbocharge your engineering prowess with a unified design platform — ASIC architecture, FPGA synthesis, ROS 2 robotics telemetry, and NBA-compliant OBE governance, all in one workspace."
        button={{ label: user ? "Go to Dashboard" : "Get Started", onClick: onGetStarted }}
        icon={Activity}
      />

      <MiddleBlock
        title="NBA ACCREDITED · ADVANCED RESEARCH"
        content="Aligning deep-tech engineering pipelines with Outcome-Based Education (OBE) metrics. Our infrastructure supports rigorous evaluation and comprehensive capability tracking."
        button={{ label: "Learn More", onClick: () => document.getElementById("about").scrollIntoView({ behavior: "smooth" }) }}
      />

      <ContentBlock
        id="about"
        type="left"
        title="Silicon Design & FPGA Synthesis"
        content="From RTL logic in Verilog/VHDL to full custom ASIC layouts and high-speed PCB routing. Equipped with industry-standard EDA tools for cutting-edge microelectronics research."
        icon={Code2}
      />

      <ContentBlock
        id="mission"
        type="right"
        title="Autonomous Robotics & Kinematics"
        content="Real-time edge compute, SLAM navigation, and motor control powered by ROS 2. Design and deploy intelligent autonomous systems seamlessly."
        icon={Bot}
      />

      <ContentBlock
        id="product"
        type="left"
        title="IoT & Wireless Telemetry"
        content="High-frequency data streaming via CAN bus, LoRaWAN, and MQTT architectures. Connect the physical world to robust cloud-based telemetry dashboards."
        icon={Radio}
      />

      <ContactForm />
      
      <Footer />
    </div>
  );
}
