import React from "react"
import { CgFileDocument } from "react-icons/cg";
import { FaRegClock } from "react-icons/fa";
import { LuCircleCheckBig } from "react-icons/lu";
import { TiSpanner } from "react-icons/ti";

const mockData = [
    {
        label: "Submitted",
        count: 0,
        bg_color: "bg-blue-500/20",
        icon_color: "text-blue-700",
        icon: CgFileDocument
    },
    {
        label: "In Progress",
        count: 0,
        bg_color: "bg-purple-500/20",
        icon_color: "text-purple-700",
        icon: TiSpanner
    },
    {
        label: "Pending",
        count: 0,
        bg_color: "bg-yellow-500/20",
        icon_color: "text-yellow-700",
        icon: FaRegClock
    },
    {
        label: "Completed",
        count: 0,
        bg_color: "bg-green-500/20",
        icon_color: "text-green-700",
        icon: LuCircleCheckBig
    }
]


export default function PageStats() {
    return <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 my-6">
        {mockData.map(({ label, count, bg_color, icon_color, icon: Icon }, idx) => {
            return <div key={idx} className="rounded-md shadow-md p-6 border border-gray-200 flex flex-row items-center gap-4">
                <div className={`size-12 rounded-md flex items-center justify-center ${bg_color}`}>
                    <Icon className={`size-6 text-blue-500 ${icon_color}`} />
                </div>
                <div className="flex flex-col">
                    <h5 className="font-bold text-lg">
                        {count}
                    </h5>

                    <p className="text-sm text-gray-500">{label}</p>
                </div>
            </div>
        })}
    </section>
}