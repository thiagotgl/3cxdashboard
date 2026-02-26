
"use client";

import { useState, useMemo } from "react";
import Papa from "papaparse";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Page() {
  const [data, setData] = useState<any[]>([]);

  function handleFile(e: any) {
    const file = e.target.files[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setData(result.data);
      },
    });
  }

  const stats = useMemo(() => {
    const total = data.length;

    const answered = data.filter(
      (c) => c.Status?.toLowerCase() === "answered"
    ).length;

    const missed = data.filter(
      (c) => c.Status?.toLowerCase() === "missed"
    ).length;

    const byExtension = Object.values(
      data.reduce((acc: any, call: any) => {
        const ext = call.From || "Unknown";

        if (!acc[ext])
          acc[ext] = {
            name: ext,
            total: 0,
          };

        acc[ext].total++;

        return acc;
      }, {})
    );

    return {
      total,
      answered,
      missed,
      byExtension,
    };
  }, [data]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard 3CX</h1>

      <input type="file" accept=".csv" onChange={handleFile} />

      <div style={{ marginTop: 20 }}>
        <h3>Total chamadas: {stats.total}</h3>
        <h3>Atendidas: {stats.answered}</h3>
        <h3>Perdidas: {stats.missed}</h3>
      </div>

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={stats.byExtension}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
