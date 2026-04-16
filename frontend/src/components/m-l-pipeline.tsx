import { type FunctionComponent } from "react";
import PipelineStep from "./p-s";

export type MLPipelineProps = {
  className?: string;
};

/** Data for the 5-step ML pipeline. */
const PIPELINE_STEPS: Array<{
  icon: string;
  title: string;
  description: string;
  iconBackgroundColor?: string;
}> = [
  {
    icon: "🗄️",
    title: "CMS Data",
    description: `~1M records\nMySQL/PostgreSQL`,
  },
  {
    icon: "🧹",
    title: "Data Pipeline",
    description: `Cleaning +\nFeature Engineering`,
    iconBackgroundColor: "#7333bf",
  },
  {
    icon: "🤖",
    title: "XGBoost Train",
    description: `Chrono split\nGrid Search tuning`,
    iconBackgroundColor: "#bf800d",
  },
  {
    icon: "📊",
    title: "Evaluation",
    description: `Macro F1 + MAE\nUnder-est. rate`,
    iconBackgroundColor: "#0f9959",
  },
  {
    icon: "🚀",
    title: "FastAPI Serving",
    description: `REST endpoint\np99 < 1s`,
    iconBackgroundColor: "#0e7da1",
  },
];

/**
 * ML Pipeline section displaying the 5-step training pipeline
 * from raw CMS data to production FastAPI serving.
 */
const MLPipeline: FunctionComponent<MLPipelineProps> = ({ className = "" }) => {
  return (
    <section
      aria-labelledby="ml-pipeline-heading"
      className={`self-stretch bg-[#fff] overflow-hidden flex flex-col items-center justify-center !pt-[72px] !pb-[72px] !pl-20 !pr-20 gap-12 text-left text-xs text-[#0e7da1] font-[Inter] mq750:gap-6 mq750:!pl-10 mq750:!pr-10 mq750:box-border mq450:!pt-[47px] mq450:!pb-[47px] mq450:box-border ${className}`}
    >
      <div className="self-stretch overflow-hidden flex flex-col items-center justify-center gap-3">
        <p className="!m-0 relative tracking-[2px] font-semibold">ML PIPELINE</p>
        <h2
          id="ml-pipeline-heading"
          className="!m-0 relative text-4xl font-extrabold font-[inherit] text-[#0e2538] mq450:text-[22px] mq1050:text-[29px]"
        >
          How the Model is Built
        </h2>
        <p className="!m-0 relative text-base text-[#708599]">
          A fully designed training pipeline processes 1M+ historical records
          into a production-ready XGBoost classifier.
        </p>
      </div>

      <div
        className="self-stretch overflow-hidden flex items-center gap-2 text-left text-xl text-[#e0edfa] font-[Inter] lg:flex-wrap"
        role="list"
        aria-label="ML pipeline steps"
      >
        {PIPELINE_STEPS.map((step, index) => (
          <div key={step.title} role="listitem" className="flex-1 min-w-[148px]">
            <PipelineStep
              className="w-full"
              icon={step.icon}
              title={step.title}
              description={step.description}
              iconBackgroundColor={step.iconBackgroundColor}
            />
            {index < PIPELINE_STEPS.length - 1 && (
              <span
                className="relative text-[length:inherit] font-normal mq450:text-base"
                aria-hidden="true"
              >
                →
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default MLPipeline;
