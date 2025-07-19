import { motion, useTime, useTransform, } from "motion/react";
// import { LuLoaderCircle } from "react-icons/lu";

export function CircleLoading() {
    const time = useTime();
    const rotate = useTransform(time, [0, 650], [0, 360], { clamp: false });
    const pathLength = useTransform(() => Math.abs(Math.cos(time.get()/500)));

    return(
        <div className="w-full h-full flex justify-center items-center" style={{ padding: 30 }}>
            {/* <motion.div
                className="w-[50px] h-[50px]"
                style={{ x, rotate, color: '#1677ff' }}
            ><LuLoaderCircle className="w-[100%] h-[100%]"/></motion.div> */}
            <motion.svg
                width="75"
                height="75"
                viewBox="-100 -100 200 200"
                initial="hidden"
                animate="visible"
            >
                <motion.circle
                    className="circle-path"
                    cx="0"
                    cy="0"
                    r="90"
                    stroke="#1677ff"
                    initial={{ pathLength: 0, opacity: 1 }}
                    style={{
                        strokeWidth: 12.5,
                        strokeLinecap: "round",
                        fill: "transparent",
                        pathLength,
                        rotate
                    }}
                />
            </motion.svg>
        </div>
    );
}