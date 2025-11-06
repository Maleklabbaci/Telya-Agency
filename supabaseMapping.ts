/**
 * Ce fichier centralise le mappage entre les noms de propriétés de notre application (camelCase)
 * et les noms de colonnes de la base de données Supabase (snake_case).
 * 
 * NOTE IMPORTANTE : Ce fichier est destiné à clarifier les mappages. Si vous rencontrez une erreur
 * "Could not find the '...' column", le problème vient probablement de la manière dont les données
 * sont interrogées ou mises à jour dans App.tsx, et non d'un simple nom de colonne incorrect ici.
 * Les relations plusieurs-à-plusieurs (ex: clients-employés) sont gérées via des tables de jointure
 * et ne sont pas mappées ici.
 */
