-- Add images column to posts table (max 4 image URLs)
ALTER TABLE public.posts ADD COLUMN images text[] DEFAULT '{}';

-- Create storage bucket for thread images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('thread-images', 'thread-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for thread images
CREATE POLICY "Anyone can view thread images"
ON storage.objects FOR SELECT
USING (bucket_id = 'thread-images');

CREATE POLICY "Authenticated users can upload thread images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'thread-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own thread images"
ON storage.objects FOR DELETE
USING (bucket_id = 'thread-images' AND auth.uid()::text = (storage.foldername(name))[1]);