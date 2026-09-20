import { supabase } from "../lib/supabase";


export const metricService = {



    async submitMetric(metric: any) {


        const { data, error } = await supabase
            .from("performance_metrics")
            .insert([

                {

                    task_id:
                        metric.task_id,


                    report_period:
                        metric.report_period,


                    views:
                        metric.views,


                    likes:
                        metric.likes,


                    comments:
                        metric.comments,


                    shares:
                        metric.shares,


                    saves:
                        metric.saves,


                    engagement:
                        metric.engagement,


                    engagement_rate:
                        metric.engagement_rate,


                    insight_screenshot_url:
                        metric.insight_screenshot_url,


                    status: "PENDING"


                }

            ])
            .select();



        if (error)
            throw error;



        return data[0];


    },




    async getMetricsByTask(
        taskId: number
    ) {


        const { data, error } = await supabase
            .from("performance_metrics")
            .select("*")
            .eq(
                "task_id",
                taskId
            );


        if (error)
            throw error;


        return data ?? [];


    }



};