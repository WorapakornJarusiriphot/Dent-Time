import { type FunctionComponent } from "react";
import Navbar from "../components/navbar";
import MLPipeline from "../components/m-l-pipeline";
import ArchSec from "../components/arch-sec";
import PerfSec from "../components/perf-sec";
import LCSec from "../components/l-c-sec";

/**
 * How It Works page — explains the full DentTime ML system.
 *
 * Sections:
 * 1. Hero banner with page title and subtitle
 * 2. ML Pipeline — 5-step training pipeline
 * 3. System Architecture — 4-tier inference architecture
 * 4. Model Performance — 4 evaluation metric cards
 * 5. ML Lifecycle — 6-stage lifecycle table
 * 6. Footer
 */
const HowItWorks: FunctionComponent = () => {
  return (
    <div className="w-full relative bg-[#f0faff] flex flex-col items-center leading-[normal] tracking-[normal]">
      <Navbar />

      {/* Hero Banner */}
      <section
        aria-labelledby="how-it-works-heading"
        className="self-stretch bg-[#0e7da1] overflow-hidden flex flex-col items-center justify-center !pt-16 !pb-16 !pl-20 !pr-20 gap-4 text-left text-xs text-[#b8e8f5] font-[Inter] mq1050:!pl-10 mq1050:!pr-10 mq1050:box-border"
      >
        <p className="!m-0 relative tracking-[2px] font-semibold">
          HOW IT WORKS
        </p>
        <h1
          id="how-it-works-heading"
          className="!m-0 relative text-[44px] font-extrabold font-[inherit] text-[#fff] mq450:text-[26px] mq1050:text-[35px]"
        >
          From Data to Decision in Under 1 Second
        </h1>
        <p className="!m-0 relative text-[17px]">
          DentTime is a full ML system — from raw clinic data to real-time
          appointment scheduling support.
        </p>
      </section>

      <MLPipeline />
      <ArchSec />
      <PerfSec />
      <LCSec />

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

export default HowItWorks;
