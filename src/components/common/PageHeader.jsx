export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-xs text-zinc-400 hidden sm:block sm:text-sm sm:mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 sm:gap-3">{actions}</div>}
    </div>
  )
}
