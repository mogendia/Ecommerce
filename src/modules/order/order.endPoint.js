import {roles} from "../../middleware/auth.js"

export const endPoint = {
    create:[roles.User],
    cancel:[roles.User],
    adminUpdateOrder:[roles.Admin],
}