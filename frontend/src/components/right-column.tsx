import { type FunctionComponent } from "react";

type PredictionResult = {
  predicted_duration_class: number;
  confidence?: number;
  status: string;
  unit: string;
  model_version: string;
  timestamp: string;
  request_id: string;
};

export type RightColumnType = {
  className?: string;
  result?: PredictionResult | null;
  isLoading?: boolean;
};

interface StatCard {
  label: string;
  value: string;
}

const STAT_CARDS: StatCard[] = [
  { label: "Treatment Class", value: "Scaling — Class 3" },
  { label: "Tooth Count", value: "3 teeth" },
  { label: "Doctor Speed", value: "1.08× avg" },
  { label: "Latency", value: "< 0.3s" },
];

const PROBABILITY_SLOTS = [15, 30, 45, 60, 75, 90, 105] as const;

/**
 * Prediction result panel showing XGBoost model output:
 * suggested time window, confidence score, class probability
 * distribution, stat cards, and under-estimation guard banner.
 */
const RightColumn: FunctionComponent<RightColumnType> = ({
  className = "",
  result,
  isLoading = false,
}) => {
  const predictedMinutes =
    !isLoading && result?.predicted_duration_class != null
      ? result.predicted_duration_class
      : "--";

  const confidence =
    !isLoading && result?.confidence != null
      ? result.confidence
      : 0;

  const status = isLoading ? "loading" : result?.status ?? "Not predicted yet";
  return (
    <div
      className={`overflow-hidden flex flex-col items-start gap-5 text-left text-[13px] text-[#b8e8f5] font-[Inter] ${className}`}
    >
      {/* Main prediction card */}
      <div className="self-stretch shadow-[0px_12px_40px_rgba(14,_125,_161,_0.3)] rounded-2xl bg-[#0e7da1] overflow-hidden flex flex-col items-start !p-7 gap-5 mq450:!pt-5 mq450:!pb-5 mq450:box-border">

        {/* Card header */}
        <div className="self-stretch overflow-hidden flex items-center justify-between gap-0 text-sm">
          <span className="relative font-semibold shrink-0">
            Prediction Result
          </span>
          <div
            aria-label={`Model: ${result?.model_version ?? "Unknown"}`}
            className="rounded-[20px] bg-[rgba(14,37,56,0.3)] overflow-hidden flex items-center justify-center !pt-1 !pb-1 !pl-2.5 !pr-2.5 shrink-0 text-[11px] text-[#fff]"
          >
            <span className="relative">{result?.model_version ?? "Model"}</span>
          </div>
        </div>

        {/* Suggested time window */}
        <div className="self-stretch overflow-hidden flex flex-col items-start gap-1">
          <span className="relative shrink-0">Suggested Time Window</span>
          <div className="overflow-hidden flex items-start gap-2 shrink-0 text-7xl text-[#fff]">
            <span
              aria-label={
                typeof predictedMinutes === "number"
                  ? `${predictedMinutes} minutes`
                  : "Prediction loading"
              }
              className="relative font-extrabold font-[Inter] text-[length:inherit] mq1000:text-[58px] mq450:text-[43px]"
            >
              {predictedMinutes}
            </span>
            <div className="self-stretch overflow-hidden flex flex-col items-start justify-end text-xl text-[#b8e8f5]">
              <span className="relative font-bold font-[Inter] text-[length:inherit] mq450:text-base">
                min
              </span>
            </div>
          </div>
        </div>

        {/* Model confidence */}
        <div className="self-stretch overflow-hidden flex flex-col items-start gap-2">
          <div className="self-stretch overflow-hidden flex items-center justify-between gap-0">
            <span className="relative font-medium shrink-0">Model Confidence</span>
            <b className="relative text-sm text-[#fff] shrink-0">{confidence}%</b>
          </div>
          <div
            role="progressbar"
            aria-valuenow={confidence}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Model confidence ${confidence}%`}
            className="self-stretch h-1.5 rounded bg-[rgba(14,37,56,0.25)] overflow-hidden shrink-0 flex flex-col items-start"
          >
            <div
              className="h-1.5 rounded bg-[#fff] overflow-hidden shrink-0 flex flex-col items-start"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
        
        {/* Status */}
        <div className="flex items-center gap-3 text-white">
          <span className="text-base font-medium">Status:</span>

          {isLoading ? (
            <>
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span className="text-lg font-semibold">Loading...</span>
            </>
          ) : (
            <span className="text-lg font-semibold">{status}</span>
          )}
        </div>

        {/* Class probability distribution */}
        <div className="self-stretch overflow-hidden flex flex-col items-start gap-2.5 text-xs">
          <span className="relative font-medium shrink-0">
            Class Probability Distribution
          </span>
          <div
            aria-label="Probability distribution chart"
            className="self-stretch overflow-hidden flex items-end gap-1.5 shrink-0 text-[10px]"
          >
            {PROBABILITY_SLOTS.map((slot) => (
              <div
                key={slot}
                className="flex-1 overflow-hidden flex flex-col items-center justify-end gap-1"
              >
                <div
                  className={`self-stretch rounded-[3px] overflow-hidden shrink-0 flex flex-col items-start ${
                    slot === predictedMinutes
                      ? "h-[52px] bg-[#fff]"
                      : "h-1 bg-[#b8e8f5]"
                  }`}
                />
                <span className="relative shrink-0">{slot}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards row */}
      <div
        aria-label="Prediction statistics"
        className="self-stretch overflow-hidden flex items-start gap-3 text-[11px] text-[#708599]"
      >
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="flex-1 rounded-[10px] bg-[#fff] border-[#e0edfa] border-solid border-[1px] overflow-hidden flex flex-col items-start !pt-3 !pb-3 !pl-4 !pr-4 gap-1"
          >
            <span className="relative whitespace-nowrap shrink-0">{card.label}</span>
            <span className="relative text-sm font-semibold text-[#0e2538] whitespace-nowrap shrink-0">
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* Under-estimation guard warning */}
      <div
        role="alert"
        className="self-stretch rounded-[10px] bg-[#fff2de] border-[#d9730d] border-solid border-[1px] overflow-hidden flex items-start !pt-3 !pb-3 !pl-[15px] !pr-[15px] text-[#d9730d]"
      >
        <div className="flex-1 overflow-hidden flex flex-col items-start gap-[3px]">
          <span className="relative font-semibold whitespace-pre-wrap shrink-0">
            ⚠️ Under-estimation Guard Active
          </span>
          <p className="!m-0 relative text-xs leading-[150%] text-[#33455c] shrink-0">
            Prediction rounded up to the next safe slot to minimise patient wait
            time risk.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RightColumn;
