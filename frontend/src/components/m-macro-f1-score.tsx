import { type FunctionComponent, useMemo, type CSSProperties } from "react";

export type MetricCardProps = {
  className?: string;
  /** Primary displayed value (e.g. "0.76", "12%") */
  value?: string;
  /** Metric title (e.g. "Macro F1-Score") */
  title?: string;
  /** Short description of the metric */
  description?: string;
  /** Background color of the value badge */
  valueBgColor?: CSSProperties["backgroundColor"];
  /** Padding of the value badge */
  valuePadding?: CSSProperties["padding"];
  /** Text color of the value */
  valueColor?: CSSProperties["color"];
};

/**
 * A single metric card in the Model Performance section.
 * Displays a colored value badge, title, and description.
 */
const MetricCard: FunctionComponent<MetricCardProps> = ({
  className = "",
  value,
  title,
  description,
  valueBgColor,
  valuePadding,
  valueColor,
}) => {
  const valueBadgeStyle: CSSProperties = useMemo(
    () => ({ backgroundColor: valueBgColor, padding: valuePadding }),
    [valueBgColor, valuePadding]
  );

  const valueTextStyle: CSSProperties = useMemo(
    () => ({ color: valueColor }),
    [valueColor]
  );

  return (
    <div
      className={`flex-1 rounded-2xl bg-[#f0faff] border-[#e0edfa] border-solid border-[1px] box-border overflow-hidden flex flex-col items-start !pt-[26px] !pb-[26px] !pl-7 !pr-5 gap-3.5 min-w-[239px] max-w-[302px] text-left text-4xl text-[#0e7da1] font-[Inter] ${className}`}
    >
      <div
        className="self-stretch rounded-xl bg-[#def7fc] overflow-hidden flex flex-col items-center justify-center !pt-3 !pb-3 !pl-4 !pr-4 shrink-0"
        style={valueBadgeStyle}
      >
        <h2
          className="!m-0 relative text-[length:inherit] font-extrabold font-[inherit] mq450:text-[22px] mq1050:text-[29px]"
          style={valueTextStyle}
        >
          {value}
        </h2>
      </div>
      <b className="relative text-sm text-[#0e2538] shrink-0">{title}</b>
      <p className="!m-0 relative text-xs leading-[150%] text-[#708599] shrink-0">
        {description}
      </p>
    </div>
  );
};

export default MetricCard;
