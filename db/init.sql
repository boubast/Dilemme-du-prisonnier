DROP TABLE IF EXISTS participation;
DROP TABLE IF EXISTS iteration;
DROP TABLE IF EXISTS partie;
DROP TABLE IF EXISTS tournoi;
DROP TABLE IF EXISTS strategie;


CREATE TABLE strategie (
    id_strategie BIGINT PRIMARY KEY NOT NULL,
    nom VARCHAR(255) NOT NULL,
    explication TEXT NOT NULL,
    script_rhai TEXT NOT NULL
);

CREATE TABLE tournoi (
    id_tournoi BIGINT PRIMARY KEY NOT NULL,
    nb_iterations INT NOT NULL,
    cout_coop_coop INT NOT NULL,
    cout_coop_trahi INT NOT NULL,
    cout_trahi_coop INT NOT NULL,
    cout_trahi_trahi INT NOT NULL,
    date_creation DATE NOT NULL,
    meilleure_strategie VARCHAR(255)
);

CREATE TABLE partie (
    id_partie BIGINT PRIMARY KEY NOT NULL,
    id_strategie_1 BIGINT NOT NULL,
    id_strategie_2 BIGINT NOT NULL,
    id_tournoi BIGINT NOT NULL,
    CONSTRAINT fk_id_strategie_1 FOREIGN KEY (id_strategie_1) REFERENCES strategie(id_strategie) ON DELETE CASCADE,
    CONSTRAINT fk_id_strategie_2 FOREIGN KEY (id_strategie_2) REFERENCES strategie(id_strategie) ON DELETE CASCADE,
    CONSTRAINT fk_id_tournoi FOREIGN KEY (id_tournoi) REFERENCES tournoi(id_tournoi) ON DELETE CASCADE
);

CREATE TABLE iteration (
    id_iteration BIGINT PRIMARY KEY NOT NULL,
    id_partie BIGINT NOT NULL,
    numero_iteration INT NOT NULL,
    choix_strategie_1 BOOLEAN NOT NULL,
    choix_strategie_2 BOOLEAN NOT NULL,
    CONSTRAINT fk_id_partie FOREIGN KEY (id_partie) REFERENCES partie(id_partie) ON DELETE CASCADE
);

CREATE TABLE participation (
    id_tournoi BIGINT NOT NULL,
    id_strategie BIGINT NOT NULL,
    CONSTRAINT pk_participation PRIMARY KEY (id_tournoi, id_strategie),
    CONSTRAINT fk_id_tournoi FOREIGN KEY (id_tournoi) REFERENCES tournoi(id_tournoi) ON DELETE CASCADE,
    CONSTRAINT fk_id_strategie FOREIGN KEY (id_strategie) REFERENCES strategie(id_strategie) ON DELETE CASCADE
);

CREATE FUNCTION supprimer_tournois_apres_suppression_strategie() RETURNS TRIGGER AS $supprimer_tournois_apres_suppression_strategie$
    BEGIN
    DELETE FROM tournoi WHERE id_tournoi = OLD.id_tournoi;

    RETURN OLD;
    END;
$supprimer_tournois_apres_suppression_strategie$ LANGUAGE plpgsql;

CREATE TRIGGER supprimer_tournois_apres_suppression_strategie AFTER DELETE ON participation
    FOR EACH ROW EXECUTE PROCEDURE supprimer_tournois_apres_suppression_strategie();