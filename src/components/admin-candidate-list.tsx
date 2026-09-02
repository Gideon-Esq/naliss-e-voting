"use client";
import Link from "next/link";
import { Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type Candidate = {
  id: string;
  slug: string;
  name: string;
  department: string;
  verified: boolean;
  position: { title: string };
};
export function AdminCandidateList({
  candidates,
}: {
  candidates: Candidate[];
}) {
  const router = useRouter();
  async function remove(candidate: Candidate) {
    if (!confirm(`Delete ${candidate.name}? This cannot be undone.`)) return;
    const response = await fetch(
      `/api/admin/candidates?id=${encodeURIComponent(candidate.id)}`,
      { method: "DELETE" },
    );
    const text = await response.text();
    let body: { message?: string } = {};
    try {
      body = JSON.parse(text);
    } catch {}
    if (!response.ok) {
      alert(body.message || "Candidate could not be deleted.");
      return;
    }
    router.refresh();
  }
  async function updateStatus(candidate: Candidate, approved: boolean) {
    const action = approved ? "approve" : "reject";
    const response = await fetch(
      `/api/admin/candidates?id=${encodeURIComponent(candidate.id)}&action=${action}`,
      { method: "PATCH" },
    );
    const text = await response.text();
    let body: { message?: string } = {};
    try {
      body = JSON.parse(text);
    } catch {}
    if (!response.ok) {
      alert(body.message || "Candidate status could not be updated.");
      return;
    }
    router.refresh();
  }
  return (
    <section className="admin-card admin-table">
      {candidates.map((candidate) => (
        <div className="admin-row" key={candidate.id}>
          <b>{candidate.name}</b>
          <span>{candidate.position.title}</span>
          <span>{candidate.department}</span>
          <small>{candidate.verified ? "Approved" : "Pending"}</small>
          <div className="row-actions">
            <Link href={`/candidates/${candidate.slug}`}>View</Link>
            <Link href={`/admin/candidates/${candidate.id}/edit`}>Edit</Link>
            {!candidate.verified && (
              <button
                onClick={() => updateStatus(candidate, true)}
                aria-label={`Approve ${candidate.name}`}
                title="Approve"
              >
                <CheckCircle2 />
                Approve
              </button>
            )}
            {candidate.verified && (
              <button
                onClick={() => updateStatus(candidate, false)}
                aria-label={`Reject ${candidate.name}`}
                title="Reject"
              >
                <XCircle />
                Reject
              </button>
            )}
            <button
              onClick={() => remove(candidate)}
              aria-label={`Delete ${candidate.name}`}
            >
              <Trash2 />
              Delete
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
