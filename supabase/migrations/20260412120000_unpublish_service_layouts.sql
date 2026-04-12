-- Unpublish builder layouts for these two services so they use the hardcoded template
UPDATE page_layouts 
SET is_published = false 
WHERE page_slug IN ('service-comprehensive-consultation', 'service-preventive-dental-care');
