module.exports = {
    "$schema": "./node_modules/rascal/lib/config/schema.json",
    "vhosts": {
        "/": {
            "connection": {
                "url": process.env.RABBITMQ_HOST,
            },
            "exchanges": ["turnomatic"],
            "queues": ["turnomatic-queue"],
            "subscriptions": {
                "turnomatic-queue": {
                    "queue": "turnomatic-queue",
                    "prefetch": 3
                }
            }
        }
    }
}
