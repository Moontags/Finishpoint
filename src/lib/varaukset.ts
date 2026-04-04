/**
 * Yhtenäinen varaukset-kirjasto
 * Käyttää Supabase "varaukset"-taulua kaikissa operaatioissa
 */

import { createClient } from "./supabase/server";
import { getSupabaseAdminClient } from "./supabase-admin";

export type Varaus = {
  id: string;
  asiakas_nimi: string | null;
  asiakas_email: string;
  asiakas_puhelin: string | null;
  palvelutyyppi: string;
  lahto_osoite: string;
  kohde_osoite: string;
  varaus_pvm: string;
  aloitusaika: string;
  lopetusaika: string;
  ajoaika_kohteeseen_min: number | null;
  ajoaika_riihimaelta_min: number | null;
  hinta_alv: number | null;
  hinta_alv0: number | null;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export type VarausInsert = Omit<Varaus, "id" | "created_at" | "updated_at">;

export type VarausUpdate = Partial<Omit<Varaus, "id" | "created_at">>;

/**
 * Hae kaikki varaukset (admin)
 */
export async function getAllVaraukset() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("varaukset")
    .select("*")
    .order("varaus_pvm", { ascending: false });

  if (error) {
    throw new Error(`Varausten haku epäonnistui: ${error.message}`);
  }

  return data as Varaus[];
}

/**
 * Hae yksittäinen varaus ID:llä
 */
export async function getVaraus(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("varaukset")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Varauksen haku epäonnistui: ${error.message}`);
  }

  return data as Varaus;
}

/**
 * Tallenna uusi varaus (admin-client)
 */
export async function createVaraus(varaus: VarausInsert) {
  const client = getSupabaseAdminClient();
  if (!client) {
    throw new Error("Supabase admin client puuttuu");
  }

  const { data, error } = await client
    .from("varaukset")
    .insert({
      ...varaus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Varauksen tallennus epäonnistui: ${error.message}`);
  }

  return data as { id: string };
}

/**
 * Päivitä varaus (admin)
 */
export async function updateVaraus(id: string, updates: VarausUpdate) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("varaukset")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Varauksen päivitys epäonnistui: ${error.message}`);
  }
}

/**
 * Poista varaus (admin)
 */
export async function deleteVaraus(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("varaukset")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Varauksen poisto epäonnistui: ${error.message}`);
  }
}

/**
 * Hae varatut ajat (kalenterille)
 */
export async function getReservedDates(alkuPvm: string, loppuPvm: string) {
  const client = getSupabaseAdminClient();
  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("varaukset")
    .select("varaus_pvm, aloitusaika, lopetusaika")
    .gte("varaus_pvm", alkuPvm)
    .lte("varaus_pvm", loppuPvm)
    .eq("status", "vahvistettu")
    .order("varaus_pvm", { ascending: true });

  if (error) {
    console.error("Reserved dates fetch failed:", error);
    return [];
  }

  return data ?? [];
}
