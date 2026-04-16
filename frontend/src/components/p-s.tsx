import { type FunctionComponent, useMemo, type CSSProperties } from "react";

export type PipelineStepProps = {
  className?: string;
  /** Emoji or icon character to display */
  icon?: string;
  /** Step title (e.g. "CMS Data") */
  title?: string;
  /** Step description (supports newlines) */
  description?: string;
  /** Background color of the icon container */
  iconBackgroundColor?: CSSProperties["backgroundColor"];
};

/**
 * A single card in the ML Pipeline section.
 * Displays an icon, title, and multi-line description.
 */
const PipelineStep: FunctionComponent<PipelineStepProps> = ({
  className = "",
  icon,
  title,
  description,
  iconBackgroundColor,
}) => {
  const iconContainerStyle: CSSProperties = useMemo(
    () => ({ backgroundColor: iconBackgroundColor }),
    [iconBackgroundColor]
  );

  return (
    <div
      className={`flex-1 rounded-xl bg-[#f0faff] border-[#e0edfa] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center justify-center !pt-[22px] !pb-[22px] !pl-4 !pr-4 gap-2.5 min-w-[148px] text-left text-[22px] text-[#fff] font-[Inter] ${className}`}
    >
      <div
        className="rounded-[14px] bg-[#0e7da1] overflow-hidden flex items-center justify-center"
        style={iconContainerStyle}
        aria-hidden="true"
      >
        <div className="relative mq450:text-lg">{icon}</div>
      </div>
      <b className="relative text-sm text-[#0e2538]">{title}</b>
      <div className="relative text-[11px] leading-[150%] text-[#708599] whitespace-pre-line">
        {description}
      </div>
    </div>
  );
};

export default PipelineStep;
