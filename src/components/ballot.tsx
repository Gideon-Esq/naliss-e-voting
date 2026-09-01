"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CandidatePhoto } from "@/components/candidate-photo";

type Position = {
  id: string;
  title: string;
  candidates: {
    id: string;
    name: string;
    pka: string;
    photoUrl: string | null;
  }[];
};
export function Ballot({
  positions,
  voterName,
}: {
  positions: Position[];
  voterName: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const position = positions[step];
  async function submit() {
    setBusy(true);
    setError("");
    const selections = Object.entries(choices).map(
      ([positionId, candidateId]) => ({ positionId, candidateId }),
    );
    const response = await fetch("/api/ballots", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ selections }),
    });
    const body = await response.json();
    if (response.ok)
      router.push(`/vote/success?receipt=${encodeURIComponent(body.receipt)}`);
    else setError(body.message);
    setBusy(false);
  }
  return (
    <main className="ballot-page">
      <header>
        <b>
          NALISS <small>Electoral Commission</small>
        </b>
        <div className="ballot-voter">
          <span>
            Welcome, <strong>{voterName}</strong>
          </span>
          <small>
            Step {step + 1} of {positions.length}
          </small>
        </div>
      </header>
      <div className="ballot-layout">
        <section>
          <p>Cast Your Vote</p>
          <h1>{position.title}</h1>
          <p>
            Select one candidate for this position. You may skip if you choose
            not to vote here.
          </p>
          <div className="ballot-candidates">
            {position.candidates.map((candidate, index) => (
              <button
                className={
                  choices[position.id] === candidate.id ? "selected" : ""
                }
                onClick={() =>
                  setChoices({ ...choices, [position.id]: candidate.id })
                }
                key={candidate.id}
              >
                <CandidatePhoto
                  name={candidate.name}
                  src={candidate.photoUrl}
                  className={`avatar avatar-${index}`}
                />
                <b>{candidate.name}</b>
                <small>
                  {candidate.pka
                    ? `Politically Known As: ${candidate.pka}`
                    : `For ${position.title}`}
                </small>
              </button>
            ))}
          </div>
          <div className="ballot-nav">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              Back
            </button>
            {step < positions.length - 1 ? (
              <button className="button" onClick={() => setStep(step + 1)}>
                Next →
              </button>
            ) : (
              <span />
            )}
          </div>
        </section>
        <aside>
          <h2>Review Your Ballot</h2>
          <p>A summary of every position you have selected so far.</p>
          {positions.map((p) => {
            const selected = p.candidates.find((c) => c.id === choices[p.id]);
            return (
              selected && (
                <div className="review" key={p.id}>
                  <small>{p.title}</small>
                  <b>{selected.name}</b>
                  {selected.pka && (
                    <small>Politically Known As: {selected.pka}</small>
                  )}
                </div>
              )
            );
          })}
          <p className="warning">
            Please review your selections carefully. Your vote cannot be changed
            after submission.
          </p>
          {error && <p className="error">{error}</p>}
          <button
            className="button wide"
            disabled={busy || Object.keys(choices).length === 0}
            onClick={submit}
          >
            {busy ? "Submitting…" : "Submit My Ballot"}
          </button>
        </aside>
      </div>
    </main>
  );
}
