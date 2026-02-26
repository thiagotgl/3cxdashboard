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
  const [queueData, setQueueData] = useState<any[]>([]);
  const [callData, setCallData] = useState<any[]>([]);

  // carregar fila
  function loadQueueCSV(e: any) {
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setQueueData(result.data);
      },
    });
  }

  // carregar chamadas
  function loadCallCSV(e: any) {
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setCallData(result.data);
      },
    });
  }

  // stats fila
  const queueStats = useMemo(() => {
    if (!queueData.length) return null;

    const total = queueData.reduce(
      (sum, q) => sum + Number(q["Calls Total"]),
      0
    );

    const answered = queueData.reduce(
      (sum, q) => sum + Number(q["Calls Answered"]),
      0
    );

    const abandoned = queueData.reduce(
      (sum, q) => sum + Number(q["Calls Abandoned"]),
      0
    );

    const byQueue = queueData.map((q) => ({
      name: q.Queue,
      total: Number(q["Calls Total"]),
    }));

    return { total, answered, abandoned, byQueue };
  }, [queueData]);

  // stats chamadas gerais
  const callStats = useMemo(() => {
    if (!callData.length) return null;

    const byExtension = Object.values(
      callData.reduce((acc: any, call: any) => {
        const ext = call["From"];

        if (!acc[ext])
          acc[ext] = {
            name: ext,
            total: 0,
          };

        acc[ext].total++;

        return acc;
      }, {})
    );

    return { byExtension };
  }, [callData]);

  return (
    <div style={{ padding: 30 }}>

      <h1>3CX Professional Dashboard</h1>

      {/* BOTÕES */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>

        <div>
          <label style={buttonStyle}>
            📊 Estatísticas detalhadas da fila
            <input
              type="file"
              accept=".csv"
              onChange={loadQueueCSV}
              style={{ display: "none" }}
            />
          </label>
        </div>

        <div>
          <label style={buttonStyle}>
            📞 Ligações gerais
            <input
              type="file"
              accept=".csv"
              onChange={loadCallCSV}
              style={{ display: "none" }}
            />
          </label>
        </div>

      </div>

      {/* DASHBOARD FILA */}
      {queueStats && (
        <>
          <h2>Filas</h2>

          <div style={{ display: "flex", gap: 20 }}>
            <Card title="Total" value={queueStats.total} />
            <Card title="Atendidas" value={queueStats.answered} />
            <Card title="Abandonadas" value={queueStats.abandoned} />
          </div>

          <Chart data={queueStats.byQueue} />
        </>
      )}

      {/* DASHBOARD LIGAÇÕES */}
      {callStats && (
        <>
          <h2>Ligações por ramal</h2>
          <Chart data={callStats.byExtension} />
        </>
      )}

    </div>
  );
}

const buttonStyle = {
  padding: "12px 20px",
  background: "#0070f3",
  color: "white",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};

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
    <div style={{ padding: 20, background: "#eee", borderRadius: 8 }}>
      <h3>{title}</h3>
      <h2>{value}</h2>
    </div>
  );
}
