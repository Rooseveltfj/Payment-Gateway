"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from "recharts";

interface Stats {
  activeUsers: number;
  totalVolume: number;
  platformRevenue: number;
  pendingWithdrawals: number;
  transactionsToday: number;
  newUsersToday: number;
}

interface ChartData {
  timeline: { date: string; volume: number }[];
  payments: { name: string; value: number }[];
  topPlayers: { name: string; revenue: number }[];
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/metrics");
        const data = await res.json();
        setStats(data.metrics);
        setCharts(data.charts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
       <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div>
         <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Oversight Global</h1>
         <p className="text-slate-500 mt-2 font-medium">Dashboard central para controle total da plataforma Black Gate.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
         <StatCard label="Usuários Ativos" value={stats?.activeUsers.toString()} icon={Users} trend="+4%" />
         <StatCard label="Volume Total" value={`R$ ${stats?.totalVolume.toFixed(2)}`} icon={DollarSign} highlight />
         <StatCard label="Receita App" value={`R$ ${stats?.platformRevenue.toFixed(2)}`} icon={ShieldCheck} highlight color="text-primary" />
         <StatCard label="Saques Pendentes" value={`R$ ${stats?.pendingWithdrawals.toFixed(2)}`} icon={Clock} color="text-yellow-500" />
         <StatCard label="Vendas Hoje" value={stats?.transactionsToday.toString()} icon={TrendingUp} trend="Live" />
         <StatCard label="Novos Players" value={stats?.newUsersToday.toString()} icon={ArrowUpRight} trend="Hoje" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Main Volume Chart */}
         <div className="bg-slate-900/40 border border-slate-800/50 p-8 rounded-3xl backdrop-blur-xl">
            <h3 className="text-lg font-black text-white uppercase italic tracking-widest mb-8">Fluxo de Volume (30 Dias)</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts?.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickFormatter={(val) => val.split('-')[2]} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="volume" stroke="#22C55E" strokeWidth={4} dot={false} animationDuration={1500} />
                </LineChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-8">
            {/* Top Players Bar Chart */}
            <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-xl">
               <h3 className="text-sm font-black text-white uppercase italic tracking-widest mb-6">Top 10 Players (Receita)</h3>
               <div className="h-40 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts?.topPlayers} layout="vertical">
                       <XAxis type="number" hide />
                       <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={100} />
                       <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                       <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Payment Methods Pie Chart */}
            <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between">
               <div className="mb-4 md:mb-0">
                  <h3 className="text-sm font-black text-white uppercase italic tracking-widest mb-2">Métodos de Pagamento</h3>
                  <p className="text-xs text-slate-500">Distribuição por volume.</p>
               </div>
               <div className="h-32 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={charts?.payments} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">
                        {charts?.payments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="space-y-2">
                  {charts?.payments.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.name}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, highlight, color = "text-white" }: { label: string, value?: string, icon: React.ComponentType<{className?: string}>, trend?: string, highlight?: boolean, color?: string }) {
  return (
    <div className={`bg-slate-900/40 border ${highlight ? 'border-primary/30 shadow-lg shadow-primary/5' : 'border-slate-800/50'} p-6 rounded-3xl backdrop-blur-xl group hover:border-slate-700 transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center transition-transform group-hover:scale-110 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${trend === 'Live' ? 'bg-green-500/20 text-green-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <h4 className={`text-xl font-black italic tracking-tighter truncate ${highlight ? 'text-primary' : 'text-white'}`}>
          {value || "..."}
        </h4>
      </div>
    </div>
  );
}
