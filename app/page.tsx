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
  const [calls, setCalls] = useState<any[]>([]);

  function loadCSV(e: any) {
    const file = e.target.files[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        console.log(result.data);
        setCalls(result.data);
      },
    });
  }

  const stats = useMemo(() => {
    if (!calls.length) return null;

    const statusField =
      Object.keys(calls[0]).find((k) =>
        k.toLowerCase().includes("status")
      ) || "Status";

    const fromField =
      Object.keys(calls[0]).find((k) =>
        k.toLowerCase().includes("from")
      ) || "From";

    const dateField =
      Object.keys(calls[0]).find((k) =>
        k.toLowerCase().includes("start")
      ) || "Start Time";

    const total = calls.length;

    const answered = calls.filter((c) =>
      c[statusField]?.toLowerCase()?.includes("answer")
    ).length;

    const missed = calls.filter((c) =>
      c[statusField]?.toLowerCase()?.includes("miss")
    ).length;

    const byExtension = Object.values(
      calls.reduce((acc: any, call: any) => {
        const ext = call[fromField] || "Unknown";

        if (!acc[ext])
          acc[ext] = {
            name: ext,
            total: 0,
          };

        acc[ext].total++;

        return acc;
      }, {})
    );

    const byDay = Object.values(
      calls.reduce((acc: any, call: any) => {
        const raw = call[dateField];

        if (!raw) return acc;

        const date = raw.split(" ")[0];

        if (!acc[date])
          acc[date] = {
            date,
            total: 0,
          };

        acc[date].total++;

        return acc;
      }, {})
    );

    return {
      total,
      answered,
      missed,
      byExtension,
      byDay,
    };
  }, [calls]);

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>3CX Professional Dashboard</h1>

      <input type="file" accept=".csv" onChange={loadCSV} />

      {stats && (
        <>
          <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
            <Card title="Total" value={stats.total} />
            <Card title="Atendidas" value={stats.answered} />
            <Card title="Perdidas" value={stats.missed} />
          </div>

          <h2 style={{ marginTop: 40 }}>Por Ramal</h2>

          <Chart data={stats.byExtension} x="name" y="total" />

          <h2 style={{ marginTop: 40 }}>Por Dia</h2>

          <Chart data={stats.byDay} x="date" y="total" />
        </>
      )}
    </div>
  );
}

function Chart({ data, x, y }: any) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={x} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={y} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div
      style={{
        background: "#f4f4f4",
        padding: 20,
        borderRadius: 8,
        minWidth: 150,
      }}
    >
      <div>{title}</div>
      <div style={{ fontSize: 28, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}
