use rhai::{Engine};
use std::env;

#[unsafe(no_mangle)]
pub extern "C" fn choix() -> String {

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

    println!(" - Running - "); 

    let engine = Engine::new();

    // Ajout des variables outils au script
    let avant = format!("let derniers_coups_strategie_courante = {derniers_coups_strategie_courante};
                        let derniers_coups_strategie_adverse = {derniers_coups_strategie_adverse};
                        let cout_trahison = {cout_trahison};
                        let cout_cooperation = {cout_cooperation};
                        let cout_trahison_cooperation = {cout_trahison_cooperation};
                        let cout_cooperation_trahison = {cout_cooperation_trahison};
                        ");
    let script_complet = format!("{avant}{script}");

    // Exécution du script
    //let result = engine.eval::<i64>(&script_complet)?;
    match engine.eval::<rhai::Dynamic>(&script_complet) {
        // Réussite de l'exécution
        Ok(result) => {result.to_string()},
        // Erreur lors de l'exécution
        Err(err) => {
            println!("Erreur: {err}");
            eprintln!("Erreur: {err}");
            "erreur".to_string()
        },
    }
}

//cargo build --release --target wasm32-unknown-unknown
