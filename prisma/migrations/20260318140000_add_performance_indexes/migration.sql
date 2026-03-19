-- CreateIndex: users
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex: providers
CREATE INDEX "providers_categoryId_idx" ON "providers"("categoryId");
CREATE INDEX "providers_status_idx" ON "providers"("status");
CREATE INDEX "providers_rating_idx" ON "providers"("rating");

-- CreateIndex: service_requests
CREATE INDEX "service_requests_clientId_idx" ON "service_requests"("clientId");
CREATE INDEX "service_requests_providerId_idx" ON "service_requests"("providerId");
CREATE INDEX "service_requests_status_idx" ON "service_requests"("status");
CREATE INDEX "service_requests_createdAt_idx" ON "service_requests"("createdAt");

-- CreateIndex: messages
CREATE INDEX "messages_requestId_idx" ON "messages"("requestId");
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

-- CreateIndex: notifications
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX "notifications_read_idx" ON "notifications"("read");
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex: reviews
CREATE INDEX "reviews_clientId_idx" ON "reviews"("clientId");
CREATE INDEX "reviews_providerId_idx" ON "reviews"("providerId");
