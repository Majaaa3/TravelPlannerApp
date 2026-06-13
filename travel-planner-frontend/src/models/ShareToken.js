export class ShareToken {
    constructor(id, token, tripId, accessType, createdAt, expiresAt, isActive, qrCodeBase64) {
        this.id = id;
        this.token = token;
        this.tripId = tripId;
        this.accessType = accessType;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.isActive = isActive;
        this.qrCodeBase64 = qrCodeBase64;
    }
}