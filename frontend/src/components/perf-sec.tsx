import { type FunctionComponent } from "react";
import MetricCard, { type MetricCardProps } from "./m-macro-f1-score";

export type PerfSecProps = {
  className?: string;
};

/** Data for the 4 model performance metric cards. */
const METRIC_CARDS: Array<Omit<MetricCardProps, "className">> = [
  {
    value: "0.76",
    title: "Macro F1-Score",
    description: "Primary metric — equal weight across all 7 duration classes",
    valueBgColor: "#def7fc",
    valuePadding: "12px 16px",
    valueColor: "#0e7da1",
  },
  {
    value: "12%",
    title: "Under-estimation Rate",
    description: "% of cases where predicted slot is shorter than actual",
    valueBgColor: "#fff5de",
    valuePadding: "12px 14px",
    valueColor: "#bf800d",
  },
  {
    value: "8.4 min",
    title: "Mean Abs. Error",
    description: "Average error in minutes across all 7 time slot classes",
    valueBgColor: "#f0e6ff",
    valuePadding: "12px 15px",
    valueColor: "#7333bf",
  },
  {
    value: "< 1s",
    title: "Inference Latency",
    description: "End-to-end p99 latency with KServe + Triton on GKE",
    valueBgColor: "#defced",
    valuePadding: undefined,
    valueColor: "#0f9959",
  },
];

/**
 * Model Performance section displaying 4 key evaluation metric cards
 * measured on held-out chronological test data.
 */
const PerfSec: FunctionComponent<PerfSecProps> = ({ className = "" }) => {
  return (
    <section
      aria-labelledby="perf-sec-heading"
      className={`self-stretch bg-[#fff] overflow-hidden flex flex-col items-center justify-center !pt-[72px] !pb-[72px] !pl-20 !pr-20 gap-12 text-left text-xs text-[#0e7da1] font-[Inter] mq750:gap-6 mq750:!pt-[47px] mq750:!pb-[47px] mq750:!pl-10 mq750:!pr-10 mq750:box-border ${className}`}
    >
      <div className="self-stretch overflow-hidden flex flex-col items-center justify-center gap-3">
        <p className="!m-0 relative tracking-[2px] font-semibold">MODEL PERFORMANCE</p>
        <h2
          id="perf-sec-heading"
          className="!m-0 relative text-4xl font-extrabold font-[inherit] text-[#0e2538] mq450:text-[22px] mq1050:text-[29px]"
        >
          Evaluation Metrics
        </h2>
        <p className="!m-0 relative text-base text-[#708599]">
          Measured on held-out test data (Month 12) using chronological split to
          prevent data leakage.
        </p>
      </div>

      <div
        className="self-stretch overflow-hidden flex items-start justify-center flex-wrap content-start gap-6 text-left text-4xl text-[#0e7da1] font-[Inter]"
        role="list"
        aria-label="Model performance metrics"
      >
        {METRIC_CARDS.map((card) => (
          <MetricCard
            key={card.title}
            value={card.value}
            title={card.title}
            description={card.description}
            valueBgColor={card.valueBgColor}
            valuePadding={card.valuePadding}
            valueColor={card.valueColor}
          />
        ))}
      </div>
    </section>
  );
};

export default PerfSec;
