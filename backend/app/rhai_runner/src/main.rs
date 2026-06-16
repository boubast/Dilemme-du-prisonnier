use rhai::{Engine, EvalAltResult, Dynamic};
use rhai::packages::Package;
use rhai_rand::RandomPackage;
use std::env;
use rhai::plugin::*;


#[derive(Debug, Clone, Eq, PartialEq, Hash)]
enum Choice {
    Cooperate,
    Betray,
}

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

    // Ajout du module de gestion des Enums
    engine.register_type_with_name::<Choice>("Choice")
        .register_static_module("Choice", exported_module!(choice_enum_module).into());

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
                        let cout_cooperation_trahison = {cout_cooperation_trahison};
                        ");
    let renvoi_choix = "
                        ;};
                        choix().value;";
    let script_complet = format!("{debut_fonction}{init_variables}{script}{renvoi_choix}");

    // Exécution du script
    match engine.eval::<rhai::Dynamic>(&script_complet) {
        // Réussite de l'exécution
        Ok(result) => {println!("{result}");Ok(())},
        // Erreur lors de l'exécution
        Err(err) => {
            print!("Erreur: {err}");
            eprintln!("Erreur: {err}");
            Ok(())
        },
    }
}

// cargo build --release --target wasm32-wasip1

// Create a plugin module with functions constructing the 'Choice' variants
#[export_module]
mod choice_enum_module {
    // Constructors for 'Choice' variants
    pub const COOPERATE: Choice = Choice::Cooperate;

    pub const BETRAY: Choice = Choice::Betray;

    /// Return the inner value.
    #[rhai_fn(global, get = "value", pure)]
    pub fn get_value(my_enum: &mut Choice) -> String {
        match my_enum {
            Choice::Cooperate => "0".to_string(),
            Choice::Betray => "1".to_string(),
        }
    }

    // Access to inner values by position

    /// Return the value kept in the first position of `Choice`.
    #[rhai_fn(global, get = "field_0", pure)]
    pub fn get_field_0(my_enum: &mut Choice) -> Dynamic {
        match my_enum {
            Choice::Cooperate => Dynamic::UNIT,
            Choice::Betray => Dynamic::UNIT,
        }
    }
    /// Return the value kept in the second position of `Choice`.
    #[rhai_fn(global, get = "field_1", pure)]
    pub fn get_field_1(my_enum: &mut Choice) -> Dynamic {
        match my_enum {
            Choice::Cooperate | Choice::Betray => Dynamic::UNIT,
        }
    }

    // Printing
    #[rhai_fn(global, name = "to_string", name = "to_debug", pure)]
    pub fn to_string(my_enum: &mut Choice) -> String {
        format!("{my_enum:?}")
    }

    // '==' and '!=' operators
    #[rhai_fn(global, name = "==", pure)]
    pub fn eq(my_enum: &mut Choice, my_enum2: Choice) -> bool {
        my_enum == &my_enum2
    }
    #[rhai_fn(global, name = "!=", pure)]
    pub fn neq(my_enum: &mut Choice, my_enum2: Choice) -> bool {
        my_enum != &my_enum2
    }
}