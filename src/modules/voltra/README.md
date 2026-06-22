# Voltra Order Tracking Service

Push Live Activity updates (iOS) + ongoing notification updates (Android) when an order status changes.

## Environment Variables

Add to `.env`:

```bash
# APNS (iOS) — required for Live Activity push
VOLTRA_APNS_TEAM_ID=<10-char Apple Team ID>
VOLTRA_APNS_KEY_ID=U5ZQ5X92RP
VOLTRA_APNS_P8_PATH=/Users/nazacity/Desktop/Project/ant-army/AuthKey_U5ZQ5X92RP.p8
VOLTRA_APNS_TOPIC=com.antdeliveryapp.app
# Optional: api.development.push.apple.com for sandbox
VOLTRA_APNS_HOST=api.push.apple.com

# FCM (Android) — pick ONE method
# Method A: HTTP v1 (recommended)
VOLTRA_FCM_PROJECT_ID=<firebase-project-id>
VOLTRA_FCM_SERVICE_ACCOUNT_PATH=/path/to/firebase-service-account.json
# Method B: Legacy server key (deprecated)
VOLTRA_FCM_SERVER_KEY=<legacy-server-key>
```

## Endpoints

| Method | Path                              | Auth                   | Purpose                                      |
| ------ | --------------------------------- | ---------------------- | -------------------------------------------- |
| POST   | `/api/voltra/register-token`      | `x-customer-id` header | App registers Voltra push token              |
| POST   | `/api/voltra/order-tracking/push` | Admin JWT              | Push status update to all customer's devices |
| POST   | `/api/voltra/order-tracking/stop` | Admin JWT              | Stop Live Activity / ongoing notif           |
| POST   | `/api/voltra/widget/order`        | Voltra bearer token    | Server-driven widget content (called by OS)  |
| GET    | `/api/voltra/health`              | Admin JWT              | Service health                               |

## Integration

```typescript
// In your order status change handler / socket service:
constructor(private readonly voltraService: VoltraService) {}

async onOrderStatusChanged(order) {
  const state = this.voltraService.mapOrderToState(order)
  await this.voltraService.pushOrderTrackingUpdate({
    customerId: order.customer_id,
    orderId: order.order_id,
    state,
  })
}

async onOrderCompleted(order) {
  await this.voltraService.stopOrderTracking({
    customerId: order.customer_id,
    orderId: order.order_id,
  })
}
```

## Database

Auto-created table `${ENV}_voltra_device_token` (via TypeORM synchronize).

| Column                          | Type                              | Description                    |
| ------------------------------- | --------------------------------- | ------------------------------ |
| id                              | uuid (PK)                         |                                |
| customerId                      | string                            | App customer ID                |
| orderId                         | bigint, nullable                  | Order this token is scoped to  |
| platform                        | enum ios/android                  |                                |
| tokenType                       | enum push-to-update/push-to-start |                                |
| token                           | string                            | Voltra push token              |
| isActive                        | boolean                           | Soft-deactivate on logout/stop |
| createdAt, updatedAt, isDeleted | from GlobalEntity                 |                                |
