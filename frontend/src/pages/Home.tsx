import TournamentConfig from "@/components/tournament-config"

const Home = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-2/3 flex-col gap-2">
        <h1 className="text-4xl font-bold">Tournoi d'Axelrod</h1>
        <p className="text-sm text-gray-700">
          Environnement d'expérimentation pour le dilemme du prisonnier.
          Configurez une expérience, opposez vos stratégies et
          analysez les résultats.
        </p>
      </div>

      <div className="w-full">
        <TournamentConfig />
      </div>
    </div>
  )
}

export default Home
