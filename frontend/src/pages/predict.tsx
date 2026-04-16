import { type FunctionComponent, useCallback, useState } from "react";
import Navbar from "../components/navbar";
import LeftColumn from "../components/left-column";
import RightColumn from "../components/right-column";
import type { PredictFormData } from "../components/left-column";

type PredictionResult = {
  predicted_duration_class: number;
  confidence?: number;
  status: string;
  unit: string;
  model_version: string;
  timestamp: string;
  request_id: string;
};

const Predict: FunctionComponent = () => {
  const [_predictionInput, setPredictionInput] = useState<PredictFormData | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePredict = useCallback(async (data: PredictFormData) => {
    setPredictionInput(data);
    setIsLoading(true);

    const payload = {
      ...data,
      request_time: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        // error in backend response
        console.error("Validation error:", result);

        setPredictionResult({
          status: "error",
          predicted_duration_class: 0,
          confidence: 0,
          unit: "",
          model_version: "",
          timestamp: "",
          request_id: "",
        });

        alert(result.detail?.[0]?.msg || "Invalid input");
        return;
      }

      setPredictionResult(result);
      console.log("Prediction result:", result);

    } catch (err) {
      console.error("API error:", err);

      setPredictionResult({
        status: "error",
        predicted_duration_class: 0,
        confidence: 0,
        unit: "",
        model_version: "",
        timestamp: "",
        request_id: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="w-full relative bg-[#f0faff] flex flex-col items-center leading-[normal] tracking-[normal]">
      <Navbar />

      <section
        aria-labelledby="predict-heading"
        className="self-stretch bg-[#fff] border-[#e0edfa] border-solid border-[1px] overflow-hidden flex flex-col items-center justify-center !pt-[46px] !pb-[46px] !pl-20 !pr-20 gap-3 text-left text-xs text-[#0e7da1] font-[Inter] mq1000:!pl-10 mq1000:!pr-10 mq1000:box-border"
      >
        <span className="relative tracking-[2px] font-semibold uppercase">
          Treatment Duration Predictor
        </span>
        <h1
          id="predict-heading"
          className="!m-0 relative text-[40px] font-extrabold font-[inherit] text-[#0e2538] mq1000:text-[32px] mq450:text-2xl"
        >
          Predict Appointment Duration
        </h1>
        <p className="!m-0 relative text-base text-[#708599]">
          Fill in the patient details below to get an AI-predicted time window.
        </p>
      </section>

      <main
        aria-label="Treatment predictor form and results"
        className="self-stretch bg-[#f0faff] overflow-hidden flex items-start !pt-12 !pb-16 !pl-20 !pr-20 gap-8 mq725:gap-4 mq725:!pt-[31px] mq725:!pb-[42px] mq725:!pl-10 mq725:!pr-10 mq725:box-border"
      >
        <LeftColumn onPredict={handlePredict} isLoading={isLoading} />
        <RightColumn result={predictionResult} isLoading={isLoading} />
      </main>

      <footer className="self-stretch bg-[#0e2538] overflow-hidden flex items-center justify-between !pt-7 !pb-7 !pl-20 !pr-20 box-border gap-5 max-w-full text-left text-sm text-[#fff] font-[Inter] mq725:flex-wrap mq725:gap-5 mq725:!pl-10 mq725:!pr-10 mq725:box-border">
        <span className="relative font-semibold inline-block max-w-full">
          DentTime &mdash; AI-Powered Smart Dentist Scheduling
        </span>
        <span className="relative text-[13px] text-[#708599]">
          SE for ML Project &middot; 2026
        </span>
      </footer>
    </div>
  );
};

export default Predict;