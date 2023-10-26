module.exports = {
    "$schema": "./node_modules/rascal/lib/config/schema.json",
    "vhosts": {
        "/": {
            "connection": {
                "url": process.env.RABBITMQ_HOST,
            },
            "exchanges": ["turnomatic"],
            "queues": ["turnomatic-queue", "turnomatic-response-queue"],
            "bindings": ["turnomatic[turnomatic-queue-key] -> turnomatic-queue"],
            "publications": {
                "turnomatic-queue": {
                    "exchange": "turnomatic",
                    "routingKey": "turnomatic-queue-key"
                }
            },
            "subscriptions": {
                "turnomatic-response-queue": {
                    "queue": "turnomatic-response-queue",
                    "prefetch": 3
                }
            }
        }
    }
}
