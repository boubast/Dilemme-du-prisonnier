use rhai::{Engine, EvalAltResult};
use rhai::packages::Package;
use rhai_rand::RandomPackage;
use std::env;

fn main() -> Result<(), Box<EvalAltResult>> {

    // Script Rhai à exécuter
    let script = env::args().nth(1).expect("script manquant");

    // Variables outils : état de la partie
    let derniers_coups_strategie_courante = env::args().nth(2).expect("derniers coups 1 manquant");
    let derniers_coups_strategie_adverse = env::args().nth(3).expect("derniers coups 2 manquant");

    // Variables outils : coûts des interactions
    let cout_trahison = env::args().nth(4).expect("coût 1 manquant");
    let cout_cooperation = env::args().nth(5).expect("coût 2 manquant");
    let cout_trahison_cooperation = env::args().nth(6).expect("coût 3 manquant");
    let cout_cooperation_trahison = env::args().nth(7).expect("coût 4 manquant");

    let mut engine = Engine::new();

    // Ajout de la gestion d'aléatoire
    engine.register_global_module(RandomPackage::new().as_shared_module());

    // Ajout des variables outils au script
    let debut_fonction = "fn choix(){";
    let init_variables = format!("
                        let derniers_coups_strategie_courante = {derniers_coups_strategie_courante};
                        let derniers_coups_strategie_adverse = {derniers_coups_strategie_adverse};
                        let cout_trahison = {cout_trahison};
                        let cout_cooperation = {cout_cooperation};
                        let cout_trahison_cooperation = {cout_trahison_cooperation};
                        let cout_cooperation_trahison = {cout_cooperation_trahison};");
    let renvoi_choix = ";};print(choix());";
    let script_complet = format!("{debut_fonction}{init_variables}{script}{renvoi_choix}");

    // Exécution du script
    match engine.eval::<rhai::Dynamic>(&script_complet) {
        // Réussite de l'exécution
        Ok(_result) => {Ok(())},
        // Erreur lors de l'exécution
        Err(err) => {
            print!("Erreur: {err}");
            eprintln!("Erreur: {err}");
            Ok(())
        },
    }
}

// depuis Windows
// cargo build --release
// inutilisé : cargo build --release --target wasm32-wasip1


// depuis Linux (WSL)
// cargo build --target x86_64-unknown-linux-gnu --release