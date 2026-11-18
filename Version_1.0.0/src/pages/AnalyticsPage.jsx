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
import PageHeader from '../components/common/PageHeader'
import FleetStatusChart from '../components/dashboard/FleetStatusChart'
import FuelAndMileageChart from '../components/dashboard/FuelAndMileageChart'
import { useFleetData } from '../hooks/useFleetData'

export default function AnalyticsPage() {
  const { monthlyTrends, statusData } = useFleetData()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Operating cost breakdown, distance volume, and vehicle utilization metrics."
      />

      <div className="rounded-2xl border border-white/10 bg-[#0d1014] p-5 sm:p-6">
        <div>
          <h3 className="text-base font-bold text-white">
            Fuel vs. Maintenance Costs
          </h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            Monthly expenditure comparison (₹)
          </p>
        </div>

        <div className="mt-5 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyTrends}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
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
                  value >= 1000 ? `₹${(value / 1000).toFixed(1)}k` : `₹${value}`
                }
              />
              <Tooltip
                formatter={(value, name) => [
                  `₹${Number(value).toLocaleString('en-IN')}`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: '#12161c',
                  borderRadius: '0.75rem',
                  borderColor: '#27272a',
                  color: '#f4f4f5',
                  fontSize: '0.8rem',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }} />
              <Bar
                dataKey="fuelCost"
                name="Fuel Spend"
                fill="#a3e635"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="maintenanceCost"
                name="Maintenance Spend"
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FuelAndMileageChart data={monthlyTrends} />
        </div>
        <FleetStatusChart data={statusData} />
      </div>
    </div>
  )
}
