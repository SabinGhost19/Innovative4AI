import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const keywords = [
    {
      text: "Reality is your sandbox",
      position: { top: "12%", left: "8%" }
    },
    {
      text: "Test your idea on a real-world map",
      position: { top: "18%", right: "5%" }
    },
    {
      text: "Where real data builds virtual empires",
      position: { top: "65%", left: "6%" }
    },
    {
      text: "The hyper-local business sim",
      position: { bottom: "22%", right: "8%" }
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
          <source src="/fundal.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Main Title */}
        <h1
          className="text-[12rem] font-light tracking-wider text-white/95 mb-32 select-none transition-all duration-500 hover:text-white hover:tracking-widest"
          style={{
            textShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 200,
            letterSpacing: '0.15em'
          }}
        >
          PROXITY
        </h1>

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
                className="rain-drop-text text-white/80 text-base font-light tracking-wide cursor-default block"
                style={{
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontFamily: "'DM Sans', 'Space Grotesk', sans-serif",
                  fontWeight: 400,
                }}
                onMouseEnter={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.style.transform = 'scale(1.15)';
                    parent.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)';
                    parent.style.boxShadow = '0 8px 32px rgba(255, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(255, 255, 255, 0.2)';
                  }
                  e.currentTarget.style.textShadow = '0 2px 12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(255, 255, 255, 0.6)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)';
                }}
                onMouseLeave={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.style.transform = 'scale(1)';
                    parent.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)';
                    parent.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.1)';
                  }
                  e.currentTarget.style.textShadow = '0 2px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
              >
                {keyword.text}
              </span>
            </div>
          </div>
        ))}

        {/* CTA Button */}
        <div className="absolute bottom-12">
          <Button
            size="lg"
            onClick={() => navigate("/onboarding")}
            className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 text-lg px-10 py-6 rounded-full transition-all duration-300 hover:scale-105"
            style={{
              boxShadow: '0 0 30px rgba(255, 255, 255, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 50px rgba(255, 255, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.2)';
            }}
          >
            Enter Proxity
          </Button>
        </div>
      </div>

      <style>{`
        .rain-drop-container {
          padding: 16px 28px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          border-radius: 50px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 8px 32px rgba(31, 38, 135, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .rain-drop-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
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
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .rain-drop-container:hover::after {
          opacity: 1;
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
