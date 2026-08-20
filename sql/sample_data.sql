-- IT-CHU Manager — donnees de demonstration (reference)
-- En Docker, DatabaseSeeder (profil docker) injecte automatiquement ces donnees.
-- Ne pas executer manuellement si le seeder a deja tourne.

-- Comptes (mots de passe BCrypt generes au runtime) :
--   Admin  : admin@chu.local / Admin123!
--   Admin  : chef.projet@chu.local / Admin123!
--   Membre : youssef.alaoui@chu.local / Member123!
--   Membre : nadia.berrada@chu.local / Member123!
--   Membre : omar.chakir@chu.local / Member123!
--   Membre : imane.daoudi@chu.local / Member123!
--   Membre : mehdi.fassi@chu.local / Member123!
--   Membre : leila.ghazi@chu.local / Member123!

-- Projets seed :
--   1. Portail Patient Unifie (ACTIF, HAUTE)
--   2. Migration SI Laboratoire (ACTIF, CRITIQUE)
--   3. Dashboard Qualite SI (EN_PAUSE, MOYENNE)
--   4. Archivage Dossiers Medicaux (TERMINE, BASSE)

-- ~30 taches reparties sur les 4 colonnes Kanban
-- 5 reunions avec notes / actions / decisions (stubs Phase 2)
-- Notifications + audit + workload snapshots

SELECT 'Preferer le seeder Spring (APP_SEED_ENABLED=true, profil docker).' AS info;
