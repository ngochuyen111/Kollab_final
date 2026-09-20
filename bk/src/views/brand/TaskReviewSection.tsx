import { useEffect, useState } from "react";

import { draftService }
    from "../../services/draftService";

import { taskService }
    from "../../services/taskService";



interface Props {

    campaignId: number;

    brandId: number;

}



export default function TaskReviewSection({

    campaignId,
    brandId

}: Props) {


    const [tasks, setTasks] = useState<any[]>([]);

    const [drafts, setDrafts] = useState<any[]>([]);



    async function loadTasks() {


        const data =
            await taskService.getTasksByCampaign(
                campaignId
            );


        setTasks(data);


    }



    useEffect(() => {


        loadTasks();


    }, [campaignId]);




    async function viewDraft(
        taskId: number
    ) {


        const data =
            await draftService
                .getDraftByTask(taskId);


        setDrafts(data);


    }




    async function approveDraft(
        id: number
    ) {


        await draftService.reviewDraft(

            id,

            "APPROVED",

            "Đã duyệt",

            brandId

        );


        alert(
            "Duyệt thành công"
        );


    }



    async function rejectDraft(
        id: number
    ) {


        await draftService.reviewDraft(

            id,

            "REJECTED",

            "Cần chỉnh sửa lại",

            brandId

        );


        alert(
            "Đã từ chối"
        );


    }




    return (

        <div className="space-y-4">


            <h2 className="
text-xl
font-bold
">

                Review nhiệm vụ KOL

            </h2>



            {

                tasks.map(task => (


                    <div

                        key={task.id}

                        className="
bg-white
rounded-xl
p-5
border
"


                    >


                        <div>

                            <h3 className="font-bold">

                                {
                                    task.kol_profiles?.users?.full_name
                                }

                            </h3>


                            <p>

                                {
                                    task.content_type
                                }

                            </p>


                            <p className="
text-sm
text-gray-500
">

                                {
                                    task.content_requirement
                                }

                            </p>


                        </div>



                        <button

                            className="
mt-3
px-4
py-2
rounded
bg-teal-600
text-white
"

                            onClick={() => viewDraft(task.id)}

                        >

                            Xem draft

                        </button>



                    </div>


                ))

            }




            <hr />

            <h2 className="font-bold">

                Draft đang chờ duyệt

            </h2>



            {

                drafts.map(d => (


                    <div

                        key={d.id}

                        className="
border
rounded-xl
p-4
"


                    >


                        <p>

                            {d.caption}

                        </p>


                        <a
                            href={d.draft_link}
                            target="_blank"
                            className="text-blue-500"
                        >

                            Xem link

                        </a>



                        <div className="flex gap-3 mt-3">


                            <button

                                className="
bg-green-600
text-white
px-3
py-2
rounded
"

                                onClick={() => approveDraft(d.id)}

                            >

                                Approve

                            </button>



                            <button

                                className="
bg-red-600
text-white
px-3
py-2
rounded
"

                                onClick={() => rejectDraft(d.id)}

                            >

                                Reject

                            </button>



                        </div>


                    </div>


                ))


            }



        </div>


    )

}