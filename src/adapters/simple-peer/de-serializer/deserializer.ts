import {
    Command,
    CommandToByte,
    DeserializedData,
    PositionDataArrayBytePos,
} from "./types";

export const decodePosition = (dataRawArray: Uint8Array) => {
    const dataArray = new Float64Array(dataRawArray.buffer);
    return {
        absoluteRotation: {
            x: dataArray[PositionDataArrayBytePos.RotationX],
            y: dataArray[PositionDataArrayBytePos.RotationY],
            z: dataArray[PositionDataArrayBytePos.RotationZ],
            w: dataArray[PositionDataArrayBytePos.RotationW],
        },
        globalPosition: {
            x: dataArray[PositionDataArrayBytePos.PositionX],
            y: dataArray[PositionDataArrayBytePos.PositionY],
            z: dataArray[PositionDataArrayBytePos.PositionZ],
        },
    };
};

export const decodeConfiguration = (dataArray: Uint8Array) =>
    JSON.parse(new TextDecoder().decode(dataArray));

export const deserializer = (buffer: ArrayBufferLike): DeserializedData => {
    const commandArray = new Uint8Array(buffer).slice(0, 1);
    const dataArray = new Uint8Array(buffer).slice(1);

    if (commandArray[0] === CommandToByte.Position) {
        return {
            type: Command.Position,
            payload: decodePosition(dataArray),
        };
    }
    if (commandArray[0] === CommandToByte.Configuration) {
        const payload = decodeConfiguration(dataArray);
        return {
            type: Command.Configuration,
            payload,
        };
    }
    throw new Error("couldn't deserialize the command");
};
