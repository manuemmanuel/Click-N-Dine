-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT fk_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);

-- Add RLS policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert reviews
CREATE POLICY "Allow anyone to insert reviews"
    ON reviews FOR INSERT
    TO public
    WITH CHECK (true);

-- Allow anyone to read reviews
CREATE POLICY "Allow anyone to read reviews"
    ON reviews FOR SELECT
    TO public
    USING (true); 