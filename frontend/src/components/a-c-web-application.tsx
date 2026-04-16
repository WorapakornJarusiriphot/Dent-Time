import { type FunctionComponent, useMemo, type CSSProperties } from "react";

export type ArchitectureCardProps = {
  className?: string;
  /** Emoji or icon character for the card */
  icon?: string;
  /** Card title (e.g. "Web Application") */
  title?: string;
  /** Technology stack label (e.g. "React / Next.js") */
  techStack?: string;
  /** Card description text */
  description?: string;
  /** Background color of the icon container */
  iconBgColor?: CSSProperties["backgroundColor"];
  /** Background color of the tech-stack tag */
  tagBgColor?: CSSProperties["backgroundColor"];
  /** Padding of the tech-stack tag */
  tagPadding?: CSSProperties["padding"];
  /** Text color of the tech-stack label */
  techStackColor?: CSSProperties["color"];
};

/**
 * A single card in the System Architecture section.
 * Displays an icon, title, colored tech-stack tag, and description.
 */
const ArchitectureCard: FunctionComponent<ArchitectureCardProps> = ({
  className = "",
  icon,
  title,
  techStack,
  description,
  iconBgColor,
  tagBgColor,
  tagPadding,
  techStackColor,
}) => {
  const iconContainerStyle: CSSProperties = useMemo(
    () => ({ backgroundColor: iconBgColor }),
    [iconBgColor]
  );

  const tagStyle: CSSProperties = useMemo(
    () => ({ backgroundColor: tagBgColor, padding: tagPadding }),
    [tagBgColor, tagPadding]
  );

  const techStackLabelStyle: CSSProperties = useMemo(
    () => ({ color: techStackColor }),
    [techStackColor]
  );

  return (
    <article
      className={`flex-1 shadow-[0px_4px_16px_rgba(14,_37,_56,_0.05)] rounded-2xl bg-[#fff] border-[#e0edfa] border-solid border-[1px] box-border overflow-hidden flex flex-col items-start !pt-[22px] !pb-[22px] !pl-6 !pr-5 gap-3.5 min-w-[242px] max-w-[302px] text-left text-xl text-[#0e2538] font-[Inter] ${className}`}
    >
      <div
        className="rounded-[10px] bg-[#def7fc] overflow-hidden flex items-center justify-center !pt-2 !pb-2 !pl-3 !pr-3 shrink-0"
        style={iconContainerStyle}
        aria-hidden="true"
      >
        <div className="relative mq450:text-base">{icon}</div>
      </div>
      <b className="relative text-base shrink-0">{title}</b>
      <div
        className="rounded-[20px] bg-[#def7fc] overflow-hidden flex items-center justify-center !pt-1 !pb-1 !pl-2.5 !pr-2.5 shrink-0 text-[11px] text-[#0e7da1]"
        style={tagStyle}
      >
        <span className="relative font-medium" style={techStackLabelStyle}>
          {techStack}
        </span>
      </div>
      <p className="!m-0 relative text-[13px] leading-[160%] text-[#708599] shrink-0">
        {description}
      </p>
    </article>
  );
};

export default ArchitectureCard;
