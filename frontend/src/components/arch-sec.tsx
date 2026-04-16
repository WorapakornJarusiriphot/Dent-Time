import { type FunctionComponent } from "react";
import ArchitectureCard, { type ArchitectureCardProps } from "./a-c-web-application";

export type ArchSecProps = {
  className?: string;
};

/** Data for the 4 system architecture cards. */
const ARCHITECTURE_CARDS: Array<Omit<ArchitectureCardProps, "className">> = [
  {
    icon: "🌐",
    title: "Web Application",
    techStack: "React / Next.js",
    description:
      "Clinic staff fills treatment details and receives the predicted time window instantly.",
    iconBgColor: "#def7fc",
    tagBgColor: "#def7fc",
    tagPadding: "4px 10px",
    techStackColor: "#0e7da1",
  },
  {
    icon: "⚡",
    title: "FastAPI Backend",
    techStack: "FastAPI + Docker",
    description:
      "Receives requests, preprocesses features, routes to the ML inference layer.",
    iconBgColor: "#f0e6ff",
    tagBgColor: "#f0e6ff",
    tagPadding: undefined,
    techStackColor: "#7333bf",
  },
  {
    icon: "🧠",
    title: "ML Inference",
    techStack: "XGBoost → ONNX + Triton",
    description:
      "Loads versioned ONNX model from GCS. Runs inference with p99 latency under 1 second.",
    iconBgColor: "#fff5de",
    tagBgColor: "#fff5de",
    tagPadding: "4px 9px",
    techStackColor: "#bf800d",
  },
  {
    icon: "☁️",
    title: "Cloud Infrastructure",
    techStack: "GKE Autopilot + KServe",
    description:
      "Kubernetes auto-scales inference pods based on request volume across multiple clinics.",
    iconBgColor: "#defced",
    tagBgColor: "#defced",
    tagPadding: "4px 9px",
    techStackColor: "#0f9959",
  },
];

/**
 * System Architecture section displaying the 4 infrastructure cards
 * (Web App, FastAPI Backend, ML Inference, Cloud Infrastructure).
 */
const ArchSec: FunctionComponent<ArchSecProps> = ({ className = "" }) => {
  return (
    <section
      aria-labelledby="arch-sec-heading"
      className={`self-stretch bg-[#f0faff] overflow-hidden flex flex-col items-center justify-center !pt-[72px] !pb-[72px] !pl-20 !pr-20 gap-12 text-left text-xs text-[#0e7da1] font-[Inter] mq750:gap-6 mq750:!pt-[47px] mq750:!pb-[47px] mq750:!pl-10 mq750:!pr-10 mq750:box-border ${className}`}
    >
      <div className="self-stretch overflow-hidden flex flex-col items-center justify-center gap-3">
        <p className="!m-0 relative tracking-[2px] font-semibold">SYSTEM ARCHITECTURE</p>
        <h2
          id="arch-sec-heading"
          className="!m-0 relative text-4xl font-extrabold font-[inherit] text-[#0e2538] mq450:text-[22px] mq1050:text-[29px]"
        >
          How Predictions are Served
        </h2>
        <p className="!m-0 relative text-base text-[#708599]">
          The inference pipeline delivers real-time predictions through a
          scalable, cloud-ready architecture.
        </p>
      </div>

      <div
        className="self-stretch overflow-hidden flex items-start justify-center flex-wrap content-start gap-6 text-left text-xl text-[#0e2538] font-[Inter]"
        role="list"
        aria-label="System architecture components"
      >
        {ARCHITECTURE_CARDS.map((card) => (
          <ArchitectureCard
            key={card.title}
            icon={card.icon}
            title={card.title}
            techStack={card.techStack}
            description={card.description}
            iconBgColor={card.iconBgColor}
            tagBgColor={card.tagBgColor}
            tagPadding={card.tagPadding}
            techStackColor={card.techStackColor}
          />
        ))}
      </div>
    </section>
  );
};

export default ArchSec;
