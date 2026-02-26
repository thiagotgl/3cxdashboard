
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
  const [selectedExt, setSelectedExt] = useState("ALL");

  // carregar csv estatísticas da fila
  function loadQueueCSV(e: any) {
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setQueueData(result.data as any[]);
      },
    });
  }

  // carregar csv ligações gerais
  function loadCallCSV(e: any) {
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setCallData(result.data as any[]);
      },
    });
  }

  // lista de ramais
  const extensions = useMemo(() => {
    return Array.from(
      new Set(callData.map((c: any) => c.From))
    ).filter(Boolean);
  }, [callData]);

  // filtrar chamadas
  const filteredCalls = useMemo(() => {
    if (selectedExt === "ALL") return callData;

    return callData.filter(
      (c: any) => c.From === selectedExt
    );
  }, [callData, selectedExt]);

  // estatísticas
  const stats = useMemo(() => {
    const total = filteredCalls.length;

    const answered = filteredCalls.filter((c: any) =>
      c.Status?.toLowerCase().includes("answered")
    ).length;

    const missed = filteredCalls.filter((c: any) =>
      c.Status?.toLowerCase().includes("missed")
    ).length;

    // por ramal
    const byExtMap: any = {};

    filteredCalls.forEach((c: any) => {
      const ext = c.From || "Unknown";

      if (!byExtMap[ext])
        byExtMap[ext] = { name: ext, total: 0 };

      byExtMap[ext].total++;
    });

    const byExt = Object.values(byExtMap);

    // por fila
    const byQueue = queueData.map((q: any) => ({
      name: q.Queue || "Unknown",
      total: Number(q["Calls Total"]) || 0,
    }));

    return {
      total,
      answered,
      missed,
      byExt,
      byQueue,
    };
  }, [filteredCalls, queueData]);

  return (
    <div style={containerStyle}>

      <h1>3CX Dashboard (Grafana Style)</h1>

      {/* upload */}
      <div style={uploadContainer}>
        <Upload
          label="📊 Estatísticas detalhadas da fila"
          onChange={loadQueueCSV}
        />

        <Upload
          label="📞 Ligações gerais"
          onChange={loadCallCSV}
        />
      </div>

      {/* filtro */}
      <div style={{ marginTop: 20 }}>
        <Select
          label="Filtrar por ramal"
          options={extensions}
          value={selectedExt}
          onChange={setSelectedExt}
        />
      </div>

      {/* cards */}
      <div style={cardContainer}>
        <Card title="Total Calls" value={stats.total} />
        <Card title="Answered" value={stats.answered} />
        <Card title="Missed" value={stats.missed} />
      </div>

      {/* gráficos */}
      <div style={grid}>

        <Panel title="Calls per Extension">
          <Chart data={stats.byExt} />
        </Panel>

        <Panel title="Calls per Queue">
          <Chart data={stats.byQueue} />
        </Panel>

      </div>

    </div>
  );
}

/* COMPONENTES */

function Upload({ label, onChange }: any) {
  return (
    <label style={uploadStyle}>
      {label}
      <input type="file" hidden onChange={onChange} />
    </label>
  );
}

function Select({ label, options, value, onChange }: any) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={selectStyle}
    >
      <option value="ALL">{label}</option>

      {options.map((o: any) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

function Card({ title, value }: any) {
  return (
    <div style={cardStyle}>
      <div>{title}</div>
      <h2>{value}</h2>
    </div>
  );
}

function Panel({ title, children }: any) {
  return (
    <div style={panelStyle}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function Chart({ data }: any) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid stroke="#333" />
        <XAxis dataKey="name" stroke="white" />
        <YAxis stroke="white" />
        <Tooltip />
        <Bar dataKey="total" fill="#00d4ff" />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ESTILO */

const containerStyle = {
  padding: 20,
  background: "#0b0f19",
  color: "white",
  minHeight: "100vh",
};

const uploadContainer = {
  display: "flex",
  gap: 10,
};

const uploadStyle = {
  padding: 10,
  background: "#1f2937",
  borderRadius: 6,
  cursor: "pointer",
};

const selectStyle = {
  padding: 10,
  background: "#1f2937",
  color: "white",
};

const cardContainer = {
  display: "flex",
  gap: 20,
  marginTop: 20,
};

const cardStyle = {
  background: "#111827",
  padding: 20,
  borderRadius: 8,
  minWidth: 150,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
  marginTop: 20,
};

const panelStyle = {
  background: "#111827",
  padding: 20,
  borderRadius: 8,
};
