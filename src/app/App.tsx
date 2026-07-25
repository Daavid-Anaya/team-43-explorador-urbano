import { DiscoveryView } from "../features/discovery/DiscoveryView";

export function App() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-4xl gap-8">
        <header>
          <h1 className="text-4xl font-black tracking-tight">Explorador Urbano</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Descubrí retos curados, revisá la distancia y elegí el próximo lugar para explorar.
          </p>
        </header>
        <DiscoveryView />
      </div>
    </main>
  );
}
