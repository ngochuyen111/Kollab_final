import { supabase } from "../lib/supabase";


export const profileService = {



    async getUserProfile(
        userId: number
    ) {


        const { data, error } = await supabase
            .from("users")
            .select(`

 *

 `)
            .eq(
                "id",
                userId
            )
            .single();



        if (error)
            throw error;



        return data;


    },




    async getKOLProfileByUser(
        userId: number
    ) {


        const { data, error } = await supabase
            .from("kol_profiles")
            .select(`

 *,

 users(
  full_name,
  email,
  avatar_url
 )

 `)
            .eq(
                "user_id",
                userId
            )
            .single();



        if (error)
            throw error;



        return data;


    }



};