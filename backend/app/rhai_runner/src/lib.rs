use rhai::{Engine};
use std::env;

#[unsafe(no_mangle)]
pub extern "C" fn choix() -> String {

    // Script Rhai à exécuter
    let script = env::args().nth(1).expect("missing script");

    // Variables outils : état de la partie
    let derniers_coups_strategie_courante = env::args().nth(2).expect("missing action history 1");
    let derniers_coups_strategie_adverse = env::args().nth(3).expect("missing action history 2");

    // Variables outils : coûts des interactions
    let cout_trahison = env::args().nth(4).expect("missing payoff 1");
    let cout_cooperation = env::args().nth(5).expect("missing payoff 2");
    let cout_trahison_cooperation = env::args().nth(6).expect("missing payoff 3");
    let cout_cooperation_trahison = env::args().nth(7).expect("missing payoff 4");

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
            println!("Error: {err}");
            eprintln!("Error: {err}");
            "error".to_string()
        },
    }
}

//cargo build --release --target wasm32-unknown-unknown
