import zod from 'zod'

export const userSchema = zod.object({
    username: zod.string().min(1),
    email: zod.string().email().min(1),
    password: zod.string().min(8)
})
