import { MyPosition, PeerConfig } from "../../../domain/types";
import { Command, CommandToByte, PositionDataArrayBytePos } from "./types";

function encodePosition({ absoluteRotation, globalPosition }: MyPosition) {
    const payloadArray = new Float64Array(7);
    payloadArray[PositionDataArrayBytePos.RotationX] = absoluteRotation.x;
    payloadArray[PositionDataArrayBytePos.RotationY] = absoluteRotation.y;
    payloadArray[PositionDataArrayBytePos.RotationZ] = absoluteRotation.z;
    payloadArray[PositionDataArrayBytePos.RotationW] = absoluteRotation.w;
    payloadArray[PositionDataArrayBytePos.PositionX] = globalPosition.x;
    payloadArray[PositionDataArrayBytePos.PositionY] = globalPosition.y;
    payloadArray[PositionDataArrayBytePos.PositionZ] = globalPosition.z;
    return payloadArray.buffer;
}

function encodeCommand(command: Command) {
    const commandByte = new Uint8Array(1);
    commandByte[0] = CommandToByte[command];
    return commandByte.buffer;
}

function chainBuffers(commandBuffer: ArrayBuffer, payloadBuffer: ArrayBuffer) {
    const uint8array = new Uint8Array(
        commandBuffer.byteLength + payloadBuffer.byteLength
    );
    uint8array.set(new Uint8Array(commandBuffer), 0);
    uint8array.set(new Uint8Array(payloadBuffer), commandBuffer.byteLength);
    return uint8array.buffer;
}

export const serializer =
    <T>(command: Command, payloadSerializer: (obj: T) => ArrayBufferLike) =>
    (obj: T): ArrayBuffer => {
        const payloadBuffer = payloadSerializer(obj);
        const commandBuffer = encodeCommand(command);
        return chainBuffers(commandBuffer, payloadBuffer);
    };
export const positionSerializer = serializer(Command.Position, encodePosition);
const encodeConfig = (config: PeerConfig) =>
    new TextEncoder().encode(JSON.stringify(config));
export const configSerializer = serializer(Command.Configuration, encodeConfig);
