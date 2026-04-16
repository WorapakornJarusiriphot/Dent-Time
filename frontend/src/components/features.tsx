import { type FunctionComponent } from "react";
import FeatureCard from "./card-accurate-duration-predict";

export interface FeaturesProps {
  className?: string;
}

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

const FEATURE_ITEMS: FeatureItem[] = [
  {
    icon: "\u23F1",
    title: "Accurate Duration Prediction",
    description:
      "XGBoost classifies treatment into 7 time slots (15\u2013105 min) based on treatment type, tooth count, and doctor profile \u2014 trained on 1M+ real records.",
  },
  {
    icon: "\uD83D\uDCC9",
    title: "Reduce Wait Times",
    description:
      "Eliminate over-booking and under-booking gaps. Give patients realistic wait estimates and keep dentists running on schedule all day.",
  },
  {
    icon: "\uD83E\uDD16",
    title: "AI Decision Support",
    description:
      "Real-time online prediction with p99 latency under 1 second. Clinic staff get an instant suggested time window as they book.",
  },
];

/**
 * The \"Why DentTime?\" features section displaying three key capability cards.
 */
const Features: FunctionComponent<FeaturesProps> = ({ className = "" }) => {
  return (
    <section
      aria-labelledby="features-heading"
      className={`self-stretch bg-[#fff] overflow-hidden flex flex-col items-center justify-center !p-20 gap-12 text-left text-xs text-[#0e7da1] font-[Inter] mq750:gap-6 mq750:!pl-10 mq750:!pr-10 mq750:box-border mq450:!pt-[52px] mq450:!pb-[52px] mq450:box-border ${className}`}
    >
      <div className="self-stretch overflow-hidden flex flex-col items-center justify-center gap-3">
        <p className="relative tracking-[2px] font-semibold !m-0">KEY FEATURES</p>
        <h2
          id="features-heading"
          className="!m-0 relative text-4xl font-extrabold font-[inherit] text-[#0e2538] mq450:text-[22px] mq1050:text-[29px]"
        >
          Why DentTime?
        </h2>
        <p className="relative text-base text-[#708599] !m-0">
          Built for dental clinics \u2014 designed around real scheduling challenges.
        </p>
      </div>
      <div className="self-stretch overflow-hidden flex items-start justify-center flex-wrap content-start gap-6 text-left text-[22px] text-[#0e2538] font-[Inter]">
        {FEATURE_ITEMS.map((item) => (
          <FeatureCard
            key={item.title}
            icon={item.icon}
            title={item.title}
            description={item.description}
          />
        ))}
      </div>
    </section>
  );
};

export default Features;
