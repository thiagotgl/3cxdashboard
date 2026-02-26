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
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);

  function loadCSV(e: any) {
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setData(result.data);
      },
    });
  }

  const isQueueReport = data.length > 0 && data[0]["Queue"];

  const stats = useMemo(() => {
    if (!data.length) return null;

    if (isQueueReport) {
      const total = data.reduce(
        (sum, q) => sum + Number(q["Calls Total"]),
        0
      );

      const answered = data.reduce(
        (sum, q) => sum + Number(q["Calls Answered"]),
        0
      );

      const abandoned = data.reduce(
        (sum, q) => sum + Number(q["Calls Abandoned"]),
        0
      );

      return {
        total,
        answered,
        abandoned,
        byQueue: data.map((q) => ({
          name: q.Queue,
          total: Number(q["Calls Total"]),
          abandoned: Number(q["Calls Abandoned"]),
        })),
      };
    }

    return null;
  }, [data]);

  return (
    <div style={{ padding: 30 }}>
      <h1>3CX Professional Dashboard</h1>

      <input type="file" accept=".csv" onChange={loadCSV} />

      {stats && (
        <>
          <div style={{ display: "flex", gap: 20 }}>
            <Card title="Total" value={stats.total} />
            <Card title="Atendidas" value={stats.answered} />
            <Card title="Abandonadas" value={stats.abandoned} />
          </div>

          <h2>Chamadas por fila</h2>

          <Chart data={stats.byQueue} />
        </>
      )}
    </div>
  );
}

function Chart({ data }: any) {
  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div style={{ padding: 20, background: "#eee" }}>
      <h3>{title}</h3>
      <h2>{value}</h2>
    </div>
  );
}
