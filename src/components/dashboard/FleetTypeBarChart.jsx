import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export default function FleetTypeBarChart({ data }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          Vehicles by Category
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Active units compared against total fleet allocation
        </p>
      </div>

      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="category"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '0.5rem',
                borderColor: '#e2e8f0',
                fontSize: '0.8rem',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }} />
            <Bar dataKey="total" name="Total Units" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
            <Bar dataKey="active" name="Active Units" fill="#4f46e5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
