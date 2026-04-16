import { type FunctionComponent, useMemo, useState, type CSSProperties } from "react";

interface Symptom {
  id: string;
  symptom: string;
}

export type SymptomsType = {
  className?: string;
  treatmentSymptoms?: string;
  egScalingRootPlaning?: string;

  /** All available options */
  options: Symptom[];

  /** Selected values */
  value?: Symptom[];

  /** On change */
  onChange?: (value: Symptom[]) => void;

  symptomsAlignSelf?: CSSProperties["alignSelf"];
  symptomsFlex?: CSSProperties["flex"];
  symptomsMinWidth?: CSSProperties["minWidth"];
};

const Symptoms: FunctionComponent<SymptomsType> = ({
  className = "",
  treatmentSymptoms,
  egScalingRootPlaning,
  options,
  value = [],
  onChange,
  symptomsAlignSelf,
  symptomsFlex,
  symptomsMinWidth,
}) => {
  const [open, setOpen] = useState(false);

  const symptomsStyle: CSSProperties = useMemo(
    () => ({
      alignSelf: symptomsAlignSelf,
      flex: symptomsFlex,
      minWidth: symptomsMinWidth,
    }),
    [symptomsAlignSelf, symptomsFlex, symptomsMinWidth]
  );

  const toggleOption = (option: Symptom) => {
    const exists = value.find((v) => v.id === option.id);

    let newValue: Symptom[];
    if (exists) {
      newValue = value.filter((v) => v.id !== option.id);
    } else {
      newValue = [...value, option];
    }

    onChange?.(newValue);
  };

  const displayValue =
    value.length > 0
      ? value.map((v) => v.symptom).join(", ")
      : egScalingRootPlaning;

  const isPlaceholder = value.length === 0;

  return (
    <div
      className={`relative self-stretch flex flex-col gap-1.5 text-[13px] text-[#0e2538] font-[Inter] ${className}`}
      style={symptomsStyle}
    >
      {treatmentSymptoms && (
        <span className="font-medium">{treatmentSymptoms}</span>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-lg bg-white border border-[#e0edfa] flex justify-between items-center px-3.5 py-[9px] hover:border-[#0e7da1]"
      >
        <span className={isPlaceholder ? "text-[#708599]" : ""}>
          {displayValue}
        </span>
        <span>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-1 w-full bg-white border border-[#e0edfa] rounded-lg shadow-md z-50 max-h-60 overflow-auto">
          {options.map((opt) => {
            const selected = value.some((v) => v.id === opt.id);

            return (
              <div
                key={opt.id}
                onClick={() => toggleOption(opt)}
                className={`px-3 py-2 cursor-pointer flex justify-between hover:bg-[#f5faff] ${
                  selected ? "bg-[#e6f4fa]" : ""
                }`}
              >
                <span>{opt.symptom}</span>
                {selected && <span>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Symptoms;