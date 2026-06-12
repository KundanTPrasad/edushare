"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function PaperViewer() {
  const params = useParams();
  const id = params.id as string;

  const [paper, setPaper] = useState<any>(null);

  useEffect(() => {
    fetchPaper();
  }, []);

  const fetchPaper = async () => {
    const { data, error } = await supabase
      .from("papers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setPaper(data);
  };

  if (!paper) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="flex gap-4 mb-6">

        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-white/10"
        >
          ← Back
        </Link>

        <a
          href={paper.file_url}
          target="_blank"
          download
          className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold"
        >
          Download Paper
        </a>

      </div>

      <div className="glass rounded-3xl p-6">

        <h1 className="text-4xl font-bold text-cyan-400">
          {paper.subject}
        </h1>

        <div className="flex flex-wrap gap-3 mt-4">

          <span className="px-3 py-1 rounded-full bg-cyan-500/20">
            {paper.college}
          </span>

          <span className="px-3 py-1 rounded-full bg-cyan-500/20">
            {paper.branch}
          </span>

          <span className="px-3 py-1 rounded-full bg-cyan-500/20">
            Semester {paper.semester}
          </span>

          <span className="px-3 py-1 rounded-full bg-cyan-500/20">
            {paper.resource_type}
          </span>

          <span className="px-3 py-1 rounded-full bg-cyan-500/20">
            {paper.year}
          </span>

        </div>

      </div>

      <div className="mt-8 px-4 pb-20">

        {paper.file_type === "pdf" ? (
          <iframe
            src={paper.file_url}
            className="w-full h-screen rounded-2xl"
          />
        ) : (
          <div className="flex justify-center">
        <img
            src={paper.file_url}
            alt={paper.subject}
            className="
            max-w-4xl
            w-full
            rounded-2xl
            shadow-2xl
            bg-white
            "
        />
        </div>
        )}

      </div>

    </main>
  );
}
