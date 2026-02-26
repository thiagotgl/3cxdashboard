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
  const [extensionFilter, setExtensionFilter] = useState("ALL");

  function loadCSV(e: any) {
    const file = e.target.files[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setCalls(result.data);
      },
    });
  }

  const fields = useMemo(() => {
    if (!calls.length) return null;

    return {
      status:
        Object.keys(calls[0]).find((k) =>
          k.toLowerCase().includes("status")
        ) || "Status",

      from:
        Object.keys(calls[0]).find((k) =>
          k.toLowerCase().includes("from")
        ) || "From",

      date:
        Object.keys(calls[0]).find((k) =>
          k.toLowerCase().includes("start")
        ) || "Start Time",

      talk:
        Object.keys(calls[0]).find((k) =>
          k.toLowerCase().includes("talk")
        ) || "Talk Time",
    };
  }, [calls]);

  const filteredCalls = useMemo(() => {
    if (!fields) return [];

    if (extensionFilter === "ALL") return calls;

    return calls.filter(
      (c) => c[fields.from] === extensionFilter
    );
  }, [calls, extensionFilter, fields]);

  const extensions = useMemo(() => {
    if (!fields) return [];

    return [
      "ALL",
      ...Array.from(
        new Set(calls.map((c) => c[fields.from]))
      ),
    ];
  }, [calls, fields]);

  const stats = useMemo(() => {
    if (!fields) return null;

    const total = filteredCalls.length;

    const answered = filteredCalls.filter((c) =>
      c[fields.status]?.toLowerCase().includes("answer")
    ).length;

    const missed = filteredCalls.filter((c) =>
      c[fields.status]?.toLowerCase().includes("miss")
    ).length;

    const byExtension = Object.values(
      filteredCalls.reduce((acc: any, call: any) => {
        const ext = call[fields.from];

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
      filteredCalls.reduce((acc: any, call: any) => {
        const date = call[fields.date]?.split(" ")[0];

        if (!date) return acc;

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
  }, [filteredCalls, fields]);

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>3CX Professional Dashboard</h1>

      <input type="file" accept=".csv" onChange={loadCSV} />

      {calls.length > 0 && (
        <>
          {/* FILTRO */}
          <div style={{ marginTop: 20 }}>
            <label>Filtrar por Ramal: </label>

            <select
              value={extensionFilter}
              onChange={(e) =>
                setExtensionFilter(e.target.value)
              }
            >
              {extensions.map((ext) => (
                <option key={ext}>{ext}</option>
              ))}
            </select>
          </div>

          {/* CARDS */}
          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 20,
            }}
          >
            <Card title="Total" value={stats?.total} />
            <Card title="Atendidas" value={stats?.answered} />
            <Card title="Perdidas" value={stats?.missed} />
          </div>

          {/* GRÁFICO RAMAL */}
          <h2 style={{ marginTop: 40 }}>
            Chamadas por Ramal
          </h2>

          <Chart data={stats?.byExtension} x="name" y="total" />

          {/* GRÁFICO DIA */}
          <h2 style={{ marginTop: 40 }}>
            Chamadas por Dia
          </h2>

          <Chart data={stats?.byDay} x="date" y="total" />

          {/* TABELA */}
          <h2 style={{ marginTop: 40 }}>
            Lista de chamadas
          </h2>

          <table border={1} cellPadding={5}>
            <thead>
              <tr>
                <th>From</th>
                <th>Status</th>
                <th>Data</th>
                <th>Talk Time</th>
              </tr>
            </thead>

            <tbody>
              {filteredCalls.slice(0, 50).map((call, i) => (
                <tr key={i}>
                  <td>{call[fields.from]}</td>
                  <td>{call[fields.status]}</td>
                  <td>{call[fields.date]}</td>
                  <td>{call[fields.talk]}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
      <div style={{ fontSize: 28, fontWeight: "bold" }}>
        {value}
      </div>
    </div>
  );
}
