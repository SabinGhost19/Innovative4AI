import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const keywords = [
    {
      text: "AI-Powered Insights",
      position: { top: "20%", left: "12%" }
    },
    {
      text: "Real Data. Real Results.",
      position: { top: "28%", right: "10%" }
    },
    {
      text: "Simulate → Validate → Dominate",
      position: { top: "68%", left: "10%" }
    },
    {
      text: "Your Edge in NYC Business",
      position: { bottom: "25%", right: "12%" }
    }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-105"
          style={{ filter: 'blur(8px) brightness(0.6)' }}
        >
          <source src="/bg2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Main Title with modern positioning */}
        <div className="text-center -mt-20">
          <h1
            className="text-[11rem] font-extralight tracking-widest text-white/95 mb-4 select-none transition-all duration-700 hover:text-white hover:tracking-[0.25em] hover:scale-105"
            style={{
              textShadow: '0 0 60px rgba(212, 175, 55, 0.4), 0 0 100px rgba(212, 175, 55, 0.15)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 100,
              letterSpacing: '0.18em',
              animation: 'titleGlow 3s ease-in-out infinite alternate'
            }}
          >
            PROXITY
          </h1>

          {/* Slogan with sophisticated styling */}
          <div className="relative inline-block">
            <p
              className="text-xl font-light text-white/85 tracking-[0.15em] select-none uppercase"
              style={{
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.25)',
                fontFamily: "'Inter', 'DM Sans', sans-serif",
                letterSpacing: '0.2em',
                fontWeight: 300
              }}
            >
              Don't gamble with your future
            </p>
            <div 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-[1px]"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent)',
                boxShadow: '0 0 10px rgba(212, 175, 55, 0.3)'
              }}
            />
          </div>
        </div>

        {/* Water Drop Keywords */}
        {keywords.map((keyword, index) => (
          <div
            key={index}
            className="absolute water-drop"
            style={{
              ...keyword.position,
              animation: `fadeInDrop 0.8s ease-out ${index * 0.4}s both, float 6s ease-in-out ${index * 0.5}s infinite`
            }}
          >
            <div className="rain-drop-container">
              <span
                className="rain-drop-text text-white/85 text-sm font-medium tracking-wider cursor-default block"
                style={{
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.25)',
                  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  fontFamily: "'Inter', 'Space Grotesk', sans-serif",
                  fontWeight: 500,
                  letterSpacing: '0.08em'
                }}
                onMouseEnter={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.style.transform = 'scale(1.12) translateY(-4px)';
                    parent.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(0, 0, 0, 0.7) 100%)';
                    parent.style.boxShadow = '0 15px 50px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.15), inset 0 1px 0 rgba(212, 175, 55, 0.5), inset 0 -1px 0 rgba(212, 175, 55, 0.25)';
                    parent.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                  }
                  e.currentTarget.style.textShadow = '0 2px 15px rgba(0, 0, 0, 0.9), 0 0 50px rgba(212, 175, 55, 0.5)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.98)';
                  e.currentTarget.style.letterSpacing = '0.12em';
                }}
                onMouseLeave={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.style.transform = 'scale(1)';
                    parent.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.06) 0%, rgba(0, 0, 0, 0.6) 100%)';
                    parent.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(212, 175, 55, 0.08), inset 0 1px 0 rgba(212, 175, 55, 0.3), inset 0 -1px 0 rgba(212, 175, 55, 0.15)';
                    parent.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                  }
                  e.currentTarget.style.textShadow = '0 2px 10px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.25)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                  e.currentTarget.style.letterSpacing = '0.08em';
                }}
              >
                {keyword.text}
              </span>
            </div>
          </div>
        ))}

        {/* CTA Button */}
        <div className="absolute bottom-16">
          <Button
            size="lg"
            onClick={() => navigate("/register")}
            className="bg-white/10 hover:bg-white/15 text-white backdrop-blur-md border border-yellow-500/25 text-lg px-12 py-7 rounded-full transition-all duration-500 hover:scale-110 hover:shadow-2xl font-medium tracking-wider"
            style={{
              boxShadow: '0 0 25px rgba(212, 175, 55, 0.12), 0 10px 30px rgba(0, 0, 0, 0.5)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 35px rgba(212, 175, 55, 0.25), 0 15px 40px rgba(0, 0, 0, 0.6)';
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 25px rgba(212, 175, 55, 0.12), 0 10px 30px rgba(0, 0, 0, 0.5)';
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.25)';
            }}
          >
            Jump In Your Virtual Environment
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes titleGlow {
          0% {
            text-shadow: 0 0 60px rgba(212, 175, 55, 0.3), 0 0 100px rgba(212, 175, 55, 0.15);
          }
          100% {
            text-shadow: 0 0 80px rgba(212, 175, 55, 0.5), 0 0 120px rgba(212, 175, 55, 0.25);
          }
        }

        .rain-drop-container {
          padding: 14px 26px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.06) 0%, rgba(0, 0, 0, 0.6) 100%);
          backdrop-filter: blur(16px) saturate(200%);
          -webkit-backdrop-filter: blur(16px) saturate(200%);
          border-radius: 40px;
          border: 1px solid rgba(212, 175, 55, 0.2);
          box-shadow: 
            0 10px 40px rgba(0, 0, 0, 0.4),
            0 0 20px rgba(212, 175, 55, 0.08),
            inset 0 1px 0 rgba(212, 175, 55, 0.3),
            inset 0 -1px 0 rgba(212, 175, 55, 0.15);
          position: relative;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }

        .rain-drop-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.25), transparent);
          transition: left 0.6s ease;
        }

        .rain-drop-container:hover::before {
          left: 100%;
        }

        .rain-drop-container::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .rain-drop-container:hover::after {
          opacity: 1;
        }

        .rain-drop-text {
          position: relative;
          z-index: 1;
        }

        @keyframes fadeInDrop {
          0% {
            opacity: 0;
            transform: translateY(-30px) scale(0.8);
            filter: blur(10px);
          }
          50% {
            filter: blur(5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-10px) translateX(5px);
          }
          50% {
            transform: translateY(0px) translateX(-5px);
          }
          75% {
            transform: translateY(10px) translateX(5px);
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;
