import { MyPosition } from "../domain/types";

export const serializer = ({
    absoluteRotation,
    globalPosition,
}: MyPosition): ArrayBuffer => {
    const dataArray = new Float64Array(7);
    dataArray[0] = absoluteRotation.x;
    dataArray[1] = absoluteRotation.y;
    dataArray[2] = absoluteRotation.z;
    dataArray[3] = absoluteRotation.w;
    dataArray[4] = globalPosition.x;
    dataArray[5] = globalPosition.y;
    dataArray[6] = globalPosition.z;
    return dataArray.buffer;
};

export const deserializer = (buffer: Buffer): MyPosition => {
    const dataArray = new Float64Array(buffer.buffer);
    return {
        absoluteRotation: {
            x: dataArray[0],
            y: dataArray[1],
            z: dataArray[2],
            w: dataArray[3],
        },
        globalPosition: {
            x: dataArray[4],
            y: dataArray[5],
            z: dataArray[6],
        },
    };
};
