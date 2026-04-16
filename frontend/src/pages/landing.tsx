import { type FunctionComponent } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Hero from "../components/hero";
import Features from "../components/features";

/**
 * DentTime landing page.
 * Composes the sticky Navbar, Hero section, Stats Banner,
 * Features section, CTA section, and Footer.
 */
const Landing: FunctionComponent = () => {
  const navigate = useNavigate();

  const handleTryPredictor = () => navigate("/predict");
  const handleHowItWorks = () => navigate("/how-it-works");

  return (
    <div className="w-full relative bg-[#f0faff] flex flex-col items-center leading-[normal] tracking-[normal]">
      <Navbar />

      <Hero
        onTryPredictor={handleTryPredictor}
        onHowItWorks={handleHowItWorks}
      />

      {/* Stats Banner */}
      <section
        aria-label="Key statistics"
        className="self-stretch bg-[#0e7da1] overflow-hidden flex items-center justify-center !pt-10 !pb-10 !pl-20 !pr-20 [row-gap:20px] text-left text-[32px] text-[#fff] font-[Inter] mq750:!pl-10 mq750:!pr-10 mq750:box-border mq1125:flex-wrap"
      >
        <div className="flex-1 overflow-hidden flex flex-col items-center justify-center !pt-0 !pb-0 !pl-8 !pr-8 box-border gap-1 min-w-[207px]">
          <h2 className="!m-0 relative text-[length:inherit] font-extrabold font-[inherit] mq450:text-[19px] mq1050:text-[26px]">
            1M+
          </h2>
          <p className="!m-0 relative text-sm text-[#b8e8f5]">
            Historical Records
          </p>
        </div>
        <div className="h-12 w-px bg-[#fff] overflow-hidden shrink-0 flex flex-col items-start mq1125:w-full mq1125:h-px" />
        <div className="flex-1 overflow-hidden flex flex-col items-center justify-center !pt-0 !pb-0 !pl-8 !pr-8 box-border gap-1 min-w-[207px]">
          <h2 className="!m-0 relative text-[length:inherit] font-extrabold font-[inherit] mq450:text-[19px] mq1050:text-[26px]">
            7
          </h2>
          <p className="!m-0 relative text-sm text-[#b8e8f5]">
            Duration Slots (15&ndash;105 min)
          </p>
        </div>
        <div className="h-12 w-px bg-[#fff] overflow-hidden shrink-0 flex flex-col items-start mq1125:w-full mq1125:h-px" />
        <div className="flex-1 overflow-hidden flex flex-col items-center justify-center !pt-0 !pb-0 !pl-8 !pr-8 box-border gap-1 min-w-[207px]">
          <h2 className="!m-0 relative text-[length:inherit] font-extrabold font-[inherit] mq450:text-[19px] mq1050:text-[26px]">
            p99 &lt; 1s
          </h2>
          <p className="!m-0 relative text-sm text-[#b8e8f5]">
            Prediction Latency
          </p>
        </div>
        <div className="h-12 w-px bg-[#fff] overflow-hidden shrink-0 flex flex-col items-start mq1125:w-full mq1125:h-px" />
        <div className="flex-1 overflow-hidden flex flex-col items-center justify-center !pt-0 !pb-0 !pl-8 !pr-8 box-border gap-1 min-w-[207px]">
          <h2 className="!m-0 relative text-[length:inherit] font-extrabold font-[inherit] mq450:text-[19px] mq1050:text-[26px]">
            XGBoost
          </h2>
          <p className="!m-0 relative text-sm text-[#b8e8f5]">
            Primary ML Model
          </p>
        </div>
      </section>

      <Features />

      {/* CTA Section */}
      <section
        aria-labelledby="cta-heading"
        className="self-stretch bg-[#f0faff] overflow-hidden flex flex-col items-center justify-center !p-20 gap-6 text-left text-base text-[#0e2538] font-[Inter] mq1050:!pl-10 mq1050:!pr-10 mq1050:box-border"
      >
        <h2
          id="cta-heading"
          className="!m-0 relative text-4xl font-extrabold font-[inherit] mq450:text-[22px] mq1050:text-[29px]"
        >
          Ready to predict smarter appointments?
        </h2>
        <p className="!m-0 relative text-[#708599]">
          Enter treatment details and get an AI-predicted time window in under 1
          second.
        </p>
        <button
          type="button"
          onClick={handleTryPredictor}
          className="rounded-lg bg-[#0e7da1] overflow-hidden flex items-center justify-center !pt-4 !pb-4 !pl-10 !pr-10 text-[#fff] cursor-pointer border-0 hover:bg-[#0b6a8a] transition-colors"
        >
          <span className="relative font-semibold">Go to Predictor &#8594;</span>
        </button>
      </section>

      {/* Footer */}
      <footer className="self-stretch bg-[#0e2538] overflow-hidden flex items-center justify-between !pt-7 !pb-7 !pl-20 !pr-20 box-border gap-5 max-w-full text-left text-sm text-[#fff] font-[Inter] mq750:flex-wrap mq750:gap-5 mq750:!pl-10 mq750:!pr-10 mq750:box-border">
        <span className="relative font-semibold inline-block max-w-full">
          DentTime &mdash; AI-Powered Smart Dentist Scheduling
        </span>
        <span className="relative text-[13px] text-[#708599]">
          SE for ML Project &middot; 2025
        </span>
      </footer>
    </div>
  );
};

export default Landing;
