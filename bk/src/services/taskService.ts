import { supabase } from "../lib/supabase";


export const taskService = {


    // ============================
    // BRAND CREATE TASK
    // ============================
    async createTask(task: any) {

        const { data, error } = await supabase
            .from("campaign_tasks")
            .insert([
                {
                    campaign_id: task.campaign_id,
                    kol_profile_id: task.kol_profile_id,

                    content_type: task.content_type,

                    content_requirement:
                        task.content_requirement,

                    draft_deadline:
                        task.draft_deadline,

                    publish_deadline:
                        task.publish_deadline,

                    payment_amount:
                        task.payment_amount,

                    status: "ASSIGNED"
                }
            ])
            .select();


        if (error) {
            console.error(error);
            throw error;
        }


        return data[0];

    },



    // ============================
    // BRAND GET TASK BY CAMPAIGN
    // ============================
    async getTasksByCampaign(
        campaignId: number
    ) {

        const { data, error } = await supabase
            .from("campaign_tasks")
            .select(`
        *,

        kol_profiles(
          id,
          followers,
          platform,
          content_category,

          users(
            full_name,
            avatar_url
          )
        )

      `)
            .eq(
                "campaign_id",
                campaignId
            );


        if (error)
            throw error;


        return data ?? [];

    },



    // ============================
    // KOL GET MY TASK
    // ============================
    async getTasksByKOL(
        kolProfileId: number
    ) {

        const { data, error } = await supabase
            .from("campaign_tasks")
            .select(`
        *,

        campaigns(
          id,
          campaign_name,
          campaign_brief,
          budget
        )

      `)
            .eq(
                "kol_profile_id",
                kolProfileId
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error)
            throw error;


        return data ?? [];

    },



    // ============================
    // UPDATE TASK STATUS
    // ============================
    async updateTaskStatus(
        taskId: number,
        status: string
    ) {

        const { data, error } = await supabase
            .from("campaign_tasks")
            .update({

                status,

                updated_at:
                    new Date()

            })
            .eq(
                "id",
                taskId
            )
            .select();


        if (error)
            throw error;


        return data[0];

    }


};