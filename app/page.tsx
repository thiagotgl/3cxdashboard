"use client"

import { useState } from "react"
import { ligacoesPorMes } from "@/data/ligacoes"
import { agentesRaw } from "@/data/agentesRaw"

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

  const anosDisponiveis = [...new Set(ligacoesPorMes.map(d => d.ano))]

const [anoSelecionado, setAnoSelecionado] = useState(anosDisponiveis[0])

const [mesSelecionado, setMesSelecionado] = useState("TODOS")

const dadosAno = ligacoesPorMes.filter(d => d.ano === anoSelecionado)
const mesesDisponiveis = [
  "TODOS",
  ...new Set(
    agentesRaw
      .filter(a => a.ano === anoSelecionado)
      .map(a => a.mes)
  )
]

const totalRecebidas = dadosAno.reduce((acc, d) => acc + d.recebidas, 0)

const totalAtendidas = dadosAno.reduce((acc, d) => acc + d.atendidas, 0)

const totalNaoAtendidas = dadosAno.reduce((acc, d) => acc + d.naoAtendidas, 0)

const totalGeral = totalRecebidas

const taxaSucesso =
  totalRecebidas > 0
    ? ((totalAtendidas / totalRecebidas) * 100).toFixed(1)
    : 0

  const dadosDisco = [
    { name: "Atendidas", value: totalAtendidas },
    { name: "Não atendidas", value: totalNaoAtendidas },
  ]


const rankingAgentes = Object.values(
  agentesRaw
    .filter(a =>
      a.ano === anoSelecionado &&
      (mesSelecionado === "TODOS" || a.mes === mesSelecionado)
    )
    .reduce((acc: any, item: any) => {

      if (!acc[item.nome]) {
        acc[item.nome] = {
          nome: item.nome,
          atendimentos: 0,
          somaTma: 0,
          somaTta: 0,
          registros: 0,
          tma: 0,
          tta: 0
        }
      }

      acc[item.nome].atendimentos += item.atendimentos
      acc[item.nome].somaTma += item.tma
      acc[item.nome].somaTta += item.tta
      acc[item.nome].registros++

      acc[item.nome].tma =
        acc[item.nome].somaTma / acc[item.nome].registros

      acc[item.nome].tta =
        acc[item.nome].somaTta

      return acc

    }, {})
)

const rankingPorAtendimentos =
  [...rankingAgentes].sort((a: any, b: any) => b.atendimentos - a.atendimentos)

const rankingPorTma =
  [...rankingAgentes].sort((a: any, b: any) => b.tma - a.tma)

