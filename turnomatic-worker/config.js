module.exports = {
    "$schema": "./node_modules/rascal/lib/config/schema.json",
    "vhosts": {
        "/": {
            "connection": {
                "url": process.env.RABBITMQ_HOST,
            },
            "exchanges": ["turnomatic"],
            "queues": ["turnomatic-queue", "turnomatic-response-queue"],
            "bindings": ["turnomatic[turnomatic-response-key] -> turnomatic-response-queue"],
            "publications": {
                "turnomatic-response": {
                    "exchange": "turnomatic",
                    "routingKey": "turnomatic-response-key"
                }
            },
            "subscriptions": {
                "turnomatic-queue": {
                    "queue": "turnomatic-queue",
                    "prefetch": 3
                }
            }
        }
    }
}
