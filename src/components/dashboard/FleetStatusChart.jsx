import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

export default function FleetStatusChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-[#0d1014] p-5">
      <div>
        <h3 className="text-base font-bold text-white">Status Breakdown</h3>
        <p className="mt-0.5 text-xs text-zinc-400">
          Current status across {total} registered vehicle
        </p>
      </div>

      <div className="mt-4 h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={86}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} vehicle`, name]}
              contentStyle={{
                backgroundColor: '#12161c',
                borderRadius: '0.75rem',
                borderColor: '#27272a',
                color: '#f4f4f5',
                fontSize: '0.8rem',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 border-t border-white/8 pt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate">{item.name}</span>
            </div>
            <span className="font-bold text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
