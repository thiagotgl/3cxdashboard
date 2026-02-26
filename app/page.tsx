"use client";

import { useState } from "react";
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

  const total = data.length;

  const perExt = Object.values(
    data.reduce((acc: any, row: any) => {
      const ext = row.From || "Unknown";
      acc[ext] = acc[ext] || { name: ext, value: 0 };
      acc[ext].value++;
      return acc;
    }, {})
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard 3CX</h1>

      <input type="file" accept=".csv" onChange={handleFile} />

      <h2>Total chamadas: {total}</h2>

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={perExt}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
