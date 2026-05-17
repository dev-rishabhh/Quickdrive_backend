import { directoryModel } from "../model/directoryModel.js"

export async function updateParentSize(parentId, deltaSize, type) {
    const parents = []

    while (parentId) {
        const parentDir = await directoryModel.findById({ _id: parentId })

        if (!parentId) break

        parents.push(parentDir.id)
        parentId = parentDir.parentDirId
    }
    // console.log(parents);

    if (type === "inc") {
        await directoryModel.updateMany(
            { _id: { $in: parents } },
            { $inc: { size: +deltaSize } }
        )
    }
    if (type === "dec") {
        await directoryModel.updateMany(
            { _id: { $in: parents } },
            { $inc: { size: -deltaSize } }
        )
    }

}