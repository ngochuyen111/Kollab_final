import { supabase } from "../lib/supabase";


export const paymentService = {



    async createPayment(payment: any) {


        const { data, error } = await supabase
            .from("payments")
            .insert([

                {

                    task_id:
                        payment.task_id,


                    brand_id:
                        payment.brand_id,


                    kol_profile_id:
                        payment.kol_profile_id,


                    amount:
                        payment.amount,


                    paid_amount: 0,


                    status: "PENDING"

                }

            ])
            .select();



        if (error)
            throw error;



        return data[0];


    },




    async getPaymentsByKOL(
        kolProfileId: number
    ) {


        const { data, error } = await supabase
            .from("payments")
            .select(`

 *

 `)
            .eq(
                "kol_profile_id",
                kolProfileId
            );


        if (error)
            throw error;


        return data ?? [];


    },




    async confirmPayment(
        paymentId: number
    ) {


        const { data, error } = await supabase
            .from("payments")
            .update({

                status: "PAID",

                paid_date:
                    new Date()

            })
            .eq(
                "id",
                paymentId
            )
            .select();



        if (error)
            throw error;



        return data[0];


    }



};