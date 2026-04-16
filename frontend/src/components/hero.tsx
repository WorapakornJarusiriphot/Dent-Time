import { type FunctionComponent } from "react";

export interface HeroProps {
  className?: string;
  /** Callback when the primary CTA (\"Try the Predictor\") is clicked */
  onTryPredictor?: () => void;
  /** Callback when the secondary CTA (\"How It Works\") is clicked */
  onHowItWorks?: () => void;
}

/**
 * Hero section for the DentTime landing page.
 * Displays the main headline, description, two CTA buttons,
 * and a mock appointment prediction card.
 */
const Hero: FunctionComponent<HeroProps> = ({
  className = "",
  onTryPredictor,
  onHowItWorks,
}) => {
  return (
    <main
      className={`self-stretch bg-[#f0faff] overflow-hidden flex items-center justify-center flex-wrap content-center !pt-24 !pb-24 !pl-20 !pr-20 box-border gap-20 max-w-full text-left text-[11px] text-[#708599] font-[Inter] mq750:gap-10 mq750:!pt-[62px] mq750:!pb-[62px] mq750:!pl-10 mq750:!pr-10 mq750:box-border mq450:gap-5 ${className}`}
    >
      {/* Left: headline + description + CTAs */}
      <section
        aria-labelledby="hero-heading"
        className="flex-1 overflow-hidden flex flex-col items-start gap-6 min-w-[494px] text-left text-[13px] text-[#0e7da1] font-[Inter] mq750:min-w-full"
      >
        <div className="rounded-[20px] bg-[#def7fc] overflow-hidden flex items-center justify-center !pt-1.5 !pb-1.5 !pl-3.5 !pr-3.5 shrink-0">
          <span className="relative font-semibold whitespace-pre-wrap text-[13px]">
            ✦ AI-Powered Dental Scheduling
          </span>
        </div>

        <h1
          id="hero-heading"
          className="!m-0 relative text-[52px] leading-[120%] font-extrabold font-[inherit] text-[#0e2538] shrink-0 mq450:text-[31px] mq450:leading-[37px] mq1050:text-[42px] mq1050:leading-[50px]"
        >
          Smart Scheduling
          <br />
          for Every Dental
          <br />
          Treatment
        </h1>

        <p className="!m-0 relative text-[17px] leading-[160%] text-[#708599] shrink-0">
          DentTime predicts the right treatment duration \u2014 15 to 105 minutes \u2014
          so clinic staff can book smarter appointments, reduce patient wait
          times, and keep dentists on schedule.
        </p>

        <div className="overflow-hidden flex items-center gap-4 shrink-0 text-base mq450:flex-wrap">
          <button
            type="button"
            onClick={onTryPredictor}
            className="rounded-lg bg-[#0e7da1] overflow-hidden flex items-center justify-center !pt-3.5 !pb-3.5 !pl-8 !pr-8 text-[#fff] cursor-pointer border-0 hover:bg-[#0b6a8a] transition-colors"
          >
            <span className="relative font-semibold">Try the Predictor \u2192</span>
          </button>
          <button
            type="button"
            onClick={onHowItWorks}
            className="rounded-lg bg-[#fff] border-[#0e7da1] border-solid border-[1.5px] overflow-hidden flex items-center justify-center !pt-3 !pb-3 !pl-[30px] !pr-[30px] text-[#0e7da1] cursor-pointer hover:bg-[#f0faff] transition-colors"
          >
            <span className="relative font-semibold">How It Works</span>
          </button>
        </div>
      </section>

      {/* Right: mock appointment prediction card */}
      <div
        role="presentation"
        aria-label="Appointment prediction card demo"
        className="w-[440px] shadow-[0px_20px_60px_rgba(14,_125,_161,_0.15)] rounded-[20px] bg-[#fff] overflow-hidden shrink-0 flex flex-col items-start !pt-6 !pb-6 !pl-7 !pr-7 box-border gap-3.5 max-w-full mq450:w-full"
      >
        {/* Card header */}
        <div className="self-stretch overflow-hidden flex items-center justify-between gap-5 shrink-0 text-[15px] text-[#0e2538]">
          <span className="relative font-semibold">Appointment Prediction</span>
          <div className="rounded-[20px] bg-[#defced] overflow-hidden flex items-center justify-center !pt-1 !pb-1 !pl-2.5 !pr-2.5 text-xs text-[#0f9959]">
            <span className="relative font-semibold">&#9679; Live</span>
          </div>
        </div>

        {/* Treatment field */}
        <div className="self-stretch overflow-hidden flex flex-col items-start gap-1 shrink-0 text-[11px] text-[#708599]">
          <span className="relative font-medium">Treatment</span>
          <div className="self-stretch rounded-lg bg-[#f7faff] border-[#e0edfa] border-solid border-[1px] overflow-hidden flex items-center !pt-[7px] !pb-[7px] !pl-3 !pr-3 text-[13px] text-[#0e2538]">
            <span className="relative">Scaling &amp; Root Planing</span>
          </div>
        </div>

        {/* Tooth No. field */}
        <div className="self-stretch overflow-hidden flex flex-col items-start gap-1 shrink-0 text-[11px] text-[#708599]">
          <span className="relative font-medium">Tooth No.</span>
          <div className="self-stretch rounded-lg bg-[#f7faff] border-[#e0edfa] border-solid border-[1px] overflow-hidden flex items-center !pt-[7px] !pb-[7px] !pl-3 !pr-3 text-[13px] text-[#0e2538]">
            <span className="relative">16, 17, 18</span>
          </div>
        </div>

        {/* Doctor field */}
        <div className="self-stretch overflow-hidden flex flex-col items-start gap-1 shrink-0 text-[11px] text-[#708599]">
          <span className="relative font-medium">Doctor</span>
          <div className="self-stretch rounded-lg bg-[#f7faff] border-[#e0edfa] border-solid border-[1px] overflow-hidden flex items-center !pt-[7px] !pb-[7px] !pl-[11px] !pr-[11px] text-[13px] text-[#0e2538]">
            <span className="relative">Dr. Somchai (ID: A-042)</span>
          </div>
        </div>

        <div className="self-stretch h-px bg-[#e0edfa] overflow-hidden shrink-0" />

        {/* Prediction result */}
        <div className="self-stretch rounded-xl bg-[#0e7da1] overflow-hidden flex items-center justify-between !pt-4 !pb-4 !pl-5 !pr-5 gap-5 shrink-0 text-xs text-[#b8e8f5] mq450:flex-wrap mq450:gap-5">
          <div className="overflow-hidden flex flex-col items-start gap-0.5">
            <span className="relative">Suggested Time Window</span>
            <h2 className="!m-0 relative text-3xl font-extrabold font-[inherit] text-[#fff] mq450:text-lg mq1050:text-2xl">
              60 minutes
            </h2>
          </div>
          <div className="overflow-hidden flex flex-col items-end gap-0.5 text-[11px]">
            <span className="relative">Confidence</span>
            <h3 className="!m-0 relative text-[22px] font-bold font-[inherit] text-[#fff] mq450:text-lg">
              87%
            </h3>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;
