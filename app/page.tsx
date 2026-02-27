"use client"

import { ligacoesPorMes } from "@/data/ligacoes"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts"

const COLORS = ["#22c55e", "#ef4444"]

export default function Dashboard() {

  const anoSelecionado = 2025

  const dadosAno = ligacoesPorMes.filter(d => d.ano === anoSelecionado)

  const totalAtendidas = dadosAno.reduce((acc, d) => acc + d.atendidas, 0)
  const totalNaoAtendidas = dadosAno.reduce((acc, d) => acc + d.naoAtendidas, 0)

  const dadosDisco = [
    { name: "Atendidas", value: totalAtendidas },
    { name: "Não atendidas", value: totalNaoAtendidas },
  ]

  return (
    <div style={{ padding: 40 }}>

      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        Dashboard Call Center {anoSelecionado}
      </h1>

      {/* GRAFICO DISCO */}
      <div style={{ width: 400, height: 400 }}>
        <h2>Total anual</h2>

        <ResponsiveContainer>
          <PieChart>

            <Pie
              data={dadosDisco}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={140}
              dataKey="value"
            >
              {dadosDisco.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>

            <Tooltip />

          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* GRAFICO BARRAS */}

      <div style={{ width: "100%", height: 500 }}>

        <h2>Ligações por mês</h2>

        <ResponsiveContainer>

          <BarChart data={dadosAno}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="mes" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar dataKey="atendidas" fill="#22c55e" name="Atendidas" />

            <Bar dataKey="naoAtendidas" fill="#ef4444" name="Não atendidas" />

            <Bar dataKey="recebidas" fill="#3b82f6" name="Recebidas" />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  )
}
