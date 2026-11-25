CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id),
    subject VARCHAR(160) NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'OTHER',
    message TEXT NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'OPEN',
    admin_resolution TEXT,
    resolved_by_admin_id UUID REFERENCES users (id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);