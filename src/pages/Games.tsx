import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { gamesCopy } from "@/data/gamesCopy";

const Games = () => {
  const { language, t } = useLanguage();
  const content = gamesCopy[language];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto max-w-5xl px-4 space-y-12">
          <section className="text-center space-y-3">
            <h1 className="text-4xl font-bold">{content.title}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {content.subtitle}
            </p>
          </section>

          <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <article className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg backdrop-blur">
              <div className="space-y-4">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {t.nav.gamesBlackjack}
                </span>
                <h2 className="text-2xl font-semibold">{content.blackjack.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {content.blackjack.description}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {language === "fr"
                    ? "Affronte le croupier avec toutes les options classiques."
                    : "Take on the dealer with every classic option."}
                </div>
                <Link
                  to="/games/blackjack"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  {language === "fr" ? "Jouer" : "Play"}
                </Link>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg backdrop-blur">
              <div className="space-y-4">
                <span className="inline-flex items-center rounded-full bg-secondary/20 px-3 py-1 text-sm font-medium text-secondary-foreground">
                  {t.nav.gamesPlinko}
                </span>
                <h2 className="text-2xl font-semibold">{content.plinko.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {content.plinko.description}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {language === "fr"
                    ? "Choisis ton risque et tente le gros multiplicateur."
                    : "Pick your risk and chase the big multiplier."}
                </div>
                <Link
                  to="/games/plinko"
                  className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary/90"
                >
                  {language === "fr" ? "Jouer" : "Play"}
                </Link>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg backdrop-blur">
              <div className="space-y-4">
                <span className="inline-flex items-center rounded-full bg-teal-500/10 px-3 py-1 text-sm font-medium text-teal-500">
                  {content.coinFlip.title}
                </span>
                <h2 className="text-2xl font-semibold">{content.coinFlip.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {content.coinFlip.description}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {language === "fr"
                    ? "Choisis pile ou face et tente ta chance."
                    : "Choose heads or tails and try your luck."}
                </div>
                <Link
                  to="/games/coinflip"
                  className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600"
                >
                  {language === "fr" ? "Jouer" : "Play"}
                </Link>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg backdrop-blur">
              <div className="space-y-4">
                <span className="inline-flex items-center rounded-full bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-500">
                  {content.limbo.title}
                </span>
                <h2 className="text-2xl font-semibold">{content.limbo.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {content.limbo.description}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {language === "fr"
                    ? "Misez et regardez le multiplicateur monter."
                    : "Place your bet and watch the multiplier rise."}
                </div>
                <Link
                  to="/games/limbo"
                  className="rounded-full bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-600"
                >
                  {language === "fr" ? "Jouer" : "Play"}
                </Link>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg backdrop-blur">
              <div className="space-y-4">
                <span className="inline-flex items-center rounded-full bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-500">
                  {content.rockPaperScissors.title}
                </span>
                <h2 className="text-2xl font-semibold">{content.rockPaperScissors.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {content.rockPaperScissors.description}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {language === "fr"
                    ? "Choisis Rock, Paper ou Scissors."
                    : "Choose Rock, Paper or Scissors."}
                </div>
                <Link
                  to="/games/rockpaperscissors"
                  className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  {language === "fr" ? "Jouer" : "Play"}
                </Link>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg backdrop-blur">
              <div className="space-y-4">
                <span className="inline-flex items-center rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-500">
                  {content.war.title}
                </span>
                <h2 className="text-2xl font-semibold">{content.war.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {content.war.description}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {language === "fr"
                    ? "Gagnez toutes les cartes pour remporter."
                    : "Win all the cards to win."}
                </div>
                <Link
                  to="/games/war"
                  className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  {language === "fr" ? "Jouer" : "Play"}
                </Link>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-3xl border border-yellow-500/60 bg-card/80 p-8 shadow-lg backdrop-blur">
              <div className="space-y-4">
                <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-500">
                  Wager Race
                </span>
                <h2 className="text-2xl font-semibold">Wager Race</h2>
                <p className="text-sm text-muted-foreground">
                  {language === "fr"
                    ? "Découvrez le classement mensuel des meilleurs wagers"
                    : "Discover the monthly leaderboard of top wagers"}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {language === "fr"
                    ? "Compétition mensuelle des plus gros wagers."
                    : "Monthly competition of the biggest wagers."}
                </div>
                <Link
                  to="/games/wager-race"
                  className="rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-600"
                >
                  {language === "fr" ? "Voir" : "View"}
                </Link>
              </div>
            </article>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Games;

