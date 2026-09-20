import { supabase } from "../lib/supabase";


export const draftService = {



    // KOL submit draft
    async submitDraft(draft: any) {


        const { data, error } = await supabase
            .from("draft_submissions")
            .insert([

                {

                    task_id:
                        draft.task_id,


                    caption:
                        draft.caption,


                    draft_file_url:
                        draft.draft_file_url,


                    draft_link:
                        draft.draft_link,


                    status: "PENDING"

                }

            ])
            .select();



        if (error)
            throw error;



        return data[0];

    },



    // Brand get draft
    async getDraftByTask(
        taskId: number
    ) {


        const { data, error } = await supabase
            .from("draft_submissions")
            .select("*")
            .eq(
                "task_id",
                taskId
            );


        if (error)
            throw error;


        return data ?? [];

    },



    // Brand approve/reject
    async reviewDraft(
        draftId: number,
        status: string,
        feedback: string,
        reviewerId: number
    ) {


        const { data, error } = await supabase
            .from("draft_submissions")
            .update({

                status,

                feedback,

                reviewed_by:
                    reviewerId,

                reviewed_at:
                    new Date()

            })
            .eq(
                "id",
                draftId
            )
            .select();



        if (error)
            throw error;



        return data[0];

    }


};