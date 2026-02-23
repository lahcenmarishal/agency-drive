-- Create storage bucket for vehicle images
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-images', 'vehicle-images', true);

-- Allow authenticated users to upload vehicle images
CREATE POLICY "Authenticated users can upload vehicle images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'vehicle-images');

-- Allow anyone to view vehicle images (public bucket)
CREATE POLICY "Anyone can view vehicle images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'vehicle-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update vehicle images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'vehicle-images');

-- Allow authenticated users to delete vehicle images
CREATE POLICY "Authenticated users can delete vehicle images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'vehicle-images');