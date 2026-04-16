import { type FunctionComponent } from "react";

export interface FeatureCardProps {
  className?: string;
  /** Emoji icon displayed at the top of the card */
  icon?: string;
  /** Card title / feature name */
  title?: string;
  /** Card body description */
  description?: string;
}

/**
 * A feature highlight card used in the "Why DentTime?" section.
 * Displays an emoji icon, a title, and a short description.
 */
const FeatureCard: FunctionComponent<FeatureCardProps> = ({
  className = "",
  icon,
  title,
  description,
}) => {
  return (
    <article
      className={`flex-1 rounded-2xl bg-[#f7fcff] border-[#e0edfa] border-solid border-[1px] box-border overflow-hidden flex flex-col items-start !pt-[26px] !pb-[26px] !pl-7 !pr-5 gap-4 min-w-[308px] text-left text-[22px] text-[#0e2538] font-[Inter] ${className}`}
    >
      <div
        className="rounded-xl bg-[#def7fc] overflow-hidden flex items-center justify-center shrink-0 p-2"
        aria-hidden="true"
      >
        <span className="text-2xl mq450:text-lg">{icon}</span>
      </div>
      <h3 className="!m-0 relative text-[17px] font-bold shrink-0">{title}</h3>
      <p className="!m-0 relative text-sm leading-[160%] text-[#708599] shrink-0">
        {description}
      </p>
    </article>
  );
};

export default FeatureCard;
