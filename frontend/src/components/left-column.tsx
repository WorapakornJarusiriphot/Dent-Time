import { type FunctionComponent, useState, useCallback, useEffect, useMemo } from "react";

export type LeftColumnType = {
  className?: string;
  onPredict?: (data: PredictFormData) => void;
  isLoading?: boolean;
};

export interface PredictFormData {
  treatmentSymptoms: string[];
  toothNumbers: string[];
  timeOfDay: string;
  doctorId: string;
  isFirstCase: boolean;
  notes?: string;
}

interface Symptom {
  id: string;
  symptom: string;
}
interface Doctor {
  id: string;
  doctor: string;
}
interface PredictOptions {
  symptoms: Symptom[];
  doctors: Doctor[];
}

const MAX_TOOTH_TAGS = 32;

/**
 * Patient & Treatment Details form panel.
 * Collects treatment inputs and emits a prediction request.
 */
const LeftColumn: FunctionComponent<LeftColumnType> = ({
  className = "",
  onPredict,
  isLoading = false,
}) => {
  const [predictOption, setPredictOption] = useState<PredictOptions | null>(null);
  const [toothNumbers, setToothNumbers] = useState<string[]>([]);
  const [toothInput, setToothInput] = useState("");
  const [toothInputError, setToothInputError] = useState("");
  const [isFirstCase, setIsFirstCase] = useState(false);
  const [treatmentSymptoms, setTreatmentSymptoms] = useState<Symptom[]>([]);
  const [symptomInput, setSymptomInput] = useState("");
  const [isSymptomMenuOpen, setIsSymptomMenuOpen] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [isDoctorMenuOpen, setIsDoctorMenuOpen] = useState(false);
  const [notes, setNotes] = useState("");
  // const hasInvalidCount = toothNumbers.length === 0;

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/options`)
      .then((res) => res.json())
      .then((data) => {
        setPredictOption(data)
      });

  }, []);

  const handleToggle = useCallback(() => {
    setIsFirstCase((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (treatmentSymptoms.length === 0) {
        alert("Please select at least one treatment symptom.");
        return;
      }

      if (!timeOfDay) {
        alert("Please select time of day.");
        return;
      }

      if (!doctorId) {
        alert("Please select a doctor from the dropdown.");
        return;
      }

      onPredict?.({
        treatmentSymptoms: treatmentSymptoms.map((item) => item.symptom),
        toothNumbers,
        timeOfDay,
        doctorId,
        isFirstCase,
        notes,
      });
    },
    [treatmentSymptoms, toothNumbers, timeOfDay, doctorId, isFirstCase, notes, onPredict]
  );

  const addToothNumber = useCallback((rawValue: string) => {
    const cleaned = rawValue.trim();
    if (!cleaned) return;

    const num = Number(cleaned);
    const isValid = !Number.isNaN(num) && num >= 1 && num <= 32;
    if (!isValid) {
      setToothInputError("Tooth number must be between 1 and 32.");
      return;
    }

    setToothNumbers((prev) => {
      if (prev.length >= MAX_TOOTH_TAGS) {
        setToothInputError(`You can add up to ${MAX_TOOTH_TAGS} tooth numbers.`);
        return prev;
      }
      if (prev.includes(cleaned)) return prev;
      setToothInputError("");
      return [...prev, cleaned];
    });
  }, []);

  const removeToothNumber = useCallback((value: string) => {
    setToothNumbers((prev) => prev.filter((item) => item !== value));
  }, []);

  const filteredSymptoms = useMemo(() => {
    const allSymptoms = predictOption?.symptoms || [];
    const selectedIds = new Set(treatmentSymptoms.map((item) => item.id));
    const query = symptomInput.trim().toLowerCase();

    return allSymptoms.filter((item) => {
      if (selectedIds.has(item.id)) return false;
      if (!query) return true;
      return item.symptom.toLowerCase().includes(query);
    });
  }, [predictOption?.symptoms, treatmentSymptoms, symptomInput]);

  const filteredDoctors = useMemo(() => {
    const allDoctors = predictOption?.doctors || [];
    const query = doctorSearch.trim().toLowerCase();
    if (!query) return allDoctors;
    return allDoctors.filter((item) => item.doctor.toLowerCase().includes(query));
  }, [predictOption?.doctors, doctorSearch]);

  const addSymptom = useCallback((symptom: Symptom) => {
    setTreatmentSymptoms((prev) => {
      if (prev.some((item) => item.id === symptom.id)) return prev;
      return [...prev, symptom];
    });
    setSymptomInput("");
    setIsSymptomMenuOpen(true);
  }, []);

  const removeSymptom = useCallback((id: string) => {
    setTreatmentSymptoms((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const selectDoctor = useCallback((doctor: Doctor) => {
    setDoctorId(doctor.id);
    setDoctorSearch(doctor.doctor);
    setIsDoctorMenuOpen(false);
  }, []);

  return (
    <form
      aria-label="Patient and treatment details"
      onSubmit={handleSubmit}
      className={`!m-0 flex-1 shadow-[0px_4px_20px_rgba(14,_37,_56,_0.05)] rounded-2xl bg-[#fff] border-[#e0edfa] border-solid border-[1px] overflow-hidden flex flex-col items-start !pt-[30px] !pb-[30px] !pl-[31px] !pr-[31px] gap-5 mq725:!pt-5 mq725:!pb-5 mq725:box-border ${className}`}
    >
      {/* Header row */}
      <div className="self-stretch overflow-hidden flex items-center justify-between gap-5 mq725:flex-wrap mq725:gap-5">
        <b className="relative text-lg font-[Inter] text-[#0e2538] text-left">
          Patient &amp; Treatment Details
        </b>
        <div className="rounded-[20px] bg-[#def7fc] overflow-hidden flex items-center justify-center !pt-[5px] !pb-[5px] !pl-3 !pr-3">
          <span className="relative text-xs font-medium font-[Inter] text-[#0e7da1] text-left">
            Step 1 of 1
          </span>
        </div>
      </div>

      {/* Divider */}
      <div
        role="separator"
        className="self-stretch h-px bg-[#e0edfa] overflow-hidden shrink-0 flex flex-col items-start"
      />

      {/* Treatment / Symptoms combobox tags input */}
      <div className="self-stretch overflow-visible flex flex-col items-start gap-1.5 relative">
        <label
          htmlFor="symptoms-input"
          className="relative text-[13px] font-medium font-[Inter] text-[#0e2538] text-left"
        >
          Treatment / Symptoms
        </label>
        <div className="self-stretch rounded-lg bg-[#fff] border-[#e0edfa] border-solid border-[1px] overflow-hidden !p-2 flex flex-wrap items-center gap-2 focus-within:border-[#0e7da1] transition-colors">
          {treatmentSymptoms.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 rounded-full bg-[#def7fc] text-[#0e7da1] text-xs font-medium font-[Inter] !pl-2.5 !pr-2 !pt-1 !pb-1"
            >
              {item.symptom}
              <button
                type="button"
                aria-label={`Remove symptom ${item.symptom}`}
                onClick={() => removeSymptom(item.id)}
                className="border-0 bg-transparent text-[#0e7da1] cursor-pointer leading-none !p-0"
              >
                x
              </button>
            </span>
          ))}
          <input
            id="symptoms-input"
            value={symptomInput}
            onChange={(e) => {
              setSymptomInput(e.target.value);
              setIsSymptomMenuOpen(true);
            }}
            onFocus={() => setIsSymptomMenuOpen(true)}
            onBlur={() => setIsSymptomMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredSymptoms.length > 0) {
                e.preventDefault();
                addSymptom(filteredSymptoms[0]);
              }
              if (
                e.key === "Backspace" &&
                symptomInput.trim() === "" &&
                treatmentSymptoms.length > 0
              ) {
                e.preventDefault();
                setTreatmentSymptoms((prev) => prev.slice(0, -1));
              }
            }}
            placeholder={treatmentSymptoms.length ? "Search more symptoms..." : "Search and select symptoms"}
            aria-label="Search symptoms"
            className="flex-1 min-w-[180px] border-0 outline-none text-sm font-[Inter] text-[#0e2538] !p-1 placeholder:text-[#708599]"
          />
        </div>
        {isSymptomMenuOpen && filteredSymptoms.length > 0 && (
          <div className="absolute top-full mt-1 w-full rounded-lg bg-[#fff] border-[#e0edfa] border-solid border-[1px] shadow-md max-h-52 overflow-auto z-20">
            {filteredSymptoms.map((item) => (
              <button
                key={item.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addSymptom(item)}
                className="w-full text-left border-0 bg-transparent !px-3 !py-2 text-sm font-[Inter] text-[#0e2538] hover:bg-[#f5faff] cursor-pointer"
              >
                {item.symptom}
              </button>
            ))}
          </div>
        )}
      </div>


      {/* Notes textarea */}
      <div className="self-stretch overflow-hidden flex flex-col items-start gap-1.5">
        <label
          htmlFor="notes"
          className="relative text-[13px] font-medium font-[Inter] text-[#0e2538] text-left"
        >
          Additional Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes or observations..."
          aria-label="Additional notes"
          className="self-stretch rounded-lg bg-[#fff] border-[#e0edfa] border-solid border-[1px] overflow-hidden !p-3 text-sm font-[Inter] text-[#708599] text-left outline-none focus:border-[#0e7da1] transition-colors resize-none min-h-[100px]"
        />
      </div>

      {/* Tooth Numbers + Time of Day row */}
      <div className="self-stretch overflow-hidden flex items-start gap-4 mq1000:flex-wrap">
        <div className="flex-1 overflow-hidden flex flex-col items-start gap-1.5 min-w-[337px] mq725:min-w-full">
          <label
            htmlFor="tooth-numbers"
            className="relative text-[13px] font-medium font-[Inter] text-[#0e2538] text-left"
          >
            Tooth Number(s)
          </label>
          <div className="self-stretch rounded-lg bg-[#fff] border-[#e0edfa] border-solid border-[1px] overflow-hidden !p-2 flex flex-wrap items-center gap-2 focus-within:border-[#0e7da1] transition-colors">
            {toothNumbers.map((tooth) => (
              <span
                key={tooth}
                className="inline-flex items-center gap-1 rounded-full bg-[#def7fc] text-[#0e7da1] text-xs font-medium font-[Inter] !pl-2.5 !pr-2 !pt-1 !pb-1"
              >
                {tooth}
                <button
                  type="button"
                  aria-label={`Remove tooth number ${tooth}`}
                  onClick={() => removeToothNumber(tooth)}
                  className="border-0 bg-transparent text-[#0e7da1] cursor-pointer leading-none !p-0"
                >
                  x
                </button>
              </span>
            ))}
            <input
              id="tooth-numbers"
              value={toothInput}
              onChange={(e) => {
                setToothInput(e.target.value);
                if (toothInputError) setToothInputError("");
              }}
              onBlur={() => {
                addToothNumber(toothInput);
                setToothInput("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
                  e.preventDefault();
                  addToothNumber(toothInput);
                  setToothInput("");
                }
                if (
                  e.key === "Backspace" &&
                  toothInput.trim() === "" &&
                  toothNumbers.length > 0
                ) {
                  e.preventDefault();
                  setToothNumbers((prev) => prev.slice(0, -1));
                }
              }}
              placeholder={toothNumbers.length ? "Add more..." : "Type tooth number and press Enter"}
              aria-label="Enter tooth numbers"
              className="flex-1 min-w-[160px] border-0 outline-none text-sm font-[Inter] text-[#0e2538] !p-1 placeholder:text-[#708599]"
            />
          </div>
          {toothInputError && (
            <span className="text-xs font-[Inter] text-[#b91c1c]">{toothInputError}</span>
          )}
          {/* {hasInvalidCount && (
            <span className="text-xs font-[Inter] text-[#b91c1c]">
              Add at least one tooth number.
            </span>
          )} */}
        </div>
        <div className="flex-1 overflow-hidden flex flex-col items-start gap-1.5 min-w-[337px] mq725:min-w-full">
          <label
            htmlFor="time-of-day"
            className="relative text-[13px] font-medium font-[Inter] text-[#0e2538] text-left"
          >
            Time of Day
          </label>
          <select
            id="time-of-day"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
            aria-label="Select time of day"
            className="self-stretch rounded-lg bg-[#fff] border-[#e0edfa] border-solid border-[1px] overflow-hidden flex items-center justify-between !pt-[9px] !pb-[9px] !pl-3.5 !pr-3.5 text-sm font-[Inter] text-[#708599] text-left outline-none focus:border-[#0e7da1] transition-colors cursor-pointer"
          >
            <option value="">Select time...</option>
            <option value="morning">Morning (8:00 - 12:00)</option>
            <option value="afternoon">Afternoon (12:00 - 17:00)</option>
            <option value="evening">Evening (17:00 - 21:00)</option>
          </select>
        </div>
      </div>

      {/* Doctor search dropdown */}
      <div className="self-stretch overflow-hidden flex flex-col items-start gap-1.5 relative">
        <label
          htmlFor="doctor-search"
          className="relative text-[13px] font-medium font-[Inter] text-[#0e2538] text-left"
        >
          Doctor (Anonymized ID)
        </label>
        <div className="self-stretch rounded-lg bg-[#fff] border-[#e0edfa] border-solid border-[1px] overflow-hidden !p-2 flex flex-col gap-0 transition-colors focus-within:border-[#0e7da1]">
          <input
            id="doctor-search"
            value={doctorSearch}
            onChange={(e) => {
              setDoctorSearch(e.target.value);
              setDoctorId("");
              setIsDoctorMenuOpen(true);
            }}
            onFocus={() => setIsDoctorMenuOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setIsDoctorMenuOpen(false), 150);
            }}
            placeholder="Search doctor by name..."
            aria-label="Search doctor"
            className="self-stretch border-0 outline-none text-sm font-[Inter] text-[#0e2538] !p-1 placeholder:text-[#708599]"
            autoComplete="off"
          />
          {isDoctorMenuOpen && filteredDoctors.length > 0 && (
            <div className="mt-1 w-full rounded-lg bg-[#fff] border-[#e0edfa] border-solid border-[1px] shadow-md max-h-52 overflow-auto z-20">
              {filteredDoctors.map((doctor) => (
                <button
                  key={doctor.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectDoctor(doctor)}
                  className="w-full text-left border-0 bg-transparent !px-3 !py-2 text-sm font-[Inter] text-[#0e2538] hover:bg-[#f5faff] cursor-pointer"
                >
                  {doctor.doctor}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* First Case toggle */}
      <div className="self-stretch rounded-[10px] bg-[#f0faff] border-[#e0edfa] border-solid border-[1px] overflow-hidden flex items-center justify-between !pt-3 !pb-3 !pl-4 !pr-4 gap-5">
        <div className="overflow-hidden flex flex-col items-start gap-[3px]">
          <span className="relative text-sm font-medium font-[Inter] text-[#0e2538] text-left">
            Is First Case of the Day?
          </span>
          <span className="relative text-xs font-[Inter] text-[#708599] text-left">
            First case patterns affect duration prediction accuracy.
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isFirstCase}
          aria-label="Toggle first case of the day"
          onClick={handleToggle}
          className={`relative rounded-xl overflow-hidden flex items-center justify-end !p-0.5 cursor-pointer border-0 transition-all duration-300 ease-in-out transform hover:scale-105 ${
            isFirstCase
              ? "bg-gradient-to-r from-[#0e7da1] to-[#0b6a8a] shadow-lg shadow-[#0e7da1]/30 ring-2 ring-[#0e7da1]/20"
              : "bg-[#d1d5db] hover:bg-[#c1c5c9]"
          }`}
        >
          <span
            className={`h-5 w-5 rounded-[10px] bg-[#fff] overflow-hidden shrink-0 flex flex-col items-start transition-all duration-300 ease-in-out shadow-md ${
              isFirstCase ? "translate-x-0" : "-translate-x-5"
            }`}
          />
          {isFirstCase && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0e7da1]/10 to-[#0b6a8a]/10 animate-pulse" />
          )}
        </button>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`self-stretch rounded-[10px] overflow-hidden flex items-center justify-center !pt-4 !pb-4 !pl-0 !pr-0 border-0 transition-colors ${
          isLoading
            ? "bg-[#7fb8c9] cursor-not-allowed"
            : "bg-[#0e7da1] cursor-pointer hover:bg-[#0b6a8a]"
        }`}
      >
        <span className="relative text-base font-semibold font-[Inter] text-[#fff] text-left">
          {isLoading ? "Predicting..." : "Predict Treatment Duration →"}
        </span>
      </button>
    </form>
  );
};

export default LeftColumn;