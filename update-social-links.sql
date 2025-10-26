-- Actualizar configuración del negocio con redes sociales
UPDATE business_config 
SET 
  instagram_url = 'https://www.instagram.com/zingaritokids/',
  facebook_url = 'https://www.facebook.com/zingara.ramallo'
WHERE id = (SELECT id FROM business_config LIMIT 1);

-- Si no existe configuración, insertar una nueva
INSERT INTO business_config (
  business_name,
  whatsapp_number,
  email,
  address,
  min_wholesale_quantity,
  instagram_url,
  facebook_url
) VALUES (
  'Zingarito Kids',
  '543407498045',
  'zingaritokids@gmail.com',
  'San Martín 17 - Villa Ramallo, Buenos Aires, Argentina',
  5,
  'https://www.instagram.com/zingaritokids/',
  'https://www.facebook.com/zingara.ramallo'
) ON CONFLICT DO NOTHING;
