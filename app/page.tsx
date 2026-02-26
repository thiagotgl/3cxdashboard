"use client";

import { useState, useMemo } from "react";
import Papa from "papaparse";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [queueData, setQueueData] = useState<any[]>([]);
  const [callData, setCallData] = useState<any[]>([]);
  const [selectedQueue, setSelectedQueue] = useState("ALL");
  const [selectedExt, setSelectedExt] = useState("ALL");

  function loadQueueCSV(e: any) {
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: (result) => setQueueData(result.data),
    });
  }

  function loadCallCSV(e: any) {
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: (result) => setCallData(result.data),
    });
  }

  const extensions = useMemo(() => {
    return [...new Set(callData.map((c) => c.From))];
  }, [callData]);

  const queues = useMemo(() => {
    return [...new Set(queueData.map((q) => q.Queue))];
  }, [queueData]);

  const filteredCalls = useMemo(() => {
    return callData.filter((c) => {
      if (selectedExt !== "ALL" && c.From !== selectedExt) return false;
      return true;
    });
  }, [callData, selectedExt]);

  const stats = useMemo(() => {
    const total = filteredCalls.length;

    const answered = filteredCalls.filter((c) =>
      c.Status?.includes("Answered")
    ).length;

    const missed = filteredCalls.filter((c) =>
      c.Status?.includes("Missed")
    ).length;

    const byExt = Object.values(
      filteredCalls.reduce((acc: any, c: any) => {
        if (!acc[c.From])
          acc[c.From] = { name: c.From, total: 0 };

        acc[c.From].total++;
        return acc;
      }, {})
    );

    const byQueue = queueData.map((q) => ({
      name: q.Queue,
      total: Number(q["Calls Total"]),
    }));

    return { total, answered, missed, byExt, byQueue };
  }, [filteredCalls, queueData]);

  return (
    <div style={{ padding: 20, background: "#0b0f19", color: "white" }}>

      <h1>3CX Grafana Dashboard</h1>

      {/* upload */}
      <div style={{ display: "flex", gap: 10 }}>
        <Upload label="Estatísticas da fila" onChange={loadQueueCSV} />
        <Upload label="Ligações gerais" onChange={loadCallCSV} />
      </div>

      {/* filtros */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <Select
          label="Ramal"
          options={extensions}
          value={selectedExt}
          onChange={setSelectedExt}
        />
      </div>

      {/* cards */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <Card title="Total" value={stats.total} />
        <Card title="Answered" value={stats.answered} />
        <Card title="Missed" value={stats.missed} />
      </div>

      {/* gráficos */}
      <Grid>
        <Panel title="Calls per Extension">
          <Chart data={stats.byExt} />
        </Panel>

        <Panel title="Calls per Queue">
          <Chart data={stats.byQueue} />
        </Panel>
      </Grid>

    </div>
  );
}

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

function Grid({ children }: any) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
        marginTop: 20,
      }}
    >
      {children}
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

function Card({ title, value }: any) {
  return (
    <div style={cardStyle}>
      <div>{title}</div>
      <h2>{value}</h2>
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

const panelStyle = {
  background: "#111827",
  padding: 20,
  borderRadius: 8,
};

const cardStyle = {
  background: "#111827",
  padding: 20,
  borderRadius: 8,
  minWidth: 150,
};
