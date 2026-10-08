-- Demos seed with REAL data from lib/demos.ts
INSERT INTO demos (slug, name, tag, business_type, description, welcome_message, published)
VALUES ('velvet-vine', 'Velvet & Vine', 'Boutique', 'a women''s fashion boutique', 'Product discovery, sizing, delivery, and guided purchase questions.', 'Hi, welcome to Velvet & Vine! Looking for something special today?', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  business_type = EXCLUDED.business_type,
  description = EXCLUDED.description,
  welcome_message = EXCLUDED.welcome_message,
  published = TRUE;

INSERT INTO demos (slug, name, tag, business_type, description, welcome_message, published)
VALUES ('casa-verde-kitchen', 'Casa Verde Kitchen', 'Restaurant', 'a family restaurant', 'Menu guidance, dietary questions, reservations, and warm service.', 'Welcome to Casa Verde Kitchen! Can I help with the menu or a reservation?', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  business_type = EXCLUDED.business_type,
  description = EXCLUDED.description,
  welcome_message = EXCLUDED.welcome_message,
  published = TRUE;

INSERT INTO demos (slug, name, tag, business_type, description, welcome_message, published)
VALUES ('luxe-locks-studio', 'Luxe Locks Studio', 'Salon', 'a hair & beauty salon', 'Service matching, availability questions, and booking guidance.', 'Hi! Welcome to Luxe Locks Studio. Which service are you interested in?', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  business_type = EXCLUDED.business_type,
  description = EXCLUDED.description,
  welcome_message = EXCLUDED.welcome_message,
  published = TRUE;

INSERT INTO demos (slug, name, tag, business_type, description, welcome_message, published)
VALUES ('harborline-realty', 'Harborline Realty', 'Real estate', 'a real estate agency', 'Property discovery, viewing enquiries, and qualified lead capture.', 'Hello! Looking to buy or rent? Tell me what you need and I''ll help.', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  business_type = EXCLUDED.business_type,
  description = EXCLUDED.description,
  welcome_message = EXCLUDED.welcome_message,
  published = TRUE;

INSERT INTO demos (slug, name, tag, business_type, description, welcome_message, published)
VALUES ('novakart', 'NovaKart', 'E-commerce', 'an online e-commerce store', 'Product search, order tracking, returns, and checkout help.', 'Hi! Welcome to NovaKart — hunting for something, or tracking an order?', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  business_type = EXCLUDED.business_type,
  description = EXCLUDED.description,
  welcome_message = EXCLUDED.welcome_message,
  published = TRUE;

INSERT INTO demos (slug, name, tag, business_type, description, welcome_message, published)
VALUES ('crumb-craft', 'Crumb & Craft', 'Bakery', 'an artisan bakery', 'Order questions, product suggestions, and collection details.', 'Hey! Fresh out of the oven at Crumb & Craft — what are you craving?', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  business_type = EXCLUDED.business_type,
  description = EXCLUDED.description,
  welcome_message = EXCLUDED.welcome_message,
  published = TRUE;

INSERT INTO demos (slug, name, tag, business_type, description, welcome_message, published)
VALUES ('ironpulse-fitness', 'IronPulse Fitness', 'Fitness', 'a fitness studio', 'Membership guidance, class matching, and visit enquiries.', 'Hey! Ready to get moving? I can help with memberships or classes.', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  business_type = EXCLUDED.business_type,
  description = EXCLUDED.description,
  welcome_message = EXCLUDED.welcome_message,
  published = TRUE;

INSERT INTO demos (slug, name, tag, business_type, description, welcome_message, published)
VALUES ('brightsmile-dental', 'BrightSmile Dental Studio', 'Dental', 'a dental clinic', 'Treatment questions, appointment guidance, and human handoff.', 'Hi, welcome to BrightSmile! How can I help with your dental care?', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  business_type = EXCLUDED.business_type,
  description = EXCLUDED.description,
  welcome_message = EXCLUDED.welcome_message,
  published = TRUE;

INSERT INTO demos (slug, name, tag, business_type, description, welcome_message, published)
VALUES ('fixright-plumbing', 'FixRight Plumbing Co.', 'Home services', 'a plumbing service company', 'Job triage, availability, and clear next-step guidance.', 'Hi! Plumbing issue? Tell me what''s happening and I''ll arrange help.', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  business_type = EXCLUDED.business_type,
  description = EXCLUDED.description,
  welcome_message = EXCLUDED.welcome_message,
  published = TRUE;

INSERT INTO demos (slug, name, tag, business_type, description, welcome_message, published)
VALUES ('everafter-events', 'EverAfter Events', 'Events', 'a wedding & event planning studio', 'Package discovery, event details, and enquiry qualification.', 'Hi! Planning something special? Tell me about your event!', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  business_type = EXCLUDED.business_type,
  description = EXCLUDED.description,
  welcome_message = EXCLUDED.welcome_message,
  published = TRUE;

INSERT INTO demos (slug, name, tag, business_type, description, welcome_message, published)
VALUES ('serene-glow-spa', 'Serene Glow Spa', 'Spa', 'a day spa', 'Treatment matching, availability questions, and booking intent.', 'Welcome to Serene Glow. What kind of relaxation are you looking for?', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  business_type = EXCLUDED.business_type,
  description = EXCLUDED.description,
  welcome_message = EXCLUDED.welcome_message,
  published = TRUE;

INSERT INTO demos (slug, name, tag, business_type, description, welcome_message, published)
VALUES ('daily-grind-coffee', 'Daily Grind Coffee House', 'Coffee', 'a specialty coffee house', 'Menu help, recommendations, and location questions in DMs.', 'Hey coffee lover! What can I get you started with today?', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  business_type = EXCLUDED.business_type,
  description = EXCLUDED.description,
  welcome_message = EXCLUDED.welcome_message,
  published = TRUE;

INSERT INTO demos (slug, name, tag, business_type, description, welcome_message, published)
VALUES ('lumiere-cosmetics', 'Lumière Cosmetics', 'Cosmetics', 'a cosmetics brand', 'Product matching, routine guidance, and purchase questions.', 'Hi gorgeous! Looking for skincare or makeup advice today?', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  business_type = EXCLUDED.business_type,
  description = EXCLUDED.description,
  welcome_message = EXCLUDED.welcome_message,
  published = TRUE;

