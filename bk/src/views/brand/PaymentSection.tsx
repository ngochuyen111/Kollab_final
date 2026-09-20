import { useEffect, useState } from "react";

import { paymentService }
    from "../../services/paymentService";



interface Props {

    brandId: number;

}



export default function PaymentSection({

    brandId

}: Props) {


    const [payments, setPayments]
        =
        useState<any[]>([]);




    async function loadPayment() {


        /*
        Sau này có thể tạo getPaymentsByBrand
        Hiện dùng query trực tiếp
        */


    }



    useEffect(() => {


        loadPayment();


    }, []);




    async function confirm(id: number) {


        await paymentService
            .confirmPayment(id);


        alert(
            "Thanh toán thành công"
        );


    }



    return (

        <div>


            <h2 className="
text-xl
font-bold
mb-4
">

                Thanh toán KOL

            </h2>



            {

                payments.map(p => (


                    <div

                        key={p.id}

                        className="
border
rounded-xl
p-4
"

                    >


                        <p>

                            Task:
                            {p.task_id}

                        </p>


                        <p>

                            Amount:
                            {p.amount}

                        </p>


                        <p>

                            Status:
                            {p.status}

                        </p>



                        <button

                            onClick={() => confirm(p.id)}

                            className="
bg-teal-600
text-white
px-4
py-2
rounded
"

                        >

                            Xác nhận thanh toán

                        </button>


                    </div>


                ))

            }



        </div>


    )

}