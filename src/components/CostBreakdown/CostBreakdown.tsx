import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAppContext } from '../../context/AppContext';

const COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#06b6d4', '#a855f7', '#f97316', '#ef4444'];

export default function CostBreakdown() {
  const { sectionCosts, totalCost, selectedModule } = useAppContext();

  if (!selectedModule) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        Select a module to see cost charts
      </div>
    );
  }

  const barData = sectionCosts.map((sc, i) => ({
    name: sc.sectionName,
    cost: sc.cost,
    fill: COLORS[i % COLORS.length],
  }));

  const pieData = sectionCosts.map((sc, i) => ({
    name: sc.sectionName,
    value: sc.cost,
    fill: COLORS[i % COLORS.length],
  }));

  const areaM2 = (selectedModule.width * selectedModule.height) / 1_000_000;
  const costPerWp = selectedModule.powerWp > 0 ? totalCost / selectedModule.powerWp : 0;
  const costPerM2 = areaM2 > 0 ? totalCost / areaM2 : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-3 py-2">
        <h2 className="text-sm font-bold text-slate-700">Cost Breakdown</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-blue-50 p-2 text-center">
            <div className="text-lg font-bold text-blue-700">{totalCost.toFixed(2)}</div>
            <div className="text-[10px] text-blue-500">Total EUR</div>
          </div>
          <div className="rounded-lg bg-amber-50 p-2 text-center">
            <div className="text-lg font-bold text-amber-700">{costPerWp.toFixed(3)}</div>
            <div className="text-[10px] text-amber-500">EUR / Wp</div>
          </div>
          <div className="rounded-lg bg-green-50 p-2 text-center">
            <div className="text-lg font-bold text-green-700">{costPerM2.toFixed(2)}</div>
            <div className="text-[10px] text-green-500">EUR / m2</div>
          </div>
        </div>

        {/* Bar chart */}
        <div>
          <h3 className="text-xs font-semibold text-slate-600 mb-1">Cost per Section (EUR)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(2)} EUR`, 'Cost']}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div>
          <h3 className="text-xs font-semibold text-slate-600 mb-1">Cost Distribution (%)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={{ strokeWidth: 1 }}
                fontSize={9}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(2)} EUR`]} contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cost table */}
        <div>
          <h3 className="text-xs font-semibold text-slate-600 mb-1">Detailed Costs</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-1">Section</th>
                <th className="py-1 text-right">Cost (EUR)</th>
                <th className="py-1 text-right">Share</th>
              </tr>
            </thead>
            <tbody>
              {sectionCosts.map((sc, i) => (
                <tr key={sc.sectionId} className="border-b border-slate-100">
                  <td className="py-1 flex items-center gap-1">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    {sc.sectionName}
                  </td>
                  <td className="py-1 text-right font-medium">{sc.cost.toFixed(2)}</td>
                  <td className="py-1 text-right text-slate-400">{sc.percentage}%</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-1">Total</td>
                <td className="py-1 text-right">{totalCost.toFixed(2)}</td>
                <td className="py-1 text-right">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
