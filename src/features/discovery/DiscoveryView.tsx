import { useEffect, useState } from "react";
import type { LocationResult, LocationService } from "../../shared/browser/locationService";
import { browserLocationService } from "../../shared/browser/locationService";
import { formatDistance, loadChallenges, type Challenge } from "./challengeDiscovery";
import {
  browserDiscoveryObservability,
  createCatalogLoadFailedEvent,
  createGeolocationFallbackEvent,
  type DiscoveryObservability,
} from "./discoveryObservability";

interface DiscoveryViewProps {
  locationService?: LocationService;
  loadChallengeList?: (location: LocationResult) => Promise<Challenge[]>;
  observability?: DiscoveryObservability;
}

type DiscoveryState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; challenges: Challenge[]; location: LocationResult };

const difficultyLabel: Record<Challenge["difficulty"], string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Difícil",
};

function progressLabel(progress: Challenge["progress"]): string {
  if (progress === "completed") {
    return "Completado";
  }

  if (progress === "in-progress") {
    return "En progreso";
  }

  return "No iniciado";
}

async function defaultLoadChallengeList(location: LocationResult): Promise<Challenge[]> {
  return loadChallenges(location.status === "granted" ? location.location : null);
}

function ChallengeDetail({ challenge, onBack }: { challenge: Challenge; onBack: () => void }) {
  return (
    <section aria-labelledby="challenge-detail-title" className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <button className="w-fit rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" type="button" onClick={onBack}>
        Volver al catálogo
      </button>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{challenge.category}</p>
        <h2 id="challenge-detail-title" className="mt-2 text-3xl font-bold text-slate-950">{challenge.title}</h2>
        <p className="mt-2 text-slate-600">{challenge.locationName}</p>
      </div>
      <p className="text-slate-700">{challenge.description}</p>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <dt className="text-sm text-slate-500">Estado</dt>
          <dd className="font-semibold text-slate-900">{progressLabel(challenge.progress)}</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <dt className="text-sm text-slate-500">Distancia</dt>
          <dd className="font-semibold text-slate-900">{formatDistance(challenge.distanceMeters)}</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <dt className="text-sm text-slate-500">Puntos</dt>
          <dd className="font-semibold text-slate-900">{challenge.points}</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <dt className="text-sm text-slate-500">Tiempo estimado</dt>
          <dd className="font-semibold text-slate-900">{challenge.estimatedMinutes ? `${challenge.estimatedMinutes} min` : "No disponible"}</dd>
        </div>
      </dl>
      <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-950">
        <h3 className="font-semibold">Foto requerida</h3>
        <p className="mt-1">{challenge.photoPrompt}</p>
      </div>
    </section>
  );
}

function ChallengeCard({ challenge, onSelect }: { challenge: Challenge; onSelect: (challenge: Challenge) => void }) {
  return (
    <li className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{challenge.category}</p>
          <h3 className="mt-2 text-xl font-bold text-slate-950">{challenge.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{challenge.locationName}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{formatDistance(challenge.distanceMeters)}</span>
      </div>
      <p className="mt-4 text-slate-700">{challenge.description}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
        <span className="rounded-full bg-slate-100 px-3 py-1">{progressLabel(challenge.progress)}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">{difficultyLabel[challenge.difficulty]}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">{challenge.points} pts</span>
      </div>
      <button className="mt-5 rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white" type="button" onClick={() => onSelect(challenge)}>
        Ver detalle
      </button>
    </li>
  );
}

export function DiscoveryView({
  locationService = browserLocationService,
  loadChallengeList = defaultLoadChallengeList,
  observability = browserDiscoveryObservability,
}: DiscoveryViewProps) {
  const [state, setState] = useState<DiscoveryState>({ status: "loading" });
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadDiscovery() {
      try {
        const location = await locationService.getCurrentLocation();

        if (location.status === "denied") {
          observability.capture(createGeolocationFallbackEvent(location.reason));
        }

        const challenges = await loadChallengeList(location);

        if (!ignore) {
          setState({ status: "success", challenges, location });
          setSelectedChallenge(null);
        }
      } catch (error) {
        observability.capture(createCatalogLoadFailedEvent(error));

        if (!ignore) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "No se pudo cargar el catálogo.",
          });
        }
      }
    }

    void loadDiscovery();

    return () => {
      ignore = true;
    };
  }, [loadChallengeList, locationService, observability, reloadKey]);

  if (state.status === "loading") {
    return <p className="rounded-2xl bg-white p-5 text-slate-700">Buscando retos cercanos...</p>;
  }

  if (state.status === "error") {
    return (
      <section aria-labelledby="discovery-error-title" className="grid gap-4 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-950">
        <div role="alert">
          <h2 id="discovery-error-title" className="text-xl font-bold">No pudimos cargar los retos</h2>
          <p className="mt-2">{state.message}</p>
        </div>
        <p className="text-sm text-red-900">
          Podés reintentar la carga sin salir de la pantalla. Si el problema continúa, probá más tarde.
        </p>
        <button
          className="w-fit rounded-full bg-red-950 px-5 py-2 text-sm font-semibold text-white"
          type="button"
          onClick={() => {
            setState({ status: "loading" });
            setReloadKey((current) => current + 1);
          }}
        >
          Reintentar
        </button>
      </section>
    );
  }

  if (selectedChallenge) {
    return <ChallengeDetail challenge={selectedChallenge} onBack={() => setSelectedChallenge(null)} />;
  }

  return (
    <section aria-labelledby="discovery-title" className="grid gap-6">
      <div className="rounded-3xl bg-slate-950 p-6 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Descubrimiento</p>
        <h2 id="discovery-title" className="mt-2 text-3xl font-bold">Retos urbanos cercanos</h2>
        <p className="mt-3 max-w-2xl text-slate-200">
          Explora el catálogo curado de Ciudad de México. Si compartís tu ubicación, ordenamos los retos por cercanía.
        </p>
      </div>
      {state.location.status === "denied" ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
          Podés navegar el catálogo sin ubicación. El orden por distancia y la validación de proximidad quedan limitados hasta que habilites el permiso.
        </p>
      ) : null}
      <ul className="grid gap-4">
        {state.challenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} onSelect={setSelectedChallenge} />
        ))}
      </ul>
    </section>
  );
}
