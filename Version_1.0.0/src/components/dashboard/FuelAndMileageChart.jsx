import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export default function FuelAndMileageChart({ data }) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-[#0d1014] p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white">
            Monthly Distance Trend
          </h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            Monthly distance logged over the last 6 months (km)
          </p>
        </div>
        <span className="rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-300">
          Last 6 Months
        </span>
      </div>

      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="mileageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a3e635" stopOpacity={0.32} />
                <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#71717a', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#71717a', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`
              }
            />
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString('en-IN')} km`, 'Distance']}
              contentStyle={{
                backgroundColor: '#12161c',
                borderRadius: '0.75rem',
                borderColor: '#27272a',
                color: '#f4f4f5',
                fontSize: '0.8rem',
              }}
            />
            <Area
              type="monotone"
              dataKey="mileage"
              stroke="#a3e635"
              strokeWidth={2.5}
              fill="url(#mileageGradient)"
              activeDot={{ r: 5, fill: '#a3e635' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
