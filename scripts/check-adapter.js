const { neon } = require("@neondatabase/serverless");
const { PrismaNeonHttp } = require("@prisma/adapter-neon");

console.log(PrismaNeonHttp.toString());
