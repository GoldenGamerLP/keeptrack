export default defineEventHandler((req) => {
    return req.context.user;
});