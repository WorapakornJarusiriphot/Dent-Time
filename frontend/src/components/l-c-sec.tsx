import { type FunctionComponent } from "react";

export type LCSecProps = {
  className?: string;
};

type AutomationLevel = "Manual" | "Semi-auto" | "Partial" | "Not started";

type LifecycleStage = {
  step: number;
  title: string;
  description: string;
  automationLabel: string;
  automationLevel: AutomationLevel;
  /** Tailwind classes for the automation badge background */
  badgeBgClass: string;
  /** Tailwind classes for the automation badge text color */
  badgeTextClass: string;
  /** Tailwind classes for the row background */
  rowBgClass: string;
};

const LIFECYCLE_STAGES: LifecycleStage[] = [
  {
    step: 1,
    title: "Data Collection & Extraction",
    description: "SQL from CMS + SHA-256 Anonymization of doctor IDs",
    automationLabel: "Manual (Airflow DAG)",
    automationLevel: "Manual",
    badgeBgClass: "bg-[#defced]",
    badgeTextClass: "text-[#0f9959]",
    rowBgClass: "bg-[#fff]",
  },
  {
    step: 2,
    title: "Data Cleaning & Feature Engineering",
    description:
      "Missing data handling, fuzzy matching, outlier removal, feature creation",
    automationLabel: "Semi-auto (Airflow)",
    automationLevel: "Semi-auto",
    badgeBgClass: "bg-[#def7fc]",
    badgeTextClass: "text-[#0e7da1]",
    rowBgClass: "bg-[#f0faff]",
  },
  {
    step: 3,
    title: "Model Training & Tuning",
    description: "XGBoost + Random Forest, Grid Search on Validation Set",
    automationLabel: "Manual (MLflow)",
    automationLevel: "Manual",
    badgeBgClass: "bg-[#f0e6ff]",
    badgeTextClass: "text-[#7333bf]",
    rowBgClass: "bg-[#fff]",
  },
  {
    step: 4,
    title: "Offline Evaluation",
    description:
      "Macro F1, Under-estimation Rate, MAE on held-out Test Set",
    automationLabel: "Manual (MLflow)",
    automationLevel: "Manual",
    badgeBgClass: "bg-[#f0e6ff]",
    badgeTextClass: "text-[#7333bf]",
    rowBgClass: "bg-[#f0faff]",
  },
  {
    step: 5,
    title: "Model Deployment",
    description:
      "Export .pkl → FastAPI + Docker → ONNX (planned for KServe)",
    automationLabel: "Partial (FastAPI)",
    automationLevel: "Partial",
    badgeBgClass: "bg-[#fff5de]",
    badgeTextClass: "text-[#bf800d]",
    rowBgClass: "bg-[#fff]",
  },
  {
    step: 6,
    title: "Monitoring & Feedback",
    description:
      "Latency, drift detection (PSI, MMD), automated retrain triggers",
    automationLabel: "Not started",
    automationLevel: "Not started",
    badgeBgClass: "bg-[#e0edfa]",
    badgeTextClass: "text-[#708599]",
    rowBgClass: "bg-[#f0faff]",
  },
];

/**
 * ML Lifecycle section showing all 6 stages from data collection
 * to monitoring, with automation level badges for each stage.
 */
const LCSec: FunctionComponent<LCSecProps> = ({ className = "" }) => {
  return (
    <section
      aria-labelledby="lc-sec-heading"
      className={`self-stretch bg-[#f0faff] overflow-hidden flex flex-col items-center justify-center !pt-16 !pb-16 !pl-20 !pr-20 box-border gap-10 max-w-full text-left text-xs text-[#0e7da1] font-[Inter] mq750:gap-5 mq750:!pt-[42px] mq750:!pb-[42px] mq750:!pl-10 mq750:!pr-10 mq750:box-border ${className}`}
    >
      <div className="self-stretch overflow-hidden flex flex-col items-center justify-center gap-3">
        <p className="!m-0 relative tracking-[2px] font-semibold">ML LIFECYCLE</p>
        <h2
          id="lc-sec-heading"
          className="!m-0 relative text-4xl font-extrabold font-[inherit] text-[#0e2538] mq450:text-[22px] mq1050:text-[29px]"
        >
          6-Stage Model Lifecycle
        </h2>
        <p className="!m-0 relative text-base text-[#708599]">
          From raw data extraction to production monitoring — each stage
          designed for the PoC phase.
        </p>
      </div>

      <ol
        aria-label="ML lifecycle stages"
        className="self-stretch rounded-2xl bg-[#fff] border-[#e0edfa] border-solid border-[1px] box-border overflow-hidden flex flex-col items-start max-w-full text-[13px] text-[#fff] list-none !m-0 !p-0"
      >
        {LIFECYCLE_STAGES.map((stage) => (
          <li
            key={stage.step}
            className={`self-stretch ${stage.rowBgClass} overflow-x-auto flex items-center !pt-4 !pb-4 !pl-6 !pr-6 box-border gap-4 max-w-full lg:flex-wrap`}
          >
            <div
              className="rounded-lg bg-[#0e7da1] overflow-hidden shrink-0 flex items-center justify-center w-7 h-7"
              aria-hidden="true"
            >
              <b className="relative text-[#fff] text-xs">{stage.step}</b>
            </div>
            <span className="w-[220px] relative text-sm font-semibold text-[#0e2538] inline-block shrink-0">
              {stage.title}
            </span>
            <span className="w-[360px] relative leading-[150%] text-[#708599] inline-block shrink-0 max-w-full">
              {stage.description}
            </span>
            <div className="h-px flex-1 overflow-hidden flex flex-col items-start min-w-[287px]" />
            <span
              className={`rounded-[20px] ${stage.badgeBgClass} overflow-hidden shrink-0 flex items-center justify-center !pt-[5px] !pb-[5px] !pl-3 !pr-3 text-xs ${stage.badgeTextClass}`}
              aria-label={`Automation: ${stage.automationLevel}`}
            >
              <span className="relative font-medium">{stage.automationLabel}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default LCSec;
