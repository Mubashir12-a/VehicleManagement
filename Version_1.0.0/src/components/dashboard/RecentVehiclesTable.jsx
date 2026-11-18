import { Link } from 'react-router-dom'
import StatusBadge from '../common/StatusBadge'

export default function RecentVehiclesTable({ vehicles, showViewAll = true }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Fleet Vehicles Overview
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Sample vehicle inventory with status, mileage, and fuel telemetry
          </p>
        </div>
        {showViewAll && (
          <Link
            to="/vehicles"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View all vehicles →
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead className="bg-slate-50/75 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Vehicle</th>
              <th className="px-5 py-3">Plate</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Driver</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Mileage</th>
              <th className="px-5 py-3">Fuel / Charge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-slate-50/80">
                <td className="whitespace-nowrap px-5 py-3.5">
                  <div className="font-medium text-slate-900">{vehicle.name}</div>
                  <div className="text-xs text-slate-400">{vehicle.id}</div>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-slate-600">
                  {vehicle.plate}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                  {vehicle.type}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-slate-700">
                  {vehicle.driver}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5">
                  <StatusBadge status={vehicle.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right font-medium text-slate-800">
                  {vehicle.mileage.toLocaleString()} mi
                </td>
                <td className="whitespace-nowrap px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          vehicle.fuelLevel >= 60
                            ? 'bg-emerald-500'
                            : vehicle.fuelLevel >= 30
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                        }`}
                        style={{ width: `${vehicle.fuelLevel}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                      {vehicle.fuelLevel}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
