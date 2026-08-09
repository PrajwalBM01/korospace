-- CreateIndex
CREATE INDEX "Edge_canvasId_idx" ON "Edge"("canvasId");

-- CreateIndex
CREATE INDEX "Edge_sourceNodeId_idx" ON "Edge"("sourceNodeId");

-- CreateIndex
CREATE INDEX "Edge_targetNodeId_idx" ON "Edge"("targetNodeId");

-- CreateIndex
CREATE INDEX "Message_nodeId_createdAt_idx" ON "Message"("nodeId", "createdAt");

-- CreateIndex
CREATE INDEX "Node_canvasId_idx" ON "Node"("canvasId");
