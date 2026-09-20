import { supabase } from "../lib/supabase";


export const kolService = {


    // =====================
    // GET ALL KOL
    // =====================
    async getAllKOLs() {


        const { data, error } = await supabase
            .from("kol_profiles")
            .select(`

        *,

        users(
          id,
          full_name,
          email,
          avatar_url
        )

      `)
            .eq(
                "status",
                "ACTIVE"
            );


        if (error)
            throw error;


        return data ?? [];

    },



    // =====================
    // GET KOL PROFILE
    // =====================
    async getProfile(
        kolProfileId: number
    ) {

        const { data, error } = await supabase
            .from("kol_profiles")
            .select(`

        *,

        users(
          id,
          full_name,
          email,
          avatar_url
        )

      `)
            .eq(
                "id",
                kolProfileId
            )
            .single();


        if (error)
            throw error;


        return data;

    }


};