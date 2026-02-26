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

    // chamadas por ramal
    const byExtension = Object.values(
      data.reduce((acc: any, call: any) => {
        const ext = call.From || "Unknown";

        if (!acc[ext]) {
          acc[ext] = {
            name: ext,
            total: 0,
          };
        }

        acc[ext].total++;

        return acc;
      }, {})
    );

    // chamadas por dia
    const byDay = Object.values(
      data.reduce((acc: any, call: any) => {
        const date = call["Start Time"]?.split(" ")[0];

        if (!date) return acc;

        if (!acc[date]) {
          acc[date] = {
            date,
            total: 0,
          };
        }

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
  }, [data]);

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>Dashboard 3CX</h1>

      <input type="file" accept=".csv" onChange={handleFile} />

      {/* CARDS */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <Card title="Total chamadas" value={stats.total} />
        <Card title="Atendidas" value={stats.answered} />
        <Card title="Perdidas" value={stats.missed} />
      </div>

      {/* GRÁFICO POR RAMAL */}
      <h2 style={{ marginTop: 40 }}>Chamadas por ramal</h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={stats.byExtension}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* GRÁFICO POR DIA */}
      <h2 style={{ marginTop: 40 }}>Chamadas por dia</h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={stats.byDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TABELA */}
      <h2 style={{ marginTop: 40 }}>Lista de chamadas</h2>

      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Status</th>
            <th>Start Time</th>
            <th>Talk Time</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 50).map((call, i) => (
            <tr key={i}>
              <td>{call.From}</td>
              <td>{call.To}</td>
              <td>{call.Status}</td>
              <td>{call["Start Time"]}</td>
              <td>{call["Talk Time"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div
      style={{
        padding: 20,
        background: "#f4f4f4",
        borderRadius: 8,
        minWidth: 150,
      }}
    >
      <div>{title}</div>
      <div style={{ fontSize: 24, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}