const rankingPorTta =
  [...rankingAgentes].sort((a: any, b: any) => b.tta - a.tta)


  return (
    <div className="min-h-screen bg-zinc-100 p-10 text-zinc-800">

      {/* TITULO */}

<div className="flex justify-between items-center mb-8">

  <h1 className="text-3xl font-bold text-zinc-800">
    Dashboard Call Center
  </h1>

  <select
    value={anoSelecionado}
    onChange={(e) => setAnoSelecionado(Number(e.target.value))}
    className="bg-white border border-zinc-300 rounded-lg px-4 py-2 shadow-sm"
  >
    {anosDisponiveis.map((ano) => (
      <option key={ano} value={ano}>
        {ano}
      </option>
    ))}
  </select>

</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

  <div className="bg-white p-4 rounded-xl shadow">
    <div className="text-sm text-zinc-500">Recebidas</div>
    <div className="text-2xl font-bold text-blue-600">
      {totalRecebidas.toLocaleString()}
    </div>
  </div>

  <div className="bg-white p-4 rounded-xl shadow">
    <div className="text-sm text-zinc-500">Atendidas</div>
    <div className="text-2xl font-bold text-green-600">
      {totalAtendidas.toLocaleString()}
    </div>
  </div>

  <div className="bg-white p-4 rounded-xl shadow">
    <div className="text-sm text-zinc-500">Não atendidas</div>
    <div className="text-2xl font-bold text-red-600">
      {totalNaoAtendidas.toLocaleString()}
    </div>
  </div>

  <div className="bg-white p-4 rounded-xl shadow">
    <div className="text-sm text-zinc-500">Taxa sucesso</div>
    <div className="text-2xl font-bold text-zinc-800">
      {taxaSucesso}%
    </div>
  </div>

</div>

{/* GRAFICO DISCO */}

<div className="bg-white p-6 rounded-xl shadow">

  <h2 className="mb-4 font-semibold text-lg text-zinc-700">
    Total anual de ligações
  </h2>

  <div className="relative w-full h-[320px]">

    <ResponsiveContainer>

      <PieChart>

        <Pie
          data={dadosDisco}
          dataKey="value"
          innerRadius={80}
          outerRadius={120}
          paddingAngle={2}
        >
          {dadosDisco.map((entry, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>

        {/* Tooltip melhorado */}
<Tooltip
  formatter={(value, name) => [
    Number(value ?? 0).toLocaleString(),
    String(name ?? "")
  ]}
  contentStyle={{
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "14px"
  }}
/>

      </PieChart>

    </ResponsiveContainer>

    {/* TEXTO CENTRAL */}

    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

      <span className="text-3xl font-bold text-zinc-800">
        {totalGeral.toLocaleString()}
      </span>

      <span className="text-sm text-zinc-500">
        Total
      </span>

    </div>

  </div>

  {/* LEGENDA FIXA */}

  <div className="flex justify-center gap-8 mt-4 text-sm">

    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-green-500 rounded"></div>
      <span className="text-zinc-700">
        Atendidas: <b>{totalAtendidas.toLocaleString()}</b>
      </span>
    </div>

    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-red-500 rounded"></div>
      <span className="text-zinc-700">
        Não atendidas: <b>{totalNaoAtendidas.toLocaleString()}</b>
      </span>
    </div>

  </div>

</div>

        {/* GRAFICO BARRAS */}

        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="mb-4 font-semibold text-lg text-zinc-700">
            Ligações por mês
          </h2>

          <ResponsiveContainer width="100%" height={320}>

          <BarChart 
  data={dadosAno}
  barGap={4}
  barCategoryGap="20%"
>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis 
                dataKey="mes"
                tick={{ fill: "#374151", fontSize: 12 }}
              />

              <YAxis 
                tick={{ fill: "#374151", fontSize: 12 }}
              />

              <Tooltip />

              <Legend />

           <Bar 
  dataKey="atendidas" 
  fill="#22c55e" 
  name="Atendidas"
  label={{ 
    position: "top", 
    fill: "#374151",
    fontSize: 11 
  }} 
/>

   <Bar 
  dataKey="naoAtendidas" 
  fill="#ef4444" 
  name="Não atendidas"
  label={{ 
    position: "top", 
    fill: "#374151",
    fontSize: 11 
  }} 
/>

<Bar 
  dataKey="recebidas" 
  fill="#3b82f6" 
  name="Recebidas"
  label={{ 
    position: "top", 
    fill: "#374151",
    fontSize: 11 
  }} 
/>



            </BarChart>

          </ResponsiveContainer>

        </div>

  

{/* RANKING DE AGENTES */}

<div className="bg-white p-6 rounded-xl shadow mt-8">

  <div className="flex justify-between items-center mb-4">

  <h2 className="font-semibold text-lg text-zinc-700">
    Ranking de atendimentos por agente
  </h2>

  <select
    value={mesSelecionado}
    onChange={(e) => setMesSelecionado(e.target.value)}
    className="bg-white border border-zinc-300 rounded-lg px-3 py-1 shadow-sm text-sm"
  >
    {mesesDisponiveis.map((mes) => (
      <option key={mes} value={mes}>
        {mes}
      </option>
    ))}
  </select>

</div>

  <ResponsiveContainer width="100%" height={400}>

    <BarChart
     data={rankingPorAtendimentos}
      layout="vertical"
      margin={{ left: 40 }}
    >

      <CartesianGrid strokeDasharray="3 3" />

      <XAxis
        type="number"
        tick={{ fill: "#374151", fontSize: 12 }}
      />

      <YAxis
        type="category"
        dataKey="nome"
        width={120}
        tick={{ fill: "#374151", fontSize: 12 }}
      />

      <Tooltip />

      <Bar
        dataKey="atendimentos"
        fill="#6366f1"
        label={{
          position: "right",
          fill: "#312e81",
          fontWeight: 600
        }}
      />

    </BarChart>

  </ResponsiveContainer>

</div>

<div className="bg-white p-6 rounded-xl shadow mt-8">

  <h2 className="mb-4 font-semibold text-lg text-zinc-700">
    Ranking por TMA
  </h2>

  <ResponsiveContainer width="100%" height={400}>

    <BarChart
      data={rankingPorTma}
      layout="vertical"
      margin={{ left: 40 }}
    >

      <CartesianGrid strokeDasharray="3 3" />

      <XAxis type="number" />

      <YAxis
        type="category"
        dataKey="nome"
        width={120}
      />

      <Tooltip />

<Bar
  dataKey="tma"
  fill="#22c55e"
  name="TMA"
  label={{
    position: "right",
    fill: "#166534",
    fontSize: 12
  }}
/>

    </BarChart>

  </ResponsiveContainer>

</div>
<div className="bg-white p-6 rounded-xl shadow mt-8">

  <h2 className="mb-4 font-semibold text-lg text-zinc-700">
    Ranking por TTA (Tempo Total Atendimento)
  </h2>

  <ResponsiveContainer width="100%" height={400}>

    <BarChart
      data={rankingPorTta}
      layout="vertical"
      margin={{ left: 40 }}
    >

      <CartesianGrid strokeDasharray="3 3" />

      <XAxis type="number" />

      <YAxis
        type="category"
        dataKey="nome"
        width={120}
      />

      <Tooltip />

      <Bar
        dataKey="tta"
        fill="#f59e0b"
        name="TTA"
        label={{
          position: "right",
          fill: "#92400e",
          fontSize: 12
        }}
      />

    </BarChart>

  </ResponsiveContainer>

</div>
 </div> 

  )
}